import { InsertService, Workspace } from "@rbxts/services";
import { discAlgorithm, haltonSequence } from "shared/gen";

function generateIsland(parent: Instance, x: number, y: number) {
    const island = InsertService.LoadAsset(17900649471).GetChildren()[0] as Model;
    island.Parent = parent;
    //Move island randomly
    island.MoveTo(new Vector3(x, -3, y));
    //Set random rotation
    island.PrimaryPart!.CFrame = new CFrame(island.PrimaryPart!.Position).mul(
        CFrame.Angles(0, math.rad(math.random() * 360), 0),
    );

    return island;
}

function generateWorld(bases: [number, number][]) {
    const islandList = [];
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
