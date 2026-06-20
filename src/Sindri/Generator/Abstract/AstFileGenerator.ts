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

import { GenerateStatus } from '../Enum/GenerateStatus.ts';

export abstract class AstFileGenerator {
    /**
     * Build a property access or string literal expression from a "ClassName::CASE" string.
     */
    protected buildEnumCaseExpr(fqnColonCase: string): ts.Expression {
        const pos = fqnColonCase.indexOf('::');

        if (pos === -1) {
            return ts.factory.createStringLiteral(fqnColonCase);
        }

        const fqn = fqnColonCase.substring(0, pos);
        const caseName = fqnColonCase.substring(pos + 2);
        const className = fqn.slice(fqn.lastIndexOf('\\') + 1);

        return ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier(className), caseName);
    }

    protected writeFile(directory: string, className: string, data: string): GenerateStatus {
        const filePath = directory.replace(/\/$/, '') + `/${className}.ts`;

        try {
            const existing = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : false;

            if (existing === data) {
                return GenerateStatus.SKIPPED;
            }

            fs.mkdirSync(directory, { recursive: true });
            fs.writeFileSync(filePath, data, 'utf-8');

            return GenerateStatus.SUCCESS;
        } catch {
            // Fallthrough
        }

        return GenerateStatus.FAILURE;
    }
}
