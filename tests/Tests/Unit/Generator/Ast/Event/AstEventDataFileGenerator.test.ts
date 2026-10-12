/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import { ts } from 'ts-morph';

import { describe, expect, it, vi } from 'vitest';

import { GenerateStatus } from '../../../../../../src/Sindri/Generator/Enum/GenerateStatus.ts';
import { AstEventDataFileGenerator } from '../../../../../../src/Sindri/Generator/Ast/Event/AstEventDataFileGenerator.ts';
import { GeneratorUnreadableListenerException } from '../../../../../../src/Sindri/Generator/Throwable/Exception/GeneratorUnreadableListenerException.ts';
import { lastWrittenFile, parseRouteExprs } from '../generatorTestUtil.ts';

vi.mock('fs', () => ({
    existsSync: vi.fn(() => false),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn(),
}));

/** A listener expression the reader would build for a decorated listener. */
function attributeListener(eventId: string, name: string): ts.Expression {
    return ts.factory.createNewExpression(ts.factory.createIdentifier('Listener'), undefined, [
        ts.factory.createStringLiteral(eventId),
        ts.factory.createStringLiteral(name),
        ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('Fixture'), 'handle'),
    ]);
}

/** Generate from hand-declared listener source and return the written file. */
function generateFrom(source: string): string {
    const generator = new AstEventDataFileGenerator();
    generator.classImportMap = { AppListenerProvider: '../Provider/AppListenerProvider.ts' };
    generator.generateMergedFile('/out', 'AppEventData', 'App.Data', new Map(), parseRouteExprs(source));

    return lastWrittenFile();
}

