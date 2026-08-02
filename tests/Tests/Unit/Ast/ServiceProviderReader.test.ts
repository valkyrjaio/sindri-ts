/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { ServiceProviderReader } from '../../../../src/Sindri/Ast/ServiceProviderReader.ts';

function fixture(name: string): string {
    return fileURLToPath(new URL(`../../Fixtures/${name}.ts`, import.meta.url));
}

describe('ServiceProviderReader', () => {
    it('extracts the publishers map (property-access and array handler forms)', () => {
        const result = new ServiceProviderReader().readFile(fixture('Provider/TestServiceProviderFixture'));

        expect(result.serviceClasses).toStrictEqual(['service.a', 'service.b']);
        expect(result.publishers['service.a']).toStrictEqual(['ProviderA', 'publishA']);
        expect(result.publishers['service.b']).toStrictEqual(['ProviderB', 'publishB']);
    });

    it('extracts publishers keyed by `as const` binding-key constants', () => {
        const result = new ServiceProviderReader().readFile(fixture('Provider/TestServiceProviderConstantKeysFixture'));

        expect(result.serviceClasses).toStrictEqual(['svc.const.data', 'svc.const.contract']);
        expect(result.publishers['svc.const.data']).toStrictEqual(['ProviderA', 'publishData']);
        expect(result.publishers['svc.const.contract']).toStrictEqual(['ProviderB', 'publishContract']);
    });

    it("extracts publishers keyed by the provider's own constant and by an imported one", () => {
        const result = new ServiceProviderReader().readFile(fixture('Provider/TestServiceProviderLocalKeysFixture'));

        expect(result.serviceClasses).toStrictEqual(['app.own.service', 'svc.constant-id']);
        expect(result.publishers['app.own.service']).toStrictEqual([
            'TestServiceProviderLocalKeysFixture',
            'publishOwn',
        ]);
        expect(result.publishers['svc.constant-id']).toStrictEqual([
            'TestServiceProviderLocalKeysFixture',
            'publishConstant',
        ]);
    });

    it('returns an empty result when there is no class', () => {
        expect(new ServiceProviderReader().readFile(fixture('Config/TestConfigNoClassFixture')).serviceClasses).toHaveLength(
            0,
        );
    });

    it('returns an empty result when there is no publishers() method', () => {
        expect(
            new ServiceProviderReader().readFile(fixture('Provider/TestServiceProviderNoPublishersFixture')).serviceClasses,
        ).toHaveLength(0);
    });

    it('returns an empty result when publishers() does not return an object', () => {
        expect(
            new ServiceProviderReader().readFile(fixture('Provider/TestServiceProviderNonObjectPublishersFixture'))
                .serviceClasses,
        ).toHaveLength(0);
    });

    it('skips spreads, unsupported keys and invalid handler values', () => {
        const result = new ServiceProviderReader().readFile(fixture('Provider/TestServiceProviderEdgePublishersFixture'));

        // Only the self-reference and the valid property-access entries survive.
        expect(result.serviceClasses).toStrictEqual(['svc.self', 'svc.ok']);
        expect(result.publishers['svc.self']).toStrictEqual(['TestServiceProviderEdgePublishersFixture', 'publishSelf']);
        expect(result.publishers['svc.ok']).toStrictEqual(['ProviderA', 'publishA']);
    });

    it('falls back to an empty current class for an anonymous default-exported class', () => {
        expect(new ServiceProviderReader().readFile(fixture('Ast/AnonymousFixture')).serviceClasses).toHaveLength(0);
    });
});
