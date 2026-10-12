/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { ListenerAttributeReader } from '../../../../src/Sindri/Ast/ListenerAttributeReader.ts';
import { ListenerProviderReader } from '../../../../src/Sindri/Ast/ListenerProviderReader.ts';
import { AstUnreadableListenerException } from '../../../../src/Sindri/Ast/Throwable/Exception/AstUnreadableListenerException.ts';
import { AstEventDataFileGenerator } from '../../../../src/Sindri/Generator/Ast/Event/AstEventDataFileGenerator.ts';
import { GeneratorUnreadableListenerException } from '../../../../src/Sindri/Generator/Throwable/Exception/GeneratorUnreadableListenerException.ts';

/**
 * Every shape sindri reads a listener from, read from a fixture and written to a real event data
 * file.
 *
 * A declaration shape only reaches the generated file when a test feeds that shape in. Coverage
 * says nothing about a shape no fixture declares, so each shape is asserted here by name, and a
 * shape the cache leaves out is asserted by its absence.
 */

function fixture(name: string): string {
    return fileURLToPath(new URL(`../../Fixtures/${name}.ts`, import.meta.url));
}

/** Read both listener sources and write the event data file, returning its source. */
function generate(provider: string = 'Provider/TestImperativeListenerProviderFixture'): string {
    const attributeResult = new ListenerAttributeReader().readFile(fixture('Listener/TestListenerFixture'));
    const providerResult = new ListenerProviderReader().readFile(fixture(provider));

    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'sindri-event-'));

    try {
        const generator = new AstEventDataFileGenerator();
        generator.classImportMap = {
            TestListenerFixture: '../Listener/TestListenerFixture.ts',
            TestImperativeListenerProviderFixture: '../Provider/TestImperativeListenerProviderFixture.ts',
            TestEventIdFixture: '../Provider/TestEventIdFixture.ts',
        };
        generator.generateMergedFile(
            directory,
            'AppEventData',
            'App.Data',
            attributeResult.listeners,
            providerResult.listeners,
        );

        return fs.readFileSync(path.join(directory, 'AppEventData.ts'), 'utf-8');
    } finally {
        fs.rmSync(directory, { recursive: true, force: true });
    }
}

describe('EventDataGeneration', () => {
    const generated = generate();

    describe('a listener a decorator declares', () => {
        it('holds a factory for the listener', () => {
            expect(generated).toContain(
                '[\'sendWelcome\']: (): ListenerContract => new Listener("user.created", "sendWelcome", TestListenerFixture.handle)',
            );
        });

        it('files the listener name under its event id', () => {
            expect(generated).toContain("['user.created']: ['sendWelcome'],");
        });
    });

    describe('a listener a provider declares as a bare construction', () => {
        it('holds a factory for the listener', () => {
            expect(generated).toContain(
                "['logStart']: (): ListenerContract => new Listener('app.started', 'logStart', TestImperativeListenerProviderFixture.logStart)",
            );
        });

        it('files the listener name under its event id', () => {
            expect(generated).toContain("['app.started']: ['logStart'],");
        });
    });

    describe('a listener a provider declares as a builder chain', () => {
        it('holds a factory for the whole chain', () => {
            expect(generated).toContain('.withHandler(TestImperativeListenerProviderFixture.logStopInstead)');
        });

        it('files the listener name under the event id the constant names', () => {
            // The event id is a constant reference, so the index emits the reference and reads the
            // value the constant holds when the application runs.
            expect(generated).toContain("[TestEventIdFixture.Stopped]: ['logStop'],");
        });
    });

    describe('a handler the provider declares for itself', () => {
        it('stops rather than naming it unbound in the generated file', () => {
            expect(() => generate('Provider/TestLocalHandlerListenerProviderFixture')).toThrow(
                AstUnreadableListenerException,
            );
        });
    });

    describe('a listener a cast dresses', () => {
        it('stops on a cast that dresses the listener', () => {
            // The file emits the listener as the provider wrote it, and no import map carries a
            // type, so the cast would reach the file as an unbound name.
            expect(() => generate('Provider/TestCastListenerProviderFixture')).toThrow(
                GeneratorUnreadableListenerException,
            );
        });

        it('stops on a cast that dresses an argument', () => {
            expect(() => generate('Provider/TestArgumentCastListenerProviderFixture')).toThrow(
                GeneratorUnreadableListenerException,
            );
        });
    });

    describe('a listener whose name carries the "::" separator', () => {
        it('keys the listener by the literal the construction holds', () => {
            // The separator marks a constant reference elsewhere in sindri. Reading it as one here
            // would emit a key that names a class the file does not import, and that no longer
            // matches what `getEventId()` returns.
            expect(generated).toContain("['app.Separated::Id']: ['separated'],");
        });
    });

    describe('a chain that replaces a key', () => {
        it('keys a renaming chain by the name the chain ends with', () => {
            // Reading the key from the base construction would cache the listener under a name the
            // dispatcher never asks for.
            expect(generated).toContain("['app.renamed']: ['other'],");
            expect(generated).toContain("['other']: (): ListenerContract =>");
        });

        it('files a re-targeting chain under the event id the chain ends with', () => {
            expect(generated).toContain("['app.elsewhere']: ['retargeted'],");
            expect(generated).not.toContain("['app.retargeted']");
        });
    });

    describe('a chain the cache cannot read', () => {
        it('stops on a chain that calls a method the listener does not declare', () => {
            // An unknown method can replace either key, so a guessed key would cache a listener
            // the dispatcher never reaches. The build stops instead of writing it.
            expect(() => generate('Provider/TestUnknownBuilderListenerProviderFixture')).toThrow(
                GeneratorUnreadableListenerException,
            );
        });
    });

    describe('a construction the cache cannot key', () => {
        it('leaves out a listener whose event id is not a literal or a constant', () => {
            expect(generated).not.toContain('dynamic');
        });

        it('leaves out an element that is not a construction', () => {
            expect(generated).not.toContain('listenerFactory()');
        });

        it('stops on a key that names a constant the provider declares for itself', () => {
            // The reader reaches it first, because the provider declares the constant at its own
            // module level. The generator keeps its own guard for a name no reader resolved.
            expect(() => generate('Provider/TestLocalKeyListenerProviderFixture')).toThrow(
                AstUnreadableListenerException,
            );
        });
    });

    it('imports every class the cached listeners name', () => {
        expect(generated).toContain("import { TestListenerFixture } from '../Listener/TestListenerFixture.ts';");
        expect(generated).toContain(
            "import { TestImperativeListenerProviderFixture } from '../Provider/TestImperativeListenerProviderFixture.ts';",
        );
        expect(generated).toContain("import { TestEventIdFixture } from '../Provider/TestEventIdFixture.ts';");
    });
});
