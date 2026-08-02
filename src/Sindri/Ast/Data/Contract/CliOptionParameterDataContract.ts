/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

export interface CliOptionParameterDataContract {
    readonly name: string;
    readonly description: string;
    readonly valueDisplayName: string;
    readonly cast: string | null;
    readonly defaultValue: string;
    readonly shortNames: readonly string[];
    readonly validValues: readonly string[];
    /** Stored as "FQN::CASE" */
    readonly mode: string;
    /** Stored as "FQN::CASE" */
    readonly valueMode: string;
}
