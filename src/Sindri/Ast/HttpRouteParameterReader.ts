/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import ts from 'typescript';

import { AstReader } from './Abstract/AstReader.js';
import { HttpParameterData } from './Data/HttpParameterData.js';

import type { Decorator, MethodDeclaration, ParameterDeclaration } from 'ts-morph';

import type { HttpRouteParameterReaderContract } from './Contract/HttpRouteParameterReaderContract.js';

/**
 * Reads and builds AST expressions for HTTP dynamic route parameters.
 *
 * Extracted from HttpRouteAttributeReader to keep each class under the
 * complexity threshold; injected as a constructor argument.
 */
export class HttpRouteParameterReader extends AstReader implements HttpRouteParameterReaderContract {
    updateParameters(
        decoratorArgs: ts.NodeArray<ts.Expression> | ts.Expression[],
        method: MethodDeclaration,
        useMap: Record<string, string>,
        namespace: string,
        currentClass: string,
    ): HttpParameterData[] {
        return [
            ...this.collectInlineParameters(decoratorArgs, useMap, namespace, currentClass),
            ...this.collectAttributeParameters(method, useMap, namespace, currentClass),
            ...this.collectMethodParamParameters(method, useMap, namespace, currentClass),
        ];
    }

    buildParameterListExpr(parameters: HttpParameterData[]): ts.ArrayLiteralExpression {
        const elements = parameters.map((p) => this.buildParameterExpr(p));
        return ts.factory.createArrayLiteralExpression(elements);
    }

    protected collectInlineParameters(
        decoratorArgs: ts.NodeArray<ts.Expression> | ts.Expression[],
        useMap: Record<string, string>,
        currentFilePath: string,
        currentClass: string,
    ): HttpParameterData[] {
        const inlineArg = decoratorArgs[2];

        if (inlineArg === undefined || !ts.isArrayLiteralExpression(inlineArg)) {
            return [];
        }

        const parameters: HttpParameterData[] = [];

        for (const element of inlineArg.elements) {
            if (!ts.isNewExpression(element)) {
                continue;
            }

            const param = this.buildParameterDataFromTsArgs(element.arguments ?? [], useMap, currentFilePath, currentClass);

            if (param !== null) {
                parameters.push(param);
            }
        }

        return parameters;
    }

    protected collectAttributeParameters(
        method: MethodDeclaration,
        useMap: Record<string, string>,
        currentFilePath: string,
        currentClass: string,
    ): HttpParameterData[] {
        const parameters: HttpParameterData[] = [];

        for (const decorator of this.findDecoratorsOnNode(method, 'Parameter', useMap, currentFilePath)) {
            const param = this.buildParameterDataFromDecorator(decorator, useMap, currentFilePath, currentClass);

            if (param !== null) {
                parameters.push(param);
            }
        }

        return parameters;
    }

    protected collectMethodParamParameters(
        method: MethodDeclaration,
        useMap: Record<string, string>,
        currentFilePath: string,
        currentClass: string,
    ): HttpParameterData[] {
        const parameters: HttpParameterData[] = [];

        for (const methodParam of method.getParameters()) {
            for (const decorator of this.findDecoratorsOnNode(methodParam as ParameterDeclaration, 'Parameter', useMap, currentFilePath)) {
                const param = this.buildParameterDataFromDecorator(decorator, useMap, currentFilePath, currentClass);

                if (param !== null) {
                    parameters.push(param);
                }
            }
        }

        return parameters;
    }

    protected buildParameterDataFromDecorator(
        decorator: Decorator,
        useMap: Record<string, string>,
        currentFilePath: string,
        currentClass: string,
    ): HttpParameterData | null {
        const name = this.extractStringArg(decorator, 0, useMap, currentFilePath, currentClass);
        const regex = this.extractStringArg(decorator, 1, useMap, currentFilePath, currentClass);

        if (name === '' || regex === '') {
            return null;
        }

        return new HttpParameterData(
            name,
            regex,
            this.extractStringArg(decorator, 2, useMap, currentFilePath, currentClass) || null,
            this.extractBoolArg(decorator, 3, useMap, currentFilePath, currentClass, false),
            this.extractBoolArg(decorator, 4, useMap, currentFilePath, currentClass, true),
        );
    }

    protected buildParameterDataFromTsArgs(
        args: ts.NodeArray<ts.Expression>,
        useMap: Record<string, string>,
        currentFilePath: string,
        currentClass: string,
    ): HttpParameterData | null {
        const nameNode = args[0];
        const regexNode = args[1];

        if (nameNode === undefined || regexNode === undefined) {
            return null;
        }

        const name = this.extractExprValue(nameNode, useMap, currentFilePath, currentClass);
        const regex = this.extractExprValue(regexNode, useMap, currentFilePath, currentClass);

        if (typeof name !== 'string' || name === '' || typeof regex !== 'string' || regex === '') {
            return null;
        }

        const castNode = args[2];
        const castRaw = castNode !== undefined ? this.extractExprValue(castNode, useMap, currentFilePath, currentClass) : null;
        const cast = typeof castRaw === 'string' && castRaw !== '' ? castRaw : null;

        const isOptionalNode = args[3];
        const isOptionalRaw = isOptionalNode !== undefined ? this.extractExprValue(isOptionalNode, useMap, currentFilePath, currentClass) : false;
        const isOptional = typeof isOptionalRaw === 'boolean' ? isOptionalRaw : false;

        const shouldCaptureNode = args[4];
        const shouldCaptureRaw = shouldCaptureNode !== undefined ? this.extractExprValue(shouldCaptureNode, useMap, currentFilePath, currentClass) : true;
        const shouldCapture = typeof shouldCaptureRaw === 'boolean' ? shouldCaptureRaw : true;

        return new HttpParameterData(name, regex, cast, isOptional, shouldCapture);
    }

    protected buildParameterExpr(data: HttpParameterData): ts.Expression {
        const regexExpr = data.regex.includes('::')
            ? this.buildEnumCaseExpr(data.regex)
            : this.buildStringExpr(data.regex);

        const args: ts.Expression[] = [
            this.buildStringExpr(data.name),
            regexExpr,
            data.cast !== null ? this.buildEnumCaseExpr(data.cast) : this.buildNullExpr(),
            this.buildBoolExpr(data.isOptional),
            this.buildBoolExpr(data.shouldCapture),
        ];

        return this.buildNewExpr('Valkyrja\\Http\\Routing\\Data\\Parameter', args);
    }
}