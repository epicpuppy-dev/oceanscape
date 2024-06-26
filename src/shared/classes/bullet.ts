import { InsertService, ReplicatedStorage, Workspace } from "@rbxts/services";
import { Ship } from "./ship";
import { World } from "./world";

export class Bullet {
    damage: number; // Damage per shot
    part: Part;

    constructor(world: World, damage: number, part: Part) {
        this.damage = damage;
        this.part = part;
        this.part.Parent = Workspace.WaitForChild("Bullets");
        this.part.Size = new Vector3(0.2, 0.2, 0.2);
        this.part.Material = Enum.Material.Neon;
        this.part.Color = Color3.fromRGB(255, 153, 0);
        wait();
        this.part.Touched.Connect((hit) => {
            print("touched something!");
            print(hit.Parent);
            const shipID = hit.Parent?.GetAttribute("id");
            if (typeIs(shipID, "number")) {
                const ship = world.ships[shipID];
                if (ship !== undefined) {
                    ship.DamageShip(this.damage);
                    print("damaged ship!");
                    this.part.Destroy();
                }
            }
        });
    }
}
