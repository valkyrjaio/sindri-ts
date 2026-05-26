/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { ListenerAttributeResult } from '../Data/Result/ListenerAttributeResult.js';

export interface ListenerAttributeReaderContract {
    readFile(filePath: string): ListenerAttributeResult;
}