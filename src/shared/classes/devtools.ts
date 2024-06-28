import { listenPacketC2S } from "shared/util/network";
import { World } from "./world";

type DevObject =
    | {
          [key: string]: unknown | undefined;
      }
    | undefined;

export class DevTools {
    query: { [key: string]: unknown | undefined } | undefined;
    world: World;

    constructor(world: World) {
        this.world = world;

        listenPacketC2S<Packet.DevCommand>("DevCommand", (player, packet) => {
            //hardcoded dev users
            if (![1077566183, 310943157].includes(player.UserId)) return;
            this.parseCommand(player, packet.command);
        });
    }

    parseCommand(player: Player, command: string) {
        let args = command.split(" ");
        const flags = args.filter((arg) => arg.sub(0, 1) === "-");
        args = args.filter((arg) => arg.sub(0, 1) !== "-");
        const cmd = args.shift();
        switch (cmd) {
            case "get":
                if (args.size() === 0) {
                    warn("No query provided");
                    return;
                }
                if (args[0] === "world") {
                    this.query = this.world as unknown as DevObject;
                } else if (this.query !== undefined) {
                    let text: number | string = args[0];
                    const number = tonumber(text);
                    if (number !== undefined) text = number;
                    this.query = this.query[text] as DevObject;
                }
                break;
            case "give":
                if (args.size() < 2) {
                    warn("Not enough arguments");
                    return;
                }
                if (args[0] === "ship") {
                    const gamePlayer = this.world.players[player.UserId]!;
                    gamePlayer.inventory!.addShip(args[1], 100, 100);
                } else if (args[0] === "item") {
                    if (args.size() < 3) {
                        warn("Not enough arguments");
                        return;
                    }
                } else {
                    warn("Unknown type: " + args[0]);
                }
                break;
            default:
                warn("Unknown command: " + cmd);
        }
    }
}
