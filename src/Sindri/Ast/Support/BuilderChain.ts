/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import { ts } from 'ts-morph';

/**
 * Walk a `with*` builder chain back to the construction it was built from.
 *
 * One reader decides what counts as a chained route and one generator decides what gets a key, so
 * they read the chain through this one function. Widening one alone would key a shape the other
 * rejects, and the method would leave the generated service map without a word.
 */
export function unwrapBuilderChain(expression: ts.Expression): ts.NewExpression | undefined {
    let current: ts.Expression = expression;

    while (ts.isCallExpression(current) && ts.isPropertyAccessExpression(current.expression)) {
        current = current.expression.expression;
    }

    return ts.isNewExpression(current) ? current : undefined;
}
