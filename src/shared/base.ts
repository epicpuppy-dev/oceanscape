import { Island } from "./island";
import { importModel } from "./util";

export class Base {
    variant: string;
    model: Model;
    components: { [key: string]: Model };
    island: Island;

    constructor(variant: string, island: Island) {
        this.variant = variant;
        this.island = island;
        this.model = new Instance("Model");
        this.model.Parent = this.island.model;
        this.components = {
            foundation: addComponent(this, 18135184738),
        };
        this.model.MoveTo(new Vector3(island.x, 0, island.y));
        const constraint = new Instance("RigidConstraint");
        constraint.Parent = this.model;
        constraint.Attachment0 = this.components.foundation.PrimaryPart!.WaitForChild("IslandAttachment") as Attachment;
        constraint.Attachment1 = this.island.model.PrimaryPart!.WaitForChild("BaseAttachment") as Attachment;
    }
}

function addComponent(base: Base, assetId: number) {
    const component = importModel(assetId);
    component.Parent = base.model;
    return component;
}
