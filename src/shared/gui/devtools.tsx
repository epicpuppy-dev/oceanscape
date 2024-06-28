import Roact from "@rbxts/roact";
import { sendPacketC2S } from "shared/util/network";

export function DevTools() {
    return (
        <screengui>
            <textbox
                Size={new UDim2(0.5, 0, 0, 16)}
                Position={new UDim2(0.25, 0, 0.5, 32)}
                TextSize={12}
                Event={{
                    InputBegan: (box, input) => {
                        if (input.KeyCode === Enum.KeyCode.Return) {
                            sendPacketC2S<Packet.DevCommand>("DevCommand", { command: box.ContentText });
                            box.Text = "";
                        }
                    },
                }}
            ></textbox>
        </screengui>
    );
}
