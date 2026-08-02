/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import { ts } from 'ts-morph';

import { AstReader } from './Abstract/AstReader.ts';
import { HttpParameterData } from './Data/HttpParameterData.ts';

import type { HttpRouteParameterReaderContract } from './Contract/HttpRouteParameterReaderContract.ts';

/**
 * Reads and builds AST expressions for HTTP dynamic route parameters.
 *
 * The shipped `@DynamicRoute` decorator folds parameter definitions into its
 * options object as `parameters: [{ name, regex, cast?, isOptional?,
 * shouldCapture?, default? }]` (TC39 Stage-3 has no parameter decorators), so
 * this reader parses that array of object literals rather than a separate
 * `@Parameter` decorator.
 *
 * Extracted from HttpRouteAttributeReader to keep each class under the
 * complexity threshold; injected as a constructor argument.
 */
export class HttpRouteParameterReader extends AstReader implements HttpRouteParameterReaderContract {
    updateParameters(
        obj: ts.ObjectLiteralExpression,
        useMap: Record<string, string>,
        namespace: string,
        currentClass: string,
    ): HttpParameterData[] {
        const node = this.getObjectProp(obj, 'parameters');

        if (node === undefined || !ts.isArrayLiteralExpression(node)) {
            return [];
        }

        const parameters: HttpParameterData[] = [];

        for (const element of node.elements) {
            if (!ts.isObjectLiteralExpression(element)) {
                continue;
            }

            const param = this.buildParameterData(element, useMap, namespace, currentClass);

            if (param !== null) {
                parameters.push(param);
            }
        }

        return parameters;
    }

    buildParameterListExpr(parameters: HttpParameterData[]): ts.ArrayLiteralExpression {
        const elements = parameters.map((p) => this.buildParameterExpr(p));
        return ts.factory.createArrayLiteralExpression(elements);
    }

    protected buildParameterData(
        obj: ts.ObjectLiteralExpression,
        useMap: Record<string, string>,
        currentFilePath: string,
        currentClass: string,
    ): HttpParameterData | null {
        const name = this.getObjectStringProp(obj, 'name', useMap, currentFilePath, currentClass);
        const regex = this.getObjectStringProp(obj, 'regex', useMap, currentFilePath, currentClass);

        if (name === '' || regex === '') {
            return null;
        }

        const cast = this.getObjectStringProp(obj, 'cast', useMap, currentFilePath, currentClass) || null;

        return new HttpParameterData(
            name,
            regex,
            cast,
            this.getObjectBoolProp(obj, 'isOptional', useMap, currentFilePath, currentClass, false),
            this.getObjectBoolProp(obj, 'shouldCapture', useMap, currentFilePath, currentClass, true),
            this.extractDefault(obj, useMap, currentFilePath, currentClass),
        );
    }

    protected extractDefault(
        obj: ts.ObjectLiteralExpression,
        useMap: Record<string, string>,
        currentFilePath: string,
        currentClass: string,
    ): string | number | boolean | null {
        const value = this.extractExprValue(this.getObjectProp(obj, 'default'), useMap, currentFilePath, currentClass);

        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            return value;
        }

        return null;
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

        if (data.defaultValue !== null) {
            args.push(this.buildScalarExpr(data.defaultValue));
        }

        return this.buildNewExpr('Valkyrja\\Http\\Routing\\Data\\Parameter', args);
    }

    protected buildScalarExpr(value: string | number | boolean): ts.Expression {
        if (typeof value === 'string') {
            return this.buildStringExpr(value);
        }

        if (typeof value === 'boolean') {
            return this.buildBoolExpr(value);
        }

        return ts.factory.createNumericLiteral(value);
    }
}
