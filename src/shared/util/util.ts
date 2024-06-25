import { InsertService } from "@rbxts/services";

export function importModel(modelId: number) {
    const model = InsertService.LoadAsset(modelId);
    return model.GetChildren()[0] as Model;
}

export function isNil(value: unknown) {
    return value !== value;
}
