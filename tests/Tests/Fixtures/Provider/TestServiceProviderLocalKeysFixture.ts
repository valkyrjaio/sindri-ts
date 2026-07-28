// Fixture parsed by ts-morph (never executed).
/* eslint-disable */
// @ts-nocheck
// Mirrors an application provider: it declares the key for its own service, and
// imports a module-level constant for a framework contract it overrides.
import { CONSTANT_ID } from '../Ast/ConstantHolderFixture.ts';

export class TestServiceProviderLocalKeysFixture {
    static readonly OwnServiceId = 'app.own.service' as const;

    publishers() {
        return {
            [TestServiceProviderLocalKeysFixture.OwnServiceId]: TestServiceProviderLocalKeysFixture.publishOwn,
            [CONSTANT_ID]: TestServiceProviderLocalKeysFixture.publishConstant,
        };
    }
}
