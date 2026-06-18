/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { ListenerDataContract } from './Contract/ListenerDataContract.ts';
import type { HandlerData } from './HandlerData.ts';

export class ListenerData implements ListenerDataContract {
    constructor(
        readonly eventId: string,
        readonly name: string,
        readonly handler: HandlerData | null = null,
    ) {}
}
