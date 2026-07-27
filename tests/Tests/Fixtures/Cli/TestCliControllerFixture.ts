// Fixture parsed by ts-morph (never executed).
/* eslint-disable */
// @ts-nocheck
import { AllCliMiddlewareFixture } from './AllCliMiddlewareFixture.ts';

export class TestCliControllerFixture {
    @Route({
        name: 'build',
        description: 'Builds the app',
        helpText: [HelpProvider, 'buildHelp'],
        middleware: [AllCliMiddlewareFixture, UnknownMiddleware],
    })
    @Name('build:app')
    @Name(999)
    @Middleware(AllCliMiddlewareFixture)
    @Middleware(UnknownMiddleware)
    @Middleware()
    @ArgumentParameter({ name: 'source', description: 'The source dir', cast: 'string', mode: 'REQUIRED', valueMode: 'ARRAY' })
    @ArgumentParameter({ name: 'target', description: 'The target dir' })
    @ArgumentParameter({ name: '', description: '' })
    @ArgumentParameter('not-an-object')
    @OptionParameter({ name: 'verbose', description: 'Verbose output', valueDisplayName: 'V', cast: 'bool' })
    @OptionParameter({
        name: 'mode',
        description: 'Mode',
        valueDisplayName: 'M',
        cast: 'string',
        defaultValue: 'default',
        shortNames: ['m', 'md', 9],
        validValues: ['a', 'b'],
    })
    @OptionParameter({ name: 'plain', description: 'Plain option' })
    @OptionParameter({ name: '', description: '' })
    @OptionParameter('not-an-object')
    build() {}

    @Route({ name: 'opts', description: 'Options only' })
    @OptionParameter({ name: 'flag', description: 'A flag' })
    opts() {}

    @Route({ name: 'handled', description: 'Has an object handler', handler: [OtherCli, 'run'] })
    handled() {}

    @Route({ name: '', description: '' })
    invalid() {}

    @Route('not-an-object')
    nonObject() {}

    noDecorator() {}
}
