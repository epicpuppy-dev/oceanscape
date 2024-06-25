import Roact from "@rbxts/roact";

const headingLabels = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

interface SpeedDisplayProps {
    speed: number;
    targetPower: number;
}

export function SpeedDisplay(props: SpeedDisplayProps) {
    let speedText = tostring(math.round(props.speed * 10) / 10);
    if (speedText.split(".").size() === 1) speedText += ".0";
    return (
        <screengui>
            <frame Size={new UDim2(0, 160, 0, 150)} Position={new UDim2(0, 0, 1, -150)}>
                <textlabel
                    Size={new UDim2(1, 0, 0, 30)}
                    Position={new UDim2(0, 0, 1, -30)}
                    TextSize={16}
                    Text={speedText + " kts"}
                />
                <PowerBar targetPower={props.targetPower} />
            </frame>
        </screengui>
    );
}

interface PowerBarProps {
    targetPower: number;
}

function PowerBar(props: PowerBarProps) {
    const segments = [];
    for (let i = 0; i < 5; i++) {
        let color = Color3.fromRGB(50, 50, 50);
        if (i === 4 && props.targetPower < 0) color = Color3.fromRGB(255, 255, 50);
        else if (i < 4 && (3 - i) * 0.25 < props.targetPower) color = Color3.fromRGB(50, 255, 50);
        segments.push(
            <frame Size={new UDim2(1, 0, 0, 30)} Position={new UDim2(0, 0, 0, i * 30)} BackgroundColor3={color} />,
        );
    }
    return (
        <frame Size={new UDim2(0, 10, 0, 150)} Position={new UDim2(0, 150, 1, -150)}>
            {segments}
        </frame>
    );
}

interface HeadingDisplayProps {
    heading: number;
}

export function HeadingDisplay(props: HeadingDisplayProps) {
    const headingIndex = math.floor((props.heading + 22.5) / 45) % 8;
    return (
        <screengui>
            <frame Size={new UDim2(0, 150, 0, 30)} Position={new UDim2(0.5, -75, 0, 0)}>
                <textlabel
                    Size={new UDim2(1, 0, 1, 0)}
                    Position={new UDim2(0, 0, 0, 0)}
                    TextSize={16}
                    Text={headingLabels[headingIndex] + " " + math.round(props.heading) + "°"}
                />
            </frame>
        </screengui>
    );
}

interface TurnBarProps {
    rudder: number;
    maxRudder: number;
    targetTurn: number;
}

export function TurnBar(props: TurnBarProps) {
    if (props.rudder === 0 && props.targetTurn === 0) return <screengui />;
    let pos: UDim2;
    let size: UDim2;
    if (props.rudder >= 0) {
        pos = new UDim2(0.5, -0.5, 0, 0);
        size = new UDim2(0, (props.rudder / props.maxRudder) * 75, 1, 0);
    } else {
        pos = new UDim2(0.5, (props.rudder / props.maxRudder) * 75, 0, 0);
        size = new UDim2(0, (-props.rudder / props.maxRudder) * 75, 1, 0);
    }
    return (
        <screengui>
            <frame Size={new UDim2(0, 150, 0, 10)} Position={new UDim2(0.5, -75, 1, -60)}>
                <frame Size={size} Position={pos} BackgroundColor3={Color3.fromRGB(50, 50, 255)} />
            </frame>
        </screengui>
    );
}

interface ShipStatusProps {
    armor: number;
    maxArmor: number;
    hull: number;
    maxHull: number;
}

export function ShipStatus(props: ShipStatusProps) {
    return (
        <screengui>
            <frame
                Size={new UDim2(0, 250, 0, 40)}
                Position={new UDim2(0.5, -125, 1, -40)}
                BackgroundColor3={Color3.fromRGB(155, 155, 155)}
                BackgroundTransparency={1}
            >
                <frame
                    Size={new UDim2(1, 0, 0, 20)}
                    Position={new UDim2(0, 0, 0, 0)}
                    BackgroundColor3={Color3.fromRGB(125, 125, 125)}
                >
                    <frame
                        Size={new UDim2(props.armor / props.maxArmor, 0, 0, 20)}
                        Position={new UDim2(0, 0, 0, 0)}
                        BackgroundColor3={Color3.fromRGB(255, 255, 255)}
                        BorderSizePixel={0}
                    />
                </frame>
                <frame
                    Size={new UDim2(1, 0, 0, 20)}
                    Position={new UDim2(0, 0, 0, 20)}
                    BackgroundColor3={Color3.fromRGB(125, 25, 25)}
                >
                    <frame
                        Size={new UDim2(props.hull / props.maxHull, 0, 0, 20)}
                        Position={new UDim2(0, 0, 0, 0)}
                        BackgroundColor3={Color3.fromRGB(255, 50, 50)}
                        BorderSizePixel={0}
                    />
                </frame>
                <textlabel
                    Size={new UDim2(0, 50, 0, 20)}
                    Position={new UDim2(1, -53, 0, 0)}
                    TextSize={10}
                    TextXAlignment={Enum.TextXAlignment.Right}
                    Text={tostring(math.round(props.armor))}
                    BackgroundTransparency={1}
                    TextColor3={Color3.fromRGB(0, 0, 0)}
                />
                <textlabel
                    Size={new UDim2(0, 50, 0, 20)}
                    Position={new UDim2(1, -53, 0, 20)}
                    TextSize={10}
                    TextXAlignment={Enum.TextXAlignment.Right}
                    Text={tostring(math.round(props.hull))}
                    BackgroundTransparency={1}
                    TextColor3={Color3.fromRGB(0, 0, 0)}
                />
                <textlabel
                    Size={new UDim2(0, 50, 0, 20)}
                    Position={new UDim2(0, 5, 0, 0)}
                    TextSize={10}
                    TextXAlignment={Enum.TextXAlignment.Left}
                    Text={tostring(math.round((props.armor / props.maxArmor) * 100)) + "%"}
                    BackgroundTransparency={1}
                    TextColor3={Color3.fromRGB(0, 0, 0)}
                />
                <textlabel
                    Size={new UDim2(0, 50, 0, 20)}
                    Position={new UDim2(0, 5, 0, 20)}
                    TextSize={10}
                    TextXAlignment={Enum.TextXAlignment.Left}
                    Text={tostring(math.round((props.hull / props.maxHull) * 100)) + "%"}
                    BackgroundTransparency={1}
                    TextColor3={Color3.fromRGB(0, 0, 0)}
                />
            </frame>
        </screengui>
    );
}

export function Crosshair() {
    return (
        <screengui>
            <frame
                Size={new UDim2(0, 2, 0, 2)}
                Position={new UDim2(0.5, -1, 0.5, -1)}
                BackgroundColor3={Color3.fromRGB(255, 255, 255)}
                BorderSizePixel={0}
            />
        </screengui>
    );
}
