/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ValkyrjaRuntimeException } from '@valkyrja/valkyrja/Throwable/Exception/Abstract/ValkyrjaRuntimeException.js';

import type { SindriThrowable } from '../../Contract/SindriThrowable.js';

export abstract class SindriRuntimeException extends ValkyrjaRuntimeException implements SindriThrowable {}