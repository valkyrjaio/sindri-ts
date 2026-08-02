/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import { ts } from 'ts-morph';

import { DynamicRoute } from '@valkyrjaio/valkyrja/Http/Routing/Data/DynamicRoute.ts';
import { Parameter } from '@valkyrjaio/valkyrja/Http/Routing/Data/Parameter.ts';
import { Regex } from '@valkyrjaio/valkyrja/Http/Routing/Constant/Regex.ts';
import { Processor } from '@valkyrjaio/valkyrja/Http/Routing/Processor/Processor.ts';
import { RequestMethod, allRequestMethods } from '@valkyrjaio/valkyrja/Http/Message/Enum/RequestMethod.ts';

import { AstFileGenerator } from '../../Abstract/AstFileGenerator.ts';
import { GeneratorUnreachableException } from '../../Throwable/Exception/GeneratorUnreachableException.ts';
import type { HttpDataFileGeneratorContract } from '../../Http/Contract/HttpDataFileGeneratorContract.ts';
import type { GenerateStatus } from '../../Enum/GenerateStatus.ts';
import type { HttpParameterData } from '../../../Ast/Data/HttpParameterData.ts';
import type { HttpRouteData } from '../../../Ast/Data/HttpRouteData.ts';
import type { ProcessorContract } from '@valkyrjaio/valkyrja/Http/Routing/Processor/Contract/ProcessorContract.ts';

/** Metadata extracted from an imperative `new Route(...)` / `new DynamicRoute(...)` expression. */
interface ImperativeRouteMeta {
    readonly expr: ts.Expression;
    readonly name: string;
    readonly path: string;
    readonly isDynamic: boolean;
    readonly regex: string;
    readonly methods: readonly string[];
}

export class AstHttpDataFileGenerator extends AstFileGenerator implements HttpDataFileGeneratorContract {
    /** The framework classes every generated HTTP data file imports as values. */
    protected static readonly FRAMEWORK_IMPORTS: Readonly<Record<string, string>> = {
        HttpRoutingData: '@valkyrjaio/valkyrja/Http/Routing/Data/HttpRoutingData.ts',
        DynamicRoute: '@valkyrjaio/valkyrja/Http/Routing/Data/DynamicRoute.ts',
        Route: '@valkyrjaio/valkyrja/Http/Routing/Data/Route.ts',
        Parameter: '@valkyrjaio/valkyrja/Http/Routing/Data/Parameter.ts',
        RequestMethod: '@valkyrjaio/valkyrja/Http/Message/Enum/RequestMethod.ts',
        Regex: '@valkyrjaio/valkyrja/Http/Routing/Constant/Regex.ts',
    };

    /** The framework types every generated HTTP data file imports. */
    protected static readonly FRAMEWORK_TYPE_IMPORTS: Readonly<Record<string, string>> = {
        RouteContract: '@valkyrjaio/valkyrja/Http/Routing/Data/Contract/RouteContract.ts',
    };

    public classImportMap: Record<string, string> = {};

    protected readonly processor: ProcessorContract;

    private readonly printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

    private readonly dummySourceFile = ts.createSourceFile(
        '_dummy.ts',
        '',
        ts.ScriptTarget.ESNext,
        false,
        ts.ScriptKind.TS,
    );

    public constructor(processor: ProcessorContract = new Processor()) {
        super();
        this.processor = processor;
    }

    public generateFile(
        directory: string,
        className: string,
        namespace: string,
        routes: Record<string, ts.Expression>,
        routeData: Record<string, HttpRouteData>,
    ): GenerateStatus {
        return this.generateMergedFile(directory, className, namespace, routes, routeData, []);
    }

    /**
     * Generate the routing data file from imperative `getRoutes()` route
     * objects (as opposed to attribute-scanned routes).
     *
     * Each route expression is emitted verbatim as a route closure and the
     * path/dynamic-path/regex lookup maps are derived from the route objects'
     * own arguments, mirroring the framework's runtime `RouteCollection`
     * (literal path and regex, request methods defaulting to `[HEAD, GET]`).
     */
    public generateFileFromRoutes(
        directory: string,
        className: string,
        namespace: string,
        routeExprs: readonly ts.Expression[],
    ): GenerateStatus {
        return this.generateMergedFile(directory, className, namespace, {}, {}, routeExprs);
    }

