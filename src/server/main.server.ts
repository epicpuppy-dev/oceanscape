import { Players, Workspace } from "@rbxts/services";
import { GamePlayer } from "shared/player";
import { Ship } from "shared/ship";
import { World } from "shared/world";
import { generateDiscWorld } from "../shared/worldgen";

const W = new World(generateDiscWorld(0, 6000, 3, [100, 2000, 4000], [0, 75, 40], [1, 3, 5], [100, 1000, 2000]));

let id = 0;

function onPlayerRemoved(player: Player) {
    const gamePlayer = W.players[player.UserId]!;
    const character = player.Character;
    if (character !== undefined) onCharacterDied(gamePlayer);
}

function onCharacterDied(player: GamePlayer) {
    if (player.shipId === undefined) return;
    const ship = W.ships[player.shipId!];
    player.player.Character!.WaitForChild("HumanoidRootPart").WaitForChild("Attachment").Destroy();
    if (ship !== undefined) destroyShip(ship.id);
}

function onPlayerAdded(player: Player) {
    const gamePlayer = new GamePlayer(player);
    W.addPlayer(gamePlayer);
    function characterAdded(character: Model) {
        //Disable player animations
        character.WaitForChild("Animate").Destroy();
        wait(0.1);
        //Initialize ship class
        const ship = new Ship(
            W.anchor,
            ++id,
            character,
            character.PrimaryPart!.CFrame.LookVector.Y,
            32,
            2.86,
            2,
            2.86,
            200,
            300,
            gamePlayer,
        );
        W.addShip(ship);
        (player.Character!.WaitForChild("Humanoid") as Humanoid).Died.Connect(() =>
            onCharacterDied(W.players[player.UserId]!),
        );
    }
    player.CharacterAdded.Connect(characterAdded);
    if (player.Character !== undefined) characterAdded(player.Character);
    wait(1);
    W.sendMapData(gamePlayer);
}

function tickShipMovement() {
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const dt = wait(0.05)[0];
        for (const ship of pairs(W.ships)) {
            ship[1].TickMovement(dt);
        }
    }
}

function destroyShip(shipId: number) {
    const ship = W.ships[shipId];
    if (ship !== undefined) W.ships[shipId] = undefined;
}

for (const player of Players.GetPlayers()) {
    onPlayerAdded(player);
}
Players.PlayerAdded.Connect(onPlayerAdded);
Players.PlayerRemoving.Connect(onPlayerRemoved);

tickShipMovement();
