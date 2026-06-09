/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { ts } from 'ts-morph';

import type { GenerateStatus } from '../../Enum/GenerateStatus.js';

export interface EventDataFileGeneratorContract {
    generateFile(
        directory: string,
        className: string,
        namespace: string,
        listeners: Record<string, ts.Expression>,
    ): GenerateStatus;

    generateClassContents(listeners: Record<string, ts.Expression>): string;
}
