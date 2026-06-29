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

import { ConfigReader } from '../../../../src/Sindri/Ast/ConfigReader.ts';
import { AstFileReadException } from '../../../../src/Sindri/Ast/Throwable/Exception/AstFileReadException.ts';

function fixturePath(name: string): string {
    return fileURLToPath(new URL(`../../Fixtures/Config/${name}.ts`, import.meta.url));
}

const fixture = fixturePath('TestConfigClass');

describe('ConfigReader', () => {
    it('extracts the namespace, dir, data path, and data namespace from the config class', () => {
        const result = new ConfigReader().readFile(fixture);

        expect(result.namespace).toBe('Sindri.Tests.Fixtures');
        expect(result.dir).toBe('/app/src');
        expect(result.dataPath).toBe('/app/src/Config/Data');
        expect(result.dataNamespace).toBe('Sindri.Tests.Fixtures.Config.Data');
    });

    it('extracts the configured providers', () => {
        const result = new ConfigReader().readFile(fixture);

        expect(result.providers.length).toBeGreaterThan(0);
    });

    it('resolves process.cwd() as the dir, keeps an absolute data path, and ignores non-array providers', () => {
        const result = new ConfigReader().readFile(fixturePath('TestConfigProcessCwd'));

        expect(result.namespace).toBe('App.Cwd');
        expect(result.dir).toBe(process.cwd());
        expect(result.dataPath).toBe('/abs/data');
        expect(result.providers).toStrictEqual([]);
    });

    it('resolves __dirname as the dir', () => {
        const result = new ConfigReader().readFile(fixturePath('TestConfigDirname'));

        expect(result.namespace).toBe('App.Dir');
        expect(result.dir).toContain('Fixtures/Config');
        expect(result.dataPath).toContain('/Data');
    });

    it('resolves import.meta.dirname as the dir', () => {
        const result = new ConfigReader().readFile(fixturePath('TestConfigImportMeta'));

        expect(result.namespace).toBe('App.Meta');
        expect(result.dir).toContain('Fixtures/Config');
    });

    it('returns an empty config when a required value is not a string literal', () => {
        expect(new ConfigReader().readFile(fixturePath('TestConfigNonLiteral')).namespace).toBe('');
    });

    it('returns an empty config when there is no class', () => {
        expect(new ConfigReader().readFile(fixturePath('TestConfigNoClass')).namespace).toBe('');
    });

    it('returns an empty config when the class has no constructor', () => {
        expect(new ConfigReader().readFile(fixturePath('TestConfigNoConstructor')).namespace).toBe('');
    });

    it('returns an empty config when the constructor has no super() call', () => {
        expect(new ConfigReader().readFile(fixturePath('TestConfigNoSuper')).namespace).toBe('');
    });

    it('returns an empty config when the first constructor is an overload with no body', () => {
        expect(new ConfigReader().readFile(fixturePath('TestConfigConstructorOverload')).namespace).toBe('');
    });

    it('returns an empty config when the super() call has too few arguments', () => {
        expect(new ConfigReader().readFile(fixturePath('TestConfigFewArgs')).dir).toBe('');
    });

    it('returns an empty config when the data path argument is not a string', () => {
        expect(new ConfigReader().readFile(fixturePath('TestConfigNonStringDataPath')).dataPath).toBe('');
    });

    it('returns an empty config when the dir argument is an unrecognized expression', () => {
        expect(new ConfigReader().readFile(fixturePath('TestConfigUnresolvedDir')).dir).toBe('');
    });

    it('throws when the file cannot be read', () => {
        expect(() => new ConfigReader().readFile('/does/not/exist.ts')).toThrow(AstFileReadException);
    });

    it('ignores non-super() call statements in the constructor', () => {
        expect(new ConfigReader().readFile(fixturePath('TestConfigNonSuperCall')).namespace).toBe('App.NonSuper');
    });

    it('does not resolve the dir from a property-access call that is not process.cwd()', () => {
        // The dir argument is path.resolve() (not process.cwd()), so the dir cannot be
        // resolved and the config comes back empty.
        const result = new ConfigReader().readFile(fixturePath('TestConfigNonCwdCall'));

        expect(result.dir).toBe('');
        expect(result.namespace).toBe('');
    });
});
