/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import { ComponentProvider } from '@valkyrjaio/valkyrja/Application/Provider/Abstract/ComponentProvider.ts';

import { SindriAstServiceProvider } from './SindriAstServiceProvider.ts';
import { SindriCliRouteProvider } from './SindriCliRouteProvider.ts';
import { SindriCommandServiceProvider } from './SindriCommandServiceProvider.ts';

import type { ApplicationContract } from '@valkyrjaio/valkyrja/Application/Kernel/Contract/ApplicationContract.ts';
import type { CliRouteProviderContract } from '@valkyrjaio/valkyrja/Cli/Routing/Provider/Contract/CliRouteProviderContract.ts';
import type { ServiceProviderContract } from '@valkyrjaio/valkyrja/Container/Provider/Contract/ServiceProviderContract.ts';

export class SindriComponentProvider extends ComponentProvider {
    override getContainerProviders(_app: ApplicationContract): ServiceProviderContract[] {
        return [new SindriAstServiceProvider(), new SindriCommandServiceProvider()];
    }

    override getCliProviders(_app: ApplicationContract): CliRouteProviderContract[] {
        return [new SindriCliRouteProvider()];
    }
}
