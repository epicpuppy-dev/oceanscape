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

export function discAlgorithm(
    seed: number,
    size: number,
    discs: number,
    radii: number[],
    separation: number[],
    points: number[],
    variance: number[],
) {
    const output: [number, number][] = [];
    math.randomseed(seed);
    // for each disc
    for (let i = 0; i < discs; i++) {
        // generate an array of degrees with the minimum separation
        const degrees: number[] = [];
        for (let j = 0; j < points[i]; j++) {
            let point = math.random() * 360;
            while (
                degrees.some((degree) => {
                    const distance = math.min(
                        math.abs(degree - point),
                        math.abs(degree - point + 360),
                        math.abs(degree - point - 360),
                    );
                    return distance < separation[i];
                })
            ) {
                point = math.random() * 360;
            }
            degrees.push(point);
        }

        // draw each of the points, including the variance
        for (let j = 0; j < points[i]; j++) {
            const x = size / 2 + math.cos(math.rad(degrees[j])) * radii[i] + (math.random() - 0.5) * variance[i];
            const y = size / 2 + math.sin(math.rad(degrees[j])) * radii[i] + (math.random() - 0.5) * variance[i];
            output.push([x, y]);
        }
    }

    return output;
}
