/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import { ConfigReader } from '../../Ast/ConfigReader.ts';
import { ConfigSourceReader } from '../../Ast/ConfigSourceReader.ts';
import { GenerateCachedConfigFromAst } from '../../Generate/Abstract/GenerateCachedConfigFromAst.ts';
import { AstCachedConfigFileGenerator } from '../../Generator/Ast/Config/AstCachedConfigFileGenerator.ts';

import type { ConfigReaderContract } from '../../Ast/Contract/ConfigReaderContract.ts';
import type { ConfigSourceReaderContract } from '../../Ast/Contract/ConfigSourceReaderContract.ts';
import type { CachedConfigFileGeneratorContract } from '../../Generator/Config/Contract/CachedConfigFileGeneratorContract.ts';
import type { OutputContract } from '@valkyrjaio/valkyrja/Cli/Interaction/Output/Contract/OutputContract.ts';
import type { OutputFactoryContract } from '@valkyrjaio/valkyrja/Cli/Interaction/Output/Factory/Contract/OutputFactoryContract.ts';
import type { RouteContract } from '@valkyrjaio/valkyrja/Cli/Routing/Data/Contract/RouteContract.ts';

export class GenerateCachedConfigCommand extends GenerateCachedConfigFromAst {
    public constructor(
        protected override readonly route: RouteContract,
        outputFactory: OutputFactoryContract,
        configReader: ConfigReaderContract = new ConfigReader(),
        configSourceReader: ConfigSourceReaderContract = new ConfigSourceReader(),
        cachedConfigGenerator: CachedConfigFileGeneratorContract = new AstCachedConfigFileGenerator(),
    ) {
        super(
            outputFactory,
            route,
            'Generating Cached Config From Config',
            configReader,
            configSourceReader,
            cachedConfigGenerator,
        );
    }

    public run(): OutputContract {
        return this.generateCachedConfig();
    }

    protected override getConfigFilePath(): string {
        return this.route.getArgument('config').getArguments()[0]?.getValue() ?? '';
    }
}
