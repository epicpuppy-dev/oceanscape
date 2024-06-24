export class MapData {
    bases: { [key: string]: BaseEntry | undefined } = {};

    addBase(base: BaseEntry) {
        this.bases[base.id] = base;
    }
}

export type BaseEntry = {
    id: number;
    x: number;
    y: number;
    dockX: number;
    dockZ: number;
};
