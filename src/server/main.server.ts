import { Players } from "@rbxts/services";
import { Ship } from "shared/ship";

const ships: Ship[] = [];
let id = 0;

function onPlayerAdded(player: Player) {
    player.CharacterAdded.Connect((character) => {
        wait(1);
        //Initialize ship class
        const ship = new Ship(
            ++id,
            character,
            character.PrimaryPart!.CFrame.LookVector.Y,
            25,
            1,
            3,
            0.3,
            character.PrimaryPart!.Position.X,
            character.PrimaryPart!.Position.Z,
        );
        ships.push(ship);
    });
}

Players.PlayerAdded.Connect(onPlayerAdded);

function tickShipMovement() {
    const dt = wait(0.05)[0];
    ships.forEach((ship) => ship.TickMovement(dt));
    tickShipMovement();
}

tickShipMovement();
