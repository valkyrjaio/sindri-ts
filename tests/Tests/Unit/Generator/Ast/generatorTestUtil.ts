/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import * as fs from 'fs';

import { ts } from 'ts-morph';

import { vi } from 'vitest';

/** Parse a `new Route(...)` / `new DynamicRoute(...)` source list into parsed expression nodes. */
export function parseRouteExprs(source: string): ts.Expression[] {
    const sourceFile = ts.createSourceFile('routes.ts', `[${source}]`, ts.ScriptTarget.Latest, true);
    const statement = sourceFile.statements[0] as ts.ExpressionStatement;

    return [...(statement.expression as ts.ArrayLiteralExpression).elements];
}

/** The source text written by the most recent (mocked) generateFile* call. */
export function lastWrittenFile(): string {
    const calls = vi.mocked(fs.writeFileSync).mock.calls;

    return calls[calls.length - 1]?.[1] as string;
}