    /**
     * Generate the routing data file by MERGING attribute-scanned routes with
     * imperative `getRoutes()` route objects — the four lookup maps (routes,
     * paths, dynamicPaths, regexes) are built from both sources and combined.
     * Attribute entries are emitted first, then imperative ones.
     */
    public generateMergedFile(
        directory: string,
        className: string,
        _namespace: string,
        routes: Record<string, ts.Expression>,
        routeData: Record<string, HttpRouteData>,
        routeExprs: readonly ts.Expression[],
    ): GenerateStatus {
        const userImportsBlock = this.buildUserImportsBlock(this.classImportMap, [
            ...Object.keys(AstHttpDataFileGenerator.FRAMEWORK_IMPORTS),
            ...Object.keys(AstHttpDataFileGenerator.FRAMEWORK_TYPE_IMPORTS),
        ]);

        const metas = routeExprs
            .map((expr) => this.extractRouteMeta(expr))
            .filter((meta): meta is ImperativeRouteMeta => meta !== undefined);

        const routesContent = this.wrapRoutes([
            ...this.getRouteLines(routes, routeData),
            ...this.getImperativeRouteLines(metas),
        ]);
        const paths = this.printNestedObject(
            this.mergeNested(this.buildPaths(routeData), this.buildImperativePaths(metas, false)),
        );
        const dynamicPaths = this.printNestedObject(
            this.mergeNested(this.buildDynamicPaths(routeData), this.buildImperativePaths(metas, true)),
        );
        const regexes = this.printNestedObject(
            this.mergeNested(this.buildRegexes(routeData), this.buildImperativeRegexes(metas)),
        );

        const data = this.assembleFile(className, userImportsBlock, routesContent, paths, dynamicPaths, regexes);

        return this.writeFile(directory, className, data);
    }

    /** Deep-merge two `method → key → name` maps; entries in `b` override `a`. */
    protected mergeNested(
        a: Record<string, Record<string, string>>,
        b: Record<string, Record<string, string>>,
    ): Record<string, Record<string, string>> {
        const merged: Record<string, Record<string, string>> = {};

        for (const [outerKey, innerMap] of [...Object.entries(a), ...Object.entries(b)]) {
            merged[outerKey] = { ...(merged[outerKey] ?? {}), ...innerMap };
        }

        return merged;
    }

    protected assembleFile(
        className: string,
        userImportsBlock: string,
        routesContent: string,
        paths: string,
        dynamicPaths: string,
        regexes: string,
    ): string {
        return [
            '// This file was automatically generated by Sindri.',
            '',
            ...this.buildFrameworkImportLines(AstHttpDataFileGenerator.FRAMEWORK_IMPORTS),
            ...this.buildFrameworkImportLines(AstHttpDataFileGenerator.FRAMEWORK_TYPE_IMPORTS, true),
            userImportsBlock,
            `export class ${className} extends HttpRoutingData {`,
            `    constructor() {`,
            `        super(`,
            `            ${routesContent},`,
            `            ${paths},`,
            `            ${dynamicPaths},`,
            `            ${regexes},`,
            `        );`,
            `    }`,
            `}`,
            '',
        ].join('\n');
    }

    public generateClassContents(
        routes: Record<string, ts.Expression>,
        routeData: Record<string, HttpRouteData>,
    ): string {
        const routesContent = this.getRoutesAsContent(routes, routeData);
        const paths = this.printNestedObject(this.buildPaths(routeData));
        const dynamicPaths = this.printNestedObject(this.buildDynamicPaths(routeData));
        const regexes = this.printNestedObject(this.buildRegexes(routeData));

        return [
            'super(',
            `            ${routesContent},`,
            `            ${paths},`,
            `            ${dynamicPaths},`,
            `            ${regexes},`,
            '        );',
        ].join('\n        ');
    }

    protected buildPaths(routeData: Record<string, HttpRouteData>): Record<string, Record<string, string>> {
        const paths: Record<string, Record<string, string>> = {};

        for (const [name, data] of Object.entries(routeData)) {
            if (data.isDynamic) {
                continue;
            }

            const path = this.normalizePath(data.path);

            for (const method of this.extractMethodNames(data.requestMethods)) {
                if (paths[method] === undefined) {
                    paths[method] = {};
                }

                paths[method][path] = name;
            }
        }

        return paths;
    }

    protected buildDynamicPaths(routeData: Record<string, HttpRouteData>): Record<string, Record<string, string>> {
        const dynamicPaths: Record<string, Record<string, string>> = {};

        for (const [name, data] of Object.entries(routeData)) {
            if (!data.isDynamic) {
                continue;
            }

            const path = this.normalizePath(data.path);

            for (const method of this.extractMethodNames(data.requestMethods)) {
                if (dynamicPaths[method] === undefined) {
                    dynamicPaths[method] = {};
                }

                dynamicPaths[method][path] = name;
            }
        }

        return dynamicPaths;
    }

