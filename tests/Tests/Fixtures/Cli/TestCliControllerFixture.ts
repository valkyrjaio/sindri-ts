// Fixture parsed by ts-morph (never executed).
/* eslint-disable */
// @ts-nocheck
import { AllCliMiddlewareFixture } from './AllCliMiddlewareFixture.ts';

export class TestCliControllerFixture {
    @Route('build', 'Builds the app')
    @Name('build:app')
    @Name(999)
    @Middleware(AllCliMiddlewareFixture)
    @Middleware(UnknownMiddleware)
    @Middleware()
    @ArgumentParameter('source', 'The source dir', 'string', 'REQUIRED', 'ARRAY')
    @ArgumentParameter('', '')
    @OptionParameter('verbose', 'Verbose output', 'V', 'bool')
    @OptionParameter('mode', 'Mode', 'M', 'string', 'default', ['m', 'md'], ['a', 'b'])
    @OptionParameter('plain', 'Plain option')
    @OptionParameter('', '')
    build() {}

    @Route('', '')
    invalid() {}

    noDecorator() {}
}
