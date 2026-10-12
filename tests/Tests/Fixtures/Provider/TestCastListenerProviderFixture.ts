// Fixture parsed by ts-morph (never executed).
/* eslint-disable */
// @ts-nocheck
import { Listener } from '@valkyrjaio/valkyrja/Event/Data/Listener.ts';
import type { TestListenerAliasFixture } from './TestListenerAliasFixture.ts';

export class TestCastListenerProviderFixture {
    getListeners() {
        return [
            (
                new Listener('app.cast', 'cast', TestCastListenerProviderFixture.cast) as TestListenerAliasFixture
            ).withHandler(TestCastListenerProviderFixture.castInstead),
        ];
    }
}
