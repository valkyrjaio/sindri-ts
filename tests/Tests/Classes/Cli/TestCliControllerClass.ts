// Fixture parsed by ts-morph (never executed).
/* eslint-disable */
// @ts-nocheck
import { AllCliMiddleware } from './AllCliMiddleware.ts';

export class TestCliControllerClass {
    @Route('build', 'Builds the app')
    @Name('build:app')
    @Middleware(AllCliMiddleware)
    @Middleware()
    @ArgumentParameter('source', 'The source dir', 'string', 'REQUIRED', 'ARRAY')
    @ArgumentParameter('', '')
    @OptionParameter('verbose', 'Verbose output', 'V', 'bool')
    @OptionParameter('mode', 'Mode', 'M', 'string', 'default', ['m', 'md'], ['a', 'b'])
    @OptionParameter('', '')
    build() {}

    @Route('', '')
    invalid() {}

    noDecorator() {}
}
