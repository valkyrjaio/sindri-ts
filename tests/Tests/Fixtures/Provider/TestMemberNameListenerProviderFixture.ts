// Fixture parsed by ts-morph (never executed).
/* eslint-disable */
// @ts-nocheck
import { Listener } from '@valkyrjaio/valkyrja/Event/Data/Listener.ts';

const notify = (container, args) => {};

export class TestMemberNameListenerProviderFixture {
    getListeners() {
        // `TestMemberNameListenerProviderFixture.notify` carries `notify` as a member name, which
        // declares nothing, so the bare `notify` is still a name the file declares for itself.
        return [
            new Listener('app.started', 'notify', notify).withHandler(TestMemberNameListenerProviderFixture.notify),
        ];
    }
}
