// Fixture parsed by ts-morph (never executed).
/* eslint-disable */
// @ts-nocheck
export class TestServiceProviderFixture {
    publishers() {
        return {
            'service.a': ProviderA.publishA,
            'service.b': [ProviderB, 'publishB'],
        };
    }
}
