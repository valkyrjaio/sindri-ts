/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { HttpRouteAttributeResult } from '../Data/Result/HttpRouteAttributeResult.js';

export interface HttpRouteAttributeReaderContract {
    readFile(filePath: string): HttpRouteAttributeResult;
}