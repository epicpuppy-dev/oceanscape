import { DataStoreService, Players, Workspace } from "@rbxts/services";
import { GamePlayer } from "shared/classes/player";
import { World } from "shared/classes/world";
import { generateDiscWorld } from "../shared/util/worldgen";

const inventoryStore = DataStoreService.GetDataStore("Inventory");

Players.CharacterAutoLoads = false;

function generateFolder(name: string) {
    const folder = new Instance("Folder");
    folder.Name = name;
    folder.Parent = Workspace;
    return folder;
}

generateFolder("Islands");
generateFolder("Bullets");

const W = new World(generateDiscWorld(1, 6000, 3, [100, 2000, 4000], [0, 75, 40], [1, 3, 5], [100, 1000, 2000]));

function onPlayerRemoved(player: Player) {
    const gamePlayer = W.players[player.UserId]!;
    const character = player.Character;
}

function onPlayerAdded(player: Player) {
    const gamePlayer = new GamePlayer(player, W, inventoryStore);
    W.addPlayer(gamePlayer);
    gamePlayer.spawnShip(18198556467);
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
