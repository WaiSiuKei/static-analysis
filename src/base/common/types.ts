export type JSPrimitiveType = boolean | null | undefined | number | bigint | string | symbol;

export function isBoolean(obj: unknown): obj is boolean {
    return obj === true || obj === false;
}
export function isUndefined(obj: unknown): obj is undefined {
    return typeof obj === 'undefined';
}
export function isUndefinedOrNull(obj: unknown): obj is undefined | null {
    return isUndefined(obj) || obj === null;
}
export function isNumber(obj: unknown): obj is number {
    return typeof obj === 'number';
}
export function isString(val: unknown): val is string {
    return typeof val === 'string';
}
export function isBigInt(obj: unknown): obj is bigint {
    return typeof obj === 'bigint';
}
export function isSymbol(obj: unknown): obj is symbol {
    return typeof obj === 'symbol';
}

export function isPrimitive(val: unknown): val is JSPrimitiveType {
    if (isBoolean(val)) return true;
    else if (isUndefinedOrNull(val)) return true;
    else if (isNumber(val)) return true;
    else if (isBigInt(val)) return true;
    else if (isString(val)) return true;
    else return !!isSymbol(val);
}
