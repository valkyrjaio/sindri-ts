/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { CliRouteAttributeReader } from '../../Ast/CliRouteAttributeReader.ts';
import { ComponentProviderReader } from '../../Ast/ComponentProviderReader.ts';
import { ConfigReader } from '../../Ast/ConfigReader.ts';
import { HttpRouteAttributeReader } from '../../Ast/HttpRouteAttributeReader.ts';
import { ListenerAttributeReader } from '../../Ast/ListenerAttributeReader.ts';
import { ListenerProviderReader } from '../../Ast/ListenerProviderReader.ts';
import { RouteProviderReader } from '../../Ast/RouteProviderReader.ts';
import { ServiceProviderReader } from '../../Ast/ServiceProviderReader.ts';
import { AstCliDataFileGenerator } from '../../Generator/Ast/Cli/AstCliDataFileGenerator.ts';
import { AstContainerDataFileGenerator } from '../../Generator/Ast/Container/AstContainerDataFileGenerator.ts';
import { AstEventDataFileGenerator } from '../../Generator/Ast/Event/AstEventDataFileGenerator.ts';
import { AstHttpDataFileGenerator } from '../../Generator/Ast/Http/AstHttpDataFileGenerator.ts';
import { GenerateDataFromAst } from '../../Generate/Abstract/GenerateDataFromAst.ts';

import type { CliDataFileGeneratorContract } from '../../Generator/Cli/Contract/CliDataFileGeneratorContract.ts';
import type { ContainerDataFileGeneratorContract } from '../../Generator/Container/Contract/ContainerDataFileGeneratorContract.ts';
import type { EventDataFileGeneratorContract } from '../../Generator/Event/Contract/EventDataFileGeneratorContract.ts';
import type { HttpDataFileGeneratorContract } from '../../Generator/Http/Contract/HttpDataFileGeneratorContract.ts';
import type { CliRouteAttributeReaderContract } from '../../Ast/Contract/CliRouteAttributeReaderContract.ts';
import type { ComponentProviderReaderContract } from '../../Ast/Contract/ComponentProviderReaderContract.ts';
import type { ConfigReaderContract } from '../../Ast/Contract/ConfigReaderContract.ts';
import type { HttpRouteAttributeReaderContract } from '../../Ast/Contract/HttpRouteAttributeReaderContract.ts';
import type { ListenerAttributeReaderContract } from '../../Ast/Contract/ListenerAttributeReaderContract.ts';
import type { ListenerProviderReaderContract } from '../../Ast/Contract/ListenerProviderReaderContract.ts';
import type { RouteProviderReaderContract } from '../../Ast/Contract/RouteProviderReaderContract.ts';
import type { ServiceProviderReaderContract } from '../../Ast/Contract/ServiceProviderReaderContract.ts';
import type { OutputContract } from '@valkyrjaio/valkyrja/Cli/Interaction/Output/Contract/OutputContract.ts';
import type { OutputFactoryContract } from '@valkyrjaio/valkyrja/Cli/Interaction/Output/Factory/Contract/OutputFactoryContract.ts';
import type { RouteContract } from '@valkyrjaio/valkyrja/Cli/Routing/Data/Contract/RouteContract.ts';

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
