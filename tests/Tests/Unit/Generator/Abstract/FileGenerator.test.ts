/*
 * This file is part of the Valkyrja package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import * as fs from 'fs';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GenerateStatus } from '../../../../../src/Sindri/Generator/Enum/GenerateStatus.ts';
import { FileGenerator } from '../../../../../src/Sindri/Generator/Abstract/FileGenerator.ts';

vi.mock('fs', () => ({
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn(),
}));

const existsSync = vi.mocked(fs.existsSync);
const readFileSync = vi.mocked(fs.readFileSync);
const writeFileSync = vi.mocked(fs.writeFileSync);

class TestFileGenerator extends FileGenerator {
    constructor(
        directory: string,
        className: string,
        private readonly contents: () => string,
    ) {
        super(directory, className);
    }

    generateFileContents(): string {
        return this.contents();
    }
}

beforeEach(() => {
    existsSync.mockReturnValue(false);
    writeFileSync.mockReturnValue(undefined);
});

afterEach(() => {
    vi.clearAllMocks();
});

describe('FileGenerator', () => {
    it('writes the file and returns SUCCESS when the contents differ', () => {
        existsSync.mockReturnValue(true);
        readFileSync.mockReturnValue('old contents' as never);

        const status = new TestFileGenerator('/out', 'Data', () => 'new contents').generateFile();

        expect(status).toBe(GenerateStatus.SUCCESS);
        expect(writeFileSync).toHaveBeenCalledWith('/out/Data.ts', 'new contents', 'utf-8');
    });

    it('writes a brand new file when none exists', () => {
        existsSync.mockReturnValue(false);

        const status = new TestFileGenerator('/out', 'Data', () => 'fresh').generateFile();

        expect(status).toBe(GenerateStatus.SUCCESS);
        expect(writeFileSync).toHaveBeenCalledWith('/out/Data.ts', 'fresh', 'utf-8');
    });

    it('returns SKIPPED when the contents are unchanged', () => {
        existsSync.mockReturnValue(true);
        readFileSync.mockReturnValue('same' as never);

        const status = new TestFileGenerator('/out/', 'Data', () => 'same').generateFile();

        expect(status).toBe(GenerateStatus.SKIPPED);
        expect(writeFileSync).not.toHaveBeenCalled();
    });

    it('returns FAILURE when generation throws', () => {
        const status = new TestFileGenerator('/out', 'Data', () => {
            throw new Error('boom');
        }).generateFile();

        expect(status).toBe(GenerateStatus.FAILURE);
    });
});
