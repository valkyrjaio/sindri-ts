/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

export class ServiceProviderResult {
    constructor(
        readonly serviceClasses: readonly string[] = [],
        readonly publishers: Readonly<Record<string, readonly [string, string]>> = {},
    ) {}

    merge(other: ServiceProviderResult): ServiceProviderResult {
        return new ServiceProviderResult([...new Set([...this.serviceClasses, ...other.serviceClasses])], {
            ...this.publishers,
            ...other.publishers,
        });
    }
}
