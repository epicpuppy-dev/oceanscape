import { HttpService } from "@rbxts/services";
import { Inventory } from "shared/classes/inventory";

type JSONObject = { [key: string]: { [key: string]: string | number | boolean }[] };

export function serializeInventory(inventory: Inventory): string {
    const jsonObject: JSONObject = {
        s: [],
        i: [],
    };

    for (const ship of inventory.ships) {
        jsonObject.s.push({
            s: ship.shipId,
            a: ship.armor,
            h: ship.hull,
        });
    }

    for (const item of inventory.items) {
        jsonObject.i.push({
            i: item.itemId,
            c: item.count,
        });
    }

    return HttpService.JSONEncode(jsonObject);
}

export function deserializeInventory(serialized: string): Inventory {
    const jsonObject: JSONObject = HttpService.JSONDecode(serialized) as JSONObject;

    const inventory = new Inventory();

    for (const ship of jsonObject.s) {
        inventory.addShip(ship.s as string, ship.a as number, ship.h as number);
    }

    for (const item of jsonObject.i) {
        inventory.addItem(item.i as string, item.c as number);
    }

    return inventory;
}
