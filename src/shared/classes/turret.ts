import { InsertService, ReplicatedStorage, Workspace } from "@rbxts/services";
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
    barrelServo: HingeConstraint;
    ship: Ship;
    reloading: number = 0;

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
        this.barrelServo = this.model.WaitForChild("Barrel").WaitForChild("HingeConstraint") as HingeConstraint;
    }
    TickTurret(dt: number) {
        // Code to rotate turret towards target
        this.targetHeading = (-this.ship.cameraHeading + 90 + this.ship.heading) % 360;
        this.targetDistance = this.ship.cameraFocus;
        this.targetAngle = math.deg(math.asin(((9.81 / 5) * this.targetDistance) / this.velocity ** 2) / 2);
        const headingDeltaCW = this.targetHeading - this.heading;
        let headingDeltaCCW = this.targetHeading - this.heading + 360;
        if (headingDeltaCCW > 360) headingDeltaCCW -= 720;
        const delta = math.abs(headingDeltaCW) < math.abs(headingDeltaCCW) ? headingDeltaCW : headingDeltaCCW;
        this.heading += math.round(math.clamp(delta, -this.rotationSpeed * dt, this.rotationSpeed * dt) * 100) / 100;
        this.heading = this.heading % 360;
        const angleDelta = this.targetAngle - this.angle;
        this.angle += math.clamp(angleDelta, -this.rotationSpeed * dt, this.rotationSpeed * dt);
        if (this.angle > 30 || this.angle !== this.angle) {
            this.angle = 30;
        }
        this.servo.TargetAngle = this.heading;
        this.barrelServo.TargetAngle = this.angle;
        if (this.reloading > 0) {
            this.reloading -= dt;
        }
    }
    FireTurret() {
        // Code to fire turret
        if (this.reloading > 0) return;
        const bullet = new Instance("Part");
        const barrel = this.model.WaitForChild("Barrel") as BasePart;
        bullet.Parent = Workspace.WaitForChild("Bullets");
        bullet.Size = new Vector3(0.2, 0.2, 0.2);
        bullet.Material = Enum.Material.Neon;
        bullet.Color = Color3.fromRGB(255, 153, 0);
        bullet.Position = barrel.Position;
        bullet.Orientation = barrel.Orientation;
        const firingDir = barrel.CFrame.mul(CFrame.Angles(0, math.rad(-90), 0));
        bullet.ApplyImpulse(firingDir.LookVector.mul(this.velocity * bullet.Mass));
        print("firing");
        this.reloading = this.reloadTime;
    }
}
