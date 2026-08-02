/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import type { ts } from 'ts-morph';

import type { GenerateStatus } from '../../Enum/GenerateStatus.ts';

export interface EventDataFileGeneratorContract {
    generateFile(
        directory: string,
        className: string,
        namespace: string,
        listeners: Record<string, ts.Expression>,
    ): GenerateStatus;

    generateClassContents(listeners: Record<string, ts.Expression>): string;
}
