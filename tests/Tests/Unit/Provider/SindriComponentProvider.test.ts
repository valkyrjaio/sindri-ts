/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import { describe, expect, it } from 'vitest';

import { SindriAstServiceProvider } from '../../../../src/Sindri/Provider/SindriAstServiceProvider.ts';
import { SindriCliRouteProvider } from '../../../../src/Sindri/Provider/SindriCliRouteProvider.ts';
import { SindriCommandServiceProvider } from '../../../../src/Sindri/Provider/SindriCommandServiceProvider.ts';
import { SindriComponentProvider } from '../../../../src/Sindri/Provider/SindriComponentProvider.ts';

import type { ApplicationContract } from '@valkyrjaio/valkyrja/Application/Kernel/Contract/ApplicationContract.ts';

const app = {} as unknown as ApplicationContract;

describe('SindriComponentProvider', () => {
    const provider = new SindriComponentProvider();

    it('wires the ast and command service providers', () => {
        const providers = provider.getContainerProviders(app);

        expect(providers[0]).toBeInstanceOf(SindriAstServiceProvider);
        expect(providers[1]).toBeInstanceOf(SindriCommandServiceProvider);
    });

    it('wires the cli route provider', () => {
        expect(provider.getCliProviders(app)[0]).toBeInstanceOf(SindriCliRouteProvider);
    });

    it('returns no component, event, or http providers', () => {
        expect(provider.getComponentProviders(app)).toHaveLength(0);
        expect(provider.getEventProviders(app)).toHaveLength(0);
        expect(provider.getHttpProviders(app)).toHaveLength(0);
    });
});
