/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import { describe, expect, it } from 'vitest';

import { SindriServiceId } from '../../../../src/Sindri/Constant/SindriServiceId.ts';

describe('SindriServiceId', () => {
    it('exposes the reader and generator service ids', () => {
        expect(SindriServiceId.ConfigReaderContract).toBe('Sindri.Ast.Contract.ConfigReaderContract');
        expect(SindriServiceId.CliDataFileGeneratorContract).toBe(
            'Sindri.Generator.Cli.Contract.CliDataFileGeneratorContract',
        );
    });
});
