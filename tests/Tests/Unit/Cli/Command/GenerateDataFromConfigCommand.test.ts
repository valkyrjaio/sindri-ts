/*
 * This file is part of the Valkyrja package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import * as fs from 'fs';
import { fileURLToPath } from 'node:url';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { GenerateDataFromConfigCommand } from '../../../../../src/Sindri/Cli/Command/GenerateDataFromConfigCommand.ts';
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
const stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);

const configPath = fileURLToPath(new URL('../../../Fixtures/App/Config.ts', import.meta.url));

function command(path: string): GenerateDataFromConfigCommand {
    const route = new Route(
        'data:generate',
        'Generate data',
        (): OutputContract => new OutputFactory().createOutput(),
    ).withArguments(new ArgumentParameter('config', 'Config path').withArguments(new Argument(path)));

    return new GenerateDataFromConfigCommand(route, new OutputFactory(new CliInteractionConfig()));
}

afterEach(() => {
    vi.clearAllMocks();
});

describe('GenerateDataFromConfigCommand', () => {
    it('runs the full pipeline and writes the generated data files', () => {
        const output = command(configPath).run();

        // Container, event, cli and http data files are all generated.
        expect(writeFileSync).toHaveBeenCalledTimes(4);
        expect(output.getMessages().length).toBeGreaterThan(0);
    });

    it('still runs the generators when the config has no providers', () => {
        const emptyConfig = fileURLToPath(new URL('../../../Fixtures/Config/TestConfigNoClass.ts', import.meta.url));

        const output = command(emptyConfig).run();

        expect(output.getMessages().length).toBeGreaterThan(0);
    });

    it('throws when the config file cannot be read', () => {
        expect(() => command('/does/not/exist.ts').run()).toThrow();
    });

    it('falls back to an empty config path when the config argument has no value', () => {
        const route = new Route(
            'data:generate',
            'Generate data',
            (): OutputContract => new OutputFactory().createOutput(),
        ).withArguments(new ArgumentParameter('config', 'Config path'));
        const cmd = new GenerateDataFromConfigCommand(route, new OutputFactory(new CliInteractionConfig()));

        expect(() => cmd.run()).toThrow();
    });
});
