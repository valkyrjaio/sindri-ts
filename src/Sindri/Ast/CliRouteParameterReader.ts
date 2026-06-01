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
import { CliArgumentParameterData } from './Data/CliArgumentParameterData.js';
import { CliOptionParameterData } from './Data/CliOptionParameterData.js';

import type { MethodDeclaration } from 'ts-morph';

import type { CliRouteData } from './Data/CliRouteData.js';
import type { CliRouteParameterReaderContract } from './Contract/CliRouteParameterReaderContract.js';

/**
 * Builds AST expressions for CLI route argument and option parameters.
 *
 * Extracted from CliRouteAttributeReader to keep each class under the
 * complexity threshold; injected as a constructor argument.
 */
export class CliRouteParameterReader extends AstReader implements CliRouteParameterReaderContract {
    buildParameterArgs(data: CliRouteData): ts.Expression[] {
        const args: ts.Expression[] = [];

        if (data.arguments.length > 0) {
            args.push(this.buildArgumentListExpr(data.arguments));
        }

        if (data.options.length > 0) {
            args.push(this.buildOptionListExpr(data.options));
        }

        return args;
    }

    updateArguments(
        method: MethodDeclaration,
        useMap: Record<string, string>,
        namespace: string,
        currentClass: string,
    ): CliArgumentParameterData[] {
        const arguments_: CliArgumentParameterData[] = [];

        for (const decorator of this.findDecoratorsOnNode(method, 'ArgumentParameter', useMap, namespace)) {
            const data = this.buildArgumentData(decorator, useMap, namespace, currentClass);

            if (data !== null) {
                arguments_.push(data);
            }
        }

        return arguments_;
    }

    updateOptions(
        method: MethodDeclaration,
        useMap: Record<string, string>,
        namespace: string,
        currentClass: string,
    ): CliOptionParameterData[] {
        const options: CliOptionParameterData[] = [];

        for (const decorator of this.findDecoratorsOnNode(method, 'OptionParameter', useMap, namespace)) {
            const data = this.buildOptionData(decorator, useMap, namespace, currentClass);

            if (data !== null) {
                options.push(data);
            }
        }

        return options;
    }

    protected buildArgumentData(
        decorator: import('ts-morph').Decorator,
        useMap: Record<string, string>,
        currentFilePath: string,
        currentClass: string,
    ): CliArgumentParameterData | null {
        const name = this.extractStringArg(decorator, 0, useMap, currentFilePath, currentClass);
        const description = this.extractStringArg(decorator, 1, useMap, currentFilePath, currentClass);

        if (name === '' || description === '') {
            return null;
        }

        return new CliArgumentParameterData(
            name,
            description,
            this.extractStringArg(decorator, 2, useMap, currentFilePath, currentClass) || null,
            this.extractStringArg(decorator, 3, useMap, currentFilePath, currentClass, 'Valkyrja\\Cli\\Routing\\Enum\\ArgumentMode::OPTIONAL'),
            this.extractStringArg(decorator, 4, useMap, currentFilePath, currentClass, 'Valkyrja\\Cli\\Routing\\Enum\\ArgumentValueMode::DEFAULT'),
        );
    }

    protected buildOptionData(
        decorator: import('ts-morph').Decorator,
        useMap: Record<string, string>,
        currentFilePath: string,
        currentClass: string,
    ): CliOptionParameterData | null {
        const name = this.extractStringArg(decorator, 0, useMap, currentFilePath, currentClass);
        const description = this.extractStringArg(decorator, 1, useMap, currentFilePath, currentClass);

        if (name === '' || description === '') {
            return null;
        }

        return new CliOptionParameterData(
            name,
            description,
            this.extractStringArg(decorator, 2, useMap, currentFilePath, currentClass),
            this.extractStringArg(decorator, 3, useMap, currentFilePath, currentClass) || null,
            this.extractStringArg(decorator, 4, useMap, currentFilePath, currentClass),
            this.extractStringListArgFromDecorator(decorator, 5, useMap, currentFilePath, currentClass),
            this.extractStringListArgFromDecorator(decorator, 6, useMap, currentFilePath, currentClass),
            this.extractStringArg(decorator, 7, useMap, currentFilePath, currentClass, 'Valkyrja\\Cli\\Routing\\Enum\\OptionMode::OPTIONAL'),
            this.extractStringArg(decorator, 8, useMap, currentFilePath, currentClass, 'Valkyrja\\Cli\\Routing\\Enum\\OptionValueMode::DEFAULT'),
        );
    }

    protected buildArgumentListExpr(arguments_: readonly CliArgumentParameterData[]): ts.ArrayLiteralExpression {
        const elements = arguments_.map((a) => this.buildArgumentExpr(a));
        return ts.factory.createArrayLiteralExpression(elements);
    }

    protected buildArgumentExpr(data: CliArgumentParameterData): ts.Expression {
        const args: ts.Expression[] = [
            this.buildStringExpr(data.name),
            this.buildStringExpr(data.description),
            data.cast !== null ? this.buildEnumCaseExpr(data.cast) : this.buildNullExpr(),
            this.buildEnumCaseExpr(data.mode),
            this.buildEnumCaseExpr(data.valueMode),
        ];

        return this.buildNewExpr('Valkyrja\\Cli\\Routing\\Data\\ArgumentParameter', args);
    }

    protected buildOptionListExpr(options: readonly CliOptionParameterData[]): ts.ArrayLiteralExpression {
        const elements = options.map((o) => this.buildOptionExpr(o));
        return ts.factory.createArrayLiteralExpression(elements);
    }

    protected buildOptionExpr(data: CliOptionParameterData): ts.Expression {
        const args: ts.Expression[] = [
            this.buildStringExpr(data.name),
            this.buildStringExpr(data.description),
            this.buildStringExpr(data.valueDisplayName),
            data.cast !== null ? this.buildEnumCaseExpr(data.cast) : this.buildNullExpr(),
            this.buildStringExpr(data.defaultValue),
        ];

        if (data.shortNames.length > 0) {
            args.push(this.buildStringArrayExpr(data.shortNames));
        } else {
            args.push(ts.factory.createArrayLiteralExpression([]));
        }

        if (data.validValues.length > 0) {
            args.push(this.buildStringArrayExpr(data.validValues));
        } else {
            args.push(ts.factory.createArrayLiteralExpression([]));
        }

        args.push(this.buildEnumCaseExpr(data.mode));
        args.push(this.buildEnumCaseExpr(data.valueMode));

        return this.buildNewExpr('Valkyrja\\Cli\\Routing\\Data\\OptionParameter', args);
    }
}
