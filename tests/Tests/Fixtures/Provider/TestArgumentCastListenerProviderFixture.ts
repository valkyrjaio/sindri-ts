// Fixture parsed by ts-morph (never executed).
/* eslint-disable */
// @ts-nocheck
import { Listener } from '@valkyrjaio/valkyrja/Event/Data/Listener.ts';
import type { ListenerHandler } from '@valkyrjaio/valkyrja/Event/Data/Contract/ListenerContract.ts';

export class TestArgumentCastListenerProviderFixture {
    getListeners() {
        return [
            new Listener(
                'app.started',
                'logStart',
                TestArgumentCastListenerProviderFixture.logStart as ListenerHandler,
            ),
        ];
    }
}
