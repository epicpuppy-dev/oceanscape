import { ReplicatedStorage } from "@rbxts/services";

const event = ReplicatedStorage.WaitForChild("PacketEvent") as RemoteEvent;

export function sendPacketC2S<T>(name: string, packet: T) {
    event.FireServer(name, packet);
}

export function sendPacketS2C<T>(player: Player, name: string, packet: T) {
    event.FireClient(player, name, packet);
}

export function listenPacketC2S<T>(packet: string, callback: (player: Player, packet: T) => void) {
    event.OnServerEvent.Connect((player: Player, ...args: unknown[]) => {
        const [name, data] = args;
        if (name === packet) {
            callback(player, data as T);
        }
    });
}

export function listenPacketS2C<T>(packet: string, callback: (packet: T) => void) {
    event.OnClientEvent.Connect((name: string, data: T) => {
        if (name === packet) {
            callback(data);
        }
    });
}
