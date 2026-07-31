/*
 * This file is part of the Valkyrja package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { fileURLToPath } from 'node:url';

import { describe, expect, it, vi } from 'vitest';

import { GenerateCachedConfigFromAst } from '../../../../../src/Sindri/Generate/Abstract/GenerateCachedConfigFromAst.ts';
import { GenerateStatus } from '../../../../../src/Sindri/Generator/Enum/GenerateStatus.ts';
import { CliInteractionConfig } from '@valkyrjaio/valkyrja/Cli/Interaction/Data/CliInteractionConfig.ts';
import { OutputFactory } from '@valkyrjaio/valkyrja/Cli/Interaction/Output/Factory/OutputFactory.ts';
import { Route } from '@valkyrjaio/valkyrja/Cli/Routing/Data/Route.ts';

import type { ConfigSourceResult } from '../../../../../src/Sindri/Ast/Data/Result/ConfigSourceResult.ts';
import type { CachedConfigFileGeneratorContract } from '../../../../../src/Sindri/Generator/Config/Contract/CachedConfigFileGeneratorContract.ts';
import type { OutputContract } from '@valkyrjaio/valkyrja/Cli/Interaction/Output/Contract/OutputContract.ts';

vi.spyOn(process.stdout, 'write').mockImplementation(() => true);

const configPath = fileURLToPath(
    new URL('../../../Fixtures/CachedConfig/TestExtendsHttpConfigFixture.ts', import.meta.url),
);

/** Reports a fixed status, so every outcome message can be exercised. */
class StatusGeneratorFixture implements CachedConfigFileGeneratorContract {
    constructor(private readonly status: GenerateStatus) {}

    generateFile(
        _directory: string,
        _className: string,
        _source: ConfigSourceResult,
        _containerDataClass: string,
        _containerDataSpecifier: string,
    ): GenerateStatus {
        return this.status;
    }
}

class GenerateFixture extends GenerateCachedConfigFromAst {
    public run(): OutputContract {
        return this.generateCachedConfig();
    }

    protected override getConfigFilePath(): string {
        return configPath;
    }
}

function generateWith(status: GenerateStatus): string {
    const route = new Route('config:generate', 'Generate a cached config', (): OutputContract =>
        new OutputFactory().createOutput(),
    );

    const output = new GenerateFixture(
        new OutputFactory(new CliInteractionConfig()),
        route,
        undefined,
        undefined,
        undefined,
        new StatusGeneratorFixture(status),
    ).run();

    return output
        .getMessages()
        .map((message) => message.getText())
        .join('');
}

describe('GenerateCachedConfigFromAst', () => {
    it('reports success when the file is written', () => {
        expect(generateWith(GenerateStatus.SUCCESS)).toContain('Success');
    });

    it('reports skipped when the file is already up to date', () => {
        expect(generateWith(GenerateStatus.SKIPPED)).toContain('Skipped');
    });

    it('reports failed when the file cannot be written', () => {
        expect(generateWith(GenerateStatus.FAILURE)).toContain('Failed');
    });
});
