/*
 * This file is part of the Valkyrja package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';

import { HandlerData } from '../../../../../src/Sindri/Ast/Data/HandlerData.ts';
import { ListenerData } from '../../../../../src/Sindri/Ast/Data/ListenerData.ts';

describe('ListenerData', () => {
    it('defaults the handler to null', () => {
        const data = new ListenerData('event.id', 'listener');

        expect(data.eventId).toBe('event.id');
        expect(data.name).toBe('listener');
        expect(data.handler).toBeNull();
    });

    it('stores a handler when provided', () => {
        const handler = new HandlerData('App\\Listener', 'handle');
        const data = new ListenerData('event.id', 'listener', handler);

        expect(data.handler).toBe(handler);
    });
});
