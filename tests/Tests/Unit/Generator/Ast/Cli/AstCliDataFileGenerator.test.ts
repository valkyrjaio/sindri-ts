/*
 * This file is part of the Valkyrja package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ts } from 'ts-morph';

import { describe, expect, it, vi } from 'vitest';

import { GenerateStatus } from '../../../../../../src/Sindri/Generator/Enum/GenerateStatus.ts';
import { AstCliDataFileGenerator } from '../../../../../../src/Sindri/Generator/Ast/Cli/AstCliDataFileGenerator.ts';

vi.mock('fs', () => ({
    existsSync: vi.fn(() => false),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn(),
}));

describe('AstCliDataFileGenerator', () => {
    it('generates a cli routing data file with user imports', () => {
        const generator = new AstCliDataFileGenerator();
        generator.classImportMap = { SomeController: './SomeController.ts' };

        const routes = { build: ts.factory.createNull() };
        const status = generator.generateFile('/out', 'CliData', 'App.Data', routes);

        expect(status).toBe(GenerateStatus.SUCCESS);
    });

    it('generates a file with no user imports and no routes', () => {
        expect(new AstCliDataFileGenerator().generateFile('/out', 'CliData', 'App.Data', {})).toBe(
            GenerateStatus.SUCCESS,
        );
    });

    it('formats route keys that contain a "::" separator', () => {
        const routes = { 'App\\Command::NAME': ts.factory.createNull() };

        expect(new AstCliDataFileGenerator().generateFile('/out', 'CliData', 'App.Data', routes)).toBe(
            GenerateStatus.SUCCESS,
        );
    });
});
