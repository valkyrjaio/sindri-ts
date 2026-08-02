/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import { ValkyrjaRuntimeException } from '@valkyrjaio/valkyrja/Throwable/Exception/Abstract/ValkyrjaRuntimeException.ts';

import type { SindriThrowable } from '../../Contract/SindriThrowable.ts';

export abstract class SindriRuntimeException extends ValkyrjaRuntimeException implements SindriThrowable {}
