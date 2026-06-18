/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
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
