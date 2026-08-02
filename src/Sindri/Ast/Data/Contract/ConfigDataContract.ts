/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

export interface ConfigDataContract {
    readonly namespace: string;
    readonly dir: string;
    readonly dataPath: string;
    readonly dataNamespace: string;
    readonly providers: readonly string[];
}
