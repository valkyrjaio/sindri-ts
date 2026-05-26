/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export interface HttpParameterDataContract {
    readonly name: string;
    readonly regex: string;
    /** Stored as "FQN::CASE" or null */
    readonly cast: string | null;
    readonly isOptional: boolean;
    readonly shouldCapture: boolean;
}