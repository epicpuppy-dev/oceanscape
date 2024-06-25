import {
    ContextActionService,
    Players,
    ReplicatedStorage,
    RunService,
    StarterGui,
    UserInputService,
} from "@rbxts/services";
import Roact from "@rbxts/roact";
import { SpeedDisplay, HeadingDisplay, TurnBar, ShipStatus, Crosshair, DockIndicator } from "shared/ship.hud";
import { GamePlayer, PlayerState } from "shared/player";
import { BaseEntry, MapData } from "shared/map";

const player = new GamePlayer(Players.LocalPlayer);
const map = new MapData();

const controls = {
    forward: Enum.KeyCode.W,
    backward: Enum.KeyCode.S,
    left: Enum.KeyCode.A,
    right: Enum.KeyCode.D,
    dock: Enum.KeyCode.T,
};

//Disable player controls
const module = require(
    player.player.WaitForChild("PlayerScripts").WaitForChild("PlayerModule") as ModuleScript,
) as PlayerModule;
module.GetControls().Disable();

const hud = {
    speed: Roact.createElement(SpeedDisplay, { speed: 0, targetPower: 0 }),
    heading: Roact.createElement(HeadingDisplay, { heading: 0 }),
    turn: Roact.createElement(TurnBar, { rudder: 0, maxRudder: 1, targetTurn: 0 }),
    status: Roact.createElement(ShipStatus, { armor: 1, maxArmor: 1, hull: 1, maxHull: 1 }),
    crosshair: Roact.createElement(Crosshair),
    dock: Roact.createElement(DockIndicator, {
        canDock: false,
        isDocking: false,
        dockingTime: 1,
        timeLeft: 1,
        inCombat: false,
    }),
};

const ui = Roact.createElement("ScreenGui", {}, hud);

function UpdateUI(dt: number) {
    if (player.state !== PlayerState.Ship || player.shipId === undefined || player.ship === undefined) return;
    if (player.gui === undefined) return;
    hud.speed = Roact.createElement(
        SpeedDisplay,
        {
            speed: player.ship.GetAttribute("speed") as number,
            targetPower: player.ship.GetAttribute("targetPower") as number,
        },
        [],
    );
    hud.heading = Roact.createElement(
        HeadingDisplay,
        {
            heading: player.ship.GetAttribute("heading") as number,
        },
        [],
    );
    hud.turn = Roact.createElement(TurnBar, {
        rudder: player.ship.GetAttribute("rudder") as number,
        maxRudder: player.ship.GetAttribute("maxRudder") as number,
        targetTurn: player.ship.GetAttribute("targetTurn") as number,
    });
    hud.status = Roact.createElement(ShipStatus, {
        armor: player.ship.GetAttribute("armor") as number,
        maxArmor: player.ship.GetAttribute("maxArmor") as number,
        hull: player.ship.GetAttribute("hull") as number,
        maxHull: player.ship.GetAttribute("maxHull") as number,
    });
    const dockTarget = map.checkDock(player.ship.PrimaryPart!.Position.X, player.ship.PrimaryPart!.Position.Z, 75);
    hud.dock = Roact.createElement(DockIndicator, {
        canDock: dockTarget !== -1,
        isDocking: player.ship.GetAttribute("docking") as boolean,
        dockingTime: player.ship.GetAttribute("dockingTime") as number,
        timeLeft: player.ship.GetAttribute("timeLeft") as number,
        inCombat: false,
    });
    player.gui = Roact.update(player.gui, Roact.createElement("ScreenGui", {}, hud));
}

const UIS = UserInputService;
UIS.InputBegan.Connect((input, chatting) => {
    if (chatting || player.ship === undefined || player.shipId === undefined) return;
    let targetPower = player.ship.GetAttribute("targetPower") as number;
    let targetTurn = player.ship.GetAttribute("targetTurn") as number;
    let update = false;
    if (input.KeyCode === controls.forward) {
        if (targetPower < 0) targetPower = 0;
        else targetPower = math.min(targetPower + 0.25, 1);
        update = true;
    }
    if (input.KeyCode === controls.backward) {
        if (targetPower === 0) targetPower = -0.5;
        else targetPower = math.max(targetPower - 0.25, -0.5);
        update = true;
    }
    if (input.KeyCode === controls.left) {
        targetTurn = -1;
        update = true;
    }
    if (input.KeyCode === controls.right) {
        update = true;
        targetTurn = 1;
    }
    if (input.KeyCode === controls.dock) {
        (ReplicatedStorage.WaitForChild("DockRequestEvent") as RemoteEvent).FireServer(player.shipId);
    }
    if (!update) return;
    (ReplicatedStorage.WaitForChild("MovementUpdateEvent") as RemoteEvent).FireServer(
        player.shipId,
        targetPower,
        targetTurn,
    );
    player.ship.SetAttribute("targetPower", targetPower);
    player.ship.SetAttribute("targetTurn", targetTurn);
});

UIS.InputEnded.Connect((input, chatting) => {
    if (chatting || player.ship === undefined || player.shipId === undefined) return;
    const targetPower = player.ship.GetAttribute("targetPower") as number;
    let targetTurn = player.ship.GetAttribute("targetTurn") as number;
    let update = false;
    if (input.KeyCode === controls.left || input.KeyCode === controls.right) {
        targetTurn = 0;
        update = true;
    }
    if (!update) return;
    (ReplicatedStorage.WaitForChild("MovementUpdateEvent") as RemoteEvent).FireServer(
        player.shipId,
        targetPower,
        targetTurn,
    );
    player.ship.SetAttribute("targetPower", targetPower);
    player.ship.SetAttribute("targetTurn", targetTurn);
});

RunService.Heartbeat.Connect(UpdateUI);

StarterGui.SetCoreGuiEnabled(Enum.CoreGuiType.Health, false);
StarterGui.SetCoreGuiEnabled(Enum.CoreGuiType.Backpack, false);

(ReplicatedStorage.WaitForChild("MapUpdateEvent") as RemoteEvent).OnClientEvent.Connect(
    (property: string, data: { [key: string]: string | number | boolean }) => {
        if (property === "base") {
            const base = data as BaseEntry;
            map.addBase(base);
        }
    },
);

(ReplicatedStorage.WaitForChild("DockRequestEvent") as RemoteEvent).OnClientEvent.Connect(() => {
    player.dockAtBaseClient(player.gui!);
});

(ReplicatedStorage.WaitForChild("ShipSpawnEvent") as RemoteEvent).OnClientEvent.Connect(() => {
    player.addShipClient(player.player.Character!, ui);
});
ContextActionService.BindAction(
    "FireInput",
    () => {
        (ReplicatedStorage.WaitForChild("WeaponFireEvent") as RemoteEvent).FireServer(player.shipId);
    },
    false,
    Enum.UserInputType.MouseButton1,
);
