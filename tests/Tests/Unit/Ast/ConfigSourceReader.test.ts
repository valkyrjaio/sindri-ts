/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { ConfigSourceReader } from '../../../../src/Sindri/Ast/ConfigSourceReader.ts';

function fixturePath(name: string): string {
    return fileURLToPath(new URL(`../../Fixtures/CachedConfig/${name}.ts`, import.meta.url));
}

function read(name: string): ReturnType<ConfigSourceReader['readFile']> {
    return new ConfigSourceReader().readFile(fixturePath(name));
}

describe('ConfigSourceReader', () => {
    describe('a config that extends a framework config', () => {
        it('maps positional super() arguments onto the base field order', () => {
            const result = read('TestExtendsHttpConfigFixture');

            expect(result.className).toBe('TestExtendsHttpConfigFixture');
            expect(result.contractName).toBe('HttpConfigContract');
            expect(result.contractSpecifier).toBe(
                '@valkyrjaio/valkyrja/Application/Data/Contract/HttpConfigContract.ts',
            );
            expect(result.fields['namespace']).toBe("'App'");
            expect(result.fields['dataNamespace']).toBe("'App/Http/Data'");
        });

        it('keeps an initializer as source text rather than evaluating it', () => {
            const result = read('TestExtendsHttpConfigFixture');

            expect(result.fields['dir']).toBe('process.cwd()');
            expect(result.fields['key']).toBe("process.env['APP_KEY'] ?? ''");
        });

        it('fills omitted arguments from the base constructor defaults', () => {
            const result = read('TestExtendsHttpConfigFixture');

            // The fixture stops at the providers argument, so every middleware
            // list comes from HttpConfig's own defaults.
            expect(result.fields['requestReceivedMiddleware']).toBe('[]');
            expect(result.fields['responseSentMiddleware']).toBe('[]');
        });

        it('prefers the argument the config passes over the base default', () => {
            const result = read('TestExtendsHttpConfigFixture');

            expect(result.fields['version']).toBe("'1.0.0'");
            expect(result.fields['debugMode']).toBe('true');
        });

        it('reads the declared type of each base constructor parameter', () => {
            const result = read('TestExtendsHttpConfigFixture');

            expect(result.types['namespace']).toBe('string');
            expect(result.types['requestReceivedMiddleware']).toBe('string[]');
        });

        it('collects the imports of both the config and its base', () => {
            const result = read('TestExtendsHttpConfigFixture');
            const names = result.imports.map((entry) => entry.name);

            expect(names).toContain('ComponentProviderFixture');
            expect(names).toContain('HttpConfig');
        });

        it('records the resolved path of a relative import so it can be rewritten', () => {
            const result = read('TestExtendsHttpConfigFixture');
            const entry = result.imports.find((candidate) => candidate.name === 'ComponentProviderFixture');

            expect(entry?.resolvedPath).toContain('ComponentProviderFixture.ts');
        });
    });

    describe('the CliConfig argument order', () => {
        it('reads the two fields CliConfig inserts ahead of providers', () => {
            const result = read('TestExtendsCliConfigFixture');

            expect(result.contractName).toBe('CliConfigContract');
            expect(result.fields['applicationName']).toBe("'cli'");
            expect(result.fields['defaultCommandName']).toBe("'list'");
        });

        it('keeps a non-empty middleware default from the base', () => {
            const result = read('TestExtendsCliConfigFixture');

            expect(result.fields['routeNotMatchedMiddleware']).toBe('[MiddlewareIdFixture.CheckCommandForTypo]');
        });
    });

    describe('a standalone config', () => {
        it('reads initializers from property declarations', () => {
            const result = read('TestStandaloneConfigFixture');

            expect(result.contractName).toBe('HttpConfigContract');
            expect(result.fields['version']).toBe("'2.0.0'");
            expect(result.fields['requestReceivedMiddleware']).toBe('[MiddlewareIdFixture.CheckCommandForTypo]');
        });

        it('reads declared property types', () => {
            const result = read('TestStandaloneConfigFixture');

            expect(result.types['version']).toBe('string');
        });

        it('skips a static property', () => {
            const result = read('TestStandaloneConfigFixture');

            expect(result.fields['id']).toBeUndefined();
        });

        it('skips a property with no initializer', () => {
            const result = read('TestStandaloneConfigFixture');

            expect(result.fields['uninitialized']).toBeUndefined();
            expect(result.types['uninitialized']).toBe('string');
        });

        it('records no resolved path for a bare package specifier', () => {
            const result = new ConfigSourceReader().readFile(fixturePath('TestExtendsHttpConfigFixture'));
            const relative = result.imports.find((entry) => entry.name === 'ComponentProviderFixture');

            expect(relative?.specifier.startsWith('.')).toBe(true);
        });
    });

    describe('when the config cannot be read', () => {
        it('returns an empty result for a file with no class', () => {
            const result = new ConfigSourceReader().readFile(
                fileURLToPath(new URL('../../Fixtures/Config/TestConfigNoClassFixture.ts', import.meta.url)),
            );

            expect(result.className).toBe('');
        });

        it('returns an empty result when no known contract can be resolved', () => {
            expect(read('TestNoContractConfigFixture').className).toBe('');
        });

        it('returns an empty result when the class declares no fields', () => {
            expect(read('TestEmptyConfigFixture').className).toBe('');
        });

        it('reads no base defaults when the base cannot be resolved to a file', () => {
            const result = read('TestUnresolvedBaseConfigFixture');

            // The base name is known, so the positional order still applies to
            // the arguments the config passes; nothing else can be filled in.
            expect(result.fields['namespace']).toBe("'App'");
            expect(result.fields['requestReceivedMiddleware']).toBeUndefined();
        });

        it('reads only base defaults when the config declares no constructor', () => {
            const result = read('TestNoConstructorConfigFixture');

            expect(result.fields['namespace']).toBe("'App'");
            expect(result.fields['key']).toBe("'default_key'");
        });

        it('reads only base defaults when the constructor never calls super()', () => {
            const result = read('TestNoSuperConfigFixture');

            expect(result.fields['version']).toBe("'0.0.0'");
        });

        it('returns an empty result when the class has no name', () => {
            expect(read('TestAnonymousConfigFixture').className).toBe('');
        });

        it('records no default for a base parameter that has none', () => {
            const result = read('TestExtraArgsConfigFixture');

            // The Config fixture declares `namespace` with no default, so the
            // only value it can have is the one the config passes.
            expect(result.fields['namespace']).toBe("'App'");
            expect(result.types['namespace']).toBeUndefined();
        });

        it('ignores a super() argument beyond the last field the base names', () => {
            const result = read('TestExtraArgsConfigFixture');

            expect(Object.values(result.fields)).not.toContain("'surplus argument'");
        });

        it('records no type for a base parameter that declares none', () => {
            const result = read('TestExtraArgsConfigFixture');

            expect(result.fields['untyped']).toBe('SomeFrameworkThing.VALUE');
            expect(result.types['untyped']).toBeUndefined();
        });

        it('keeps a bare package specifier as written', () => {
            const result = read('TestExtraArgsConfigFixture');
            const entry = result.imports.find((candidate) => candidate.name === 'SomeFrameworkThing');

            expect(entry?.specifier).toBe('@valkyrjaio/valkyrja/Application/Constant/ApplicationInfo.ts');
            expect(entry?.resolvedPath).toBe('');
        });

        it('reads no defaults when the base class declares no constructor', () => {
            const result = read('TestNoBaseConstructorConfigFixture');

            expect(result.fields['namespace']).toBe("'App'");
            expect(result.fields['version']).toBeUndefined();
        });
    });
});
