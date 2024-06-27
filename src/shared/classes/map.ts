export class MapData {
    bases: { [key: string]: BaseEntry | undefined } = {};

    addBase(base: BaseEntry) {
        this.bases[base.id] = base;
    }

    checkDock(x: number, z: number, range: number) {
        let closestDistance = 1000000;
        for (const base of pairs(this.bases)) {
            if (base[1] !== undefined) {
                const distance = math.sqrt((base[1].dockX - x) ** 2 + (base[1].dockZ - z) ** 2);
                if (distance < closestDistance) {
                    closestDistance = distance;
                }
                if (distance <= range) {
                    return base[1].id;
                }
            }
        }
        return -1;
    }
}

export type BaseEntry = {
    id: number;
    x: number;
    y: number;
    dockX: number;
    dockZ: number;
};
