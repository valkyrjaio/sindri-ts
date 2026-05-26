/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { GenerateDataFromConfigCommand } from '../Cli/Command/GenerateDataFromConfigCommand.js';
import { SindriServiceId } from '../Constant/SindriServiceId.js';

import type { CliRouteAttributeReaderContract } from '../Ast/Contract/CliRouteAttributeReaderContract.js';
import type { ComponentProviderReaderContract } from '../Ast/Contract/ComponentProviderReaderContract.js';
import type { ConfigReaderContract } from '../Ast/Contract/ConfigReaderContract.js';
import type { HttpRouteAttributeReaderContract } from '../Ast/Contract/HttpRouteAttributeReaderContract.js';
import type { ListenerAttributeReaderContract } from '../Ast/Contract/ListenerAttributeReaderContract.js';
import type { ListenerProviderReaderContract } from '../Ast/Contract/ListenerProviderReaderContract.js';
import type { RouteProviderReaderContract } from '../Ast/Contract/RouteProviderReaderContract.js';
import type { ServiceProviderReaderContract } from '../Ast/Contract/ServiceProviderReaderContract.js';
import type { CliDataFileGeneratorContract } from '../Generator/Cli/Contract/CliDataFileGeneratorContract.js';
import type { ContainerDataFileGeneratorContract } from '../Generator/Container/Contract/ContainerDataFileGeneratorContract.js';
import type { EventDataFileGeneratorContract } from '../Generator/Event/Contract/EventDataFileGeneratorContract.js';
import type { HttpDataFileGeneratorContract } from '../Generator/Http/Contract/HttpDataFileGeneratorContract.js';
import { CliInteractionServiceId } from '@valkyrja/valkyrja/Cli/Interaction/Constant/CliInteractionServiceId.js';
import { CliRoutingServiceId } from '@valkyrja/valkyrja/Cli/Routing/Constant/CliRoutingServiceId.js';
import type { ContainerContract } from '@valkyrja/valkyrja/Container/Manager/Contract/ContainerContract.js';
import type { ServiceProviderContract } from '@valkyrja/valkyrja/Container/Provider/Contract/ServiceProviderContract.js';
import type { OutputFactoryContract } from '@valkyrja/valkyrja/Cli/Interaction/Output/Factory/Contract/OutputFactoryContract.js';
import type { RouteContract } from '@valkyrja/valkyrja/Cli/Routing/Data/Contract/RouteContract.js';

export class SindriCommandServiceProvider implements ServiceProviderContract {
    static publishGenerateDataFromConfigCommand(this: void, container: ContainerContract): void {
        container.setSingleton<GenerateDataFromConfigCommand>(
            SindriServiceId.GenerateDataFromConfigCommand,
            new GenerateDataFromConfigCommand(
                container.getSingleton<RouteContract>(CliRoutingServiceId.RouteContract),
                container.getSingleton<OutputFactoryContract>(CliInteractionServiceId.OutputFactoryContract),
                container.getSingleton<ConfigReaderContract>(SindriServiceId.ConfigReaderContract),
                container.getSingleton<ComponentProviderReaderContract>(SindriServiceId.ComponentProviderReaderContract),
                container.getSingleton<RouteProviderReaderContract>(SindriServiceId.RouteProviderReaderContract),
                container.getSingleton<ListenerProviderReaderContract>(SindriServiceId.ListenerProviderReaderContract),
                container.getSingleton<ServiceProviderReaderContract>(SindriServiceId.ServiceProviderReaderContract),
                container.getSingleton<CliRouteAttributeReaderContract>(SindriServiceId.CliRouteAttributeReaderContract),
                container.getSingleton<HttpRouteAttributeReaderContract>(SindriServiceId.HttpRouteAttributeReaderContract),
                container.getSingleton<ListenerAttributeReaderContract>(SindriServiceId.ListenerAttributeReaderContract),
                container.getSingleton<ContainerDataFileGeneratorContract>(SindriServiceId.ContainerDataFileGeneratorContract),
                container.getSingleton<EventDataFileGeneratorContract>(SindriServiceId.EventDataFileGeneratorContract),
                container.getSingleton<CliDataFileGeneratorContract>(SindriServiceId.CliDataFileGeneratorContract),
                container.getSingleton<HttpDataFileGeneratorContract>(SindriServiceId.HttpDataFileGeneratorContract),
            ),
        );
    }

    publishers(): Record<string, (container: ContainerContract) => void> {
        return {
            [SindriServiceId.GenerateDataFromConfigCommand]: SindriCommandServiceProvider.publishGenerateDataFromConfigCommand,
        };
    }
}