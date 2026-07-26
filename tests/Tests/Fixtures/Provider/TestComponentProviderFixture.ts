// Fixture parsed by ts-morph (never executed).
/* eslint-disable */
// @ts-nocheck
import { CompA } from './CompA.ts';
import { CompB } from './CompB.ts';
import { SvcA } from './SvcA.ts';
import { CliA } from './CliA.ts';

export class TestComponentProviderFixture {
    getComponentProviders() {
        return [new CompA(), new CompB()];
    }
    getContainerProviders() {
        return [new SvcA()];
    }
    getEventProviders() {
        return [];
    }
    getCliProviders() {
        return [new CliA()];
    }
    getHttpProviders() {
        return [];
    }
}
