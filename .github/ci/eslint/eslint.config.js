/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import path from 'path';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

const HEADER = `/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

`;

// The text between the delimiters of HEADER. The rule compares the first comment of
// a file against it, so a file whose header body is wrong fails too, and not only a
// file that carries no header at all.
const HEADER_COMMENT = HEADER.slice(HEADER.indexOf('/*') + 2, HEADER.lastIndexOf('*/'));

const copyrightHeader = {
    meta: {
        type: 'layout',
        fixable: 'code',
        messages: {
            missing: 'Missing copyright header. Add the standard block comment at the top of the file.',
            incorrect: 'Incorrect copyright header. The block comment must match the standard header exactly.',
        },
    },
    create(context) {
        return {
            Program(node) {
                const sourceCode = context.sourceCode;
                const comments = sourceCode.getAllComments();
                const first = comments.filter((c) => c.type === 'Block').sort((a, b) => a.range[0] - b.range[0])[0];
                const inHeaderPosition = first !== undefined && first.loc.start.line === 1;

                if (inHeaderPosition && first.value === HEADER_COMMENT) {
                    return;
                }

                if (!inHeaderPosition) {
                    context.report({
                        node,
                        messageId: 'missing',
                        fix(fixer) {
                            return fixer.insertTextBefore(node, HEADER);
                        },
                    });

                    return;
                }

                // The file carries a header whose text differs. Replace that comment.
                // An insert would put a second header above the first one.
                context.report({
                    loc: first.loc,
                    messageId: 'incorrect',
                    fix(fixer) {
                        return fixer.replaceText(first, HEADER.trimEnd());
                    },
                });
            },
        };
    },
};

export default tseslint.config(eslint.configs.recommended, tseslint.configs.strictTypeChecked, {
    languageOptions: {
        parserOptions: {
            projectService: true,
            tsconfigRootDir: path.resolve(import.meta.dirname, '../../..'),
        },
    },
    plugins: {
        local: { rules: { 'copyright-header': copyrightHeader } },
    },
    rules: {
        'local/copyright-header': 'error',
        '@typescript-eslint/no-namespace': 'off',
        '@typescript-eslint/no-extraneous-class': 'off',
        '@typescript-eslint/no-unnecessary-type-parameters': 'off',
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
        '@typescript-eslint/no-invalid-void-type': ['error', { allowAsThisParameter: true }],
    },
});
