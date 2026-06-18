/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { CliRouteAttributeResult } from '../Data/Result/CliRouteAttributeResult.ts';

export interface CliRouteAttributeReaderContract {
    readFile(filePath: string): CliRouteAttributeResult;
}
