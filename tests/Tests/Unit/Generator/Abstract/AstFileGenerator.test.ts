/*
 * This file is part of the Valkyrja package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import * as fs from 'fs';

import { ts } from 'ts-morph';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GenerateStatus } from '../../../../../src/Sindri/Generator/Enum/GenerateStatus.ts';
import { AstFileGenerator } from '../../../../../src/Sindri/Generator/Abstract/AstFileGenerator.ts';

vi.mock('fs', () => ({
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn(),
}));

const existsSync = vi.mocked(fs.existsSync);
const readFileSync = vi.mocked(fs.readFileSync);
const writeFileSync = vi.mocked(fs.writeFileSync);

class TestAstFileGenerator extends AstFileGenerator {
    publicBuildEnumCaseExpr(value: string): ts.Expression {
        return this.buildEnumCaseExpr(value);
    }

    publicWriteFile(directory: string, className: string, data: string): GenerateStatus {
        return this.writeFile(directory, className, data);
    }

    publicBuildUserImportsBlock(map: Record<string, string>, reserved: readonly string[]): string {
        return this.buildUserImportsBlock(map, reserved);
    }

    publicBuildFrameworkImportLines(imports: Readonly<Record<string, string>>, isType?: boolean): string[] {
        return this.buildFrameworkImportLines(imports, isType);
    }
}

beforeEach(() => {
    existsSync.mockReturnValue(false);
    writeFileSync.mockReturnValue(undefined);
});

afterEach(() => {
    vi.clearAllMocks();
});

describe('AstFileGenerator', () => {
    it('builds a property-access expression for a ClassName::CASE string', () => {
        const expr = new TestAstFileGenerator().publicBuildEnumCaseExpr('App\\Cli\\Mode::OPTIONAL');

        expect(ts.isPropertyAccessExpression(expr)).toBe(true);
    });

    it('builds a string literal when there is no :: separator', () => {
        const expr = new TestAstFileGenerator().publicBuildEnumCaseExpr('plain');

        expect(ts.isStringLiteral(expr)).toBe(true);
    });

    it('writes a file and returns SUCCESS', () => {
        const status = new TestAstFileGenerator().publicWriteFile('/out', 'Data', 'contents');

        expect(status).toBe(GenerateStatus.SUCCESS);
        expect(writeFileSync).toHaveBeenCalledWith('/out/Data.ts', 'contents', 'utf-8');
    });

    it('returns SKIPPED when the contents are unchanged', () => {
        existsSync.mockReturnValue(true);
        readFileSync.mockReturnValue('contents' as never);

        expect(new TestAstFileGenerator().publicWriteFile('/out/', 'Data', 'contents')).toBe(GenerateStatus.SKIPPED);
    });

    describe('buildUserImportsBlock', () => {
        it('emits an import per class, dropping names the framework header binds', () => {
            const block = new TestAstFileGenerator().publicBuildUserImportsBlock(
                { Route: '@valkyrjaio/valkyrja/Cli/Routing/Data/Route.ts', CliRouteProvider: './CliRouteProvider.ts' },
                ['Route'],
            );

            expect(block).toBe(`import { CliRouteProvider } from './CliRouteProvider.ts';\n`);
        });

        it('returns an empty string when every name is reserved', () => {
            expect(new TestAstFileGenerator().publicBuildUserImportsBlock({ Route: './Route.ts' }, ['Route'])).toBe('');
        });
    });

    describe('buildFrameworkImportLines', () => {
        it('renders value imports by default and type imports on request', () => {
            const generator = new TestAstFileGenerator();

            expect(generator.publicBuildFrameworkImportLines({ Route: './Route.ts' })).toEqual([
                `import { Route } from './Route.ts';`,
            ]);
            expect(generator.publicBuildFrameworkImportLines({ RouteContract: './RouteContract.ts' }, true)).toEqual([
                `import type { RouteContract } from './RouteContract.ts';`,
            ]);
        });
    });

    it('returns FAILURE when writing throws', () => {
        writeFileSync.mockImplementation(() => {
            throw new Error('boom');
        });

        expect(new TestAstFileGenerator().publicWriteFile('/out', 'Data', 'contents')).toBe(GenerateStatus.FAILURE);
    });
});
