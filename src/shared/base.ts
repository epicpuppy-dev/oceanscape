import { Island } from "./island";
import { BaseEntry } from "./map";
import { importModel } from "./util";

export class Base {
    id: number;
    variant: string;
    model: Model;
    components: { [key: string]: Model };
    island: Island;

    constructor(id: number, variant: string, island: Island) {
        this.id = id;
        this.variant = variant;
        this.island = island;
        this.model = new Instance("Model");
        this.model.Parent = this.island.model;
        this.components = {
            foundation: addComponent(this, 18135184738),
        };
        this.model.MoveTo(new Vector3(island.x, 0, island.y));
        const constraint = new Instance("RigidConstraint");
        constraint.Parent = this.components.foundation;
        constraint.Attachment0 = this.components.foundation.PrimaryPart!.WaitForChild("IslandAttachment") as Attachment;
        constraint.Attachment1 = this.island.model.PrimaryPart!.WaitForChild("BaseAttachment") as Attachment;
    }

    getMapData(): BaseEntry {
        const dock = this.components.foundation.WaitForChild("Dock").WaitForChild("DockingPoint") as Attachment;
        return {
            id: this.id,
            x: this.island.x,
            y: this.island.y,
            dockX: dock.WorldPosition.X,
            dockZ: dock.WorldPosition.Z,
        };
    }
}

function addComponent(base: Base, assetId: number) {
    const component = importModel(assetId);
    component.Parent = base.model;
    return component;
}
