import { Base } from "./base";
import { importModel } from "../util/util";

export class Island {
    variant: string;
    x: number;
    y: number;
    orientation: number;
    model: Model;
    base: Base | undefined;

    constructor(
        variant: string,
        x: number,
        y: number,
        orientation: number,
        parent: Instance,
        base: boolean,
        baseId?: number,
    ) {
        this.variant = variant;
        this.x = x;
        this.y = y;
        this.orientation = orientation;
        this.model = importModel(17900649471);
        this.model.Parent = parent;
        if (base) {
            this.base = new Base(baseId!, this.variant, this);
        } else {
            this.base = undefined;
        }
        this.model.PrimaryPart!.CFrame = new CFrame(new Vector3(this.x, -2, this.y)).mul(
            CFrame.Angles(0, math.rad(this.orientation), 0),
        );
    }
}
