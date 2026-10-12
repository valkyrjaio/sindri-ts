// Fixture parsed by ts-morph (never executed).
/* eslint-disable */
// @ts-nocheck
// An import of a file that does not exist, so the reader resolves it to no path the generated data
// file can import the handler from.
import { homeHandler } from './DoesNotExistFixture.ts';

export class TestUnresolvedImportRouteProviderFixture {
    getRoutes() {
        return [new Route('/', 'home', homeHandler)];
    }
}
