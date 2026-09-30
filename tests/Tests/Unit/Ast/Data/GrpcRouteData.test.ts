/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import { describe, expect, it } from 'vitest';

import { GrpcRouteData } from '../../../../../src/Sindri/Ast/Data/GrpcRouteData.ts';
import { HandlerData } from '../../../../../src/Sindri/Ast/Data/HandlerData.ts';

describe('GrpcRouteData', () => {
    it('exposes its defaults', () => {
        const handler = new HandlerData('PingController', 'ping');
        const data = new GrpcRouteData('/app.Ping/Ping', handler);

        expect(data.method).toBe('/app.Ping/Ping');
        expect(data.handler).toBe(handler);
        expect(data.clientStreaming).toBe(false);
        expect(data.serverStreaming).toBe(false);
        expect(data.routeMatchedMiddleware).toStrictEqual([]);
        expect(data.routeDispatchedMiddleware).toStrictEqual([]);
        expect(data.throwableCaughtMiddleware).toStrictEqual([]);
        expect(data.sendingResponseMiddleware).toStrictEqual([]);
        expect(data.responseSentMiddleware).toStrictEqual([]);
    });

    it('stores the streaming flags and one middleware list for each stage', () => {
        const handler = new HandlerData('PingController', 'stream');
        const data = new GrpcRouteData(
            '/app.Ping/Stream',
            handler,
            true,
            true,
            ['Matched'],
            ['Dispatched'],
            ['Caught'],
            ['Sending'],
            ['Sent'],
        );

        expect(data.clientStreaming).toBe(true);
        expect(data.serverStreaming).toBe(true);
        expect(data.routeMatchedMiddleware).toStrictEqual(['Matched']);
        expect(data.routeDispatchedMiddleware).toStrictEqual(['Dispatched']);
        expect(data.throwableCaughtMiddleware).toStrictEqual(['Caught']);
        expect(data.sendingResponseMiddleware).toStrictEqual(['Sending']);
        expect(data.responseSentMiddleware).toStrictEqual(['Sent']);
    });
});
