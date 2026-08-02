/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import type { ConfigImport } from '../ConfigImport.ts';

/**
 * The source-level shape of an application config class.
 *
 * Field initializers are kept as source text rather than evaluated values, so a
 * generated config reproduces expressions such as `process.env['APP_KEY']` or
 * `process.cwd()` exactly as the author wrote them.
 */
export class ConfigSourceResult {
    constructor(
        readonly className: string = '',
        readonly contractName: string = '',
        readonly contractSpecifier: string = '',
        readonly fields: Readonly<Record<string, string>> = {},
        readonly types: Readonly<Record<string, string>> = {},
        readonly imports: readonly ConfigImport[] = [],
    ) {}
}
