// Fixture parsed by ts-morph (never executed).
/* eslint-disable */
// @ts-nocheck
import { Listener } from '@valkyrjaio/valkyrja/Event/Data/Listener.ts';

namespace Handlers {
    export function logStart(container, args) {}
}

export class TestLocalNamespaceListenerProviderFixture {
    getListeners() {
        return [new Listener('app.started', 'logStart', Handlers.logStart)];
    }
}
