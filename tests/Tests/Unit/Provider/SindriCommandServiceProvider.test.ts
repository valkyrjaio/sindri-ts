/*
 * This file is part of the Valkyrja package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';

import { SindriServiceId } from '../../../../src/Sindri/Constant/SindriServiceId.ts';
import { SindriCommandServiceProvider } from '../../../../src/Sindri/Provider/SindriCommandServiceProvider.ts';
import { CliInteractionServiceId } from '@valkyrjaio/valkyrja/Cli/Interaction/Constant/CliInteractionServiceId.ts';
import { CliRoutingServiceId } from '@valkyrjaio/valkyrja/Cli/Routing/Constant/CliRoutingServiceId.ts';
import { Container } from '@valkyrjaio/valkyrja/Container/Manager/Container.ts';

describe('SindriCommandServiceProvider', () => {
    it('publishes the generate-data command id', () => {
        expect(Object.keys(new SindriCommandServiceProvider().publishers())).toStrictEqual([
            SindriServiceId.GenerateDataFromConfigCommand,
        ]);
    });

    it('registers the command, resolving all of its dependencies', () => {
        const container = new Container();
        for (const id of [
            CliRoutingServiceId.RouteContract,
            CliInteractionServiceId.OutputFactoryContract,
            SindriServiceId.ConfigReaderContract,
            SindriServiceId.ComponentProviderReaderContract,
            SindriServiceId.RouteProviderReaderContract,
            SindriServiceId.ListenerProviderReaderContract,
            SindriServiceId.ServiceProviderReaderContract,
            SindriServiceId.CliRouteAttributeReaderContract,
            SindriServiceId.HttpRouteAttributeReaderContract,
            SindriServiceId.ListenerAttributeReaderContract,
            SindriServiceId.ContainerDataFileGeneratorContract,
            SindriServiceId.EventDataFileGeneratorContract,
            SindriServiceId.CliDataFileGeneratorContract,
            SindriServiceId.HttpDataFileGeneratorContract,
        ]) {
            container.setSingleton(id, {});
        }

        SindriCommandServiceProvider.publishGenerateDataFromConfigCommand(container);

        expect(container.isSingleton(SindriServiceId.GenerateDataFromConfigCommand)).toBe(true);
    });
});
