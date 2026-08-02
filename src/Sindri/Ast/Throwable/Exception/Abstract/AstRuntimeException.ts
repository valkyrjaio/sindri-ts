/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import { SindriRuntimeException } from '../../../../Throwable/Exception/Abstract/SindriRuntimeException.ts';

import type { AstThrowable } from '../../Contract/AstThrowable.ts';

export abstract class AstRuntimeException extends SindriRuntimeException implements AstThrowable {}
