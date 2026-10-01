/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import { ts } from 'ts-morph';

import { AstFileGenerator } from '../../Abstract/AstFileGenerator.ts';
import type { CliDataFileGeneratorContract } from '../../Cli/Contract/CliDataFileGeneratorContract.ts';
import type { GenerateStatus } from '../../Enum/GenerateStatus.ts';

export class AstCliDataFileGenerator extends AstFileGenerator implements CliDataFileGeneratorContract {
    /** The framework classes every generated CLI data file imports as values. */
    protected static readonly FRAMEWORK_IMPORTS: Readonly<Record<string, string>> = {
        CliRoutingData: '@valkyrjaio/valkyrja/Cli/Routing/Data/CliRoutingData.ts',
        Route: '@valkyrjaio/valkyrja/Cli/Routing/Data/Route.ts',
        ArgumentParameter: '@valkyrjaio/valkyrja/Cli/Routing/Data/ArgumentParameter.ts',
        OptionParameter: '@valkyrjaio/valkyrja/Cli/Routing/Data/OptionParameter.ts',
        ArgumentMode: '@valkyrjaio/valkyrja/Cli/Routing/Enum/ArgumentMode.ts',
        ArgumentValueMode: '@valkyrjaio/valkyrja/Cli/Routing/Enum/ArgumentValueMode.ts',
        OptionMode: '@valkyrjaio/valkyrja/Cli/Routing/Enum/OptionMode.ts',
        OptionValueMode: '@valkyrjaio/valkyrja/Cli/Routing/Enum/OptionValueMode.ts',
    };

    /** The framework types every generated CLI data file imports. */
    protected static readonly FRAMEWORK_TYPE_IMPORTS: Readonly<Record<string, string>> = {
        RouteContract: '@valkyrjaio/valkyrja/Cli/Routing/Data/Contract/RouteContract.ts',
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
                'CliRoutingData',
                this.generateClassContents(routes),
                AstCliDataFileGenerator.FRAMEWORK_IMPORTS,
                AstCliDataFileGenerator.FRAMEWORK_TYPE_IMPORTS,
            ),
        );
    }

    /**
     * Generate the CLI routing data file from imperative `getRoutes()` route
     * objects — each `new Route(name, description, handler, ...)` is keyed by
     * its command name (the first constructor argument) and emitted verbatim.
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
     * Generate the CLI routing data file by MERGING attribute-scanned command
     * routes with imperative `getRoutes()` route objects — both are keyed by
     * command name into a single routes map. Attribute entries come first;
     * imperative entries override on a name collision.
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
            if (!ts.isNewExpression(expr)) {
                continue;
            }

            const key = this.routeKey((expr.arguments ?? [])[0]);

            if (key === undefined) {
                continue;
            }

            merged[key] = expr;
        }

        return this.generateFile(directory, className, namespace, merged);
    }

    /**
     * Derive the map key for a route from its name argument.
     *
     * A literal name keys the map by its own text. A constant reference
     * (`CliCommandName.LIST` — how the framework's own commands name
     * themselves) is kept as a `Class::CASE` marker, so the generated file
     * emits the constant reference as a computed key rather than baking in the
     * value it happens to hold today.
     */
    protected routeKey(nameArg: ts.Expression | undefined): string | undefined {
        return this.dataKeyOf(nameArg);
    }

    public generateClassContents(routes: Record<string, ts.Expression>): string {
        return this.buildSuperCall(routes, 'RouteContract');
    }
}
