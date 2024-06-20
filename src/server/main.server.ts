import { Players } from "@rbxts/services";
import { Ship } from "shared/ship";

const ships: Ship[] = [];
let id = 0;

function onPlayerRemoved(player: Player) {
    const character = player.Character;
    if (character !== undefined) onCharacterDied(character);
}

function onCharacterDied(character: Model) {
    const ship = ships.find((ship) => ship.model === character);
    character.WaitForChild("HumanoidRootPart").WaitForChild("Attachment").Destroy();
    if (ship !== undefined) destroyShip(ship.id);
}

function onPlayerAdded(player: Player) {
    player.CharacterAdded.Connect((character) => {
        //Disable player animations
        character.WaitForChild("Animate").Destroy();
        wait(0.1);
        //Initialize ship class
        const ship = new Ship(++id, character, character.PrimaryPart!.CFrame.LookVector.Y, 32, 2.86, 2, 2.86, 200, 300);
        ships.push(ship);
        (player.Character!.WaitForChild("Humanoid") as Humanoid).Died.Connect(() => onCharacterDied(player.Character!));
    });
}

Players.PlayerAdded.Connect(onPlayerAdded);
Players.PlayerRemoving.Connect(onPlayerRemoved);

function tickShipMovement() {
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const dt = wait(0.05)[0];
        for (const ship of ships) {
            ship.TickMovement(dt);
        }
    }
}

function destroyShip(shipId: number) {
    const index = ships.findIndex((ship) => ship.id === shipId);
    if (index !== -1) {
        ships.remove(index);
    }
}

tickShipMovement();
