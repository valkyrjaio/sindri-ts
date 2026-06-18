/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ts } from 'ts-morph';

import { AstReader } from './Abstract/AstReader.ts';
import { ServiceProviderResult } from './Data/Result/ServiceProviderResult.ts';

import type { MethodDeclaration } from 'ts-morph';

import type { ServiceProviderReaderContract } from './Contract/ServiceProviderReaderContract.ts';

export class ServiceProviderReader extends AstReader implements ServiceProviderReaderContract {
    protected static readonly METHOD_PUBLISHERS = 'publishers';

    readFile(filePath: string): ServiceProviderResult {
        const sourceFile = this.parseFileToSourceFile(filePath);
        const classDecl = this.findClass(sourceFile);

        if (classDecl === undefined) {
            return new ServiceProviderResult();
        }

        const useMap = this.buildUseMap(sourceFile);
        const methods = this.indexMethods(classDecl);
        const currentClass = classDecl.getName() ?? '';

        const publishers = this.extractPublishersMap(
            methods[ServiceProviderReader.METHOD_PUBLISHERS],
            useMap,
            filePath,
            currentClass,
        );

        return new ServiceProviderResult(Object.keys(publishers), publishers);
    }

    /**
     * Extract the publishers map from a publishers() method.
     *
     * Expects `return { [ServiceId]: ProviderClass.method, ... }`.
     */
    protected extractPublishersMap(
        method: MethodDeclaration | undefined,
        useMap: Record<string, string>,
        filePath: string,
        currentClass: string = '',
    ): Record<string, readonly [string, string]> {
        if (method === undefined) {
            return {};
        }

        const obj = this.findReturnedObject(method);

        if (obj === undefined) {
            return {};
        }

        const map: Record<string, readonly [string, string]> = {};

        for (const prop of obj.properties) {
            if (!ts.isPropertyAssignment(prop)) {
                continue;
            }

            const serviceId = this.resolvePropertyKeyToString(prop.name, useMap, filePath);

            if (serviceId === undefined || serviceId === '') {
                continue;
            }

            const handler = this.extractHandlerFromValue(prop.initializer, useMap, filePath, currentClass);

            if (handler === undefined) {
                continue;
            }

            map[serviceId] = handler;
        }

        return map;
    }

    /**
     * Extract a [providerClass, methodName] pair from a property access expression.
     *
     * Handles: `ProviderClass.publishMethod` and `[ProviderClass, 'method']`.
     */
    protected extractHandlerFromValue(
        node: ts.Expression,
        useMap: Record<string, string>,
        filePath: string,
        currentClass: string,
    ): readonly [string, string] | undefined {
        if (ts.isPropertyAccessExpression(node)) {
            const className = ts.isIdentifier(node.expression) ? node.expression.text : undefined;

            if (className === undefined) {
                return undefined;
            }

            const methodName = node.name.text;
            const resolvedClass = className === 'self' || className === 'this' ? currentClass : className;

            return [resolvedClass, methodName] as const;
        }

        if (ts.isArrayLiteralExpression(node) && node.elements.length === 2) {
            const raw = this.extractHandlerFromTsArray(node, useMap, filePath, currentClass);

            if (raw !== undefined) {
                return [raw.class, raw.method] as const;
            }
        }

        return undefined;
    }
}
