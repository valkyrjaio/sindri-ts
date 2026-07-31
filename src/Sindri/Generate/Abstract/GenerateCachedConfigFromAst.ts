/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import * as path from 'path';

import { ErrorFormatter } from '@valkyrjaio/valkyrja/Cli/Interaction/Formatter/ErrorFormatter.ts';
import { HighlightedTextFormatter } from '@valkyrjaio/valkyrja/Cli/Interaction/Formatter/HighlightedTextFormatter.ts';
import { SuccessFormatter } from '@valkyrjaio/valkyrja/Cli/Interaction/Formatter/SuccessFormatter.ts';
import { WarningFormatter } from '@valkyrjaio/valkyrja/Cli/Interaction/Formatter/WarningFormatter.ts';
import { Header } from '@valkyrjaio/valkyrja/Cli/Interaction/Message/Header.ts';
import { Message } from '@valkyrjaio/valkyrja/Cli/Interaction/Message/Message.ts';
import { NewLine } from '@valkyrjaio/valkyrja/Cli/Interaction/Message/NewLine.ts';

import { ConfigReader } from '../../Ast/ConfigReader.ts';
import { ConfigSourceReader } from '../../Ast/ConfigSourceReader.ts';
import { ConfigImport } from '../../Ast/Data/ConfigImport.ts';
import { ConfigSourceResult } from '../../Ast/Data/Result/ConfigSourceResult.ts';
import { SindriInfo } from '../../Constant/SindriInfo.ts';
import { AstCachedConfigFileGenerator } from '../../Generator/Ast/Config/AstCachedConfigFileGenerator.ts';
import { GenerateStatus } from '../../Generator/Enum/GenerateStatus.ts';
import { GenerateFromAst } from './GenerateFromAst.ts';

import type { ConfigReaderContract } from '../../Ast/Contract/ConfigReaderContract.ts';
import type { ConfigSourceReaderContract } from '../../Ast/Contract/ConfigSourceReaderContract.ts';
import type { CachedConfigFileGeneratorContract } from '../../Generator/Config/Contract/CachedConfigFileGeneratorContract.ts';
import type { OutputContract } from '@valkyrjaio/valkyrja/Cli/Interaction/Output/Contract/OutputContract.ts';
import type { OutputFactoryContract } from '@valkyrjaio/valkyrja/Cli/Interaction/Output/Factory/Contract/OutputFactoryContract.ts';
import type { RouteContract } from '@valkyrjaio/valkyrja/Cli/Routing/Data/Contract/RouteContract.ts';

/**
 * Writes a cached config beside an application config.
 *
 * This is an opt-in command, separate from data generation. An application only
 * needs a cached config when it starts often enough for module loading to
 * matter — a CGI or lambda deployment, a CLI command, or a cron job. A worker
 * process pays that cost one time and gains nothing.
 */
export abstract class GenerateCachedConfigFromAst extends GenerateFromAst {
    /** The container data class the generated config publishes. */
    protected static readonly CONTAINER_DATA_CLASS = 'AppContainerData';

    /** The name the generated config file takes. */
    protected static readonly GENERATED_CLASS = 'CachedConfig';

    public constructor(
        protected readonly outputFactory: OutputFactoryContract,
        protected readonly route: RouteContract,
        protected readonly title: string = 'Generating Cached Config From Config',
        protected readonly configReader: ConfigReaderContract = new ConfigReader(),
        protected readonly configSourceReader: ConfigSourceReaderContract = new ConfigSourceReader(),
        protected readonly cachedConfigGenerator: CachedConfigFileGeneratorContract = new AstCachedConfigFileGenerator(),
    ) {
        super();
    }

    protected generateCachedConfig(): OutputContract {
        let output = this.getOutput();

        const configFilePath = this.getConfigFilePath();
        const config = this.configReader.readFile(configFilePath);
        const source = this.configSourceReader.readFile(configFilePath);

        output = output
            .withAddedMessages(new Message('Generating Cached Config.......................'))
            .writeMessages();

        if (source.className === '' || config.dataPath === '') {
            return this.addMessagesForGenerateStatus(output, GenerateStatus.FAILURE)
                .withAddedMessages(new NewLine())
                .writeMessages();
        }

        const outputDirectory = path.dirname(configFilePath);
        const status = this.cachedConfigGenerator.generateFile(
            outputDirectory,
            GenerateCachedConfigFromAst.GENERATED_CLASS,
            this.withResolvedImports(source, outputDirectory),
            GenerateCachedConfigFromAst.CONTAINER_DATA_CLASS,
            this.importSpecifier(
                outputDirectory,
                path.join(config.dataPath, `${GenerateCachedConfigFromAst.CONTAINER_DATA_CLASS}.ts`),
            ),
        );

        return this.addMessagesForGenerateStatus(output, status)
            .withAddedMessages(new NewLine())
            .writeMessages()
            .withAddedMessages(new NewLine());
    }

    /**
     * Rewrite each copied import for the generated file's location.
     *
     * A relative specifier only means something next to the file that declared
     * it. An import copied out of a framework config base points at the
     * framework directory, so it must be written again as the package specifier
     * or as a path relative to the output directory.
     */
    protected withResolvedImports(source: ConfigSourceResult, outputDirectory: string): ConfigSourceResult {
        const imports = source.imports.map((entry) =>
            entry.resolvedPath === ''
                ? entry
                : new ConfigImport(
                      entry.name,
                      this.importSpecifier(outputDirectory, entry.resolvedPath),
                      entry.isType,
                      entry.resolvedPath,
                  ),
        );

        return new ConfigSourceResult(
            source.className,
            source.contractName,
            source.contractSpecifier,
            source.fields,
            source.types,
            imports,
        );
    }

    protected getOutput(): OutputContract {
        return this.outputFactory
            .createOutput()
            .withAddedMessages(
                new Header('Sindri', SindriInfo.VERSION, this.route, SindriInfo.ICON),
                new NewLine(),
                new NewLine(),
                new Message(`${this.title}:`, new HighlightedTextFormatter()),
                new NewLine(),
                new NewLine(),
            )
            .writeMessages();
    }

    protected addMessagesForGenerateStatus(output: OutputContract, status: GenerateStatus): OutputContract {
        let text = 'Failed';
        let formatter = new ErrorFormatter();

        if (status === GenerateStatus.SUCCESS) {
            text = 'Success';
            formatter = new SuccessFormatter();
        }

        if (status === GenerateStatus.SKIPPED) {
            text = 'Skipped';
            formatter = new WarningFormatter();
        }

        return output.withAddedMessages(new Message(text, formatter), new NewLine());
    }

    protected abstract getConfigFilePath(): string;
}
