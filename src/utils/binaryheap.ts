export class BinaryHeap<T> {
    _items: T[];
    _compareFn: (a: T, b: T) => boolean;

    /**
     * Creates a binary heap with the given compare function
     * Not passing a compare function will give a min heap
     */
    constructor(compareFn = (a: T, b: T) => a < b) {
        this._compareFn = compareFn;
        this._items = [];
    }

    /**
     * Insert an item into the binary heap
     */
    insert(item: T) {
        this._items.push(item);
        this.moveUp(this._items.length - 1);
    }

    /**
     * Remove the smallest item from the binary heap in case of a min heap
     * or the greatest item from the binary heap in case of a max heap
     */
    remove() {
        if (this._items.length === 0) {
            return null;
        }
        const item = this._items[0];
        const lastItem = this._items.pop();
        if (this._items.length !== 0) {
            this._items[0] = lastItem as T;
            this.moveDown(0);
        }
        return item;
    }

    /**
     * Remove all items
     */
    clear() {
        this._items.splice(0, this._items.length);
    }

    moveUp(pos: number) {
        while (pos > 0) {
            const parent = Math.floor((pos - 1) / 2);
            if (!this._compareFn(this._items[pos], this._items[parent])) {
                if (this._items[pos] >= this._items[parent]) {
                    break;
                }
            }
            this.swap(pos, parent);
            pos = parent;
        }
    }

    moveDown(pos: number) {
        while (pos < Math.floor(this._items.length / 2)) {
            let child = 2 * pos + 1;
            if (
                child < this._items.length - 1
                && !this._compareFn(this._items[child], this._items[child + 1])
            ) {
                ++child;
            }
            if (this._compareFn(this._items[pos], this._items[child])) {
                break;
            }
            this.swap(pos, child);
            pos = child;
        }
    }

    swap(index1: number, index2: number) {
        [this._items[index1], this._items[index2]] = [
            this._items[index2],
            this._items[index1],
        ];
    }

    /**
     * Returns the amount of items
     */
    get length() {
        return this._items.length;
    }
}
