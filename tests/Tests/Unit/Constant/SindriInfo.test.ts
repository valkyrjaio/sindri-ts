/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import { describe, expect, it } from 'vitest';

import { SindriInfo } from '../../../../src/Sindri/Constant/SindriInfo.ts';

describe('SindriInfo', () => {
    it('exposes the version and build metadata', () => {
        // The version is bumped by the release workflow, so assert its shape rather than an exact value.
        expect(SindriInfo.VERSION).toMatch(/^\d+\.\d+\.\d+$/);
        expect(typeof SindriInfo.VERSION_BUILD_DATE_TIME).toBe('string');
        expect(SindriInfo.ICON).toContain('█');
    });
});
