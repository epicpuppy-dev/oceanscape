import Roact from "@rbxts/roact";
import { importModel } from "./util";
import { World } from "./world";
import { ReplicatedStorage, Workspace } from "@rbxts/services";
import { Ship } from "./ship";

export class GamePlayer {
    id: number;
    state: PlayerState = PlayerState.None;
    shipId: number | undefined;
    ship: Model | undefined;
    player: Player;
    gui: Roact.Tree | undefined;

    constructor(player: Player) {
        this.id = player.UserId;
        this.player = player;
    }

    addShip(ship: Model) {
        this.ship = ship;
        this.state = PlayerState.Ship;
        const id = ship.GetAttribute("id");
        if (typeIs(id, "number")) this.shipId = id;
        else {
            ship.GetAttributeChangedSignal("id").Wait();
            this.shipId = ship.GetAttribute("id") as number;
        }
    }

    addShipClient(ship: Model, ui: Roact.Element) {
        this.addShip(ship);
        //Enable GUI
        this.gui = Roact.mount(ui, this.player.WaitForChild("PlayerGui"));
        ship.SetAttribute("CameraHeading", 0);
        ship.SetAttribute("CameraFocus", 100);
    }

    spawnShip(world: World, shipId: number, modelId: number) {
        const ship = importModel(modelId);
        ship.Name = this.player.Name;
        ship.Parent = Workspace;
        this.player.Character = ship;
        print("Init ship class");
        //Initialize ship class
        const shipClass = new Ship(
            world.map,
            world,
            world.anchor,
            shipId,
            ship,
            ship.PrimaryPart!.CFrame.LookVector.Y,
            32,
            2.86,
            2,
            2.86,
            200,
            300,
            5,
            this,
        );
        this.addShip(ship);
        world.addShip(shipClass);
        print("Firing ship spawn event");
        (ReplicatedStorage.WaitForChild("ShipSpawnEvent") as RemoteEvent).FireClient(this.player, shipId);
    }

    removeShip() {
        this.ship = undefined;
        this.shipId = undefined;
    }

    dockAtBase(world: World, baseId: number) {
        const character = this.player.Character;
        if (character === undefined) return;
        const base = world.bases[baseId];
        if (base === undefined) return;
        // Remove player ship and add player to base
        (ReplicatedStorage.WaitForChild("DockRequestEvent") as RemoteEvent).FireClient(this.player);
        this.removeShip();
        this.state = PlayerState.Base;
        const newPlayer = importModel(18198568965);
        newPlayer.Name = this.player.Name;
        newPlayer.Parent = Workspace;
        newPlayer.PrimaryPart!.CFrame = base.island.model.PrimaryPart!.CFrame;
        this.player.Character = newPlayer;
    }

    dockAtBaseClient(gui: Roact.Tree) {
        this.removeShip();
        this.state = PlayerState.Base;
        Roact.unmount(gui);
    }
}

export enum PlayerState {
    Base,
    Ship,
    None,
}
