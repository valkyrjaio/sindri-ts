/*
 * This file is part of the Valkyrja package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import * as fs from 'fs';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { ConfigImport } from '../../../../../../src/Sindri/Ast/Data/ConfigImport.ts';
import { ConfigSourceResult } from '../../../../../../src/Sindri/Ast/Data/Result/ConfigSourceResult.ts';
import { AstCachedConfigFileGenerator } from '../../../../../../src/Sindri/Generator/Ast/Config/AstCachedConfigFileGenerator.ts';
import { GenerateStatus } from '../../../../../../src/Sindri/Generator/Enum/GenerateStatus.ts';

vi.mock('fs', () => ({
    existsSync: vi.fn(() => false),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn(),
}));

const writeFileSync = vi.mocked(fs.writeFileSync);

function source(overrides: Partial<ConfigSourceResult> = {}): ConfigSourceResult {
    return new ConfigSourceResult(
        overrides.className ?? 'Config',
        overrides.contractName ?? 'HttpConfigContract',
        overrides.contractSpecifier ?? '@valkyrjaio/valkyrja/Application/Data/Contract/HttpConfigContract.ts',
        overrides.fields ?? { namespace: "'App'", debugMode: 'true' },
        overrides.types ?? { namespace: 'string' },
        overrides.imports ?? [],
    );
}

function generate(result: ConfigSourceResult): string {
    const status = new AstCachedConfigFileGenerator().generateFile(
        '/out',
        'CachedConfig',
        result,
        'AppContainerData',
        './Data/AppContainerData.ts',
    );

    expect(status).toBe(GenerateStatus.SUCCESS);

    return writeFileSync.mock.calls[0]?.[1] as string;
}

afterEach(() => {
    vi.clearAllMocks();
});

describe('AstCachedConfigFileGenerator', () => {
    it('implements the contract directly rather than extending a framework config', () => {
        const output = generate(source());

        expect(output).toContain('export class CachedConfig implements HttpConfigContract {');
        expect(output).not.toContain('extends');
    });

    it('binds the config under the service id of its contract', () => {
        expect(generate(source())).toContain('static readonly id = ApplicationServiceId.HttpConfigContract;');
    });

    it.each([
        ['ConfigContract', 'ApplicationServiceId.ConfigContract'],
        ['CliConfigContract', 'ApplicationServiceId.CliConfigContract'],
    ])('binds a %s config under %s', (contractName, serviceId) => {
        expect(generate(source({ contractName }))).toContain(`static readonly id = ${serviceId};`);
    });

    it('emits an empty service id when the contract is not one it knows', () => {
        expect(generate(source({ contractName: 'MysteryContract' }))).toContain('static readonly id = ;');
    });

    it('copies a field initializer as source text', () => {
        const output = generate(source({ fields: { key: "process.env['APP_KEY'] ?? ''" }, types: {} }));

        expect(output).toContain("readonly key = process.env['APP_KEY'] ?? '';");
    });

    it('declares the field type when the source has one', () => {
        expect(generate(source())).toContain("readonly namespace: string = 'App';");
    });

    it('pins debug mode off even when the source turns it on', () => {
        expect(generate(source())).toContain('readonly debugMode = false;');
        expect(generate(source())).not.toContain('readonly debugMode = true;');
    });

    it('replaces the provider list with an empty one', () => {
        const output = generate(source({ fields: { providers: '[new ComponentProvider()]' }, types: {} }));

        expect(output).toContain('readonly providers: ComponentProviderContract[] = [];');
        expect(output).not.toContain('new ComponentProvider()');
    });

    it('replaces the callbacks with one that publishes the generated container data', () => {
        const output = generate(source({ fields: { callbacks: '[somethingElse]' }, types: {} }));

        expect(output).toContain('app.getContainer().setSingleton(ContainerServiceId.Data, new AppContainerData());');
        expect(output).not.toContain('somethingElse');
    });

    it('imports the container data class by the specifier it is given', () => {
        expect(generate(source())).toContain("import { AppContainerData } from './Data/AppContainerData.ts';");
    });

    describe('copied imports', () => {
        it('re-emits a value import the copied text still references', () => {
            const output = generate(
                source({
                    fields: { defaultCommandName: 'CliCommandName.LIST' },
                    types: {},
                    imports: [new ConfigImport('CliCommandName', '@valkyrjaio/valkyrja/Cli/Constant/CommandName.ts')],
                }),
            );

            expect(output).toContain(
                "import { CliCommandName } from '@valkyrjaio/valkyrja/Cli/Constant/CommandName.ts';",
            );
        });

        it('re-emits a type import the copied text still references', () => {
            const output = generate(
                source({
                    fields: { thing: 'value' },
                    types: { thing: 'SomeContract' },
                    imports: [new ConfigImport('SomeContract', './SomeContract.ts', true)],
                }),
            );

            expect(output).toContain("import type { SomeContract } from './SomeContract.ts';");
        });

        it('drops an import that only the replaced provider list referenced', () => {
            const output = generate(
                source({
                    fields: { providers: '[new ComponentProvider()]' },
                    types: {},
                    imports: [new ConfigImport('ComponentProvider', './Provider/ComponentProvider.ts')],
                }),
            );

            expect(output).not.toContain('ComponentProvider }');
            expect(output).not.toContain('./Provider/ComponentProvider.ts');
        });

        it('drops an import that only a pinned field referenced', () => {
            const output = generate(
                source({
                    fields: { debugMode: 'DebugFlag.ON' },
                    types: {},
                    imports: [new ConfigImport('DebugFlag', './DebugFlag.ts')],
                }),
            );

            expect(output).not.toContain('./DebugFlag.ts');
        });

        it('emits a repeated import name only once', () => {
            const output = generate(
                source({
                    fields: { a: 'Shared.ONE', b: 'Shared.TWO' },
                    types: {},
                    imports: [new ConfigImport('Shared', './Shared.ts'), new ConfigImport('Shared', './Shared.ts')],
                }),
            );

            expect(output.split("import { Shared } from './Shared.ts';").length - 1).toBe(1);
        });

        it('never repeats a name the generated header already binds', () => {
            const output = generate(
                source({
                    fields: { thing: 'ApplicationServiceId.Config' },
                    types: {},
                    imports: [new ConfigImport('ApplicationServiceId', './Other/ApplicationServiceId.ts')],
                }),
            );

            expect(output).not.toContain('./Other/ApplicationServiceId.ts');
            expect(output.split('import { ApplicationServiceId }').length - 1).toBe(1);
        });
    });
});
