/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import type { CliOptionParameterDataContract } from './Contract/CliOptionParameterDataContract.ts';

export class CliOptionParameterData implements CliOptionParameterDataContract {
    constructor(
        readonly name: string,
        readonly description: string,
        readonly valueDisplayName: string = '',
        readonly cast: string | null = null,
        readonly defaultValue: string = '',
        readonly shortNames: readonly string[] = [],
        readonly validValues: readonly string[] = [],
        readonly mode: string = 'Valkyrja\\Cli\\Routing\\Enum\\OptionMode::OPTIONAL',
        readonly valueMode: string = 'Valkyrja\\Cli\\Routing\\Enum\\OptionValueMode::DEFAULT',
    ) {}
}
