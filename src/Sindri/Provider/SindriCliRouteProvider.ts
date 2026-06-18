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

import type { OutputContract } from '@valkyrjaio/valkyrja/Cli/Interaction/Output/Contract/OutputContract.ts';
import type { RouteContract } from '@valkyrjaio/valkyrja/Cli/Routing/Data/Contract/RouteContract.ts';
import type { CliRouteProviderContract } from '@valkyrjaio/valkyrja/Cli/Routing/Provider/Contract/CliRouteProviderContract.ts';
import type { ContainerContract } from '@valkyrjaio/valkyrja/Container/Manager/Contract/ContainerContract.ts';

export class SindriCliRouteProvider implements CliRouteProviderContract {
    static cliGenerateDataHandler(this: void, container: ContainerContract, _route: RouteContract): OutputContract {
        return container
            .getSingleton<GenerateDataFromConfigCommand>(SindriServiceId.GenerateDataFromConfigCommand)
            .run();
    }

    getControllerClasses(): (new (...args: unknown[]) => unknown)[] {
        return [GenerateDataFromConfigCommand as new (...args: unknown[]) => unknown];
    }

    getRoutes(): RouteContract[] {
        return [];
    }
}
