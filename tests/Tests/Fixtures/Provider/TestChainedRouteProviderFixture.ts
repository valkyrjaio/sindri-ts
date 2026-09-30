/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

/** A route provider whose routes are declared as builder chains rather than bare constructions — the shape a gRPC streaming method takes. */
export class TestChainedRouteProviderFixture {
    getRoutes() {
        return [
            new Route('/pkg.Ping/Ping', TestChainedRouteProviderFixture.pingHandler),
            new Route('/pkg.Ping/Fanout', TestChainedRouteProviderFixture.fanoutHandler).withServerStreaming(true),
            new Route('/pkg.Ping/Echo', TestChainedRouteProviderFixture.echoHandler)
                .withClientStreaming(true)
                .withServerStreaming(true),
            someFactory(),
        ];
    }
}
