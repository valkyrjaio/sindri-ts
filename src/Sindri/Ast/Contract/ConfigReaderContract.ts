/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import type { ConfigResult } from '../Data/Result/ConfigResult.ts';

export interface ConfigReaderContract {
    readFile(filePath: string): ConfigResult;
}
