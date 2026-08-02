/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import { ts } from 'ts-morph';

import { AstReader } from './Abstract/AstReader.ts';
import { CliArgumentParameterData } from './Data/CliArgumentParameterData.ts';
import { CliOptionParameterData } from './Data/CliOptionParameterData.ts';

import type { MethodDeclaration } from 'ts-morph';

import type { CliRouteData } from './Data/CliRouteData.ts';
import type { CliRouteParameterReaderContract } from './Contract/CliRouteParameterReaderContract.ts';

/**
 * Builds AST expressions for CLI route argument and option parameters.
 *
 * Extracted from CliRouteAttributeReader to keep each class under the
 * complexity threshold; injected as a constructor argument.
 */
export class CliRouteParameterReader extends AstReader implements CliRouteParameterReaderContract {
    buildParameterArgs(data: CliRouteData): ts.Expression[] {
        const args: ts.Expression[] = [];

        // The `arguments_` constructor parameter precedes `options`, so an empty
        // arguments array must still be emitted whenever options are present, to
        // keep `options` in its correct positional slot.
        if (data.arguments.length > 0 || data.options.length > 0) {
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
        const obj = this.getDecoratorObjectArg(decorator);

        if (obj === undefined) {
            return null;
        }

        const name = this.getObjectStringProp(obj, 'name', useMap, currentFilePath, currentClass);
        const description = this.getObjectStringProp(obj, 'description', useMap, currentFilePath, currentClass);

        if (name === '' || description === '') {
            return null;
        }

        return new CliArgumentParameterData(
            name,
            description,
            this.getObjectStringProp(obj, 'cast', useMap, currentFilePath, currentClass) || null,
            this.getObjectStringProp(
                obj,
                'mode',
                useMap,
                currentFilePath,
                currentClass,
                'Valkyrja\\Cli\\Routing\\Enum\\ArgumentMode::OPTIONAL',
            ),
            this.getObjectStringProp(
                obj,
                'valueMode',
                useMap,
                currentFilePath,
                currentClass,
                'Valkyrja\\Cli\\Routing\\Enum\\ArgumentValueMode::DEFAULT',
            ),
        );
    }

    protected buildOptionData(
        decorator: import('ts-morph').Decorator,
        useMap: Record<string, string>,
        currentFilePath: string,
        currentClass: string,
    ): CliOptionParameterData | null {
        const obj = this.getDecoratorObjectArg(decorator);

        if (obj === undefined) {
            return null;
        }

        const name = this.getObjectStringProp(obj, 'name', useMap, currentFilePath, currentClass);
        const description = this.getObjectStringProp(obj, 'description', useMap, currentFilePath, currentClass);

        if (name === '' || description === '') {
            return null;
        }

        return new CliOptionParameterData(
            name,
            description,
            this.getObjectStringProp(obj, 'valueDisplayName', useMap, currentFilePath, currentClass),
            this.getObjectStringProp(obj, 'cast', useMap, currentFilePath, currentClass) || null,
            this.getObjectStringProp(obj, 'defaultValue', useMap, currentFilePath, currentClass),
            this.getObjectStringListProp(obj, 'shortNames', useMap, currentFilePath, currentClass),
            this.getObjectStringListProp(obj, 'validValues', useMap, currentFilePath, currentClass),
            this.getObjectStringProp(
                obj,
                'mode',
                useMap,
                currentFilePath,
                currentClass,
                'Valkyrja\\Cli\\Routing\\Enum\\OptionMode::OPTIONAL',
            ),
            this.getObjectStringProp(
                obj,
                'valueMode',
                useMap,
                currentFilePath,
                currentClass,
                'Valkyrja\\Cli\\Routing\\Enum\\OptionValueMode::DEFAULT',
            ),
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

        // The framework `OptionParameter` constructor carries a runtime-populated
        // `options` array between `validValues` and `mode`; emit an empty array so
        // `mode`/`valueMode` land in their correct positional slots.
        args.push(ts.factory.createArrayLiteralExpression([]));
        args.push(this.buildEnumCaseExpr(data.mode));
        args.push(this.buildEnumCaseExpr(data.valueMode));

        return this.buildNewExpr('Valkyrja\\Cli\\Routing\\Data\\OptionParameter', args);
    }
}
