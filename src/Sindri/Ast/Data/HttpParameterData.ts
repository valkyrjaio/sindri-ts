/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { HttpParameterDataContract } from './Contract/HttpParameterDataContract.ts';

export class HttpParameterData implements HttpParameterDataContract {
    constructor(
        readonly name: string,
        readonly regex: string,
        readonly cast: string | null = null,
        readonly isOptional: boolean = false,
        readonly shouldCapture: boolean = true,
    ) {}
}
