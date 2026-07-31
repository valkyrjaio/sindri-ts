/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { ConfigSourceResult } from '../../../Ast/Data/Result/ConfigSourceResult.ts';
import type { GenerateStatus } from '../../Enum/GenerateStatus.ts';

export interface CachedConfigFileGeneratorContract {
    generateFile(
        directory: string,
        className: string,
        source: ConfigSourceResult,
        containerDataClass: string,
        containerDataSpecifier: string,
    ): GenerateStatus;
}
