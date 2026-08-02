/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import type { HttpParameterDataContract } from './Contract/HttpParameterDataContract.ts';

export class HttpParameterData implements HttpParameterDataContract {
    constructor(
        readonly name: string,
        readonly regex: string,
        readonly cast: string | null = null,
        readonly isOptional: boolean = false,
        readonly shouldCapture: boolean = true,
        readonly defaultValue: string | number | boolean | null = null,
    ) {}
}
