/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import type { CliRouteAttributeResult } from '../Data/Result/CliRouteAttributeResult.ts';

export interface CliRouteAttributeReaderContract {
    readFile(filePath: string): CliRouteAttributeResult;
}
