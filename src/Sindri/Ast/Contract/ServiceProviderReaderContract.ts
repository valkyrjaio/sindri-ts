/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import type { ServiceProviderResult } from '../Data/Result/ServiceProviderResult.ts';

export interface ServiceProviderReaderContract {
    readFile(filePath: string): ServiceProviderResult;
}
