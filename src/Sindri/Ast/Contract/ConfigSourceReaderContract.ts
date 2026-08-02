/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import type { ConfigSourceResult } from '../Data/Result/ConfigSourceResult.ts';

export interface ConfigSourceReaderContract {
    readFile(filePath: string): ConfigSourceResult;
}
