/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { CliRouteAttributeReader } from '../Ast/CliRouteAttributeReader.js';
import { CliRouteParameterReader } from '../Ast/CliRouteParameterReader.js';
import { ComponentProviderReader } from '../Ast/ComponentProviderReader.js';
import { ConfigReader } from '../Ast/ConfigReader.js';
import { HttpRouteAttributeReader } from '../Ast/HttpRouteAttributeReader.js';
import { HttpRouteMiddlewareReader } from '../Ast/HttpRouteMiddlewareReader.js';
import { HttpRouteParameterReader } from '../Ast/HttpRouteParameterReader.js';
import { ListenerAttributeReader } from '../Ast/ListenerAttributeReader.js';
import { ListenerProviderReader } from '../Ast/ListenerProviderReader.js';
import { RouteProviderReader } from '../Ast/RouteProviderReader.js';
import { ServiceProviderReader } from '../Ast/ServiceProviderReader.js';
import { AstCliDataFileGenerator } from '../Generator/Ast/Cli/AstCliDataFileGenerator.js';
import { AstContainerDataFileGenerator } from '../Generator/Ast/Container/AstContainerDataFileGenerator.js';
import { AstEventDataFileGenerator } from '../Generator/Ast/Event/AstEventDataFileGenerator.js';
import { AstHttpDataFileGenerator } from '../Generator/Ast/Http/AstHttpDataFileGenerator.js';
import { SindriServiceId } from '../Constant/SindriServiceId.js';

import type { CliRouteAttributeReaderContract } from '../Ast/Contract/CliRouteAttributeReaderContract.js';
import type { CliRouteParameterReaderContract } from '../Ast/Contract/CliRouteParameterReaderContract.js';
import type { ComponentProviderReaderContract } from '../Ast/Contract/ComponentProviderReaderContract.js';
import type { ConfigReaderContract } from '../Ast/Contract/ConfigReaderContract.js';
import type { HttpRouteAttributeReaderContract } from '../Ast/Contract/HttpRouteAttributeReaderContract.js';
import type { HttpRouteMiddlewareReaderContract } from '../Ast/Contract/HttpRouteMiddlewareReaderContract.js';
import type { HttpRouteParameterReaderContract } from '../Ast/Contract/HttpRouteParameterReaderContract.js';
import type { ListenerAttributeReaderContract } from '../Ast/Contract/ListenerAttributeReaderContract.js';
import type { ListenerProviderReaderContract } from '../Ast/Contract/ListenerProviderReaderContract.js';
import type { RouteProviderReaderContract } from '../Ast/Contract/RouteProviderReaderContract.js';
import type { ServiceProviderReaderContract } from '../Ast/Contract/ServiceProviderReaderContract.js';
import type { CliDataFileGeneratorContract } from '../Generator/Cli/Contract/CliDataFileGeneratorContract.js';
import type { ContainerDataFileGeneratorContract } from '../Generator/Container/Contract/ContainerDataFileGeneratorContract.js';
import type { EventDataFileGeneratorContract } from '../Generator/Event/Contract/EventDataFileGeneratorContract.js';
import type { HttpDataFileGeneratorContract } from '../Generator/Http/Contract/HttpDataFileGeneratorContract.js';
import type { ContainerContract } from '@valkyrjaio/valkyrja/Container/Manager/Contract/ContainerContract.js';
import type { ServiceProviderContract } from '@valkyrjaio/valkyrja/Container/Provider/Contract/ServiceProviderContract.js';

export class SindriAstServiceProvider implements ServiceProviderContract {
    static publishCliRouteAttributeReader(this: void, container: ContainerContract): void {
        container.setSingleton<CliRouteAttributeReaderContract>(
            SindriServiceId.CliRouteAttributeReaderContract,
            new CliRouteAttributeReader(
                container.getSingleton<CliRouteParameterReaderContract>(
                    SindriServiceId.CliRouteParameterReaderContract,
                ),
            ),
        );
    }

    static publishComponentProviderReader(this: void, container: ContainerContract): void {
        container.setSingleton<ComponentProviderReaderContract>(
            SindriServiceId.ComponentProviderReaderContract,
            new ComponentProviderReader(),
        );
    }

    static publishConfigReader(this: void, container: ContainerContract): void {
        container.setSingleton<ConfigReaderContract>(SindriServiceId.ConfigReaderContract, new ConfigReader());
    }

    static publishCliRouteParameterReader(this: void, container: ContainerContract): void {
        container.setSingleton<CliRouteParameterReaderContract>(
            SindriServiceId.CliRouteParameterReaderContract,
            new CliRouteParameterReader(),
        );
    }

    static publishHttpRouteMiddlewareReader(this: void, container: ContainerContract): void {
        container.setSingleton<HttpRouteMiddlewareReaderContract>(
            SindriServiceId.HttpRouteMiddlewareReaderContract,
            new HttpRouteMiddlewareReader(),
        );
    }

