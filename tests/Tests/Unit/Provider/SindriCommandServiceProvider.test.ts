/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
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
            SindriServiceId.GrpcDataFileGeneratorContract,
        ]) {
            container.setSingleton(id, {});
        }

        SindriCommandServiceProvider.publishGenerateDataFromConfigCommand(container);

        expect(container.isSingleton(SindriServiceId.GenerateDataFromConfigCommand)).toBe(true);
    });

    it('gives the command the container instance of each data file generator', () => {
        const container = new Container();
        const generators = {
            [SindriServiceId.ContainerDataFileGeneratorContract]: {},
            [SindriServiceId.EventDataFileGeneratorContract]: {},
            [SindriServiceId.CliDataFileGeneratorContract]: {},
            [SindriServiceId.HttpDataFileGeneratorContract]: {},
            [SindriServiceId.GrpcDataFileGeneratorContract]: {},
        };

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
        ]) {
            container.setSingleton(id, {});
        }

        for (const [id, generator] of Object.entries(generators)) {
            container.setSingleton(id, generator);
        }

        SindriCommandServiceProvider.publishGenerateDataFromConfigCommand(container);

        const command = container.getSingleton<Record<string, unknown>>(SindriServiceId.GenerateDataFromConfigCommand);

        expect(command.containerGenerator).toBe(generators[SindriServiceId.ContainerDataFileGeneratorContract]);
        expect(command.eventGenerator).toBe(generators[SindriServiceId.EventDataFileGeneratorContract]);
        expect(command.cliGenerator).toBe(generators[SindriServiceId.CliDataFileGeneratorContract]);
        expect(command.httpGenerator).toBe(generators[SindriServiceId.HttpDataFileGeneratorContract]);
        expect(command.grpcGenerator).toBe(generators[SindriServiceId.GrpcDataFileGeneratorContract]);
    });
});
