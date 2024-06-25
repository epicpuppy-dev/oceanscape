import { Workspace } from "@rbxts/services";
import { discAlgorithm } from "shared/gen";
import { Island } from "shared/island";

function generateIsland(parent: Instance, x: number, y: number) {
    const island = new Island("SmallA", x, y, math.random() * 360, parent, true);

    return island;
}

function generateWorld(bases: [number, number][]) {
    const islandList: Island[] = [];
    const folder = new Instance("Folder");
    folder.Name = "Islands";
    folder.Parent = Workspace;
    // Always ensure that an island is generated nearby the origin
    for (let i = 0; i < bases.size(); i++) {
        islandList.push(generateIsland(folder, bases[i][0], bases[i][1]));
    }
}

function generateDiscWorld(
    seed: number,
    size: number,
    discs: number,
    radii: number[],
    separation: number[],
    points: number[],
    variance: number[],
) {
    const bases = discAlgorithm(seed, size, discs, radii, separation, points, variance);
    bases.map((base) => {
        base[0] = base[0] - size / 2;
        base[1] = base[1] - size / 2;
    });
    generateWorld(bases);
}

generateDiscWorld(0, 6000, 3, [100, 2000, 4000], [0, 75, 40], [1, 3, 5], [100, 1000, 2000]);
