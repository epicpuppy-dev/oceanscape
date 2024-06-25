import Roact from "@rbxts/roact";
import { importModel } from "../util/util";
import { World } from "./world";
import { ReplicatedStorage, Workspace } from "@rbxts/services";
import { Ship } from "./ship";
import { listenPacketC2S, sendPacketS2C } from "shared/util/network";

export class GamePlayer {
    id: number;
    state: PlayerState = PlayerState.None;
    shipId: number | undefined;
    baseId: number | undefined;
    ship: Model | undefined;
    player: Player;
    gui: Roact.Tree | undefined;
    world: World | undefined;

    constructor(player: Player, world?: World) {
        this.id = player.UserId;
        this.player = player;
        this.world = world;
        if (world !== undefined) {
            listenPacketC2S<Packet.UndockRequest>("UndockRequest", (player, packet) => {
                if (this.player.UserId === player.UserId && this.state === PlayerState.Base) this.undockFromBase();
            });
        }
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

    spawnShip(modelId: number, x?: number, z?: number, heading?: number) {
        if (this.world === undefined) return;
        const ship = importModel(modelId);
        const shipId = ++this.world.nextShipId;
        ship.Name = this.player.Name;
        ship.Parent = Workspace;
        let posCFrame = new CFrame(0, 2, 0);
        if (x !== undefined && z !== undefined) posCFrame = new CFrame(x, 2, z);
        if (heading !== undefined) posCFrame = posCFrame.mul(CFrame.Angles(0, math.rad(heading), 0));
        ship.PrimaryPart!.CFrame = posCFrame;
        this.player.Character = ship;
        wait(0.25);
        //Initialize ship class
        const shipClass = new Ship(
            this.world.map,
            this.world,
            this.world.anchor,
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
        this.world.addShip(shipClass);
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
        sendPacketS2C<Packet.DockConfirm>(this.player, "DockConfirm", { baseId: baseId });
        this.baseId = baseId;
        world.ships[this.shipId] = undefined;
        this.removeShip();
        this.state = PlayerState.Base;
        const newPlayer = importModel(18198568965);
        newPlayer.Name = this.player.Name;
        newPlayer.Parent = Workspace;
        newPlayer.PrimaryPart!.CFrame = base.island.model.PrimaryPart!.CFrame;
        this.player.Character = newPlayer;
        print("[INFO] Player " + this.player.Name + " docked at base " + baseId);
    }

    dockAtBaseClient(base: number, gui: Roact.Tree) {
        this.baseId = base;
        this.removeShip();
        this.state = PlayerState.Base;
        Roact.unmount(gui);
    }

    undockFromBase() {
        if (this.world === undefined || this.baseId === undefined) return;
        const baseId = this.baseId;
        const base = this.world.bases[this.baseId];
        if (base === undefined) return;
        this.baseId = undefined;
        this.player.Character!.Destroy();
        this.state = PlayerState.None;
        const spawnLocations = base.components.foundation.WaitForChild("SpawnLocations").GetChildren();
        const spawnLocation = spawnLocations[math.random(0, spawnLocations.size())] as Attachment;
        this.spawnShip(
            18198556467,
            spawnLocation.WorldPosition.X,
            spawnLocation.WorldPosition.Z,
            -spawnLocation.Orientation.Y - 90,
        );
        print("[INFO] Player " + this.player.Name + " undocked at base " + baseId);
    }
}

export enum PlayerState {
    Base,
    Ship,
    None,
}
