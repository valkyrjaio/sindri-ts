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
import { AstEventDataFileGenerator } from '../../../../../../src/Sindri/Generator/Ast/Event/AstEventDataFileGenerator.ts';

vi.mock('fs', () => ({
    existsSync: vi.fn(() => false),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn(),
}));

describe('AstEventDataFileGenerator', () => {
    it('generates an event data file from listeners', () => {
        const generator = new AstEventDataFileGenerator();
        generator.classImportMap = { ListenerA: './ListenerA.ts' };

        const listeners = { sendWelcome: ts.factory.createNull() };
        const status = generator.generateFile('/out', 'EventData', 'App.Data', listeners);

        expect(status).toBe(GenerateStatus.SUCCESS);
    });

    it('generates a file with no listeners', () => {
        expect(new AstEventDataFileGenerator().generateFile('/out', 'EventData', 'App.Data', {})).toBe(
            GenerateStatus.SUCCESS,
        );
    });
});
