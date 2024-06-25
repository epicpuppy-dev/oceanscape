import Roact from "@rbxts/roact";
import { importModel } from "../util/util";
import { World } from "./world";
import { ReplicatedStorage, Workspace } from "@rbxts/services";
import { Ship } from "./ship";
import { sendPacketS2C } from "shared/util/network";

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

    spawnShip(world: World, shipId: number, modelId: number, x?: number, z?: number, heading?: number) {
        const ship = importModel(modelId);
        ship.Name = this.player.Name;
        ship.Parent = Workspace;
        let posCFrame = new CFrame(0, 2, 0);
        if (x !== undefined && z !== undefined) posCFrame = new CFrame(x, 2, z);
        if (heading !== undefined) posCFrame = posCFrame.mul(CFrame.Angles(0, math.rad(heading), 0));
        this.player.Character = ship;
        //Initialize ship class
        const shipClass = new Ship(
            world.map,
            world,
            world.anchor,
            shipId,
            ship,
            ship.PrimaryPart!.Orientation.Y,
            32,
            2.86,
            2,
            2.86,
            200,
            300,
            6,
            5,
            this,
        );
        this.addShip(ship);
        world.addShip(shipClass);
        sendPacketS2C<Packet.ShipSpawn>(this.player, "ShipSpawn", { shipId });
        print("[INFO] Ship spawned for player " + this.player.Name);
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
        if (this.ship === undefined || this.shipId === undefined) return;
        sendPacketS2C<Packet.DockRequest>(this.player, "DockRequest", { shipId: this.shipId });
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
