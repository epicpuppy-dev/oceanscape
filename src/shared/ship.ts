import { ReplicatedStorage } from "@rbxts/services";
import { GamePlayer } from "./player";
import { MapData } from "./map";
import { isNil } from "./util";
import { World } from "./world";

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
    cameraHeading: number = 0;
    cameraFocus: number = 100;
    docking: boolean = false;
    dockingTime: number;
    dockingAt: number | undefined;
    timeLeft: number;
    world: World;
    player: GamePlayer | undefined;

    constructor(
        map: MapData,
        world: World,
        anchor: Attachment,
        id: number,
        model: Model,
        heading: number,
        maxSpeed: number,
        maxRudder: number,
        acceleration: number,
        turnSpeed: number,
        armor: number,
        hull: number,
        dockingTime: number,
        player?: GamePlayer,
    ) {
        this.world = world;
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
        this.dockingTime = dockingTime;
        this.timeLeft = dockingTime;
        this.player = player;

        (this.model.WaitForChild("Hull").WaitForChild("PlaneConstraint") as PlaneConstraint).Attachment0 = anchor;

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
        model.SetAttribute("docking", this.docking);
        model.SetAttribute("dockingTime", this.dockingTime);
        model.SetAttribute("timeLeft", this.timeLeft);
        model.SetAttribute("targetPower", 0);
        model.SetAttribute("targetTurn", 0);

        // Setup remote event for movement updates
        (ReplicatedStorage.WaitForChild("MovementUpdateEvent") as RemoteEvent).OnServerEvent.Connect(
            (player, shipId, targetPower, targetTurn) => {
                if (typeIs(shipId, "number") && shipId === this.id) {
                    if (typeIs(targetPower, "number")) this.targetPower = targetPower;
                    if (typeIs(targetTurn, "number")) this.targetTurn = targetTurn;
                }
            },
        );
        (ReplicatedStorage.WaitForChild("MovementUpdateEvent") as RemoteEvent).OnServerEvent.Connect(
            (player, shipId, cameraHeading, cameraFocus) => {
                if (typeIs(shipId, "number") && shipId === this.id) {
                    if (typeIs(cameraHeading, "number")) this.cameraHeading = cameraHeading;
                    if (typeIs(cameraFocus, "number")) this.cameraFocus = cameraFocus;
                }
            },
        );
        (ReplicatedStorage.WaitForChild("DockRequestEvent") as RemoteEvent).OnServerEvent.Connect((player, shipId) => {
            if (typeIs(shipId, "number") && shipId === this.id) {
                this.AttemptDock(map);
            }
        });

        model.PrimaryPart!.CFrame = new CFrame(model.PrimaryPart!.Position.X, 2, model.PrimaryPart!.Position.Z);
    }

    TickShip(dt: number) {
        // Update speed
        this.speed =
            this.speed +
            this.acceleration *
                this.targetPower *
                math.abs((this.maxSpeed * this.targetPower - this.speed) / this.maxSpeed) *
                dt;
        // Apply speed drag
        this.speed -= DRAG * (this.speed - this.maxSpeed * this.targetPower) * dt;
        // Apply fixed drag
        if (this.speed > 0 && this.speed > this.maxSpeed * this.targetPower)
            this.speed = math.max(this.speed - DRAG * dt, 0);
        else if (this.speed < 0 && this.speed < this.maxSpeed * this.targetPower)
            this.speed = math.min(this.speed + DRAG * dt, 0);
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

        if (this.docking) {
            this.timeLeft -= dt;
            if (this.timeLeft <= 0) {
                this.player!.dockAtBase(this.world, this.dockingAt!);
            }
        }

        // Update model attributes
        this.model.SetAttribute("heading", this.heading);
        this.model.SetAttribute("speed", this.speed);
        this.model.SetAttribute("rudder", this.rudder);
        this.model.SetAttribute("docking", this.docking);
        this.model.SetAttribute("timeLeft", this.timeLeft);
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

    AttemptDock(map: MapData) {
        if (this.docking) {
            this.docking = false;
            this.dockingAt = undefined;
            return;
        }
        const dockTarget = map.checkDock(this.model.PrimaryPart!.Position.X, this.model.PrimaryPart!.Position.Z, 75);
        if (dockTarget !== -1) {
            this.docking = true;
            this.dockingAt = dockTarget;
            this.timeLeft = this.dockingTime;
        }
    }
}
