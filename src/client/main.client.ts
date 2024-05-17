import { Players, ReplicatedStorage, RunService, UserInputService } from "@rbxts/services";
import { ShipUI } from "shared/ship.ui";

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

let gui: ShipUI | undefined = undefined;

player.CharacterAdded.Connect((character) => {
    //Disable player animations
    character.WaitForChild("Animate").Destroy();
    (character.WaitForChild("HumanoidRootPart") as Part).Anchored = true;
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
    character.SetAttribute("rudderMax", 0.9);
    gui = new ShipUI(player);
    gui.gui.Enabled = true;
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
