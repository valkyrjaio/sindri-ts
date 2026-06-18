/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ValkyrjaRuntimeException } from '@valkyrjaio/valkyrja/Throwable/Exception/Abstract/ValkyrjaRuntimeException.ts';

import type { SindriThrowable } from '../../Contract/SindriThrowable.ts';

export abstract class SindriRuntimeException extends ValkyrjaRuntimeException implements SindriThrowable {}
