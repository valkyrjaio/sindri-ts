/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { GenerateDataFromConfigCommand } from '../Cli/Command/GenerateDataFromConfigCommand.ts';
import { SindriServiceId } from '../Constant/SindriServiceId.ts';

import type { CliRouteAttributeReaderContract } from '../Ast/Contract/CliRouteAttributeReaderContract.ts';
import type { ComponentProviderReaderContract } from '../Ast/Contract/ComponentProviderReaderContract.ts';
import type { ConfigReaderContract } from '../Ast/Contract/ConfigReaderContract.ts';
import type { HttpRouteAttributeReaderContract } from '../Ast/Contract/HttpRouteAttributeReaderContract.ts';
import type { ListenerAttributeReaderContract } from '../Ast/Contract/ListenerAttributeReaderContract.ts';
import type { ListenerProviderReaderContract } from '../Ast/Contract/ListenerProviderReaderContract.ts';
import type { RouteProviderReaderContract } from '../Ast/Contract/RouteProviderReaderContract.ts';
import type { ServiceProviderReaderContract } from '../Ast/Contract/ServiceProviderReaderContract.ts';
import type { CliDataFileGeneratorContract } from '../Generator/Cli/Contract/CliDataFileGeneratorContract.ts';
import type { ContainerDataFileGeneratorContract } from '../Generator/Container/Contract/ContainerDataFileGeneratorContract.ts';
import type { EventDataFileGeneratorContract } from '../Generator/Event/Contract/EventDataFileGeneratorContract.ts';
import type { HttpDataFileGeneratorContract } from '../Generator/Http/Contract/HttpDataFileGeneratorContract.ts';
import { CliInteractionServiceId } from '@valkyrjaio/valkyrja/Cli/Interaction/Constant/CliInteractionServiceId.ts';
import { CliRoutingServiceId } from '@valkyrjaio/valkyrja/Cli/Routing/Constant/CliRoutingServiceId.ts';
import type { ContainerContract } from '@valkyrjaio/valkyrja/Container/Manager/Contract/ContainerContract.ts';
import type { ServiceProviderContract } from '@valkyrjaio/valkyrja/Container/Provider/Contract/ServiceProviderContract.ts';
import type { OutputFactoryContract } from '@valkyrjaio/valkyrja/Cli/Interaction/Output/Factory/Contract/OutputFactoryContract.ts';
import type { RouteContract } from '@valkyrjaio/valkyrja/Cli/Routing/Data/Contract/RouteContract.ts';

export class SindriCommandServiceProvider implements ServiceProviderContract {
    static publishGenerateDataFromConfigCommand(this: void, container: ContainerContract): void {
        container.setSingleton<GenerateDataFromConfigCommand>(
            SindriServiceId.GenerateDataFromConfigCommand,
            new GenerateDataFromConfigCommand(
                container.getSingleton<RouteContract>(CliRoutingServiceId.RouteContract),
                container.getSingleton<OutputFactoryContract>(CliInteractionServiceId.OutputFactoryContract),
                container.getSingleton<ConfigReaderContract>(SindriServiceId.ConfigReaderContract),
                container.getSingleton<ComponentProviderReaderContract>(
                    SindriServiceId.ComponentProviderReaderContract,
                ),
                container.getSingleton<RouteProviderReaderContract>(SindriServiceId.RouteProviderReaderContract),
                container.getSingleton<ListenerProviderReaderContract>(SindriServiceId.ListenerProviderReaderContract),
                container.getSingleton<ServiceProviderReaderContract>(SindriServiceId.ServiceProviderReaderContract),
                container.getSingleton<CliRouteAttributeReaderContract>(
                    SindriServiceId.CliRouteAttributeReaderContract,
                ),
                container.getSingleton<HttpRouteAttributeReaderContract>(
                    SindriServiceId.HttpRouteAttributeReaderContract,
                ),
                container.getSingleton<ListenerAttributeReaderContract>(
                    SindriServiceId.ListenerAttributeReaderContract,
                ),
                container.getSingleton<ContainerDataFileGeneratorContract>(
                    SindriServiceId.ContainerDataFileGeneratorContract,
                ),
                container.getSingleton<EventDataFileGeneratorContract>(SindriServiceId.EventDataFileGeneratorContract),
                container.getSingleton<CliDataFileGeneratorContract>(SindriServiceId.CliDataFileGeneratorContract),
                container.getSingleton<HttpDataFileGeneratorContract>(SindriServiceId.HttpDataFileGeneratorContract),
            ),
        );
    }

    publishers(): Record<string, (container: ContainerContract) => void> {
        return {
            [SindriServiceId.GenerateDataFromConfigCommand]:
                SindriCommandServiceProvider.publishGenerateDataFromConfigCommand,
        };
    }
}
