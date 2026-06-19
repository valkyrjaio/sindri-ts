/*
 * This file is part of the Valkyrja package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';

import { CliArgumentParameterData } from '../../../../../src/Sindri/Ast/Data/CliArgumentParameterData.ts';
import { CliOptionParameterData } from '../../../../../src/Sindri/Ast/Data/CliOptionParameterData.ts';
import { CliRouteData } from '../../../../../src/Sindri/Ast/Data/CliRouteData.ts';
import { HandlerData } from '../../../../../src/Sindri/Ast/Data/HandlerData.ts';

describe('CliRouteData', () => {
    it('exposes its defaults', () => {
        const data = new CliRouteData('build', 'Builds');

        expect(data.name).toBe('build');
        expect(data.description).toBe('Builds');
        expect(data.handler).toBeNull();
        expect(data.helpText).toBeNull();
        expect(data.arguments).toStrictEqual([]);
        expect(data.options).toStrictEqual([]);
    });

    it('stores handlers, arguments, and options', () => {
        const handler = new HandlerData('App', 'run');
        const arg = new CliArgumentParameterData('a', 'd');
        const option = new CliOptionParameterData('o', 'd');
        const data = new CliRouteData('build', 'Builds', handler, handler, [], [], [], [], [arg], [option]);

        expect(data.handler).toBe(handler);
        expect(data.arguments).toStrictEqual([arg]);
        expect(data.options).toStrictEqual([option]);
    });
});
