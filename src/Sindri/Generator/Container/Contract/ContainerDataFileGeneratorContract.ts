/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { GenerateStatus } from '../../Enum/GenerateStatus.js';

export interface ContainerDataFileGeneratorContract {
    generateFile(
        directory: string,
        className: string,
        namespace: string,
        publishers: Readonly<Record<string, readonly [string, string]>>,
    ): GenerateStatus;

    generateClassContents(publishers: Readonly<Record<string, readonly [string, string]>>): string;
}
