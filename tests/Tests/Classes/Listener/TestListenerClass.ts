// Fixture parsed by ts-morph (never executed).
/* eslint-disable */
// @ts-nocheck
@Listener('user.created', 'sendWelcome')
export class TestListenerClass {
    @Listener('user.deleted', 'cleanup')
    onDelete() {}

    @Listener('user.updated', 'updated')
    @ListenerHandler([CustomHandler, 'doIt'])
    onUpdate() {}
}
