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

import type { OutputContract } from '@valkyrja/valkyrja/Cli/Interaction/Output/Contract/OutputContract.js';
import type { RouteContract } from '@valkyrja/valkyrja/Cli/Routing/Data/Contract/RouteContract.js';
import type { CliRouteProviderContract } from '@valkyrja/valkyrja/Cli/Routing/Provider/Contract/CliRouteProviderContract.js';
import type { ContainerContract } from '@valkyrja/valkyrja/Container/Manager/Contract/ContainerContract.js';

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
