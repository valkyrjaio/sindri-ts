/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import type { HandlerDataContract } from './Contract/HandlerDataContract.ts';

export class HandlerData implements HandlerDataContract {
    readonly class: string;
    readonly method: string;

    constructor(className: string, method: string) {
        this.class = className;
        this.method = method;
    }
}
