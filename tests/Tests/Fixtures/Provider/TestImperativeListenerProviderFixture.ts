// Fixture parsed by ts-morph (never executed).
/* eslint-disable */
// @ts-nocheck
import { Listener } from '@valkyrjaio/valkyrja/Event/Data/Listener.ts';
import { TestEventIdFixture } from './TestEventIdFixture.ts';

// Every shape a provider declares a listener by hand in: a bare construction, a chain that
// replaces the handler, the name or the event id, and the expressions the cache cannot key.
export class TestImperativeListenerProviderFixture {
    getListenerClasses() {
        return [];
    }
    getListeners() {
        return [
            new Listener('app.started', 'logStart', TestImperativeListenerProviderFixture.logStart),
            new Listener(
                TestEventIdFixture.Stopped,
                'logStop',
                TestImperativeListenerProviderFixture.logStop,
            ).withHandler(TestImperativeListenerProviderFixture.logStopInstead),
            new Listener('app.renamed', 'renamed', TestImperativeListenerProviderFixture.renamed).withName('other'),
            new Listener('app.retargeted', 'retargeted', TestImperativeListenerProviderFixture.retargeted).withEventId(
                'app.elsewhere',
            ),
            new Listener('app.Separated::Id', 'separated', TestImperativeListenerProviderFixture.separated),
            new Listener(unresolvableEventId(), 'dynamic', TestImperativeListenerProviderFixture.dynamic),
            listenerFactory(),
        ];
    }
}
