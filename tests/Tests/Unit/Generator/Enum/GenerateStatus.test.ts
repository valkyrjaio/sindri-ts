/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import { describe, expect, it } from 'vitest';

import { GenerateStatus } from '../../../../../src/Sindri/Generator/Enum/GenerateStatus.ts';

describe('GenerateStatus', () => {
    it('exposes the generation status values', () => {
        expect(GenerateStatus.SUCCESS).toBe('SUCCESS');
        expect(GenerateStatus.FAILURE).toBe('FAILURE');
        expect(GenerateStatus.SKIPPED).toBe('SKIPPED');
    });
});
