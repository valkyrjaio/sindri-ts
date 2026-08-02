/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import { fileURLToPath } from 'node:url';

import { ts } from 'ts-morph';

import { describe, expect, it } from 'vitest';

import { GrpcRouteAttributeReader } from '../../../../src/Sindri/Ast/GrpcRouteAttributeReader.ts';

function fixture(name: string): string {
    return fileURLToPath(new URL(`../../Fixtures/${name}.ts`, import.meta.url));
}

function readFixture(name: string): ReturnType<GrpcRouteAttributeReader['readFile']> {
    return new GrpcRouteAttributeReader().readFile(fixture(name));
}

function printRoute(expr: ts.Expression): string {
    return ts
        .createPrinter()
        .printNode(
            ts.EmitHint.Unspecified,
            expr,
            ts.createSourceFile('_dummy.ts', '', ts.ScriptTarget.ESNext, false, ts.ScriptKind.TS),
        );
}

describe('GrpcRouteAttributeReader', () => {
    it('keys each route by service and method, skipping invalid and non-object methods', () => {
        const result = readFixture('Grpc/TestGrpcControllerFixture');

        expect(Object.keys(result.routes)).toStrictEqual([
            '/test.Ping/Ping',
            '/test.Ping/Echo',
            '/test.Ping/Alias',
            '/test.Ping/AliasTwo',
        ]);
    });

    it('emits the handler the method names, and the streaming flags it declares', () => {
        const result = readFixture('Grpc/TestGrpcControllerFixture');

        expect(printRoute(result.routes['/test.Ping/Ping'] as ts.Expression)).toContain(
            `new Route("/test.Ping/Ping", PingProvider.pingHandler, "test.Ping", "Ping", null, null, false, false`,
        );
        expect(printRoute(result.routes['/test.Ping/Echo'] as ts.Expression)).toContain(
            `new Route("/test.Ping/Echo", TestGrpcControllerFixture.echo, "test.Ping", "Echo", null, null, true, true`,
        );
    });

    it('puts a middleware into every stage it serves, and appends without deduping', () => {
        const printed = printRoute(readFixture('Grpc/TestGrpcControllerFixture').routes['/test.Ping/Ping']!);

        // The class is named twice — once in the `middleware` option and once by `@Middleware` — so
        // every stage carries it twice. The reader appends and never dedupes.
        expect(printed).toContain(
            '[AllGrpcMiddlewareFixture, AllGrpcMiddlewareFixture], ' +
                '[AllGrpcMiddlewareFixture, AllGrpcMiddlewareFixture], ' +
                '[AllGrpcMiddlewareFixture, AllGrpcMiddlewareFixture], ' +
                '[AllGrpcMiddlewareFixture, AllGrpcMiddlewareFixture], ' +
                '[AllGrpcMiddlewareFixture, AllGrpcMiddlewareFixture]',
        );
    });

    it('imports the controller and middleware classes, skipping unresolvable ones', () => {
        const result = readFixture('Grpc/TestGrpcControllerFixture');

        expect(Object.keys(result.importMap)).toStrictEqual(['AllGrpcMiddlewareFixture', 'TestGrpcControllerFixture']);
        expect(result.importMap.PingProvider).toBeUndefined();
        expect(result.importMap.UnknownMiddleware).toBeUndefined();
    });

    it('returns an empty result when the controller declares no service', () => {
        expect(readFixture('Grpc/TestGrpcControllerNoServiceFixture').routes).toStrictEqual({});
    });

    it('returns an empty result when there is no class', () => {
        expect(readFixture('Config/TestConfigNoClassFixture').routes).toStrictEqual({});
    });
});
