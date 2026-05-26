/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { SindriAstServiceProvider } from './SindriAstServiceProvider.js';
import { SindriCliRouteProvider } from './SindriCliRouteProvider.js';
import { SindriCommandServiceProvider } from './SindriCommandServiceProvider.js';

import type { CliRouteProviderContract } from '@valkyrja/valkyrja/Cli/Routing/Provider/Contract/CliRouteProviderContract.js';
import type { ApplicationContract } from '@valkyrja/valkyrja/Application/Kernel/Contract/ApplicationContract.js';
import type { ComponentProviderContract } from '@valkyrja/valkyrja/Application/Provider/Contract/ComponentProviderContract.js';
import type { ListenerProviderContract } from '@valkyrja/valkyrja/Event/Provider/Contract/ListenerProviderContract.js';
import type { HttpRouteProviderContract } from '@valkyrja/valkyrja/Http/Routing/Provider/Contract/HttpRouteProviderContract.js';
import type { ServiceProviderContract } from '@valkyrja/valkyrja/Container/Provider/Contract/ServiceProviderContract.js';

export class SindriComponentProvider implements ComponentProviderContract {
    getComponentProviders(_app: ApplicationContract): ComponentProviderContract[] {
        return [];
    }

    getContainerProviders(_app: ApplicationContract): ServiceProviderContract[] {
        return [new SindriAstServiceProvider(), new SindriCommandServiceProvider()];
    }

    getEventProviders(_app: ApplicationContract): ListenerProviderContract[] {
        return [];
    }

    getCliProviders(_app: ApplicationContract): CliRouteProviderContract[] {
        return [new SindriCliRouteProvider()];
    }

    getHttpProviders(_app: ApplicationContract): HttpRouteProviderContract[] {
        return [];
    }
}