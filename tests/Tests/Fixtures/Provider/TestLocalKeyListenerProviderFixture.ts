// Fixture parsed by ts-morph (never executed).
/* eslint-disable */
// @ts-nocheck
import { Listener } from '@valkyrjaio/valkyrja/Event/Data/Listener.ts';

// A constant the provider declares for itself. The generated data file imports nothing for it.
const LocalEventId = { Local: 'app.local' };

export class TestLocalKeyListenerProviderFixture {
    getListeners() {
        return [new Listener(LocalEventId.Local, 'local', TestLocalKeyListenerProviderFixture.local)];
    }
}
