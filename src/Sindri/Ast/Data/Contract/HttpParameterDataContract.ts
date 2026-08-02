/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

export interface HttpParameterDataContract {
    readonly name: string;
    readonly regex: string;
    /** Stored as "FQN::CASE" or null */
    readonly cast: string | null;
    readonly isOptional: boolean;
    readonly shouldCapture: boolean;
    /** The default value for the parameter, or null when none was declared. */
    readonly defaultValue: string | number | boolean | null;
}
