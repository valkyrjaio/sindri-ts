/*
 * This file is part of the Valkyrja package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';

import { SindriServiceId } from '../../../../src/Sindri/Constant/SindriServiceId.ts';

describe('SindriServiceId', () => {
    it('exposes the reader and generator service ids', () => {
        expect(SindriServiceId.ConfigReaderContract).toBe('Sindri.Ast.Contract.ConfigReaderContract');
        expect(SindriServiceId.CliDataFileGeneratorContract).toBe(
            'Sindri.Generator.Cli.Contract.CliDataFileGeneratorContract',
        );
    });
});
