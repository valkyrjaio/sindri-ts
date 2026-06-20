/*
 * This file is part of the Valkyrja package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
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
});
