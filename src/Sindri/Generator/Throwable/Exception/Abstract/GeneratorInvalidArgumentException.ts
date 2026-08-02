/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import { SindriInvalidArgumentException } from '../../../../Throwable/Exception/Abstract/SindriInvalidArgumentException.ts';

import type { GeneratorThrowable } from '../../Contract/GeneratorThrowable.ts';

export abstract class GeneratorInvalidArgumentException
    extends SindriInvalidArgumentException
    implements GeneratorThrowable {}
