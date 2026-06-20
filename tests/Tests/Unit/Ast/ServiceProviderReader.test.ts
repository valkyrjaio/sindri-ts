/*
 * This file is part of the Valkyrja package.
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
    return fileURLToPath(new URL(`../../Classes/${name}.ts`, import.meta.url));
}

describe('ServiceProviderReader', () => {
    it('extracts the publishers map (property-access and array handler forms)', () => {
        const result = new ServiceProviderReader().readFile(fixture('Provider/TestServiceProviderClass'));

        expect(result.serviceClasses).toStrictEqual(['service.a', 'service.b']);
        expect(result.publishers['service.a']).toStrictEqual(['ProviderA', 'publishA']);
        expect(result.publishers['service.b']).toStrictEqual(['ProviderB', 'publishB']);
    });

    it('returns an empty result when there is no class', () => {
        expect(new ServiceProviderReader().readFile(fixture('Config/TestConfigNoClass')).serviceClasses).toHaveLength(
            0,
        );
    });

    it('returns an empty result when there is no publishers() method', () => {
        expect(
            new ServiceProviderReader().readFile(fixture('Provider/TestServiceProviderNoPublishers')).serviceClasses,
        ).toHaveLength(0);
    });

    it('returns an empty result when publishers() does not return an object', () => {
        expect(
            new ServiceProviderReader().readFile(fixture('Provider/TestServiceProviderNonObjectPublishers'))
                .serviceClasses,
        ).toHaveLength(0);
    });

    it('skips spreads, unsupported keys and invalid handler values', () => {
        const result = new ServiceProviderReader().readFile(fixture('Provider/TestServiceProviderEdgePublishers'));

        // Only the self-reference and the valid property-access entries survive.
        expect(result.serviceClasses).toStrictEqual(['svc.self', 'svc.ok']);
        expect(result.publishers['svc.self']).toStrictEqual(['TestServiceProviderEdgePublishers', 'publishSelf']);
        expect(result.publishers['svc.ok']).toStrictEqual(['ProviderA', 'publishA']);
    });

    it('falls back to an empty current class for an anonymous default-exported class', () => {
        expect(new ServiceProviderReader().readFile(fixture('Ast/AnonymousClass')).serviceClasses).toHaveLength(0);
    });
});
