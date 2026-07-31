/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Turns an absolute file path into the specifier a generated file must import
 * it by.
 *
 * Every Sindri command that writes TypeScript needs this, because a generated
 * file sits in a different directory from the files it references. Application
 * source gets a path relative to the output directory. A file inside an
 * installed package gets that package's own public specifier.
 */
export abstract class GenerateFromAst {
    /**
     * Build the `import { X } from '...'` specifier for a class file, relative
     * to the generated data file's output directory. Used to import the
     * provider/handler classes referenced by the generated data caches.
     */
    protected relativeSpecifier(fromDir: string, toFile: string): string {
        const relative = path.relative(fromDir, toFile).split(path.sep).join('/');

        return relative.startsWith('.') ? relative : `./${relative}`;
    }

    /**
     * Build the specifier a generated data file should import a class file by.
     *
     * Application source is imported by a path relative to the data directory;
     * a file belonging to an installed package is imported by that package's
     * own public specifier — so the framework classes the cache references are
     * written exactly as hand-written application code writes them
     * (`@valkyrjaio/valkyrja/Cli/Routing/Data/Route.ts`), never as a brittle
     * reach into `node_modules`.
     */
    protected importSpecifier(fromDir: string, toFile: string): string {
        return this.packageSpecifier(toFile) ?? this.relativeSpecifier(fromDir, toFile);
    }

    /**
     * Map an absolute path inside an installed package back to the specifier
     * that package publicly exposes it as, or undefined when the file is not
     * part of one.
     *
     * The package's `exports` map is inverted: for `"./*.ts": "./src/*.ts"` a
     * file at `<package>/src/Foo.ts` maps back to `<name>/Foo.ts`. Packages
     * with no matching pattern fall back to the path as written under the
     * package root, which is what a package without an `exports` map exposes.
     */
    protected packageSpecifier(filePath: string): string | undefined {
        const normalized = filePath.split(path.sep).join('/');
        const marker = normalized.lastIndexOf('/node_modules/');

        if (marker === -1) {
            return undefined;
        }

        const subject = normalized.substring(marker + '/node_modules/'.length);
        const segments = subject.split('/');
        const nameLength = subject.startsWith('@') ? 2 : 1;

        if (segments.length <= nameLength) {
            return undefined;
        }

        const packageName = segments.slice(0, nameLength).join('/');
        const packageDir = normalized.substring(0, marker + '/node_modules/'.length) + packageName;
        const relative = segments.slice(nameLength).join('/');

        return `${packageName}/${this.exportedSubpath(packageDir, relative) ?? relative}`;
    }

    /**
     * Invert a package's `exports` patterns to find the subpath a file inside
     * it is exposed as, or undefined when no pattern matches it.
     */
    protected exportedSubpath(packageDir: string, relative: string): string | undefined {
        for (const [key, target] of Object.entries(this.readPackageExports(packageDir))) {
            const star = key.indexOf('*');
            const targetStar = target.indexOf('*');

            if (star === -1 || targetStar === -1) {
                continue;
            }

            const prefix = target.substring(0, targetStar).replace(/^\.\//, '');
            const suffix = target.substring(targetStar + 1);

            if (!relative.startsWith(prefix) || !relative.endsWith(suffix)) {
                continue;
            }

            const value = relative.substring(prefix.length, relative.length - suffix.length);

            return (key.substring(0, star) + value + key.substring(star + 1)).replace(/^\.\//, '');
        }

        return undefined;
    }

    /**
     * Read a package's `exports` map, flattened to subpath → file target.
     *
     * Conditional targets are collapsed to their first string value; every
     * condition a package declares for a subpath points at the same source
     * file in the layouts sindri generates for.
     */
    protected readPackageExports(packageDir: string): Record<string, string> {
        const manifestPath = path.join(packageDir, 'package.json');

        if (!fs.existsSync(manifestPath)) {
            return {};
        }

        let manifest: { exports?: unknown };

        try {
            manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) as { exports?: unknown };
        } catch {
            return {};
        }

        const exports = manifest.exports;

        if (typeof exports !== 'object' || exports === null) {
            return {};
        }

        const flattened: Record<string, string> = {};

        for (const [subpath, target] of Object.entries(exports as Record<string, unknown>)) {
            const resolved = this.firstStringTarget(target);

            if (resolved !== undefined) {
                flattened[subpath] = resolved;
            }
        }

        return flattened;
    }

    /**
     * Reduce an `exports` target — a string, or a nested map of conditions — to
     * the first file path it names.
     */
    protected firstStringTarget(target: unknown): string | undefined {
        if (typeof target === 'string') {
            return target;
        }

        if (typeof target !== 'object' || target === null) {
            return undefined;
        }

        for (const value of Object.values(target as Record<string, unknown>)) {
            const resolved = this.firstStringTarget(value);

            if (resolved !== undefined) {
                return resolved;
            }
        }

        return undefined;
    }
}
