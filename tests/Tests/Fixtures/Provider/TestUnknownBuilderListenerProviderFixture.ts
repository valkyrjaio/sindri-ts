// Fixture parsed by ts-morph (never executed).
/* eslint-disable */
// @ts-nocheck
import { Listener } from '@valkyrjaio/valkyrja/Event/Data/Listener.ts';

export class TestUnknownBuilderListenerProviderFixture {
    getListeners() {
        return [
            new Listener('app.started', 'logStart', TestUnknownBuilderListenerProviderFixture.logStart).withPriority(
                10,
            ),
        ];
    }
}
