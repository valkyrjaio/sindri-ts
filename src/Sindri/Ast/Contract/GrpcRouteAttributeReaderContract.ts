/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import type { GrpcRouteAttributeResult } from '../Data/Result/GrpcRouteAttributeResult.ts';

export interface GrpcRouteAttributeReaderContract {
    readFile(filePath: string): GrpcRouteAttributeResult;
}
