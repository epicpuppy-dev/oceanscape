export class Inventory {
    nextId: number = 0;
    ships: ShipItem[] = [];
    items: InventoryItem[] = [];
    all: { [key: string]: ShipItem | InventoryItem } = {};

    addShip(shipId: string, armor: number, hull: number) {
        const ship = new ShipItem(this, shipId, armor, hull);
        this.ships.push(ship);
        this.all[ship.inventoryId] = ship;
    }

    removeShip(shipId: string) {
        const ship = this.ships.find((s) => s.shipId === shipId);
        if (ship !== undefined) {
            this.ships = this.ships.filter((s) => s !== ship);
            delete this.all[ship.inventoryId];
            return true;
        }
        return false;
    }

    addItem(itemId: string, count: number) {
        const check = this.items.find((i) => i.itemId === itemId);
        if (check !== undefined) {
            return false;
        }
        const item = new InventoryItem(this, itemId, count);
        this.items.push(item);
        this.all[item.inventoryId] = item;
        return item;
    }

    gainItem(itemId: string, count: number) {
        const item = this.items.find((i) => i.itemId === itemId);
        if (item !== undefined) {
            item.count += count;
            return item;
        } else {
            const item = this.addItem(itemId, count);
            return item;
        }
    }

    removeItem(itemId: string) {
        const item = this.items.find((i) => i.itemId === itemId);
        if (item !== undefined) {
            this.items = this.items.filter((i) => i !== item);
            delete this.all[item.inventoryId];
            return true;
        }
        return false;
    }

    loseItem(itemId: string, count: number) {
        const item = this.items.find((i) => i.itemId === itemId);
        if (item !== undefined) {
            item.count -= count;
            if (item.count <= 0) {
                this.removeItem(itemId);
                return false;
            }
            return item;
        }
    }
}

class ShipItem {
    type: string = "ship";
    inventoryId: number;
    shipId: string;
    armor: number;
    hull: number;

    constructor(inventory: Inventory, shipId: string, armor: number, hull: number) {
        this.inventoryId = ++inventory.nextId;
        this.shipId = shipId;
        this.armor = armor;
        this.hull = hull;
    }
}

class InventoryItem {
    type: string = "item";
    inventoryId: number;
    itemId: string;
    count: number;

    constructor(inventory: Inventory, itemId: string, count: number) {
        this.inventoryId = ++inventory.nextId;
        this.itemId = itemId;
        this.count = count;
    }
}
