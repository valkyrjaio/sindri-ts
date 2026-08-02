/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import { SindriAstServiceProvider } from './SindriAstServiceProvider.ts';
import { SindriCliRouteProvider } from './SindriCliRouteProvider.ts';
import { SindriCommandServiceProvider } from './SindriCommandServiceProvider.ts';

import type { CliRouteProviderContract } from '@valkyrjaio/valkyrja/Cli/Routing/Provider/Contract/CliRouteProviderContract.ts';
import type { ApplicationContract } from '@valkyrjaio/valkyrja/Application/Kernel/Contract/ApplicationContract.ts';
import type { ComponentProviderContract } from '@valkyrjaio/valkyrja/Application/Provider/Contract/ComponentProviderContract.ts';
import type { ListenerProviderContract } from '@valkyrjaio/valkyrja/Event/Provider/Contract/ListenerProviderContract.ts';
import type { HttpRouteProviderContract } from '@valkyrjaio/valkyrja/Http/Routing/Provider/Contract/HttpRouteProviderContract.ts';
import type { ServiceProviderContract } from '@valkyrjaio/valkyrja/Container/Provider/Contract/ServiceProviderContract.ts';

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
