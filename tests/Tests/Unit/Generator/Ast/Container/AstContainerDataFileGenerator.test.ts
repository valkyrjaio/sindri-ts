/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import { describe, expect, it, vi } from 'vitest';

import { GenerateStatus } from '../../../../../../src/Sindri/Generator/Enum/GenerateStatus.ts';
import { AstContainerDataFileGenerator } from '../../../../../../src/Sindri/Generator/Ast/Container/AstContainerDataFileGenerator.ts';

vi.mock('fs', () => ({
    existsSync: vi.fn(() => false),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn(),
}));

describe('AstContainerDataFileGenerator', () => {
    it('generates a container data file from publishers', () => {
        const generator = new AstContainerDataFileGenerator();
        generator.classImportMap = { ProviderA: './ProviderA.ts' };

        const publishers = { 'service.a': ['ProviderA', 'publishA'] as const };
        const status = generator.generateFile('/out', 'ContainerData', 'App.Data', publishers);

        expect(status).toBe(GenerateStatus.SUCCESS);
    });

    it('generates a file with no publishers', () => {
        expect(new AstContainerDataFileGenerator().generateFile('/out', 'ContainerData', 'App.Data', {})).toBe(
            GenerateStatus.SUCCESS,
        );
    });

    it('formats enum-case service ids that contain a "::" separator', () => {
        const generator = new AstContainerDataFileGenerator();
        generator.classImportMap = { ProviderA: './ProviderA.ts' };

        const publishers = { 'App\\Service::ID': ['ProviderA', 'publishA'] as const };

        expect(generator.generateFile('/out', 'ContainerData', 'App.Data', publishers)).toBe(GenerateStatus.SUCCESS);
    });
});
