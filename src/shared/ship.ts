import { InsertService, ReplicatedStorage } from "@rbxts/services";
import { Turret } from "./turret";

const DRAG = 0.1;
const TURN_DRAG = 0.05;

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
    armor: number;
    maxArmor: number;
    hull: number;
    maxHull: number;
    model: Model;
    turrets: Turret[] = [];

    constructor(
        id: number,
        model: Model,
        heading: number,
        maxSpeed: number,
        maxRudder: number,
        acceleration: number,
        turnSpeed: number,
        armor: number,
        hull: number,
        turrets: number,
    ) {
        this.id = id;
        this.model = model;
        this.heading = heading % 360;
        this.maxSpeed = maxSpeed;
        this.maxRudder = maxRudder;
        this.acceleration = acceleration;
        this.turnSpeed = turnSpeed;
        this.armor = armor;
        this.maxArmor = armor;
        this.hull = hull;
        this.maxHull = hull;

        for (let i = 0; i < turrets; i++) {
            const attachment = this.model.WaitForChild("Hardpoints").WaitForChild("Turret" + i) as Attachment;
            const turret = new Turret(
                20, //dmg
                10, //reload
                5.8, //range
                90, //rotation
                0, //heading
                0, //angle
                238.5, //velocity
                18111406054, //model
                this,
                attachment,
            );
            this.turrets.push(turret);
        }
        // Set all attributes to pass to client
        model.SetAttribute("id", this.id);
        model.SetAttribute("heading", this.heading);
        model.SetAttribute("speed", this.speed);
        model.SetAttribute("rudder", this.rudder);
        model.SetAttribute("maxSpeed", this.maxSpeed);
        model.SetAttribute("maxRudder", this.maxRudder);
        model.SetAttribute("acceleration", this.acceleration);
        model.SetAttribute("turnSpeed", this.turnSpeed);
        model.SetAttribute("armor", this.armor);
        model.SetAttribute("maxArmor", this.maxArmor);
        model.SetAttribute("hull", this.hull);
        model.SetAttribute("maxHull", this.maxHull);

        // Setup remote event for movement updates
        (ReplicatedStorage.WaitForChild("MovementUpdateEvent") as RemoteEvent).OnServerEvent.Connect(
            (player, shipId, targetPower, targetTurn) => {
                if (typeIs(shipId, "number") && shipId === this.id) {
                    if (typeIs(targetPower, "number")) this.targetPower = targetPower;
                    if (typeIs(targetTurn, "number")) this.targetTurn = targetTurn;
                }
            },
        );

        model.PrimaryPart!.CFrame = new CFrame(model.PrimaryPart!.Position.X, 2, model.PrimaryPart!.Position.Z);
    }

    TickMovement(dt: number) {
        // Update speed
        this.speed =
            this.speed +
            this.acceleration *
                this.targetPower *
                math.abs((this.maxSpeed * this.targetPower - this.speed) / this.maxSpeed) *
                dt;
        if (this.speed > 0 && this.speed > this.maxSpeed * this.targetPower)
            this.speed -= DRAG * (this.speed - this.maxSpeed * this.targetPower) * dt;
        else if (this.speed < 0 && this.speed < this.maxSpeed * this.targetPower)
            this.speed -= DRAG * (this.speed - this.maxSpeed * this.targetPower) * dt;
        if (math.abs(this.rudder) > 0.1) {
            this.speed -= TURN_DRAG * this.speed * (math.abs(this.rudder) / this.maxRudder) * dt;
        }
        this.speed = math.clamp(math.round(this.speed * 10000) / 10000, -0.5 * this.maxSpeed, this.maxSpeed);
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

        // Update model velocity
        (this.model.PrimaryPart!.WaitForChild("LinearVelocity") as LinearVelocity).PlaneVelocity = new Vector2(
            math.sin(math.rad(-this.heading)) * this.speed * 0.503,
            math.cos(math.rad(-this.heading)) * this.speed * 0.503,
        );

        // Update model orientation
        (this.model.PrimaryPart!.WaitForChild("AlignOrientation") as AlignOrientation).CFrame = new CFrame(
            this.model.PrimaryPart!.Position,
            this.model.PrimaryPart!.Position.add(
                new Vector3(math.sin(math.rad(-this.heading)), 0, math.cos(math.rad(-this.heading))),
            ),
        );

        // Update model attributes
        this.model.SetAttribute("heading", this.heading);
        this.model.SetAttribute("speed", this.speed);
        this.model.SetAttribute("rudder", this.rudder);
    }

    DamageShip(damage: number) {
        let damageLeft = damage;

        if (this.armor > 0) {
            const percentAbsorbed = math.min((3 * this.armor) / this.maxArmor + 0.25, 1);

            const absorbed = math.min(math.round(percentAbsorbed * damage * 100) / 100, this.armor);
            this.armor = math.max(this.armor - absorbed, 0);
            damageLeft -= absorbed;
        }
        // Apply remaining damage to hull
        this.hull = math.max(this.hull - damageLeft, 0);
        // If hull is 0, destroy the ship
        if (this.hull <= 0) {
            this.DestroyShip();
        }

        // Update model attributes
        this.model.SetAttribute("armor", this.armor);
        this.model.SetAttribute("hull", this.hull);
    }

    DestroyShip() {
        (this.model.WaitForChild("Humanoid") as Humanoid).Health = 0;
    }
}
