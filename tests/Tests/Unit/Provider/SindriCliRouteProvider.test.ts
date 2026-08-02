/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import { describe, expect, it, vi } from 'vitest';

import { SindriServiceId } from '../../../../src/Sindri/Constant/SindriServiceId.ts';
import { GenerateDataFromConfigCommand } from '../../../../src/Sindri/Cli/Command/GenerateDataFromConfigCommand.ts';
import { SindriCliRouteProvider } from '../../../../src/Sindri/Provider/SindriCliRouteProvider.ts';
import { Container } from '@valkyrjaio/valkyrja/Container/Manager/Container.ts';

import type { RouteContract } from '@valkyrjaio/valkyrja/Cli/Routing/Data/Contract/RouteContract.ts';

describe('SindriCliRouteProvider', () => {
    const provider = new SindriCliRouteProvider();

    it('exposes the generate-data command controller and no routes', () => {
        expect(provider.getControllerClasses()).toContain(GenerateDataFromConfigCommand);
        expect(provider.getRoutes()).toHaveLength(0);
    });

    it('cliGenerateDataHandler resolves and runs the command', () => {
        const output = {};
        const command = { run: vi.fn(() => output) };
        const container = new Container();
        container.setSingleton(SindriServiceId.GenerateDataFromConfigCommand, command);

        const result = SindriCliRouteProvider.cliGenerateDataHandler(container, {} as RouteContract);

        expect(command.run).toHaveBeenCalledTimes(1);
        expect(result).toBe(output);
    });
});
