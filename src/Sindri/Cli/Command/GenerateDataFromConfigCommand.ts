/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { CliRouteAttributeReader } from '../../Ast/CliRouteAttributeReader.js';
import { ComponentProviderReader } from '../../Ast/ComponentProviderReader.js';
import { ConfigReader } from '../../Ast/ConfigReader.js';
import { HttpRouteAttributeReader } from '../../Ast/HttpRouteAttributeReader.js';
import { ListenerAttributeReader } from '../../Ast/ListenerAttributeReader.js';
import { ListenerProviderReader } from '../../Ast/ListenerProviderReader.js';
import { RouteProviderReader } from '../../Ast/RouteProviderReader.js';
import { ServiceProviderReader } from '../../Ast/ServiceProviderReader.js';
import { AstCliDataFileGenerator } from '../../Generator/Ast/Cli/AstCliDataFileGenerator.js';
import { AstContainerDataFileGenerator } from '../../Generator/Ast/Container/AstContainerDataFileGenerator.js';
import { AstEventDataFileGenerator } from '../../Generator/Ast/Event/AstEventDataFileGenerator.js';
import { AstHttpDataFileGenerator } from '../../Generator/Ast/Http/AstHttpDataFileGenerator.js';
import { GenerateDataFromAst } from '../../Generate/Abstract/GenerateDataFromAst.js';

import type { CliDataFileGeneratorContract } from '../../Generator/Cli/Contract/CliDataFileGeneratorContract.js';
import type { ContainerDataFileGeneratorContract } from '../../Generator/Container/Contract/ContainerDataFileGeneratorContract.js';
import type { EventDataFileGeneratorContract } from '../../Generator/Event/Contract/EventDataFileGeneratorContract.js';
import type { HttpDataFileGeneratorContract } from '../../Generator/Http/Contract/HttpDataFileGeneratorContract.js';
import type { CliRouteAttributeReaderContract } from '../../Ast/Contract/CliRouteAttributeReaderContract.js';
import type { ComponentProviderReaderContract } from '../../Ast/Contract/ComponentProviderReaderContract.js';
import type { ConfigReaderContract } from '../../Ast/Contract/ConfigReaderContract.js';
import type { HttpRouteAttributeReaderContract } from '../../Ast/Contract/HttpRouteAttributeReaderContract.js';
import type { ListenerAttributeReaderContract } from '../../Ast/Contract/ListenerAttributeReaderContract.js';
import type { ListenerProviderReaderContract } from '../../Ast/Contract/ListenerProviderReaderContract.js';
import type { RouteProviderReaderContract } from '../../Ast/Contract/RouteProviderReaderContract.js';
import type { ServiceProviderReaderContract } from '../../Ast/Contract/ServiceProviderReaderContract.js';
import type { OutputContract } from '@valkyrja/valkyrja/Cli/Interaction/Output/Contract/OutputContract.js';
import type { OutputFactoryContract } from '@valkyrja/valkyrja/Cli/Interaction/Output/Factory/Contract/OutputFactoryContract.js';
import type { RouteContract } from '@valkyrja/valkyrja/Cli/Routing/Data/Contract/RouteContract.js';

export class GenerateDataFromConfigCommand extends GenerateDataFromAst {
    public constructor(
        protected override readonly route: RouteContract,
        outputFactory: OutputFactoryContract,
        configReader: ConfigReaderContract = new ConfigReader(),
        componentProviderReader: ComponentProviderReaderContract = new ComponentProviderReader(),
        routeProviderReader: RouteProviderReaderContract = new RouteProviderReader(),
        listenerProviderReader: ListenerProviderReaderContract = new ListenerProviderReader(),
        serviceProviderReader: ServiceProviderReaderContract = new ServiceProviderReader(),
        cliRouteAttributeReader: CliRouteAttributeReaderContract = new CliRouteAttributeReader(),
        httpRouteAttributeReader: HttpRouteAttributeReaderContract = new HttpRouteAttributeReader(),
        listenerAttributeReader: ListenerAttributeReaderContract = new ListenerAttributeReader(),
        containerGenerator: ContainerDataFileGeneratorContract = new AstContainerDataFileGenerator(),
        eventGenerator: EventDataFileGeneratorContract = new AstEventDataFileGenerator(),
        cliGenerator: CliDataFileGeneratorContract = new AstCliDataFileGenerator(),
        httpGenerator: HttpDataFileGeneratorContract = new AstHttpDataFileGenerator(),
    ) {
        super(
            outputFactory,
            route,
            'Generating Component Data From Config',
            configReader,
            componentProviderReader,
            routeProviderReader,
            listenerProviderReader,
            serviceProviderReader,
            cliRouteAttributeReader,
            httpRouteAttributeReader,
            listenerAttributeReader,
            containerGenerator,
            eventGenerator,
            cliGenerator,
            httpGenerator,
        );
    }

    public run(): OutputContract {
        return this.generateData();
    }

    protected override getConfigFilePath(): string {
        return this.route.getArgument('config').getArguments()[0]?.getValue() ?? '';
    }
}