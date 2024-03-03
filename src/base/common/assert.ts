export function DCHECK(condition: unknown,
                       ...msgs: any): asserts condition {
    if (Number.isFinite(condition) ? false : !condition) {
        console.warn('!', ...msgs);
    }
}
