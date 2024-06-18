export function haltonSequence(index: number, base: number) {
    let f = 1;
    let r = 0;
    while (index > 0) {
        f = f / base;
        r = r + f * (index % base);
        index = math.floor(index / base);
    }
    return r;
}