    protected buildRegexes(routeData: Record<string, HttpRouteData>): Record<string, Record<string, string>> {
        const regexes: Record<string, Record<string, string>> = {};

        for (const [name, data] of Object.entries(routeData)) {
            if (!data.isDynamic || data.parameters.length === 0) {
                continue;
            }

            const regex = this.computeRegex(data);

            if (regex === '') {
                continue;
            }

            for (const method of this.extractMethodNames(data.requestMethods)) {
                if (regexes[method] === undefined) {
                    regexes[method] = {};
                }

                regexes[method][regex] = name;
            }
        }

        return regexes;
    }

    protected buildNestedStringArrayExpr(data: Record<string, Record<string, string>>): ts.ObjectLiteralExpression {
        const outerProps: ts.PropertyAssignment[] = [];

        for (const [outerKey, innerMap] of Object.entries(data)) {
            const innerProps: ts.PropertyAssignment[] = [];

            for (const [innerKey, value] of Object.entries(innerMap)) {
                innerProps.push(
                    ts.factory.createPropertyAssignment(
                        ts.factory.createStringLiteral(innerKey),
                        ts.factory.createStringLiteral(value),
                    ),
                );
            }

            outerProps.push(
                ts.factory.createPropertyAssignment(
                    ts.factory.createStringLiteral(outerKey),
                    ts.factory.createObjectLiteralExpression(innerProps, true),
                ),
            );
        }

        return ts.factory.createObjectLiteralExpression(outerProps, true);
    }

    protected printNestedObject(data: Record<string, Record<string, string>>): string {
        return this.printer.printNode(
            ts.EmitHint.Unspecified,
            this.buildNestedStringArrayExpr(data),
            this.dummySourceFile,
        );
    }

    protected computeRegex(data: HttpRouteData): string {
        const parameters = data.parameters.map((p) => this.buildParameter(p));

        const route = new DynamicRoute(
            data.path !== '' ? data.path : '/',
            data.name !== '' ? data.name : 'temp',
            '',
            parameters,
            (): never => {
                throw new GeneratorUnreachableException('unreachable');
            },
        );

        const processed = this.processor.route(route);

        if ('getRegex' in processed && typeof (processed as DynamicRoute).getRegex === 'function') {
            return (processed as DynamicRoute).getRegex();
        }

        return '';
    }

    protected buildParameter(data: HttpParameterData): Parameter {
        let regex = data.regex;

        if (regex.includes('::')) {
            const pos = regex.lastIndexOf('::');
            const className = regex.substring(0, pos);
            const propName = regex.substring(pos + 2);

            if (className === 'Regex') {
                const resolved = (Regex as unknown as Record<string, string>)[propName];

                if (typeof resolved === 'string' && resolved !== '') {
                    regex = resolved;
                }
            }
        }

        return new Parameter(data.name, regex, null, data.isOptional, data.shouldCapture);
    }

    protected normalizePath(path: string): string {
        return '/' + path.replace(/^\/+|\/+$/g, '');
    }

    protected extractMethodNames(requestMethods: readonly string[]): string[] {
        const methods: string[] = [];

        for (const method of requestMethods) {
            const pos = method.lastIndexOf('::');

            if (pos !== -1) {
                methods.push(method.substring(pos + 2));
            }
        }

        return methods;
    }

    protected getRoutesAsContent(
        routes: Record<string, ts.Expression>,
        routeData: Record<string, HttpRouteData>,
    ): string {
        return this.wrapRoutes(this.getRouteLines(routes, routeData));
    }

    /** Wrap route closure lines in the `{ ... }` object-literal body (or `{}`). */
    protected wrapRoutes(lines: readonly string[]): string {
        if (lines.length === 0) {
            return '{}';
        }

        return ['{', ...lines, '        }'].join('\n        ');
    }

    /** Build the per-route closure lines for attribute-scanned routes. */
    protected getRouteLines(routes: Record<string, ts.Expression>, routeData: Record<string, HttpRouteData>): string[] {
        const lines: string[] = [];

        for (const [key, routeExpr] of Object.entries(routes)) {
            const data = routeData[key] ?? null;
            const expr = data !== null ? this.injectRegex(routeExpr, data) : routeExpr;

            const printedRoute = this.printer.printNode(ts.EmitHint.Unspecified, expr, this.dummySourceFile);
            const formattedKey = key.includes('::')
                ? `[${this.printer.printNode(ts.EmitHint.Unspecified, this.buildEnumCaseExpr(key), this.dummySourceFile)}]`
                : `['${key}']`;

            lines.push(`            ${formattedKey}: (): RouteContract => ${printedRoute},`);
        }

        return lines;
    }

