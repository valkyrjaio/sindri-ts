// Fixture parsed by ts-morph (never executed) — no class-level @Path/@Name, so
// the prefix lookups fall through; method-level @Path/@Name supply suffixes.
/* eslint-disable */
// @ts-nocheck
export class TestHttpControllerNoPrefix {
    @Route('/items', 'list')
    @Path('/extra')
    @Name('all')
    list() {}
}
