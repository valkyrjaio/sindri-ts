// Fixture parsed by ts-morph (never executed).
/* eslint-disable */
// @ts-nocheck
import { Listener } from '@valkyrjaio/valkyrja/Event/Data/Listener.ts';

// A handler the provider declares for itself. The generated data file sits in another module, so
// it cannot reach this name.
const logStart = (container, args) => {};

export class TestLocalHandlerListenerProviderFixture {
    getListeners() {
        return [new Listener('app.started', 'logStart', logStart)];
    }
}
