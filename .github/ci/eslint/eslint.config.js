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
import { CopyrightHeaderFactory } from '@valkyrjaio/ci-eslint';

export default tseslint.config(eslint.configs.recommended, tseslint.configs.strictTypeChecked, {
    languageOptions: {
        parserOptions: {
            projectService: true,
            tsconfigRootDir: path.resolve(import.meta.dirname, '../../..'),
        },
    },
    plugins: {
        local: { rules: { 'copyright-header': CopyrightHeaderFactory.getRule('Sindri') } },
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
