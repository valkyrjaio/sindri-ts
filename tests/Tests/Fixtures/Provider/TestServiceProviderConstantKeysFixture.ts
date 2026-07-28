// Fixture parsed by ts-morph (never executed).
/* eslint-disable */
// @ts-nocheck
import { TestServiceIdFixture } from './TestServiceIdFixture.ts';

export class TestServiceProviderConstantKeysFixture {
    publishers() {
        return {
            [TestServiceIdFixture.Data]: ProviderA.publishData,
            [TestServiceIdFixture.Contract]: [ProviderB, 'publishContract'],
        };
    }
}
