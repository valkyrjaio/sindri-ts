// Fixture parsed by ts-morph (never executed).
/* eslint-disable */
// @ts-nocheck
import { CliA } from './CliA.ts';
import { Missing } from './DoesNotExistFixture.ts';
import type { OutputContract } from './CompA.ts';

export class TestConstantNamedRouteProviderFixture {
    getRoutes() {
        return [
            new Route(CliA.LIST, 'List things', TestConstantNamedRouteProviderFixture.listHandler, {
                help: (): OutputContract => Missing.help(),
            }),
            new Route(unresolvable(), 'Skipped', TestConstantNamedRouteProviderFixture.skippedHandler),
        ];
    }
}
