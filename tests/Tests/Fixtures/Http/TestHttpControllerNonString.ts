// Fixture parsed by ts-morph (never executed) — class- and method-level @Path
// and @Name decorators carry non-string arguments, exercising the "value is not
// a non-empty string" branches, plus an invalid route.
/* eslint-disable */
// @ts-nocheck
@Path(123)
@Name(456)
export class TestHttpControllerNonString {
    @Route('/items', 'list')
    @Path(789)
    @Name(101)
    list() {}

    @Route('', '')
    invalid() {}
}
