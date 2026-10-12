// Fixture parsed by ts-morph (never executed).
/* eslint-disable */
// @ts-nocheck
import { Listener } from '@valkyrjaio/valkyrja/Event/Data/Listener.ts';

const logStart = (container, args) => {};

export class TestShorthandNameListenerProviderFixture {
    getListeners() {
        // A shorthand property names the binding rather than declaring one.
        return [new Listener('app.started', 'logStart', TestShorthandNameListenerProviderFixture.wrap({ logStart }))];
    }
}
