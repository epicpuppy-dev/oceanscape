import { ReplicatedStorage } from "@rbxts/services";

export class Ship {
    id: number;
    speed: number = 0; //kts = 0.503 studs/s
    heading: number; //degrees
    rudder: number = 0; //degrees/1 stud
    maxSpeed: number; //kts
    maxRudder: number; //degrees/1 stud
    acceleration: number; //kts/s
    turnSpeed: number; //degrees/1 stud/s
    targetPower: number = 0; //0 to 1
    targetTurn: number = 0; //-1 to 1
    x: number;
    y: number;
    z: number;
    model: Model;

    constructor(
        id: number,
        model: Model,
        heading: number,
        maxSpeed: number,
        maxRudder: number,
        acceleration: number,
        turnSpeed: number,
        x: number,
        z: number,
    ) {
        this.id = id;
        this.model = model;
        this.heading = heading % 360;
        this.maxSpeed = maxSpeed;
        this.maxRudder = maxRudder;
        this.acceleration = acceleration;
        this.turnSpeed = turnSpeed;
        this.x = x;
        this.y = 38.2;
        this.z = z;

        // Setup model for tweening
        model.SetAttribute("id", this.id);
        model.SetAttribute("heading", this.heading);
        model.SetAttribute("speed", this.speed);
        model.SetAttribute("rudder", this.rudder);

        // Setup remote event for movement updates
        (ReplicatedStorage.WaitForChild("MovementUpdateEvent") as RemoteEvent).OnServerEvent.Connect(
            (player, shipId, targetPower, targetTurn) => {
                if (typeIs(shipId, "number") && shipId === this.id) {
                    if (typeIs(targetPower, "number")) this.targetPower = targetPower;
                    if (typeIs(targetTurn, "number")) this.targetTurn = targetTurn;
                }
            },
        );
    }

    TickMovement(dt: number) {
        // Update speed
        this.speed =
            this.speed +
            this.acceleration *
                this.targetPower *
                ((this.maxSpeed * this.targetPower - this.speed) / this.maxSpeed) *
                dt;
        this.speed = math.clamp(math.round(this.speed * 100) / 100, 0, this.maxSpeed);
        // Calculate distance moved
        const distance = this.speed * 0.503 * dt;
        // Update heading
        if (this.targetTurn * this.maxRudder > this.rudder)
            this.rudder =
                math.round(math.min(this.rudder + this.turnSpeed * dt, this.targetTurn * this.maxRudder) * 100) / 100;
        if (this.targetTurn * this.maxRudder < this.rudder)
            this.rudder =
                math.round(math.max(this.rudder - this.turnSpeed * dt, this.targetTurn * this.maxRudder) * 100) / 100;
        this.heading = (math.round((this.heading + this.rudder * distance) * 10) / 10) % 360;
        // Update position
        this.x = math.round((this.x + distance * math.cos(math.rad(this.heading - 90))) * 100) / 100;
        this.z = math.round((this.z + distance * math.sin(math.rad(this.heading - 90))) * 100) / 100;
        // Move model
        this.model.PrimaryPart!.CFrame = new CFrame(this.x, this.y, this.z).mul(
            CFrame.Angles(0, math.rad(-this.heading), 0),
        );

        // Update model attributes
        this.model.SetAttribute("heading", this.heading);
        this.model.SetAttribute("speed", this.speed);
        this.model.SetAttribute("rudder", this.rudder);
    }
}
