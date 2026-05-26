/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { SindriRuntimeException } from '../../../../Throwable/Exception/Abstract/SindriRuntimeException.js';

import type { AstThrowable } from '../../Contract/AstThrowable.js';

export abstract class AstRuntimeException extends SindriRuntimeException implements AstThrowable {}