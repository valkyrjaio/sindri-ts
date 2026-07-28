// Fixture parsed by ts-morph (never executed).
/* eslint-disable */
// @ts-nocheck
import { PackageRouteProviderFixture } from '@fixture/routes/PackageRouteProviderFixture.ts';
import { PlainFixture } from 'plain/lib/PlainFixture.ts';
import { TypedFixture } from 'typed';
import { MissingFixture } from '@fixture/does-not-exist/Missing.ts';

export class PackageConsumerFixture {
    getComponentProviders() {
        return [new PackageRouteProviderFixture(), new PlainFixture(), new TypedFixture(), new MissingFixture()];
    }
}
