/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
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
