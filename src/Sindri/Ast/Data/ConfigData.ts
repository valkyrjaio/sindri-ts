/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { ConfigDataContract } from './Contract/ConfigDataContract.js';

export class ConfigData implements ConfigDataContract {
    constructor(
        readonly namespace: string,
        readonly dir: string,
        readonly dataPath: string,
        readonly dataNamespace: string,
        readonly providers: readonly string[] = [],
    ) {}
}