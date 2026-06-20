// Fixture parsed by ts-morph (never executed).
/* eslint-disable */
// @ts-nocheck
export class TestCliControllerClass {
    @Route('build', 'Builds the app')
    @Name('build:app')
    @Middleware(SomeMiddleware)
    @ArgumentParameter('source', 'The source dir', 'string', 'REQUIRED', 'ARRAY')
    @OptionParameter('verbose', 'Verbose output', 'V', 'bool')
    build() {}

    @Route('', '')
    invalid() {}

    noDecorator() {}
}
