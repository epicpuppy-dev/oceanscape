import { ReplicatedStorage } from "@rbxts/services";

export class Turret {
    damage: number; // Damage per shot
    reloadTime: number; // Time between shots
    range: number; // Maximum range
    rotationSpeed: number; // Degrees per second
    heading: number; // Current heading
    targetHeading: number; // Target heading
    angle: number; // Angle of fire
    targetAngle: number; // Target angle of fire
    velocity: number; // Speed of projectile
    targetDistance: number; // Distance to target

    constructor(
        damage: number,
        reloadTime: number,
        range: number,
        rotationSpeed: number,
        heading: number,
        angle: number,
        velocity: number,
        targetDistance: number,
    ) {
        this.damage = damage;
        this.reloadTime = reloadTime;
        this.range = range;
        this.rotationSpeed = rotationSpeed;
        this.heading = heading;
        this.targetHeading = heading;
        this.angle = angle;
        this.targetAngle = angle;
        this.velocity = velocity;
        this.targetDistance = targetDistance;
    }
    TickTurret(dt: number) {
        // Code to rotate turret towards target
        this.targetAngle = math.asin(((9.81 * this.targetDistance) / this.velocity) ^ 2) / 2;
        const delta = this.targetHeading - this.heading;
        this.heading += math.clamp(delta, -this.rotationSpeed * dt, this.rotationSpeed * dt);
        const delta2 = this.targetAngle - this.angle;
        this.angle += math.clamp(delta2, -this.rotationSpeed * dt, this.rotationSpeed * dt);
    }
}
