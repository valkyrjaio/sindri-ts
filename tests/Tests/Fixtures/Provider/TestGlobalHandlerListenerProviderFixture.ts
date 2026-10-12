// Fixture parsed by ts-morph (never executed).
/* eslint-disable */
// @ts-nocheck
import { Listener } from '@valkyrjaio/valkyrja/Event/Data/Listener.ts';

// A function declaration no listener references.
function unreferenced() {}

export class TestGlobalHandlerListenerProviderFixture {
    getListeners() {
        return [
            // `console` is a global, so the generated data file needs no import for it, and the
            // inline handler declares the names it takes.
            new Listener('app.started', 'logStart', ({ event }, args) => console.log(event, args)),
            new Listener('app.stopped', 'logStop', TestGlobalHandlerListenerProviderFixture.logStop),
        ];
    }
}
