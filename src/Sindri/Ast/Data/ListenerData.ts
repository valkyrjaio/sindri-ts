/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
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
