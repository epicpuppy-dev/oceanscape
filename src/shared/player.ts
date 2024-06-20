export class GamePlayer {
    state: PlayerState = PlayerState.Base;
    shipId: number | undefined;
    ship: Model | undefined;
    player: Player;

    constructor(player: Player) {
        this.player = player;
    }

    addShip(ship: Model) {
        this.ship = ship;
        const id = ship.GetAttribute("id");
        if (typeIs(id, "number")) this.shipId = id;
        else {
            ship.GetAttributeChangedSignal("id").Wait();
            this.shipId = ship.GetAttribute("id") as number;
        }
        ship.SetAttribute("speed", 0);
        ship.SetAttribute("heading", 0);
        ship.SetAttribute("rudder", 0);
        ship.SetAttribute("targetPower", 0);
        ship.SetAttribute("targetTurn", 0);
    }

    removeShip() {
        this.ship = undefined;
        this.shipId = undefined;
    }
}

export enum PlayerState {
    Base,
    Ship,
    Dead,
}
