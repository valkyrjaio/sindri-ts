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
