import { Players, ReplicatedStorage, RunService, UserInputService } from "@rbxts/services";
import Roact from "@rbxts/roact";
import { SpeedDisplay, HeadingDisplay, TurnBar } from "shared/ship.hud";

const player = Players.LocalPlayer;

const controls = {
    forward: Enum.KeyCode.W,
    backward: Enum.KeyCode.S,
    left: Enum.KeyCode.A,
    right: Enum.KeyCode.D,
};

//Disable player controls
const module = require(
    player.WaitForChild("PlayerScripts").WaitForChild("PlayerModule") as ModuleScript,
) as PlayerModule;
module.GetControls().Disable();

let hasShip = false;
let shipId = -1;
let targetPower = 0;
let targetTurn = 0;

const hud = {
    speed: Roact.createElement(SpeedDisplay, { speed: 0, targetPower: 0 }),
    heading: Roact.createElement(HeadingDisplay, { heading: 0 }),
    turn: Roact.createElement(TurnBar, { rudder: 0, maxRudder: 1 }),
};
const ui = Roact.createElement("ScreenGui", {}, hud);
let gui: Roact.Tree;

function UpdateUI() {
    if (!hasShip) return;
    if (shipId === -1) return;
    if (gui === undefined) return;
    hud.speed = Roact.createElement(
        SpeedDisplay,
        {
            speed: player.Character!.GetAttribute("speed") as number,
            targetPower: player.Character!.GetAttribute("targetPower") as number,
        },
        [],
    );
    hud.heading = Roact.createElement(
        HeadingDisplay,
        {
            heading: player.Character!.GetAttribute("heading") as number,
        },
        [],
    );
    hud.turn = Roact.createElement(TurnBar, {
        rudder: player.Character!.GetAttribute("rudder") as number,
        maxRudder: player.Character!.GetAttribute("maxRudder") as number,
    });
    gui = Roact.update(gui, Roact.createElement("ScreenGui", {}, hud));
}

player.CharacterAdded.Connect((character) => {
    //Setup ship
    hasShip = true;
    targetPower = 0;
    targetTurn = 0;
    const id = character.GetAttribute("id");
    if (typeIs(id, "number")) shipId = id;
    else {
        character.GetAttributeChangedSignal("id").Wait();
        shipId = character.GetAttribute("id") as number;
    }
    character.SetAttribute("speed", 0);
    character.SetAttribute("heading", 0);
    character.SetAttribute("rudder", 0);
    character.SetAttribute("targetPower", targetPower);
    character.SetAttribute("targetTurn", targetTurn);

    //Enable GUI
    gui = Roact.mount(ui, player.WaitForChild("PlayerGui"));

    (player.Character!.WaitForChild("Humanoid") as Humanoid).Died.Connect(() => {
        hasShip = false;
        shipId = -1;
        Roact.unmount(gui);
    });
});

const UIS = UserInputService;
UIS.InputBegan.Connect((input, chatting) => {
    if (chatting) return;
    if (!hasShip) return;
    if (shipId === -1) return;
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
    if (!update) return;
    (ReplicatedStorage.WaitForChild("MovementUpdateEvent") as RemoteEvent).FireServer(shipId, targetPower, targetTurn);
    player.Character!.SetAttribute("targetPower", targetPower);
    player.Character!.SetAttribute("targetTurn", targetTurn);
});

UIS.InputEnded.Connect((input, chatting) => {
    if (chatting) return;
    if (!hasShip) return;
    if (shipId === -1) return;
    let update = false;
    if (input.KeyCode === controls.left || input.KeyCode === controls.right) {
        targetTurn = 0;
        update = true;
    }
    if (!update) return;
    (ReplicatedStorage.WaitForChild("MovementUpdateEvent") as RemoteEvent).FireServer(shipId, targetPower, targetTurn);
    player.Character!.SetAttribute("targetPower", targetPower);
    player.Character!.SetAttribute("targetTurn", targetTurn);
});

RunService.Heartbeat.Connect(UpdateUI);
