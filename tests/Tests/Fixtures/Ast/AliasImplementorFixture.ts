// @ts-nocheck
/* eslint-disable */

import { FooContract as RenamedContract } from './FooContract.ts';

export class AliasImplementorFixture implements RenamedContract {
    public foo(): void {}
}
