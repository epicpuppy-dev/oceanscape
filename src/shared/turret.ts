import { InsertService, ReplicatedStorage } from "@rbxts/services";
import { Ship } from "./ship";

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
    model: Model;
    servo: HingeConstraint;
    ship: Ship;

    constructor(
        damage: number,
        reloadTime: number,
        range: number,
        rotationSpeed: number,
        heading: number,
        angle: number,
        velocity: number,
        modelID: number,
        ship: Ship,
        attachment: Attachment,
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
        this.targetDistance = 100;
        this.model = InsertService.LoadAsset(modelID).GetChildren()[0] as Model;
        this.ship = ship;

        this.model.Parent = this.ship.model;

        // Scale turret model
        this.model.ScaleTo(0.2);
        this.model.MoveTo(
            new Vector3(this.ship.model.PrimaryPart!.Position.X, 4, this.ship.model.PrimaryPart!.Position.Z),
        );

        // Fix servo issue
        this.model.PrimaryPart!.CanCollide = false;

        // Attach to ship
        this.servo = new Instance("HingeConstraint");
        this.servo.Parent = this.model.PrimaryPart!;
        this.servo.Attachment0 = this.model.PrimaryPart!.FindFirstChild("MountAttachment") as Attachment;
        this.servo.Attachment1 = attachment;
        // Setup servo
        this.servo.ActuatorType = Enum.ActuatorType.Servo;
        this.servo.AngularSpeed = 1000;
        this.servo.ServoMaxTorque = 100000;
    }
    TickTurret(dt: number) {
        // Code to rotate turret towards target
        this.targetHeading = (-this.ship.cameraHeading + 90) % 360;
        this.targetAngle = math.asin(((9.81 * this.targetDistance) / this.velocity) ** 2) / 2;
        const headingDeltaCW = this.targetHeading - this.heading;
        let headingDeltaCCW = this.targetHeading - this.heading + 360;
        if (headingDeltaCCW > 360) headingDeltaCCW -= 720;
        print(math.round(headingDeltaCW), math.round(headingDeltaCCW));
        const delta = math.abs(headingDeltaCW) < math.abs(headingDeltaCCW) ? headingDeltaCW : headingDeltaCCW;
        this.heading += math.round(math.clamp(delta, -this.rotationSpeed * dt, this.rotationSpeed * dt) * 100) / 100;
        this.heading = this.heading % 360;
        const angleDelta = this.targetAngle - this.angle;
        this.angle += math.clamp(angleDelta, -this.rotationSpeed * dt, this.rotationSpeed * dt);
        this.servo.TargetAngle = this.heading;
    }
}
