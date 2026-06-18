/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { CliRouteAttributeReader } from '../Ast/CliRouteAttributeReader.ts';
import { CliRouteParameterReader } from '../Ast/CliRouteParameterReader.ts';
import { ComponentProviderReader } from '../Ast/ComponentProviderReader.ts';
import { ConfigReader } from '../Ast/ConfigReader.ts';
import { HttpRouteAttributeReader } from '../Ast/HttpRouteAttributeReader.ts';
import { HttpRouteMiddlewareReader } from '../Ast/HttpRouteMiddlewareReader.ts';
import { HttpRouteParameterReader } from '../Ast/HttpRouteParameterReader.ts';
import { ListenerAttributeReader } from '../Ast/ListenerAttributeReader.ts';
import { ListenerProviderReader } from '../Ast/ListenerProviderReader.ts';
import { RouteProviderReader } from '../Ast/RouteProviderReader.ts';
import { ServiceProviderReader } from '../Ast/ServiceProviderReader.ts';
import { AstCliDataFileGenerator } from '../Generator/Ast/Cli/AstCliDataFileGenerator.ts';
import { AstContainerDataFileGenerator } from '../Generator/Ast/Container/AstContainerDataFileGenerator.ts';
import { AstEventDataFileGenerator } from '../Generator/Ast/Event/AstEventDataFileGenerator.ts';
import { AstHttpDataFileGenerator } from '../Generator/Ast/Http/AstHttpDataFileGenerator.ts';
import { SindriServiceId } from '../Constant/SindriServiceId.ts';

import type { CliRouteAttributeReaderContract } from '../Ast/Contract/CliRouteAttributeReaderContract.ts';
import type { CliRouteParameterReaderContract } from '../Ast/Contract/CliRouteParameterReaderContract.ts';
import type { ComponentProviderReaderContract } from '../Ast/Contract/ComponentProviderReaderContract.ts';
import type { ConfigReaderContract } from '../Ast/Contract/ConfigReaderContract.ts';
import type { HttpRouteAttributeReaderContract } from '../Ast/Contract/HttpRouteAttributeReaderContract.ts';
import type { HttpRouteMiddlewareReaderContract } from '../Ast/Contract/HttpRouteMiddlewareReaderContract.ts';
import type { HttpRouteParameterReaderContract } from '../Ast/Contract/HttpRouteParameterReaderContract.ts';
import type { ListenerAttributeReaderContract } from '../Ast/Contract/ListenerAttributeReaderContract.ts';
import type { ListenerProviderReaderContract } from '../Ast/Contract/ListenerProviderReaderContract.ts';
import type { RouteProviderReaderContract } from '../Ast/Contract/RouteProviderReaderContract.ts';
import type { ServiceProviderReaderContract } from '../Ast/Contract/ServiceProviderReaderContract.ts';
import type { CliDataFileGeneratorContract } from '../Generator/Cli/Contract/CliDataFileGeneratorContract.ts';
import type { ContainerDataFileGeneratorContract } from '../Generator/Container/Contract/ContainerDataFileGeneratorContract.ts';
import type { EventDataFileGeneratorContract } from '../Generator/Event/Contract/EventDataFileGeneratorContract.ts';
import type { HttpDataFileGeneratorContract } from '../Generator/Http/Contract/HttpDataFileGeneratorContract.ts';
import type { ContainerContract } from '@valkyrjaio/valkyrja/Container/Manager/Contract/ContainerContract.ts';
import type { ServiceProviderContract } from '@valkyrjaio/valkyrja/Container/Provider/Contract/ServiceProviderContract.ts';

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
