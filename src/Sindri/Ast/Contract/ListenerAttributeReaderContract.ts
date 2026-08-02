/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import type { ListenerAttributeResult } from '../Data/Result/ListenerAttributeResult.ts';

export interface ListenerAttributeReaderContract {
    readFile(filePath: string): ListenerAttributeResult;
}
