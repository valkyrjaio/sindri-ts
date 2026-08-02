/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import type { RouteProviderResult } from '../Data/Result/RouteProviderResult.ts';

export interface RouteProviderReaderContract {
    readFile(filePath: string): RouteProviderResult;
}
