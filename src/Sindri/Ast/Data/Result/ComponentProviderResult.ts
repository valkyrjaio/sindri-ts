/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
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