/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { CliArgumentParameterDataContract } from './Contract/CliArgumentParameterDataContract.js';

export class CliArgumentParameterData implements CliArgumentParameterDataContract {
    constructor(
        readonly name: string,
        readonly description: string,
        readonly cast: string | null = null,
        readonly mode: string = 'Valkyrja\\Cli\\Routing\\Enum\\ArgumentMode::OPTIONAL',
        readonly valueMode: string = 'Valkyrja\\Cli\\Routing\\Enum\\ArgumentValueMode::DEFAULT',
    ) {}
}
