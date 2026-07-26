/*
 * This file is part of the Valkyrja package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ts } from 'ts-morph';

import { describe, expect, it } from 'vitest';

import { HttpParameterData } from '../../../../../../src/Sindri/Ast/Data/HttpParameterData.ts';
import { HttpRouteData } from '../../../../../../src/Sindri/Ast/Data/HttpRouteData.ts';
import { AstCliDataFileGenerator } from '../../../../../../src/Sindri/Generator/Ast/Cli/AstCliDataFileGenerator.ts';
import { AstContainerDataFileGenerator } from '../../../../../../src/Sindri/Generator/Ast/Container/AstContainerDataFileGenerator.ts';
import { AstEventDataFileGenerator } from '../../../../../../src/Sindri/Generator/Ast/Event/AstEventDataFileGenerator.ts';
import { AstHttpDataFileGenerator } from '../../../../../../src/Sindri/Generator/Ast/Http/AstHttpDataFileGenerator.ts';

/**
 * Full-output golden/snapshot tests for the four Ast data-file generators.
 *
 * Unlike the per-generator unit tests (which assert individual substrings such as
 * a single route key or `super(`), these pin the ENTIRE emitted source against a
 * committed golden file, so any change to the generated shape — spacing, ordering,
 * imports, fully-qualified references, closure wrappers — is caught and must be an
 * intentional golden update.
 *
 * The inputs exercise the meaningful structure: multiple HTTP routes including a
 * dynamic `/users/{id}` and a GET/POST split (so `routes`, `paths`, `dynamicPaths`
 * and `regexes` all populate); multiple CLI commands; multiple container
 * publishers; multiple event listeners.
 *
 * To refresh the goldens after an intentional generator change, run this suite
 * with `GOLDEN_UPDATE=1` set — each `./golden/*.golden` is rewritten from the
 * matching generator output — then review and commit the new snapshots.
 */

const GET = 'RequestMethod::GET';
const POST = 'RequestMethod::POST';

const goldenDir = fileURLToPath(new URL('./golden/', import.meta.url));

/** A stable placeholder route/listener expression (printed verbatim into the snapshot). */
function placeholder(text: string): ts.Expression {
    return ts.factory.createStringLiteral(text);
}

/** Run a generator against a fresh temp directory and return the emitted source. */
function generate(className: string, run: (directory: string) => void): string {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'sindri-golden-'));

    try {
        run(directory);

        return fs.readFileSync(path.join(directory, `${className}.ts`), 'utf-8');
    } finally {
        fs.rmSync(directory, { recursive: true, force: true });
    }
}

/** Compare the generated source against the committed golden (refreshing it when GOLDEN_UPDATE=1). */
function assertGolden(actual: string, goldenName: string): void {
    const goldenPath = path.join(goldenDir, `${goldenName}.golden`);

    if (process.env.GOLDEN_UPDATE === '1') {
        fs.writeFileSync(goldenPath, actual, 'utf-8');
    }

    expect(actual).toBe(fs.readFileSync(goldenPath, 'utf-8'));
}

describe('GoldenSnapshotTest', () => {
    it('matches the AppHttpRoutingData golden', () => {
        const routes = {
            'users.index': placeholder('users-index-expr'),
            'users.show': placeholder('users-show-expr'),
            'users.store': placeholder('users-store-expr'),
        };

        const routeData = {
            'users.index': new HttpRouteData('/users', 'users.index', null, [GET]),
            'users.show': new HttpRouteData('/users/{id}', 'users.show', null, [GET], [], [], [], [], [], null, null, true, [
                new HttpParameterData('id', '[0-9]+'),
            ]),
            'users.store': new HttpRouteData('/users', 'users.store', null, [POST]),
        };

        const actual = generate('AppHttpRoutingData', (directory) => {
            const generator = new AstHttpDataFileGenerator();
            generator.classImportMap = { HttpRouteProvider: '../Provider/HttpRouteProvider.ts' };
            generator.generateFile(directory, 'AppHttpRoutingData', 'App.Data', routes, routeData);
        });

        assertGolden(actual, 'AppHttpRoutingData');
    });

    it('matches the AppCliRoutingData golden', () => {
        const routes = {
            greet: placeholder('greet-expr'),
            farewell: placeholder('farewell-expr'),
        };

        const actual = generate('AppCliRoutingData', (directory) => {
            const generator = new AstCliDataFileGenerator();
            generator.classImportMap = { CliRouteProvider: '../Provider/CliRouteProvider.ts' };
            generator.generateFile(directory, 'AppCliRoutingData', 'App.Data', routes);
        });

        assertGolden(actual, 'AppCliRoutingData');
    });

    it('matches the AppContainerData golden', () => {
        const publishers = {
            'service.a': ['DataServiceProvider', 'publishA'] as const,
            'service.b': ['DataServiceProvider', 'publishB'] as const,
        };

        const actual = generate('AppContainerData', (directory) => {
            const generator = new AstContainerDataFileGenerator();
            generator.classImportMap = { DataServiceProvider: '../Provider/DataServiceProvider.ts' };
            generator.generateFile(directory, 'AppContainerData', 'App.Data', publishers);
        });

        assertGolden(actual, 'AppContainerData');
    });

    it('matches the AppEventData golden', () => {
        const listeners = {
            'user.created': placeholder('user-created-expr'),
            'user.deleted': placeholder('user-deleted-expr'),
        };

        const actual = generate('AppEventData', (directory) => {
            const generator = new AstEventDataFileGenerator();
            generator.classImportMap = { AppListenerProvider: '../Provider/AppListenerProvider.ts' };
            generator.generateFile(directory, 'AppEventData', 'App.Data', listeners);
        });

        assertGolden(actual, 'AppEventData');
    });
});
