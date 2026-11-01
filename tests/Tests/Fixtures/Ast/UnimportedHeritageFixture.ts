// @ts-nocheck
/* eslint-disable */

export class UnimportedHeritageFixture implements NeverImportedContract {}

export class NamespacedHeritageFixture implements contracts.FooContract {}

export class ParenthesizedHeritageFixture implements (FooContract) {}
