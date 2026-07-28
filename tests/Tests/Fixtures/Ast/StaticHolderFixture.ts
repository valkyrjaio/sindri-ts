// @ts-nocheck
/* eslint-disable */

export class StaticHolderFixture {
    public static readonly NAME: string = 'svc.name';
    public static readonly NUM: number = 5;
    public static readonly AS_CONST = 'svc.as-const' as const;
    public static readonly AS_CONST_NUM = 5 as const;
    public static UNINITIALIZED: string;

    public static get GETTER(): string {
        return 'getter';
    }
}
