/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type ts from 'typescript';

import type { GenerateStatus } from '../../Enum/GenerateStatus.js';

export interface CliDataFileGeneratorContract {
    generateFile(
        directory: string,
        className: string,
        namespace: string,
        routes: Record<string, ts.Expression>,
    ): GenerateStatus;

    generateClassContents(routes: Record<string, ts.Expression>): string;
}
