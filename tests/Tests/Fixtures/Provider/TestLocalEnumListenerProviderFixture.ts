// Fixture parsed by ts-morph (never executed).
/* eslint-disable */
// @ts-nocheck
import { Listener } from '@valkyrjaio/valkyrja/Event/Data/Listener.ts';

enum LocalEventId {
    Started = 'app.started',
}

export class TestLocalEnumListenerProviderFixture {
    getListeners() {
        return [new Listener(LocalEventId.Started, 'logStart', TestLocalEnumListenerProviderFixture.logStart)];
    }
}
