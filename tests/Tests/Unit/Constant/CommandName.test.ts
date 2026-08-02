/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import { describe, expect, it } from 'vitest';

import { CommandName } from '../../../../src/Sindri/Constant/CommandName.ts';

describe('CommandName', () => {
    it('exposes the data:generate command name', () => {
        expect(CommandName.DATA_GENERATE).toBe('data:generate');
    });
});
