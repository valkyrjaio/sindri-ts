/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import type { HandlerDataContract } from './HandlerDataContract.ts';

export interface ListenerDataContract {
    readonly eventId: string;
    readonly name: string;
    readonly handler: HandlerDataContract | null;
}
