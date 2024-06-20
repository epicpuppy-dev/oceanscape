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
        // Attach to ship
        this.servo = new Instance("HingeConstraint");
        this.servo.Parent = this.model.PrimaryPart!;
        this.servo.Attachment0 = this.model.PrimaryPart!.FindFirstChild("MountAttachment") as Attachment;
        this.servo.Attachment1 = attachment;
        // Setup servo
        this.servo.ActuatorType = Enum.ActuatorType.Servo;
        this.servo.AngularSpeed = 1000;
        this.servo.ServoMaxTorque = 10000;
    }
    TickTurret(dt: number) {
        // Code to rotate turret towards target
        this.targetHeading = this.ship.cameraHeading;
        this.targetAngle = math.asin(((9.81 * this.targetDistance) / this.velocity) ^ 2) / 2;
        const delta = this.targetHeading - this.heading;
        this.heading += math.clamp(delta, -this.rotationSpeed * dt, this.rotationSpeed * dt);
        const delta2 = this.targetAngle - this.angle;
        this.angle += math.clamp(delta2, -this.rotationSpeed * dt, this.rotationSpeed * dt);
        this.servo.TargetAngle = this.heading;
        print(this.heading, this.angle);
    }
}