    static publishHttpRouteParameterReader(this: void, container: ContainerContract): void {
        container.setSingleton<HttpRouteParameterReaderContract>(
            SindriServiceId.HttpRouteParameterReaderContract,
            new HttpRouteParameterReader(),
        );
    }

    static publishHttpRouteAttributeReader(this: void, container: ContainerContract): void {
        container.setSingleton<HttpRouteAttributeReaderContract>(
            SindriServiceId.HttpRouteAttributeReaderContract,
            new HttpRouteAttributeReader(
                container.getSingleton<HttpRouteParameterReaderContract>(
                    SindriServiceId.HttpRouteParameterReaderContract,
                ),
                container.getSingleton<HttpRouteMiddlewareReaderContract>(
                    SindriServiceId.HttpRouteMiddlewareReaderContract,
                ),
            ),
        );
    }

    static publishListenerAttributeReader(this: void, container: ContainerContract): void {
        container.setSingleton<ListenerAttributeReaderContract>(
            SindriServiceId.ListenerAttributeReaderContract,
            new ListenerAttributeReader(),
        );
    }

    static publishListenerProviderReader(this: void, container: ContainerContract): void {
        container.setSingleton<ListenerProviderReaderContract>(
            SindriServiceId.ListenerProviderReaderContract,
            new ListenerProviderReader(),
        );
    }

    static publishRouteProviderReader(this: void, container: ContainerContract): void {
        container.setSingleton<RouteProviderReaderContract>(
            SindriServiceId.RouteProviderReaderContract,
            new RouteProviderReader(),
        );
    }

    static publishServiceProviderReader(this: void, container: ContainerContract): void {
        container.setSingleton<ServiceProviderReaderContract>(
            SindriServiceId.ServiceProviderReaderContract,
            new ServiceProviderReader(),
        );
    }

    static publishCliDataFileGenerator(this: void, container: ContainerContract): void {
        container.setSingleton<CliDataFileGeneratorContract>(
            SindriServiceId.CliDataFileGeneratorContract,
            new AstCliDataFileGenerator(),
        );
    }

    static publishContainerDataFileGenerator(this: void, container: ContainerContract): void {
        container.setSingleton<ContainerDataFileGeneratorContract>(
            SindriServiceId.ContainerDataFileGeneratorContract,
            new AstContainerDataFileGenerator(),
        );
    }

    static publishEventDataFileGenerator(this: void, container: ContainerContract): void {
        container.setSingleton<EventDataFileGeneratorContract>(
            SindriServiceId.EventDataFileGeneratorContract,
            new AstEventDataFileGenerator(),
        );
    }

    static publishHttpDataFileGenerator(this: void, container: ContainerContract): void {
        container.setSingleton<HttpDataFileGeneratorContract>(
            SindriServiceId.HttpDataFileGeneratorContract,
            new AstHttpDataFileGenerator(),
        );
    }

    publishers(): Record<string, (container: ContainerContract) => void> {
        return {
            [SindriServiceId.CliRouteAttributeReaderContract]: SindriAstServiceProvider.publishCliRouteAttributeReader,
            [SindriServiceId.ComponentProviderReaderContract]: SindriAstServiceProvider.publishComponentProviderReader,
            [SindriServiceId.ConfigReaderContract]: SindriAstServiceProvider.publishConfigReader,
            [SindriServiceId.CliRouteParameterReaderContract]: SindriAstServiceProvider.publishCliRouteParameterReader,
            [SindriServiceId.HttpRouteMiddlewareReaderContract]:
                SindriAstServiceProvider.publishHttpRouteMiddlewareReader,
            [SindriServiceId.HttpRouteParameterReaderContract]:
                SindriAstServiceProvider.publishHttpRouteParameterReader,
            [SindriServiceId.HttpRouteAttributeReaderContract]:
                SindriAstServiceProvider.publishHttpRouteAttributeReader,
            [SindriServiceId.ListenerAttributeReaderContract]: SindriAstServiceProvider.publishListenerAttributeReader,
            [SindriServiceId.ListenerProviderReaderContract]: SindriAstServiceProvider.publishListenerProviderReader,
            [SindriServiceId.RouteProviderReaderContract]: SindriAstServiceProvider.publishRouteProviderReader,
            [SindriServiceId.ServiceProviderReaderContract]: SindriAstServiceProvider.publishServiceProviderReader,
            [SindriServiceId.CliDataFileGeneratorContract]: SindriAstServiceProvider.publishCliDataFileGenerator,
            [SindriServiceId.ContainerDataFileGeneratorContract]:
                SindriAstServiceProvider.publishContainerDataFileGenerator,
            [SindriServiceId.EventDataFileGeneratorContract]: SindriAstServiceProvider.publishEventDataFileGenerator,
            [SindriServiceId.HttpDataFileGeneratorContract]: SindriAstServiceProvider.publishHttpDataFileGenerator,
        };
    }
}
