/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

export interface CliArgumentParameterDataContract {
    readonly name: string;
    readonly description: string;
    readonly cast: string | null;
    /** Stored as "FQN::CASE" */
    readonly mode: string;
    /** Stored as "FQN::CASE" */
    readonly valueMode: string;
}
