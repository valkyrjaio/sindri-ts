/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import type { HttpRouteAttributeResult } from '../Data/Result/HttpRouteAttributeResult.ts';

export interface HttpRouteAttributeReaderContract {
    readFile(filePath: string): HttpRouteAttributeResult;
}
