import { Players, Workspace } from "@rbxts/services";
import { GamePlayer } from "shared/player";
import { World } from "shared/world";
import { generateDiscWorld } from "../shared/worldgen";

Players.CharacterAutoLoads = false;

const W = new World(generateDiscWorld(1, 6000, 3, [100, 2000, 4000], [0, 75, 40], [1, 3, 5], [100, 1000, 2000]));

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
    gamePlayer.spawnShip(W, ++id, 18198556467);
    wait(1);
    W.sendMapData(gamePlayer);
}

function tickShipMovement() {
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const dt = wait(0.05)[0];
        for (const ship of pairs(W.ships)) {
            ship[1].TickShip(dt);
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
