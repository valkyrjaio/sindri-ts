/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import * as fs from 'fs';
import { fileURLToPath } from 'node:url';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { GenerateCachedConfigCommand } from '../../../../../src/Sindri/Cli/Command/GenerateCachedConfigCommand.ts';
import { Argument } from '@valkyrjaio/valkyrja/Cli/Interaction/Argument/Argument.ts';
import { CliInteractionConfig } from '@valkyrjaio/valkyrja/Cli/Interaction/Data/CliInteractionConfig.ts';
import { OutputFactory } from '@valkyrjaio/valkyrja/Cli/Interaction/Output/Factory/OutputFactory.ts';
import { ArgumentParameter } from '@valkyrjaio/valkyrja/Cli/Routing/Data/ArgumentParameter.ts';
import { Route } from '@valkyrjaio/valkyrja/Cli/Routing/Data/Route.ts';

import type { OutputContract } from '@valkyrjaio/valkyrja/Cli/Interaction/Output/Contract/OutputContract.ts';

// Keep filesystem reads real (ts-morph needs them) but suppress writes.
vi.mock('fs', async (importOriginal) => {
    const actual = await importOriginal<typeof import('fs')>();

    return { ...actual, writeFileSync: vi.fn(), mkdirSync: vi.fn() };
});

const writeFileSync = vi.mocked(fs.writeFileSync);

vi.spyOn(process.stdout, 'write').mockImplementation(() => true);

function fixturePath(name: string): string {
    return fileURLToPath(new URL(`../../../Fixtures/CachedConfig/${name}.ts`, import.meta.url));
}

function command(path: string): GenerateCachedConfigCommand {
    const route = new Route('config:generate', 'Generate a cached config', (): OutputContract =>
        new OutputFactory().createOutput(),
    ).withArguments(new ArgumentParameter('config', 'Config path').withArguments(new Argument(path)));

    return new GenerateCachedConfigCommand(route, new OutputFactory(new CliInteractionConfig()));
}

function written(): string {
    return writeFileSync.mock.calls[0]?.[1] as string;
}

afterEach(() => {
    vi.clearAllMocks();
});

describe('GenerateCachedConfigCommand', () => {
    it('writes one cached config beside the config it read', () => {
        const output = command(fixturePath('TestExtendsHttpConfigFixture')).run();

        expect(writeFileSync).toHaveBeenCalledTimes(1);
        expect(writeFileSync.mock.calls[0]?.[0]).toContain('CachedConfig.ts');
        expect(output.getMessages().length).toBeGreaterThan(0);
    });

    it('produces a config that names no component provider', () => {
        command(fixturePath('TestExtendsHttpConfigFixture')).run();

        expect(written()).toContain('readonly providers: ComponentProviderContract[] = [];');
        expect(written()).not.toContain('ComponentProviderFixture');
    });

    it('rewrites an import copied from the base for the generated file location', () => {
        command(fixturePath('TestExtendsCliConfigFixture')).run();

        // MiddlewareIdFixture is imported by the CliConfig base, one directory
        // away from where the generated file lands, so a specifier copied
        // verbatim would not resolve.
        expect(written()).toContain("import { MiddlewareIdFixture } from './MiddlewareIdFixture.ts';");
    });

    it('leaves a bare package specifier as written', () => {
        command(fixturePath('TestExtraArgsConfigFixture')).run();

        // Nothing to rewrite: a package specifier resolves the same from any
        // directory, so it is copied through untouched.
        expect(written()).toContain(
            "import { SomeFrameworkThing } from '@valkyrjaio/valkyrja/Application/Constant/ApplicationInfo.ts';",
        );
    });

    it('reports a failure when the config cannot be read', () => {
        const output = command(fixturePath('TestNoContractConfigFixture')).run();

        expect(writeFileSync).not.toHaveBeenCalled();
        expect(output.getMessages().length).toBeGreaterThan(0);
    });

    it('throws when the config file does not exist', () => {
        expect(() => command('/does/not/exist.ts').run()).toThrow();
    });

    it('falls back to an empty config path when the config argument has no value', () => {
        const route = new Route('config:generate', 'Generate a cached config', (): OutputContract =>
            new OutputFactory().createOutput(),
        ).withArguments(new ArgumentParameter('config', 'Config path'));
        const cmd = new GenerateCachedConfigCommand(route, new OutputFactory(new CliInteractionConfig()));

        // Matches the sibling data command: an unreadable path throws rather
        // than reporting. `bin/sindri.ts` rejects an empty path before the
        // command ever runs.
        expect(() => cmd.run()).toThrow();
    });
});
