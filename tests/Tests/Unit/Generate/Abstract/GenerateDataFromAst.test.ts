/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import * as path from 'path';
import { fileURLToPath } from 'node:url';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CliInteractionConfig } from '@valkyrjaio/valkyrja/Cli/Interaction/Data/CliInteractionConfig.ts';
import { OutputFactory } from '@valkyrjaio/valkyrja/Cli/Interaction/Output/Factory/OutputFactory.ts';

import { ComponentProviderResult } from '../../../../../src/Sindri/Ast/Data/Result/ComponentProviderResult.ts';
import { ConfigResult } from '../../../../../src/Sindri/Ast/Data/Result/ConfigResult.ts';
import { GenerateStatus } from '../../../../../src/Sindri/Generator/Enum/GenerateStatus.ts';
import { GenerateDataFromAst } from '../../../../../src/Sindri/Generate/Abstract/GenerateDataFromAst.ts';

import type { OutputContract } from '@valkyrjaio/valkyrja/Cli/Interaction/Output/Contract/OutputContract.ts';

const appDir = fileURLToPath(new URL('../../../Classes/App', import.meta.url));
const configFile = path.join(appDir, 'Config.ts');

/** A generator stub returning a fixed status. */
function generator(status: GenerateStatus = GenerateStatus.SUCCESS): { generateFile: () => GenerateStatus } {
    return { generateFile: vi.fn(() => status) };
}

/** A reader stub whose readFile returns a fixed result. */
function reader(result: unknown): { readFile: () => unknown } {
    return { readFile: vi.fn(() => result) };
}

interface Deps {
    componentProviderReader?: { readFile: (f: string) => ComponentProviderResult };
    serviceProviderReader?: { readFile: () => unknown };
    listenerProviderReader?: { readFile: () => unknown };
    routeProviderReader?: { readFile: () => unknown };
    listenerAttributeReader?: { readFile: () => unknown };
    cliRouteAttributeReader?: { readFile: () => unknown };
    httpRouteAttributeReader?: { readFile: () => unknown };
    containerGenerator?: { generateFile: () => GenerateStatus };
    eventGenerator?: { generateFile: () => GenerateStatus };
    cliGenerator?: { generateFile: () => GenerateStatus };
    httpGenerator?: { generateFile: () => GenerateStatus };
}

class TestGenerate extends GenerateDataFromAst {
    public constructor(deps: Deps = {}) {
        const outputFactory = new OutputFactory(new CliInteractionConfig());

        super(
            outputFactory,
            {} as never,
            'Generating Data',
            reader(new ConfigResult()) as never,
            (deps.componentProviderReader ?? reader(new ComponentProviderResult())) as never,
            (deps.routeProviderReader ?? reader({ controllerClasses: [] })) as never,
            (deps.listenerProviderReader ?? reader({ listenerClasses: [] })) as never,
            (deps.serviceProviderReader ?? reader({ publishers: {} })) as never,
            (deps.cliRouteAttributeReader ?? reader({ routes: {} })) as never,
            (deps.httpRouteAttributeReader ?? reader({ routes: {}, routeData: {} })) as never,
            (deps.listenerAttributeReader ?? reader({ listeners: {} })) as never,
            (deps.containerGenerator ?? generator()) as never,
            (deps.eventGenerator ?? generator()) as never,
            (deps.cliGenerator ?? generator()) as never,
            (deps.httpGenerator ?? generator()) as never,
        );
    }

    protected getConfigFilePath(): string {
        return configFile;
    }

    public fqn(className: string, namespace: string, srcDir: string): string {
        return this.fqnToFilePath(className, namespace, srcDir);
    }

    public findFile(className: string, dir: string): string {
        return this.findFileInDir(className, dir);
    }

    public walk(providerClass: string, config: ConfigResult, visited: Record<string, true>): ComponentProviderResult {
        return this.walkProvider(providerClass, config, visited);
    }

    public container(providers: readonly string[], config: ConfigResult, output: OutputContract): OutputContract {
        return this.generateContainerData(providers, config, output);
    }

    public event(providers: readonly string[], config: ConfigResult, output: OutputContract): OutputContract {
        return this.generateEventData(providers, config, output);
    }

    public cli(providers: readonly string[], config: ConfigResult, output: OutputContract): OutputContract {
        return this.generateCliData(providers, config, output);
    }

    public http(providers: readonly string[], config: ConfigResult, output: OutputContract): OutputContract {
        return this.generateHttpData(providers, config, output);
    }

    public addStatus(output: OutputContract, status: GenerateStatus): OutputContract {
        return this.addMessagesForGenerateStatus(output, status);
    }

