/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { SindriRuntimeException } from '../../../../Throwable/Exception/Abstract/SindriRuntimeException.ts';

import type { GeneratorThrowable } from '../../Contract/GeneratorThrowable.ts';

export abstract class GeneratorRuntimeException extends SindriRuntimeException implements GeneratorThrowable {}
