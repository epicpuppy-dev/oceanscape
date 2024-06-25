import { ReplicatedStorage } from "@rbxts/services";

const event = ReplicatedStorage.WaitForChild("PacketEvent") as RemoteEvent;

export function sendPacketC2S(packet: string, ...args: unknown[]) {
    event.FireServer(packet, ...args);
}

export function sendPacketS2C(player: Player, packet: string, ...args: unknown[]) {
    event.FireClient(player, packet, ...args);
}

export function listenPacketC2S(packet: string, callback: (player: Player, ...args: any[]) => void) {
    event.OnServerEvent.Connect((player, p, ...args) => {
        if (p === packet) {
            callback(player, ...args);
        }
    });
}

export function listenPacketS2C(packet: string, callback: (...args: any[]) => void) {
    event.OnClientEvent.Connect((p, ...args) => {
        if (p === packet) {
            callback(...args);
        }
    });
}
