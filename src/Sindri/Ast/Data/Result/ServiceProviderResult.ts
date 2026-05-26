/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export class ServiceProviderResult {
    constructor(
        readonly serviceClasses: readonly string[] = [],
        readonly publishers: Readonly<Record<string, readonly [string, string]>> = {},
    ) {}

    merge(other: ServiceProviderResult): ServiceProviderResult {
        return new ServiceProviderResult(
            [...new Set([...this.serviceClasses, ...other.serviceClasses])],
            { ...this.publishers, ...other.publishers },
        );
    }
}