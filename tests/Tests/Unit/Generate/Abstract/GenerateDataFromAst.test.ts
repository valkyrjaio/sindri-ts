/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
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

const appDir = fileURLToPath(new URL('../../../Fixtures/App', import.meta.url));
const packageDir = fileURLToPath(new URL('../../../Fixtures/Package', import.meta.url));
const nodeModules = path.join(packageDir, 'node_modules');
const configFile = path.join(appDir, 'ConfigFixture.ts');

/** A generator stub returning a fixed status. */
function generator(status: GenerateStatus = GenerateStatus.SUCCESS): {
    classImportMap: Record<string, string>;
    generateFile: () => GenerateStatus;
    generateFileFromRoutes: () => GenerateStatus;
    generateMergedFile: () => GenerateStatus;
} {
    return {
        classImportMap: {},
        generateFile: vi.fn(() => status),
        generateFileFromRoutes: vi.fn(() => status),
        generateMergedFile: vi.fn(() => status),
    };
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
            (deps.routeProviderReader ?? reader({ controllerClasses: [], routes: [], routeImports: {} })) as never,
            (deps.listenerProviderReader ?? reader({ listenerClasses: [] })) as never,
            (deps.serviceProviderReader ?? reader({ publishers: {} })) as never,
            (deps.cliRouteAttributeReader ?? reader({ routes: {}, importMap: {} })) as never,
            (deps.httpRouteAttributeReader ?? reader({ routes: {}, routeData: {}, importMap: {} })) as never,
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

    public specifier(fromDir: string, toFile: string): string {
        return this.importSpecifier(fromDir, toFile);
    }

    public packageFor(filePath: string): string | undefined {
        return this.packageSpecifier(filePath);
    }

    public exported(packageDir: string, relative: string): string | undefined {
        return this.exportedSubpath(packageDir, relative);
    }

    public exportsOf(packageDir: string): Record<string, string> {
        return this.readPackageExports(packageDir);
    }

    public firstTarget(target: unknown): string | undefined {
        return this.firstStringTarget(target);
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
            expect(new TestGenerate().fqn('./ConfigFixture.ts', 'App', appDir)).toBe(configFile);
            expect(new TestGenerate().fqn('./Missing.ts', 'App', appDir)).toBe('');
        });

        it('resolves absolute paths directly', () => {
            expect(new TestGenerate().fqn(configFile, 'App', appDir)).toBe(configFile);
            expect(new TestGenerate().fqn('/no/such/file.ts', 'App', appDir)).toBe('');
        });

        it('searches the directory for a short class name', () => {
            expect(new TestGenerate().fqn('ConfigFixture', 'App', appDir)).toBe(configFile);
        });
    });

    describe('findFileInDir', () => {
        it('returns empty when the directory does not exist', () => {
            expect(new TestGenerate().findFile('ConfigFixture', '/no/such/dir')).toBe('');
        });

        it('returns empty when the directory cannot be read', () => {
            // Passing a file where a directory is expected makes readdirSync throw.
            expect(new TestGenerate().findFile('ConfigFixture', configFile)).toBe('');
        });

        it('skips node_modules directories when searching for a class file', () => {
            const findFileDir = fileURLToPath(new URL('../../../Fixtures/FindFile', import.meta.url));
            const generate = new TestGenerate();

            // VisibleFixture.ts is found, but HiddenFixture.ts (only inside node_modules) is skipped.
            expect(generate.findFile('VisibleFixture', findFileDir)).toContain('VisibleFixture.ts');
            expect(generate.findFile('HiddenFixture', findFileDir)).toBe('');
        });
    });

    describe('walkProvider', () => {
        it('skips an already-visited provider', () => {
            const result = new TestGenerate().walk('AppComponentProviderFixture', config, { AppComponentProviderFixture: true });

            expect(result.serviceProviders).toEqual([]);
        });

        it('returns an empty result when the provider file cannot be resolved', () => {
            expect(new TestGenerate().walk('DoesNotExist', config, {}).serviceProviders).toEqual([]);
        });

        it('expands sub-component providers recursively', () => {
            const componentProviderReader = {
                readFile: vi
                    .fn()
                    .mockReturnValueOnce(new ComponentProviderResult(['AppServiceProviderFixture'], ['SvcA']))
                    .mockReturnValue(new ComponentProviderResult([], ['SvcB'])),
            };

            const result = new TestGenerate({ componentProviderReader }).walk('AppComponentProviderFixture', config, {});

            expect(result.serviceProviders).toEqual(['SvcB', 'SvcA']);
        });
    });

    describe('generateContainerData', () => {
        it('skips unresolvable service providers and still generates', () => {
            const gen = new TestGenerate();

            expect(() => gen.container(['DoesNotExist'], config, gen.freshOutput())).not.toThrow();
        });

        it('omits the import for a resolvable provider that publishes nothing', () => {
            const containerGenerator = generator();
            const gen = new TestGenerate({
                serviceProviderReader: reader({ publishers: {} }),
                containerGenerator,
            });

            gen.container(['AppServiceProviderFixture'], config, gen.freshOutput());

            expect(containerGenerator.classImportMap).toStrictEqual({});
        });

        it('populates the container import map for resolvable providers that publish', () => {
            const containerGenerator = generator();
            const gen = new TestGenerate({
                serviceProviderReader: reader({ publishers: { 'Id::A': ['AppServiceProviderFixture', 'publish'] } }),
                containerGenerator,
            });

            gen.container(['AppServiceProviderFixture'], config, gen.freshOutput());

            expect(containerGenerator.classImportMap).toStrictEqual({
                AppServiceProviderFixture: './Provider/AppServiceProviderFixture.ts',
            });
        });
    });

    describe('generateEventData', () => {
        it('skips unresolvable providers and listener classes', () => {
            const gen = new TestGenerate({
                listenerProviderReader: reader({ listenerClasses: ['MissingListener'] }),
            });

            // 'DoesNotExist' provider is skipped; 'AppListenerProviderFixture' resolves but its listener class does not.
            expect(() => gen.event(['DoesNotExist', 'AppListenerProviderFixture'], config, gen.freshOutput())).not.toThrow();
        });
    });

    describe('generateCliData', () => {
        it('skips unresolvable providers and controller classes', () => {
            const gen = new TestGenerate({
                routeProviderReader: reader({ controllerClasses: ['MissingController'], routes: [], routeImports: {} }),
            });

            expect(() => gen.cli(['DoesNotExist', 'AppCliRouteProviderFixture'], config, gen.freshOutput())).not.toThrow();
        });

        it('generates from imperative routes and populates the provider import map', () => {
            const cliGenerator = generator();
            const gen = new TestGenerate({
                routeProviderReader: reader({ controllerClasses: [], routes: [{} as never], routeImports: {} }),
                cliGenerator,
            });

            gen.cli(['AppCliRouteProviderFixture'], config, gen.freshOutput());

            expect(cliGenerator.generateMergedFile).toHaveBeenCalled();
            expect(cliGenerator.classImportMap).toStrictEqual({
                AppCliRouteProviderFixture: './Provider/AppCliRouteProviderFixture.ts',
            });
        });

        it('merges attribute command routes and their import map with imperative routes', () => {
            const cliGenerator = generator();
            const controllerPath = path.join(appDir, 'Controller', 'AppCliControllerFixture.ts');
            const packagePath = path.join(nodeModules, '@fixture/routes/src/PackageCommandNameFixture.ts');
            const gen = new TestGenerate({
                routeProviderReader: reader({
                    controllerClasses: ['AppCliControllerFixture'],
                    routes: [{} as never],
                    routeImports: {},
                }),
                cliRouteAttributeReader: reader({
                    routes: { build: {} },
                    importMap: {
                        AppCliControllerFixture: controllerPath,
                        PackageCommandNameFixture: packagePath,
                    },
                }),
                cliGenerator,
            });

            gen.cli(['AppCliRouteProviderFixture'], config, gen.freshOutput());

            expect(cliGenerator.generateMergedFile).toHaveBeenCalled();
            expect(cliGenerator.classImportMap.AppCliRouteProviderFixture).toBe(
                './Provider/AppCliRouteProviderFixture.ts',
            );
            expect(cliGenerator.classImportMap.AppCliControllerFixture).toBe('./Controller/AppCliControllerFixture.ts');
            // A decorator-scanned class an installed package owns is imported by that
            // package's own specifier, exactly as an imperative route argument is.
            expect(cliGenerator.classImportMap.PackageCommandNameFixture).toBe(
                '@fixture/routes/PackageCommandNameFixture.ts',
            );
        });

        it('imports the classes the route expressions reference, by package specifier', () => {
            const cliGenerator = generator();
            const gen = new TestGenerate({
                routeProviderReader: reader({
                    controllerClasses: [],
                    routes: [{} as never],
                    routeImports: {
                        CliA: path.join(appDir, '../Provider/CliA.ts'),
                        PackageCommandName: path.join(nodeModules, '@fixture/routes/src/PackageCommandNameFixture.ts'),
                    },
                }),
                cliGenerator,
            });

            gen.cli(['AppCliRouteProviderFixture'], config, gen.freshOutput());

            expect(cliGenerator.classImportMap).toStrictEqual({
                AppCliRouteProviderFixture: './Provider/AppCliRouteProviderFixture.ts',
                CliA: '../Provider/CliA.ts',
                PackageCommandName: '@fixture/routes/PackageCommandNameFixture.ts',
            });
        });
    });

    describe('generateHttpData', () => {
        it('skips unresolvable providers and controller classes', () => {
            const gen = new TestGenerate({
                routeProviderReader: reader({ controllerClasses: ['MissingController'], routes: [], routeImports: {} }),
            });

            expect(() => gen.http(['DoesNotExist', 'AppHttpRouteProviderFixture'], config, gen.freshOutput())).not.toThrow();
        });

        it('generates from imperative routes and populates the provider import map', () => {
            const httpGenerator = generator();
            const gen = new TestGenerate({
                routeProviderReader: reader({ controllerClasses: [], routes: [{} as never], routeImports: {} }),
                httpGenerator,
            });

            gen.http(['AppHttpRouteProviderFixture'], config, gen.freshOutput());

            expect(httpGenerator.generateMergedFile).toHaveBeenCalled();
            expect(httpGenerator.classImportMap).toStrictEqual({
                AppHttpRouteProviderFixture: './Provider/AppHttpRouteProviderFixture.ts',
            });
        });

        it('merges attribute routes and their import map with imperative routes', () => {
            const httpGenerator = generator();
            const controllerPath = path.join(appDir, 'Controller', 'AppHttpControllerFixture.ts');
            const packagePath = path.join(nodeModules, '@fixture/routes/src/PackageRouteProviderFixture.ts');
            const gen = new TestGenerate({
                routeProviderReader: reader({
                    controllerClasses: ['AppHttpControllerFixture'],
                    routes: [{} as never],
                    routeImports: {},
                }),
                httpRouteAttributeReader: reader({
                    routes: { 'users.show': {} },
                    routeData: {},
                    importMap: {
                        AppHttpControllerFixture: controllerPath,
                        PackageRouteProviderFixture: packagePath,
                    },
                }),
                httpGenerator,
            });

            gen.http(['AppHttpRouteProviderFixture'], config, gen.freshOutput());

            expect(httpGenerator.generateMergedFile).toHaveBeenCalled();
            expect(httpGenerator.classImportMap.AppHttpRouteProviderFixture).toBe(
                './Provider/AppHttpRouteProviderFixture.ts',
            );
            expect(httpGenerator.classImportMap.AppHttpControllerFixture).toBe(
                './Controller/AppHttpControllerFixture.ts',
            );
            // A decorator-scanned class an installed package owns is imported by that
            // package's own specifier, exactly as an imperative route argument is.
            expect(httpGenerator.classImportMap.PackageRouteProviderFixture).toBe(
                '@fixture/routes/PackageRouteProviderFixture.ts',
            );
        });

        it('imports the classes the route expressions reference, by package specifier', () => {
            const httpGenerator = generator();
            const gen = new TestGenerate({
                routeProviderReader: reader({
                    controllerClasses: [],
                    routes: [{} as never],
                    routeImports: {
                        PackageCommandName: path.join(
                            nodeModules,
                            '@fixture/routes/src/PackageCommandNameFixture.ts',
                        ),
                    },
                }),
                httpGenerator,
            });

            gen.http(['AppHttpRouteProviderFixture'], config, gen.freshOutput());

            expect(httpGenerator.classImportMap).toStrictEqual({
                AppHttpRouteProviderFixture: './Provider/AppHttpRouteProviderFixture.ts',
                PackageCommandName: '@fixture/routes/PackageCommandNameFixture.ts',
            });
        });
    });

    describe('importSpecifier', () => {
        it('imports application source by a path relative to the data directory', () => {
            const gen = new TestGenerate();

            expect(gen.specifier(appDir, path.join(appDir, 'Provider/AppServiceProviderFixture.ts'))).toBe(
                './Provider/AppServiceProviderFixture.ts',
            );
        });

        it('imports an installed package file by the package specifier', () => {
            const gen = new TestGenerate();

            expect(
                gen.specifier(appDir, path.join(nodeModules, '@fixture/routes/src/PackageRouteProviderFixture.ts')),
            ).toBe('@fixture/routes/PackageRouteProviderFixture.ts');
        });
    });

    describe('packageSpecifier', () => {
        it('returns undefined for a path outside node_modules', () => {
            expect(new TestGenerate().packageFor(path.join(appDir, 'ConfigFixture.ts'))).toBeUndefined();
        });

        it('returns undefined for a bare package directory with no file below it', () => {
            expect(new TestGenerate().packageFor(path.join(nodeModules, 'plain'))).toBeUndefined();
        });

        it('resolves an unscoped package without an exports map to its path under the package root', () => {
            expect(new TestGenerate().packageFor(path.join(nodeModules, 'plain/lib/PlainFixture.ts'))).toBe(
                'plain/lib/PlainFixture.ts',
            );
        });

        it('resolves a scoped package through its exports map', () => {
            expect(
                new TestGenerate().packageFor(path.join(nodeModules, '@fixture/routes/src/PackageCommandNameFixture.ts')),
            ).toBe('@fixture/routes/PackageCommandNameFixture.ts');
        });

        it('falls back to the path under the package root when no exports pattern matches', () => {
            expect(new TestGenerate().packageFor(path.join(nodeModules, '@fixture/routes/other/Elsewhere.ts'))).toBe(
                '@fixture/routes/other/Elsewhere.ts',
            );
        });
    });

    describe('exportedSubpath', () => {
        it('inverts a matching wildcard pattern', () => {
            expect(new TestGenerate().exported(path.join(nodeModules, '@fixture/routes'), 'src/Thing.ts')).toBe(
                'Thing.ts',
            );
        });

        it('skips a pattern whose target prefix does not match, and a key with no wildcard', () => {
            // './*.ts' targets './src/*.ts' — 'other/' is not 'src/'. The '.'
            // entry that follows has no wildcard to invert at all.
            expect(new TestGenerate().exported(path.join(nodeModules, '@fixture/routes'), 'other/Thing.ts')).toBeUndefined();
        });

        it('skips a pattern whose target suffix does not match', () => {
            expect(
                new TestGenerate().exported(path.join(nodeModules, '@fixture/routes'), 'src/Thing.js'),
            ).toBeUndefined();
        });

        it('skips a wildcard key whose target names a fixed file', () => {
            expect(new TestGenerate().exported(path.join(nodeModules, 'oddexports'), 'src/fixed.ts')).toBeUndefined();
        });
    });

    describe('readPackageExports', () => {
        it('returns nothing for a directory without a package.json', () => {
            expect(new TestGenerate().exportsOf(path.join(nodeModules, '@fixture'))).toStrictEqual({});
        });

        it('returns nothing for an unparsable package.json', () => {
            expect(new TestGenerate().exportsOf(path.join(nodeModules, 'broken'))).toStrictEqual({});
        });

        it('returns nothing for a package.json without an exports map', () => {
            expect(new TestGenerate().exportsOf(path.join(nodeModules, 'plain'))).toStrictEqual({});
        });

        it('flattens conditional and string targets', () => {
            expect(new TestGenerate().exportsOf(path.join(nodeModules, '@fixture/routes'))).toStrictEqual({
                './*.ts': './src/*.ts',
                '.': './src/index.ts',
            });
        });

        it('drops a subpath whose target names no file', () => {
            // The fixture's './nothing' entry is explicitly blocked (null).
            expect(new TestGenerate().exportsOf(path.join(nodeModules, 'oddexports'))).toStrictEqual({
                './*.ts': './src/fixed.ts',
            });
        });

        it('returns nothing for a string exports value', () => {
            // `"exports": "./index.d.ts"` names no subpaths to invert.
            expect(new TestGenerate().exportsOf(path.join(nodeModules, 'typed'))).toStrictEqual({});
        });
    });

    describe('firstStringTarget', () => {
        it('returns undefined for a non-string, non-object target', () => {
            expect(new TestGenerate().firstTarget(null)).toBeUndefined();
            expect(new TestGenerate().firstTarget(42)).toBeUndefined();
        });

        it('returns undefined when no condition names a file', () => {
            expect(new TestGenerate().firstTarget({ import: null })).toBeUndefined();
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