    public freshOutput(): OutputContract {
        return new OutputFactory(new CliInteractionConfig()).createOutput();
    }
}

const config = new ConfigResult('App', appDir, appDir, 'App.Data');

beforeEach(() => {
    vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('GenerateDataFromAst', () => {
    describe('fqnToFilePath', () => {
        it('resolves relative specifiers against the source directory', () => {
            expect(new TestGenerate().fqn('./Config.ts', 'App', appDir)).toBe(configFile);
            expect(new TestGenerate().fqn('./Missing.ts', 'App', appDir)).toBe('');
        });

        it('resolves absolute paths directly', () => {
            expect(new TestGenerate().fqn(configFile, 'App', appDir)).toBe(configFile);
            expect(new TestGenerate().fqn('/no/such/file.ts', 'App', appDir)).toBe('');
        });

        it('searches the directory for a short class name', () => {
            expect(new TestGenerate().fqn('Config', 'App', appDir)).toBe(configFile);
        });
    });

    describe('findFileInDir', () => {
        it('returns empty when the directory does not exist', () => {
            expect(new TestGenerate().findFile('Config', '/no/such/dir')).toBe('');
        });

        it('returns empty when the directory cannot be read', () => {
            // Passing a file where a directory is expected makes readdirSync throw.
            expect(new TestGenerate().findFile('Config', configFile)).toBe('');
        });

        it('skips node_modules directories when searching for a class file', () => {
            const findFileDir = fileURLToPath(new URL('../../../Classes/FindFile', import.meta.url));
            const generate = new TestGenerate();

            // Visible.ts is found, but Hidden.ts (only inside node_modules) is skipped.
            expect(generate.findFile('Visible', findFileDir)).toContain('Visible.ts');
            expect(generate.findFile('Hidden', findFileDir)).toBe('');
        });
    });

    describe('walkProvider', () => {
        it('skips an already-visited provider', () => {
            const result = new TestGenerate().walk('AppComponentProvider', config, { AppComponentProvider: true });

            expect(result.serviceProviders).toEqual([]);
        });

        it('returns an empty result when the provider file cannot be resolved', () => {
            expect(new TestGenerate().walk('DoesNotExist', config, {}).serviceProviders).toEqual([]);
        });

        it('expands sub-component providers recursively', () => {
            const componentProviderReader = {
                readFile: vi
                    .fn()
                    .mockReturnValueOnce(new ComponentProviderResult(['AppServiceProvider'], ['SvcA']))
                    .mockReturnValue(new ComponentProviderResult([], ['SvcB'])),
            };

            const result = new TestGenerate({ componentProviderReader }).walk('AppComponentProvider', config, {});

            expect(result.serviceProviders).toEqual(['SvcB', 'SvcA']);
        });
    });

    describe('generateContainerData', () => {
        it('skips unresolvable service providers and still generates', () => {
            const gen = new TestGenerate();

            expect(() => gen.container(['DoesNotExist'], config, gen.freshOutput())).not.toThrow();
        });
    });

    describe('generateEventData', () => {
        it('skips unresolvable providers and listener classes', () => {
            const gen = new TestGenerate({
                listenerProviderReader: reader({ listenerClasses: ['MissingListener'] }),
            });

            // 'DoesNotExist' provider is skipped; 'AppListenerProvider' resolves but its listener class does not.
            expect(() => gen.event(['DoesNotExist', 'AppListenerProvider'], config, gen.freshOutput())).not.toThrow();
        });
    });

    describe('generateCliData', () => {
        it('skips unresolvable providers and controller classes', () => {
            const gen = new TestGenerate({
                routeProviderReader: reader({ controllerClasses: ['MissingController'] }),
            });

            expect(() => gen.cli(['DoesNotExist', 'AppCliRouteProvider'], config, gen.freshOutput())).not.toThrow();
        });
    });

    describe('generateHttpData', () => {
        it('skips unresolvable providers and controller classes', () => {
            const gen = new TestGenerate({
                routeProviderReader: reader({ controllerClasses: ['MissingController'] }),
            });

            expect(() => gen.http(['DoesNotExist', 'AppHttpRouteProvider'], config, gen.freshOutput())).not.toThrow();
        });
    });

    describe('addMessagesForGenerateStatus', () => {
        it('adds success, skipped and failure messages', () => {
            const gen = new TestGenerate();

            expect(gen.addStatus(gen.freshOutput(), GenerateStatus.SUCCESS)).toBeDefined();
            expect(gen.addStatus(gen.freshOutput(), GenerateStatus.SKIPPED)).toBeDefined();
            expect(gen.addStatus(gen.freshOutput(), GenerateStatus.FAILURE)).toBeDefined();
        });
    });
});
