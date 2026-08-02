/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
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
