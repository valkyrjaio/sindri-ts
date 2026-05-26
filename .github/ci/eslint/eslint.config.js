import path from 'path';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

const HEADER = `/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

`;

const copyrightHeader = {
    meta: {
        type: 'layout',
        fixable: 'code',
        messages: {
            missing: 'Missing copyright header. Add the standard block comment at the top of the file.',
        },
    },
    create(context) {
        return {
            Program(node) {
                const sourceCode = context.sourceCode;
                const comments = sourceCode.getAllComments();
                const first = comments
                    .filter((c) => c.type === 'Block')
                    .sort((a, b) => a.range[0] - b.range[0])[0];

                if (first === undefined || first.loc.start.line !== 1 || !first.value.includes('This file is part of the Sindri package.')) {
                    context.report({
                        node,
                        messageId: 'missing',
                        fix(fixer) {
                            return fixer.insertTextBefore(node, HEADER);
                        },
                    });
                }
            },
        };
    },
};

export default tseslint.config(
    eslint.configs.recommended,
    tseslint.configs.strictTypeChecked,
    {
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
            'local/copyright-header'                           : 'error',
            '@typescript-eslint/no-namespace'                  : 'off',
            '@typescript-eslint/no-extraneous-class'           : 'off',
            '@typescript-eslint/no-unnecessary-type-parameters': 'off',
            '@typescript-eslint/no-unused-vars'                : ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
            '@typescript-eslint/no-invalid-void-type'          : ['error', { allowAsThisParameter: true }],
        },
    },
);
