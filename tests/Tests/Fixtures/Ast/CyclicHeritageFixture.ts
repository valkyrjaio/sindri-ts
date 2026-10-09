// @ts-nocheck
/* eslint-disable */

export class CyclicAFixture extends CyclicBFixture {}

export class CyclicBFixture extends CyclicAFixture {}
