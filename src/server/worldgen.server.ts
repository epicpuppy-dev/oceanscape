import { InsertService, Workspace } from "@rbxts/services";

function generateIsland() {
    const island = InsertService.LoadAsset(17900649471).GetChildren()[0] as Model;
    island.Parent = Workspace;
    //Move island randomly
    island.MoveTo(new Vector3(math.floor(math.random() * 9600) - 4800, -3, math.floor(math.random() * 9600) - 4800));
    //Set random rotation
    island.PrimaryPart!.CFrame = new CFrame(island.PrimaryPart!.Position).mul(
        CFrame.Angles(0, math.rad(math.random() * 360), 0),
    );

    return island;
}

const islands = [];
for (let i = 0; i < 25; i++) {
    islands.push(generateIsland());
}
