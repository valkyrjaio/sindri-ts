/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import { describe, expect, it } from 'vitest';

import { SindriServiceId } from '../../../../src/Sindri/Constant/SindriServiceId.ts';
import { SindriAstServiceProvider } from '../../../../src/Sindri/Provider/SindriAstServiceProvider.ts';
import { Container } from '@valkyrjaio/valkyrja/Container/Manager/Container.ts';

describe('SindriAstServiceProvider', () => {
    it('publishes all fifteen reader and generator service ids', () => {
        const publishers = new SindriAstServiceProvider().publishers();

        expect(Object.keys(publishers)).toHaveLength(15);
    });

    it('each publisher registers its singleton', () => {
        const container = new Container();
        // Pre-register the cross-dependencies read by some publishers.
        container.setSingleton(SindriServiceId.CliRouteParameterReaderContract, {});
        container.setSingleton(SindriServiceId.HttpRouteParameterReaderContract, {});
        container.setSingleton(SindriServiceId.HttpRouteMiddlewareReaderContract, {});

        const publishers = new SindriAstServiceProvider().publishers();

        for (const [id, publish] of Object.entries(publishers)) {
            publish(container);

            expect(container.isSingleton(id)).toBe(true);
        }
    });
});
