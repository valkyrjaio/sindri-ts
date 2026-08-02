/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import type { CliArgumentParameterDataContract } from './Contract/CliArgumentParameterDataContract.ts';

export class CliArgumentParameterData implements CliArgumentParameterDataContract {
    constructor(
        readonly name: string,
        readonly description: string,
        readonly cast: string | null = null,
        readonly mode: string = 'Valkyrja\\Cli\\Routing\\Enum\\ArgumentMode::OPTIONAL',
        readonly valueMode: string = 'Valkyrja\\Cli\\Routing\\Enum\\ArgumentValueMode::DEFAULT',
    ) {}
}