describe('AstEventDataFileGenerator', () => {
    it('generates an event data file from the decorated listeners', () => {
        const generator = new AstEventDataFileGenerator();
        generator.classImportMap = { Fixture: './Fixture.ts' };

        const listeners = new Map([['sendWelcome', attributeListener('user.created', 'sendWelcome')]]);
        const status = generator.generateFile('/out', 'EventData', 'App.Data', listeners);

        expect(status).toBe(GenerateStatus.SUCCESS);
        expect(lastWrittenFile()).toContain("['user.created']: ['sendWelcome'],");
        expect(lastWrittenFile()).toContain("['sendWelcome']: (): ListenerContract => new Listener(");
    });

    it('generates a file with no listeners', () => {
        expect(new AstEventDataFileGenerator().generateFile('/out', 'EventData', 'App.Data', new Map())).toBe(
            GenerateStatus.SUCCESS,
        );
        expect(lastWrittenFile()).toContain('super();');
    });

    it('escapes a listener name that carries a quote', () => {
        const listeners = new Map([["it's", attributeListener('user.created', "it's")]]);

        new AstEventDataFileGenerator().generateFile('/out', 'EventData', 'App.Data', listeners);

        expect(lastWrittenFile()).toContain("['it\\'s']: (): ListenerContract =>");
    });

    it('holds a factory for a decorated listener whose expression names no event id', () => {
        // The caller resolved the name the map files the listener under, so the factory stays even
        // where the expression gives the index nothing.
        const listeners = new Map([['sendWelcome', ts.factory.createNull()]]);

        new AstEventDataFileGenerator().generateFile('/out', 'EventData', 'App.Data', listeners);

        expect(lastWrittenFile()).toContain("['sendWelcome']: (): ListenerContract => null,");
        expect(lastWrittenFile()).toContain('            {},');
    });

    describe('generateMergedFile', () => {
        it('keys a hand-declared listener by the name its construction names', () => {
            const written = generateFrom(
                `new Listener('user.created', 'sendWelcome', AppListenerProvider.sendWelcome)`,
            );

            expect(written).toContain(
                "['sendWelcome']: (): ListenerContract => new Listener('user.created', 'sendWelcome', AppListenerProvider.sendWelcome)",
            );
            expect(written).toContain("['user.created']: ['sendWelcome'],");
        });

        it('keeps a decorated listener a hand-declared listener does not rename', () => {
            const generator = new AstEventDataFileGenerator();

            generator.generateMergedFile(
                '/out',
                'AppEventData',
                'App.Data',
                new Map([['cleanup', attributeListener('user.deleted', 'cleanup')]]),
                parseRouteExprs(`new Listener('user.created', 'sendWelcome', AppListenerProvider.sendWelcome)`),
            );

            expect(lastWrittenFile()).toContain("['cleanup']: (): ListenerContract =>");
            expect(lastWrittenFile()).toContain("['sendWelcome']: (): ListenerContract =>");
        });

        it('leaves out a listener whose name is neither a literal nor a constant', () => {
            expect(generateFrom(`new Listener('user.created', someName(), AppListenerProvider.handle)`)).toContain(
                'super();',
            );
        });

        it('leaves out a listener whose event id is neither a literal nor a constant', () => {
            // The event index is the only way the collection reaches a listener, so a listener the
            // index cannot hold is left out whole rather than cached as unreachable.
            expect(generateFrom(`new Listener(someEventId(), 'sendWelcome', AppListenerProvider.handle)`)).toContain(
                'super();',
            );
        });

        it('leaves out an expression that is not a construction', () => {
            expect(generateFrom(`listenerFactory()`)).toContain('super();');
        });

        it('leaves out a construction that names no argument', () => {
            expect(generateFrom(`new Listener`)).toContain('super();');
        });

        it('leaves out a listener whose event id names a nested property', () => {
            // `Ids.Event.Created` is not a reference the generated file can emit as one key.
            expect(
                generateFrom(`new Listener(Ids.Event.Created, 'sendWelcome', AppListenerProvider.handle)`),
            ).toContain('super();');
        });

        it('reads the construction arguments through a builder chain', () => {
            const written = generateFrom(
                `new Listener('user.created', 'sendWelcome', AppListenerProvider.sendWelcome).withHandler(AppListenerProvider.instead)`,
            );

            expect(written).toContain("['user.created']: ['sendWelcome'],");
            expect(written).toContain('.withHandler(AppListenerProvider.instead)');
        });

        it('keys a chain that renames the listener by the name the chain ends with', () => {
            const written = generateFrom(
                `new Listener('user.created', 'sendWelcome', AppListenerProvider.handle).withName('audit')`,
            );

            expect(written).toContain("['user.created']: ['audit'],");
            expect(written).toContain("['audit']: (): ListenerContract =>");
        });

        it('files a chain that re-targets the listener under the event id the chain ends with', () => {
            const written = generateFrom(
                `new Listener('user.created', 'audit', AppListenerProvider.handle).withEventId('user.deleted')`,
            );

            expect(written).toContain("['user.deleted']: ['audit'],");
            expect(written).not.toContain("['user.created']");
        });

        it('takes the outermost call of a builder the chain repeats', () => {
            // The framework applies each call in turn, so the outermost `withName` is the name the
            // listener ends up with.
            const written = generateFrom(
                `new Listener('user.created', 'first', AppListenerProvider.handle).withName('second').withName('third')`,
            );

            expect(written).toContain("['user.created']: ['third'],");
        });

        it('leaves out a chain whose builder argument is neither a literal nor a constant', () => {
            expect(
                generateFrom(`new Listener('user.created', 'audit', AppListenerProvider.handle).withName(someName())`),
            ).toContain('super();');
        });

        it('stops on a chain that calls a method the listener does not declare', () => {
            // An unknown method can replace either key, so a guessed key would cache a listener
            // the dispatcher never reaches.
            expect(() =>
                generateFrom(`new Listener('user.created', 'audit', AppListenerProvider.handle).withPriority(10)`),
            ).toThrow(GeneratorUnreadableListenerException);
        });

        it('reads the construction arguments through the parentheses a listener is dressed in', () => {
            const written = generateFrom(
                `((new Listener('user.created', 'sendWelcome', AppListenerProvider.sendWelcome))).withHandler(AppListenerProvider.instead)`,
            );

            expect(written).toContain("['user.created']: ['sendWelcome'],");
        });

        it('stops on a listener a cast dresses', () => {
            // The file emits the listener as the provider wrote it, and no import map carries a
            // type, so the cast would reach the file as an unbound name.
            expect(() =>
                generateFrom(`(new Listener('user.created', 'audit', AppListenerProvider.handle) as AppAlias)`),
            ).toThrow(GeneratorUnreadableListenerException);
        });

        it('stops on a cast that dresses an argument', () => {
            // Only the factory text carries the cast, so a clean key cannot stand in for the scan.
            expect(() =>
                generateFrom(`new Listener('user.created', 'audit', AppListenerProvider.handle as ListenerHandler)`),
            ).toThrow(GeneratorUnreadableListenerException);
        });

        it('stops on an inline handler whose parameter names a type', () => {
            // The annotation is not a cast, and it reaches the generated file the same way.
            expect(() =>
                generateFrom(
                    `new Listener('user.created', 'audit', (container: ContainerContract) => handle(container))`,
                ),
            ).toThrow(GeneratorUnreadableListenerException);
        });

        it('stops on a type argument a listener names', () => {
            expect(() =>
                generateFrom(`new Listener('user.created', 'audit', pick<AppHandler>(AppListenerProvider.handle))`),
            ).toThrow(GeneratorUnreadableListenerException);
        });

        it('stops on a type that queries a value', () => {
            // `typeof X` names X, which is a value binding the generated file cannot import.
            expect(() =>
                generateFrom(`new Listener('user.created', 'audit', AppListenerProvider.handle as typeof AppHandler)`),
            ).toThrow(GeneratorUnreadableListenerException);
        });

        it('stops on a type that names its own module', () => {
            // The specifier is relative to the provider, and the generated file sits elsewhere.
            expect(() =>
                generateFrom(
                    `new Listener('user.created', 'audit', AppListenerProvider.handle as import('./Handler.ts').AppHandler)`,
                ),
            ).toThrow(GeneratorUnreadableListenerException);
        });

        it('stops on a type whose member name is computed from a constant', () => {
            // A computed member name holds an expression, which names a binding like any other
            // reference. Skipping it with the names a declaration spells out would hide it.
            expect(() =>
                generateFrom(
                    `new Listener('user.created', 'audit', AppListenerProvider.handle as { [AppKey.Count]: number })`,
                ),
            ).toThrow(GeneratorUnreadableListenerException);
        });

        it('stops on a type whose parameter destructures a computed name', () => {
            // A binding pattern holds expressions as well, so only a name spelled out as one
            // identifier is read as a declaration.
            expect(() =>
                generateFrom(
                    `new Listener('user.created', 'audit', AppListenerProvider.handle as ({ [AppKey.Count]: value }: string) => void)`,
                ),
            ).toThrow(GeneratorUnreadableListenerException);
        });

        it('reads a type whose parameter destructures spelled-out names', () => {
            const written = generateFrom(
                `new Listener('user.created', 'audit', AppListenerProvider.handle as ({ count }: string) => void)`,
            );

            expect(written).toContain("['user.created']: ['audit'],");
        });

        it('reads a type whose member name is a literal', () => {
            const written = generateFrom(
                `new Listener('user.created', 'audit', AppListenerProvider.handle as { 'quoted': number })`,
            );

            expect(written).toContain("['user.created']: ['audit'],");
        });

        it('reads a type whose members name only keyword types', () => {
            // A member declares its own name rather than naming a binding.
            const written = generateFrom(
                `new Listener('user.created', 'audit', AppListenerProvider.handle as { count: number })`,
            );

            expect(written).toContain("['user.created']: ['audit'],");
        });

        it('reads an inline handler whose parameter names a keyword type', () => {
            const written = generateFrom(`new Listener('user.created', 'audit', (value: string) => handle(value))`);

            expect(written).toContain("['user.created']: ['audit'],");
        });

        it('reads a listener whose argument is asserted const', () => {
            // `as const` names no type, so it needs no import and the listener is cached.
            const written = generateFrom(
                `new Listener('user.created' as const, 'audit' as const, AppListenerProvider.handle)`,
            );

            expect(written).toContain("['user.created']: ['audit'],");
        });

        it('stops on a cast in the middle of a chain', () => {
            expect(() =>
                generateFrom(
                    `(new Listener('user.created', 'audit', AppListenerProvider.handle).withHandler(AppListenerProvider.instead) as AppAlias).withName('other')`,
                ),
            ).toThrow(GeneratorUnreadableListenerException);
        });
    });

    describe('the event index', () => {
        it('files every listener of one event id under that id, in order', () => {
            const written = generateFrom(
                [
                    `new Listener('user.created', 'sendWelcome', AppListenerProvider.sendWelcome)`,
                    `new Listener('user.created', 'auditCreate', AppListenerProvider.auditCreate)`,
                ].join(', '),
            );

            expect(written).toContain("['user.created']: ['sendWelcome', 'auditCreate'],");
        });

        it('keeps a listener name under every event id it is declared with', () => {
            // `addListener` files the name under the second event id as well as the first, and the
            // second declaration replaces the factory. A cache that held only the second event id
            // would leave the first event with no listener.
            const written = generateFrom(
                [
                    `new Listener('user.created', 'audit', AppListenerProvider.auditCreate)`,
                    `new Listener('user.deleted', 'audit', AppListenerProvider.auditDelete)`,
                ].join(', '),
            );

            expect(written).toContain("['user.created']: ['audit'],");
            expect(written).toContain("['user.deleted']: ['audit'],");
            expect(written).toContain('AppListenerProvider.auditDelete');
            expect(written).not.toContain('AppListenerProvider.auditCreate');
        });

        it('files a name once under one event id', () => {
            const written = generateFrom(
                [
                    `new Listener('user.created', 'audit', AppListenerProvider.first)`,
                    `new Listener('user.created', 'audit', AppListenerProvider.second)`,
                ].join(', '),
            );

            expect(written).toContain("['user.created']: ['audit'],");
        });

        it('keeps the declaration order of a listener name that reads as an integer', () => {
            // An object key that reads as an integer sorts ahead of every other key, which would
            // invert the order the dispatcher runs the listeners in.
            const written = generateFrom(
                [
                    `new Listener('user.created', '2', AppListenerProvider.second)`,
                    `new Listener('user.created', '1', AppListenerProvider.first)`,
                ].join(', '),
            );

            expect(written).toContain("['user.created']: ['2', '1'],");
        });

        it('emits a constant event id and a constant listener name as references', () => {
            const generator = new AstEventDataFileGenerator();
            generator.classImportMap = {
                AppEventId: '../Constant/AppEventId.ts',
                AppListenerName: '../Constant/AppListenerName.ts',
            };
            generator.generateMergedFile(
                '/out',
                'AppEventData',
                'App.Data',
                new Map(),
                parseRouteExprs(
                    `new Listener(AppEventId.Created, AppListenerName.Welcome, AppListenerProvider.sendWelcome)`,
                ),
            );

            expect(lastWrittenFile()).toContain('[AppEventId.Created]: [AppListenerName.Welcome],');
            expect(lastWrittenFile()).toContain('[AppListenerName.Welcome]: (): ListenerContract =>');
        });

        it('stops on a key that names a constant the generated file does not import', () => {
            // The reference would reach the generated file as an unbound name, which is the cast's
            // failure under another name.
            expect(() =>
                generateFrom(`new Listener(LocalEventId.Created, 'audit', AppListenerProvider.handle)`),
            ).toThrow(GeneratorUnreadableListenerException);
        });

        it('keys a name that carries the "::" separator as the literal it is', () => {
            // The separator marks a constant reference elsewhere in sindri. Here the name is a
            // string the construction holds, so the key must read as that same string.
            const written = generateFrom(
                `new Listener('user.created', 'App::Welcome', AppListenerProvider.sendWelcome)`,
            );

            expect(written).toContain("['user.created']: ['App::Welcome'],");
            expect(written).toContain("['App::Welcome']: (): ListenerContract =>");
        });
    });
});
