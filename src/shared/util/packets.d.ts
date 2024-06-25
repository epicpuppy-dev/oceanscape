declare namespace Packet {
    type MovementUpdate = {
        shipId: number;
        targetPower: number;
        targetTurn: number;
    };
    type CameraUpdate = {
        shipId: number;
        cameraHeading: number;
        cameraFocus: number;
    };
    type MapUpdate = {
        property: string;
        data: { [key: string]: string | number | boolean };
    };
    type DockRequest = {
        shipId: number;
    };
    type ShipSpawn = {
        shipId: number;
    };
    type WeaponFire = {
        shipId: number;
    };
}
