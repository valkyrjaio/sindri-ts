// Fixture parsed by ts-morph (never executed).
/* eslint-disable */
// @ts-nocheck
import { Listener } from '@valkyrjaio/valkyrja/Event/Data/Listener.ts';
import { SvcA } from './SvcA.ts';

export class TestComputedKeyListenerProviderFixture {
    getListeners() {
        // The generated data file evaluates the computed key, so it imports the class the key names.
        return [new Listener('app.started', 'logStart', (container, args) => ({ [SvcA.KEY]: args }))];
    }
}
