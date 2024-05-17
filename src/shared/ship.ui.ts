import { RunService } from "@rbxts/services";

const headingLabels = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

export class ShipUI {
    gui: ScreenGui;
    speedBox: Frame;
    speed: TextLabel;
    headingBox: Frame;
    heading: TextLabel;
    powerBar: Frame;
    powerSegments: Frame[];
    turnBar: Frame;
    turnCurrent: Frame;

    constructor(player: Player) {
        //Create GUI
        this.gui = new Instance("ScreenGui");
        this.gui.Parent = player.WaitForChild("PlayerGui");
        this.gui.Enabled = false;
        //Speed Display - Bottom Left
        this.speedBox = new Instance("Frame");
        this.speedBox.Size = new UDim2(0, 150, 0, 150);
        this.speedBox.Position = new UDim2(0, 0, 1, -150);
        this.speedBox.Parent = this.gui;
        this.speed = new Instance("TextLabel");
        this.speed.Size = new UDim2(1, 0, 0, 30);
        this.speed.Position = new UDim2(0, 0, 1, -30);
        this.speed.TextSize = 16;
        this.speed.Text = "0.0 kts";
        this.speed.Parent = this.speedBox;
        //Heading Display - Top Middle
        this.headingBox = new Instance("Frame");
        this.headingBox.Size = new UDim2(0, 150, 0, 30);
        this.headingBox.Position = new UDim2(0.5, -75, 0, 0);
        this.headingBox.Parent = this.gui;
        this.heading = new Instance("TextLabel");
        this.heading.Size = new UDim2(1, 0, 1, 0);
        this.heading.Position = new UDim2(0, 0, 0, 0);
        this.heading.TextSize = 16;
        this.heading.Text = "N 0°";
        this.heading.Parent = this.headingBox;
        //Power Bar - Directly right of speed display, 10px wide, split into 5 segments, each 1/5 tall
        this.powerBar = new Instance("Frame");
        this.powerBar.Size = new UDim2(0, 10, 0, 150);
        this.powerBar.Position = new UDim2(0, 150, 1, -150);
        this.powerBar.Parent = this.gui;
        this.powerSegments = new Array<Frame>(5);
        for (let i = 0; i < 5; i++) {
            this.powerSegments[i] = new Instance("Frame");
            this.powerSegments[i].Size = new UDim2(1, 0, 0, 30);
            this.powerSegments[i].Position = new UDim2(0, 0, 0, i * 30);
            this.powerSegments[i].Parent = this.powerBar;
        }
        //Turn Bar - Bottom Middle, 10px tall, 150px wide, line through the center
        this.turnBar = new Instance("Frame");
        this.turnBar.Size = new UDim2(0, 150, 0, 10);
        this.turnBar.Position = new UDim2(0.5, -75, 1, -60);
        this.turnBar.Parent = this.gui;
        this.turnCurrent = new Instance("Frame");
        this.turnCurrent.Size = new UDim2(0, 0, 1, 0);
        this.turnCurrent.Position = new UDim2(0.5, -0.5, 0, 0);
        this.turnCurrent.BackgroundColor3 = Color3.fromRGB(50, 50, 255);
        this.turnCurrent.Parent = this.turnBar;

        //Update GUI
        RunService.Heartbeat.Connect(() => {
            const ship = player.Character;
            if (typeIs(ship, "nil")) return;
            const speedValue = ship.GetAttribute("speed") as number;
            const headingValue = ship.GetAttribute("heading") as number;
            const rudderValue = ship.GetAttribute("rudder") as number;
            //Update GUI
            let speedText = tostring(math.round(speedValue * 10) / 10);
            if (speedText.split(".").size() === 1) speedText = speedText + ".0";
            this.speed.Text = `${speedText} kts`;
            const headingIndex = math.floor((headingValue + 22.5) / 45) % 8;
            this.heading.Text = `${headingLabels[headingIndex]} ${math.round(headingValue)}°`;
            if ((ship.GetAttribute("targetPower") as number) < 0) {
                this.powerSegments[4].BackgroundColor3 = Color3.fromRGB(255, 255, 50);
            } else {
                this.powerSegments[4].BackgroundColor3 = Color3.fromRGB(50, 50, 50);
            }
            for (let i = 0; i < 4; i++) {
                if ((ship.GetAttribute("targetPower") as number) > i / 4) {
                    this.powerSegments[3 - i].BackgroundColor3 = Color3.fromRGB(50, 255, 50);
                } else {
                    this.powerSegments[3 - i].BackgroundColor3 = Color3.fromRGB(50, 50, 50);
                }
            }
            if (rudderValue >= 0) {
                this.turnCurrent.Position = new UDim2(0.5, -0.5, 0, 0);
                this.turnCurrent.Size = new UDim2(
                    0,
                    (rudderValue / (ship.GetAttribute("rudderMax") as number)) * 75,
                    1,
                    0,
                );
            } else {
                this.turnCurrent.Position = new UDim2(
                    0.5,
                    (rudderValue / (ship.GetAttribute("rudderMax") as number)) * 75,
                    0,
                    0,
                );
                this.turnCurrent.Size = new UDim2(
                    0,
                    (-rudderValue / (ship.GetAttribute("rudderMax") as number)) * 75,
                    1,
                    0,
                );
            }
        });
    }
}
