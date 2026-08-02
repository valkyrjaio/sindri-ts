/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
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
