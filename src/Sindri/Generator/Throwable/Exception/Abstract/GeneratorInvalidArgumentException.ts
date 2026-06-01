/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { SindriInvalidArgumentException } from '../../../../Throwable/Exception/Abstract/SindriInvalidArgumentException.js';

import type { GeneratorThrowable } from '../../Contract/GeneratorThrowable.js';

export abstract class GeneratorInvalidArgumentException
    extends SindriInvalidArgumentException
    implements GeneratorThrowable {}
