import { InsertService, Workspace } from "@rbxts/services";
import { haltonSequence } from "shared/gen";

function generateIsland(x: number, y: number) {
    const island = InsertService.LoadAsset(17900649471).GetChildren()[0] as Model;
    island.Parent = Workspace;
    //Move island randomly
    island.MoveTo(new Vector3(x, -3, y));
    //Set random rotation
    island.PrimaryPart!.CFrame = new CFrame(island.PrimaryPart!.Position).mul(
        CFrame.Angles(0, math.rad(math.random() * 360), 0),
    );

    return island;
}

function generateWorld(seed: number, size: number, bases: number) {
    const islandList = [];
    const lowerBound = math.floor(size / 2);
    // Always ensure that an island is generated nearby the origin
    islandList.push(generateIsland(math.floor(math.random() * 600) - 300, math.floor(math.random() * 600) - 300));
    for (let i = 0; i < bases - 1; i++) {
        islandList.push(
            generateIsland(haltonSequence(i, 2) * size - lowerBound, haltonSequence(i, 3) * size - lowerBound),
        );
    }
}

generateWorld(0, 4000, 20);
