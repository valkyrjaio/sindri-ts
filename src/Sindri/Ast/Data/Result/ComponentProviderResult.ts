/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

export class ComponentProviderResult {
    constructor(
        readonly componentProviders: readonly string[] = [],
        readonly serviceProviders: readonly string[] = [],
        readonly listenerProviders: readonly string[] = [],
        readonly cliRouteProviders: readonly string[] = [],
        readonly httpRouteProviders: readonly string[] = [],
    ) {}

    merge(other: ComponentProviderResult): ComponentProviderResult {
        return new ComponentProviderResult(
            [...new Set([...this.componentProviders, ...other.componentProviders])],
            [...new Set([...this.serviceProviders, ...other.serviceProviders])],
            [...new Set([...this.listenerProviders, ...other.listenerProviders])],
            [...new Set([...this.cliRouteProviders, ...other.cliRouteProviders])],
            [...new Set([...this.httpRouteProviders, ...other.httpRouteProviders])],
        );
    }
}
