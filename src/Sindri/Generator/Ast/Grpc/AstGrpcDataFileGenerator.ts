/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import { ts } from 'ts-morph';

import { AstFileGenerator } from '../../Abstract/AstFileGenerator.ts';

import type { GenerateStatus } from '../../Enum/GenerateStatus.ts';
import type { GrpcDataFileGeneratorContract } from '../../Grpc/Contract/GrpcDataFileGeneratorContract.ts';

export class AstGrpcDataFileGenerator extends AstFileGenerator implements GrpcDataFileGeneratorContract {
    /** The framework classes every generated gRPC data file imports as values. */
    protected static readonly FRAMEWORK_IMPORTS: Readonly<Record<string, string>> = {
        GrpcRoutingData: '@valkyrjaio/valkyrja/Grpc/Routing/Data/GrpcRoutingData.ts',
        Route: '@valkyrjaio/valkyrja/Grpc/Routing/Data/Route.ts',
    };

    /** The framework types every generated gRPC data file imports. */
    protected static readonly FRAMEWORK_TYPE_IMPORTS: Readonly<Record<string, string>> = {
        RouteContract: '@valkyrjaio/valkyrja/Grpc/Routing/Data/Contract/RouteContract.ts',
    };

    public generateFile(
        directory: string,
        className: string,
        namespace: string,
        routes: Record<string, ts.Expression>,
    ): GenerateStatus {
        return this.writeFile(
            directory,
            className,
            this.buildDataFile(
                className,
                'GrpcRoutingData',
                this.generateClassContents(routes),
                AstGrpcDataFileGenerator.FRAMEWORK_IMPORTS,
                AstGrpcDataFileGenerator.FRAMEWORK_TYPE_IMPORTS,
            ),
        );
    }

    /**
     * Generate the gRPC routing data file from imperative `getRoutes()` route objects — each
     * `new Route(method, handler, ...)` is keyed by its fully-qualified method (the first
     * constructor argument) and emitted verbatim.
     */
    public generateFileFromRoutes(
        directory: string,
        className: string,
        namespace: string,
        routeExprs: readonly ts.Expression[],
    ): GenerateStatus {
        return this.generateMergedFile(directory, className, namespace, {}, routeExprs);
    }

    /**
     * Generate the gRPC routing data file by merging the routes the decorators declare with the
     * routes an imperative `getRoutes()` body constructs. Both are keyed by fully-qualified method
     * into one service map. A decorator entry comes first, and an imperative entry overrides it when
     * the two name one method.
     */
    public generateMergedFile(
        directory: string,
        className: string,
        namespace: string,
        routes: Record<string, ts.Expression>,
        routeExprs: readonly ts.Expression[],
    ): GenerateStatus {
        const merged: Record<string, ts.Expression> = { ...routes };

        for (const expr of routeExprs) {
            const key = this.routeKey(expr);

            if (key === undefined) {
                continue;
            }

            merged[key] = expr;
        }

        return this.generateFile(directory, className, namespace, merged);
    }

    /**
     * Derive the service-map key for a route from its method argument.
     *
     * A route expression is frequently a chain — `new Route(...).withClientStreaming(true)` — so the
     * `new` expression is unwrapped from any trailing calls before its first argument is read. A
     * literal method keys the map by its own text; a constant reference is kept as a `Class::CASE`
     * marker so the generated file emits the reference rather than baking in the value it holds
     * today.
     */
    protected routeKey(expr: ts.Expression): string | undefined {
        const newExpr = this.unwrapNewExpression(expr);

        if (newExpr === undefined) {
            return undefined;
        }

        return this.dataKeyOf((newExpr.arguments ?? [])[0]);
    }

    /** Walk back through a `with*` builder chain to the `new Route(...)` it was built from. */
    protected unwrapNewExpression(expr: ts.Expression): ts.NewExpression | undefined {
        let current: ts.Expression = expr;

        while (ts.isCallExpression(current) && ts.isPropertyAccessExpression(current.expression)) {
            current = current.expression.expression;
        }

        return ts.isNewExpression(current) ? current : undefined;
    }

    public generateClassContents(routes: Record<string, ts.Expression>): string {
        return this.buildSuperCall(routes, 'RouteContract');
    }
}
