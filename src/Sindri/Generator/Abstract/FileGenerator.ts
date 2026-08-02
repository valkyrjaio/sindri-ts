/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import * as fs from 'fs';

import { GenerateStatus } from '../Enum/GenerateStatus.ts';

import type { FileGeneratorContract } from '../Contract/FileGeneratorContract.ts';

export abstract class FileGenerator implements FileGeneratorContract {
    protected filePath: string;

    constructor(
        protected directory: string,
        protected className: string,
    ) {
        this.filePath = directory.replace(/\/$/, '') + `/${className}.ts`;
    }

    generateFile(): GenerateStatus {
        try {
            const data = this.generateFileContents();
            const existing = this.fileGetContents();

            if (existing === data) {
                return GenerateStatus.SKIPPED;
            }

            this.filePutContents(data);

            return GenerateStatus.SUCCESS;
        } catch {
            // Fallthrough
        }

        return GenerateStatus.FAILURE;
    }

    abstract generateFileContents(): string;

    protected fileGetContents(): string | false {
        if (!fs.existsSync(this.filePath)) {
            return false;
        }

        return fs.readFileSync(this.filePath, 'utf-8');
    }

    protected filePutContents(data: string): void {
        fs.mkdirSync(this.directory, { recursive: true });
        fs.writeFileSync(this.filePath, data, 'utf-8');
    }
}
