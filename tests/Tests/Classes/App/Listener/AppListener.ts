// Fixture parsed by ts-morph (never executed).
/* eslint-disable */
// @ts-nocheck
@Listener('app.started', 'onStarted')
export class AppListener {
    @Listener('app.stopped', 'onStopped')
    onStop() {}
}
