// Fixture parsed by ts-morph (never executed).
/* eslint-disable */
// @ts-nocheck
import { Listener } from '@valkyrjaio/valkyrja/Event/Data/Listener.ts';

export class TestMethodLocalHandlerListenerProviderFixture {
    getListeners() {
        // Declared where it is used, which the generated data file reaches no more than a
        // module-level declaration.
        const logStart = (container, args) => {};

        return [new Listener('app.started', 'logStart', logStart)];
    }
}
