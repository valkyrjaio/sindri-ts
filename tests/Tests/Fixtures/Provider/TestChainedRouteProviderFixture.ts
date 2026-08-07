/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
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
