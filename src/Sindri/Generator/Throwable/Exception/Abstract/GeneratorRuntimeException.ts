/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import { SindriRuntimeException } from '../../../../Throwable/Exception/Abstract/SindriRuntimeException.ts';

import type { GeneratorThrowable } from '../../Contract/GeneratorThrowable.ts';

export abstract class GeneratorRuntimeException extends SindriRuntimeException implements GeneratorThrowable {}