    /**
     * Replace the regex argument (slot 2) of a dynamic `new DynamicRoute(...)`
     * expression with the regex computed from the route's parameters. The reader
     * emits an empty-string placeholder there; the generator owns the routing
     * `Processor` and computes the real value here.
     */
    protected injectRegex(expr: ts.Expression, data: HttpRouteData): ts.Expression {
        if (!(data.isDynamic && ts.isNewExpression(expr))) {
            return expr;
        }

        const computedRegex = data.parameters.length > 0 ? this.computeRegex(data) : '';
        const original = expr.arguments ?? ts.factory.createNodeArray<ts.Expression>();
        const args = original.map((arg, index) => (index === 2 ? ts.factory.createStringLiteral(computedRegex) : arg));

        return ts.factory.createNewExpression(expr.expression, expr.typeArguments, args);
    }

    // -------------------------------------------------------------------------
    // Imperative `getRoutes()` support
    // -------------------------------------------------------------------------

    /**
     * Extract routing metadata from a `new Route(...)` / `new DynamicRoute(...)`
     * expression, matching the framework constructor argument order:
     *   Route(path, name, handler, requestMethods?)
     *   DynamicRoute(path, name, regex, parameters, handler, requestMethods?)
     */
    protected extractRouteMeta(expr: ts.Expression): ImperativeRouteMeta | undefined {
        if (!ts.isNewExpression(expr) || !ts.isIdentifier(expr.expression)) {
            return undefined;
        }

        const isDynamic = expr.expression.text === 'DynamicRoute';
        const args = expr.arguments ?? ts.factory.createNodeArray<ts.Expression>();

        const path = this.stringArg(args[0]);
        const name = this.stringArg(args[1]);

        if (name === undefined || path === undefined) {
            return undefined;
        }

        const regex = isDynamic ? (this.stringArg(args[2]) ?? '') : '';
        const methodsArg = isDynamic ? args[5] : args[3];
        const methods = this.extractMethodNamesFromArg(methodsArg);

        return { expr, name, path, isDynamic, regex, methods };
    }

    protected stringArg(node: ts.Expression | undefined): string | undefined {
        return node !== undefined && ts.isStringLiteral(node) ? node.text : undefined;
    }

    /**
     * Resolve a `[RequestMethod.GET, ...]` argument to method-name strings,
     * defaulting to `[HEAD, GET]` (the framework `Route` default) when omitted
     * and expanding `RequestMethod.ANY` to every request method.
     */
    protected extractMethodNamesFromArg(node: ts.Expression | undefined): string[] {
        if (node === undefined || !ts.isArrayLiteralExpression(node)) {
            return [RequestMethod.HEAD, RequestMethod.GET];
        }

        const methods: string[] = [];

        for (const element of node.elements) {
            if (!ts.isPropertyAccessExpression(element)) {
                continue;
            }

            const method = element.name.text;

            if (method === 'ANY') {
                return allRequestMethods();
            }

            methods.push(method);
        }

        return methods;
    }

    /** Build the per-route closure lines for imperative `getRoutes()` routes. */
    protected getImperativeRouteLines(metas: readonly ImperativeRouteMeta[]): string[] {
        // Imperative route expressions come parsed from a provider's `getRoutes()`
        // body, so they are emitted verbatim via their original source text.
        return metas.map((meta) => `            ['${meta.name}']: (): RouteContract => ${meta.expr.getText()},`);
    }

    protected buildImperativePaths(
        metas: readonly ImperativeRouteMeta[],
        dynamic: boolean,
    ): Record<string, Record<string, string>> {
        const paths: Record<string, Record<string, string>> = {};

        for (const meta of metas) {
            if (meta.isDynamic !== dynamic) {
                continue;
            }

            for (const method of meta.methods) {
                (paths[method] ??= {})[meta.path] = meta.name;
            }
        }

        return paths;
    }

    protected buildImperativeRegexes(metas: readonly ImperativeRouteMeta[]): Record<string, Record<string, string>> {
        const regexes: Record<string, Record<string, string>> = {};

        for (const meta of metas) {
            if (!meta.isDynamic || meta.regex === '') {
                continue;
            }

            for (const method of meta.methods) {
                (regexes[method] ??= {})[meta.regex] = meta.name;
            }
        }

        return regexes;
    }
}
