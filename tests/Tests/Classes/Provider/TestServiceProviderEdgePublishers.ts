// Fixture parsed by ts-morph (never executed).
/* eslint-disable */
// @ts-nocheck
export class TestServiceProviderEdgePublishers {
    publishers() {
        return {
            ...spread,
            5: ProviderA.publishA,
            'svc.bad': 'notHandler',
            'svc.nested': a.b.c,
            'svc.self': self.publishSelf,
            'svc.ok': ProviderA.publishA,
        };
    }
}
