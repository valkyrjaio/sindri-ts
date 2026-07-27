// Fixture parsed by ts-morph (never executed) — no class-level @Path/@Name, so
// the prefix lookups fall through; method-level @Path/@Name supply suffixes and
// the method-level sub-decorators (@RequestMethod, @RequestStruct,
// @ResponseStruct, @RouteHandler) exercise the object-prop fall-through paths.
/* eslint-disable */
// @ts-nocheck
export class TestHttpControllerNoPrefixFixture {
    @Route({ path: '/items', name: 'list' })
    @Path('/extra')
    @Name('all')
    @RequestMethod('M::PUT')
    @RequestStruct('MethodReq')
    @ResponseStruct('MethodRes')
    @RouteHandler([UnresolvedHandler, 'handle'])
    list() {}
}
