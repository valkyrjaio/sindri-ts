/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { ServiceProviderResult } from '../Data/Result/ServiceProviderResult.js';

export interface ServiceProviderReaderContract {
    readFile(filePath: string): ServiceProviderResult;
}
