import { ReplicatedStorage, Workspace } from "@rbxts/services";
import { Base } from "./base";
import { Island } from "./island";
import { GamePlayer } from "./player";
import { Ship } from "./ship";
import { MapData } from "./map";
import { sendPacketS2C } from "shared/util/network";

export class World {
    islands: Island[] = [];
    bases: { [key: string]: Base | undefined } = {};
    ships: { [key: string]: Ship | undefined } = {};
    nextShipId: number = 0;
    map: MapData = new MapData();
    players: { [key: string]: GamePlayer | undefined } = {};
    anchor: Attachment;

    constructor(islands: Island[]) {
        islands.forEach((island) => {
            this.islands.push(island);
            if (island.base) {
                this.bases[island.base.id] = island.base;
                this.map.addBase(island.base.getMapData());
            }
        });
        this.anchor = new Instance("Attachment");
        this.anchor.Parent = Workspace.Terrain;
        this.anchor.WorldCFrame = new CFrame(0, 0, 0).mul(CFrame.Angles(0, 0, math.rad(90)));
    }

    addPlayer(player: GamePlayer) {
        this.players[player.id] = player;
    }

    addShip(ship: Ship) {
        this.ships[ship.id] = ship;
    }

    findShip(condition: (ship: Ship) => boolean) {
        for (const ship of pairs(this.ships)) {
            if (condition(ship[1])) return ship;
        }
        return undefined;
    }

    sendMapData(player: GamePlayer) {
        // send all bases
        for (const base of pairs(this.bases)) {
            if (base[1] !== undefined) {
                // send base data
                const data = base[1].getMapData();
                sendPacketS2C<Packet.MapUpdate>(player.player, "MapUpdate", { property: "base", data });
            }
        }
    }
}
