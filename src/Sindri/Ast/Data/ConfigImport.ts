/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * A single named import read from a config source file.
 *
 * A relative specifier is only meaningful next to the file that declares it.
 * Imports copied out of a framework config base therefore carry `resolvedPath`,
 * the absolute path the specifier points at, so the generate layer can rewrite
 * the specifier for wherever the generated file goes. An import that already
 * uses a bare package specifier needs no rewrite and leaves `resolvedPath` empty.
 */
export class ConfigImport {
    constructor(
        readonly name: string,
        readonly specifier: string,
        readonly isType: boolean = false,
        readonly resolvedPath: string = '',
    ) {}
}
