/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { MethodDeclaration } from 'ts-morph';

import { AstReader } from './AstReader.js';
import { HandlerData } from '../Data/HandlerData.js';

/**
 * Base for route attribute readers — provides shared handler resolution logic.
 *
 * Concrete subclasses supply the decorator name of their specific route handler
 * decorator via getRouteHandlerDecoratorName(), and this class implements the
 * common updateHandler() that uses it.
 */
export abstract class RouteAttributeReader extends AstReader {
    /**
     * Resolve the handler from a @RouteHandler decorator or fall back to ClassName.methodName.
     */
    protected updateHandler(
        method: MethodDeclaration,
        useMap: Record<string, string>,
        currentFilePath: string,
        currentClass: string,
    ): HandlerData {
        const decoratorName = this.getRouteHandlerDecoratorName();

        for (const decorator of this.findDecoratorsOnNode(method, decoratorName, useMap, currentFilePath)) {
            const arg = this.getDecoratorArg(decorator, 0);
            const raw = this.extractExprValue(arg, useMap, currentFilePath, currentClass);

            if (raw instanceof HandlerData) {
                return raw;
            }
        }

        return new HandlerData(currentClass, method.getName());
    }

    /**
     * Return the name of the route handler decorator used by this reader.
     */
    protected abstract getRouteHandlerDecoratorName(): string;
}