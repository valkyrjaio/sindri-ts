/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ts } from 'ts-morph';

import { AstReader } from './Abstract/AstReader.js';
import { HandlerData } from './Data/HandlerData.js';
import { ListenerData } from './Data/ListenerData.js';
import { ListenerAttributeResult } from './Data/Result/ListenerAttributeResult.js';

import type { ClassDeclaration, Decorator, MethodDeclaration } from 'ts-morph';

import type { ListenerAttributeReaderContract } from './Contract/ListenerAttributeReaderContract.js';

/**
 * Scans a listener class file for @Listener and @ListenerHandler decorators
 * and returns TypeScript compiler API Expr nodes ready for the data cache generator.
 *
 * Mirrors the logic of the framework's runtime attribute collector but operates
 * entirely on AST without executing any TypeScript code.
 */
export class ListenerAttributeReader extends AstReader implements ListenerAttributeReaderContract {
    protected static readonly DEFAULT_HANDLE_METHOD = 'handle';

    readFile(filePath: string): ListenerAttributeResult {
        const context = this.parseClassFile(filePath);

        if (context === undefined) {
            return new ListenerAttributeResult();
        }

        const { classDecl, useMap, currentClass } = context;
        const listeners: Record<string, ts.Expression> = {};

        for (const decorator of this.findDecoratorsOnNode(classDecl, 'Listener', useMap, filePath)) {
            const data = this.buildListenerData(decorator, useMap, filePath, currentClass, classDecl, undefined);

            if (data !== null) {
                listeners[data.name] = this.buildListenerExpr(data);
            }
        }

        for (const method of classDecl.getMethods()) {
            for (const decorator of this.findDecoratorsOnNode(method, 'Listener', useMap, filePath)) {
                const data = this.buildListenerData(decorator, useMap, filePath, currentClass, classDecl, method);

                if (data !== null) {
                    listeners[data.name] = this.buildListenerExpr(data);
                }
            }
        }

        return new ListenerAttributeResult(listeners);
    }

    protected buildListenerData(
        decorator: Decorator,
        useMap: Record<string, string>,
        currentFilePath: string,
        currentClass: string,
        classDecl: ClassDeclaration,
        method: MethodDeclaration | undefined,
    ): ListenerData | null {
        const eventId = this.extractStringArg(decorator, 0, useMap, currentFilePath, currentClass);
        const name = this.extractStringArg(decorator, 1, useMap, currentFilePath, currentClass);

        if (eventId === '' || name === '') {
            return null;
        }

        const handlerRaw = this.extractExprValue(
            this.getDecoratorArg(decorator, 2),
            useMap,
            currentFilePath,
            currentClass,
        );
        const handler =
            handlerRaw instanceof HandlerData
                ? handlerRaw
                : this.resolveListenerHandler(useMap, currentFilePath, currentClass, classDecl, method);

        return new ListenerData(eventId, name, handler);
    }

    protected resolveListenerHandler(
        useMap: Record<string, string>,
        currentFilePath: string,
        currentClass: string,
        classDecl: ClassDeclaration,
        method: MethodDeclaration | undefined,
    ): HandlerData {
        const node = method ?? classDecl;

        for (const decorator of this.findDecoratorsOnNode(node, 'ListenerHandler', useMap, currentFilePath)) {
            const handlerRaw = this.extractExprValue(
                this.getDecoratorArg(decorator, 0),
                useMap,
                currentFilePath,
                currentClass,
            );

            if (handlerRaw instanceof HandlerData) {
                return handlerRaw;
            }
        }

        if (method !== undefined) {
            return new HandlerData(currentClass, method.getName());
        }

        return new HandlerData(currentClass, ListenerAttributeReader.DEFAULT_HANDLE_METHOD);
    }

    protected buildListenerExpr(data: ListenerData): ts.Expression {
        const args: ts.Expression[] = [this.buildClassConstExpr(data.eventId), this.buildStringExpr(data.name)];

        if (data.handler !== null) {
            args.push(this.buildHandlerExpr(data.handler));
        } else {
            args.push(this.buildNullExpr());
        }

        return this.buildNewExpr('Valkyrja\\Event\\Data\\Listener', args);
    }
}
