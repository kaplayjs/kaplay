"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinaryHeap = void 0;
var BinaryHeap = /** @class */ (function () {
    /**
     * Creates a binary heap with the given compare function
     * Not passing a compare function will give a min heap
     */
    function BinaryHeap(compareFn) {
        if (compareFn === void 0) { compareFn = function (a, b) { return a < b; }; }
        this._compareFn = compareFn;
        this._items = [];
    }
    /**
     * Insert an item into the binary heap
     */
    BinaryHeap.prototype.insert = function (item) {
        this._items.push(item);
        this.moveUp(this._items.length - 1);
    };
    /**
     * Remove the smallest item from the binary heap in case of a min heap
     * or the greatest item from the binary heap in case of a max heap
     */
    BinaryHeap.prototype.remove = function () {
        if (this._items.length === 0) {
            return null;
        }
        var item = this._items[0];
        var lastItem = this._items.pop();
        if (this._items.length !== 0) {
            this._items[0] = lastItem;
            this.moveDown(0);
        }
        return item;
    };
    /**
     * Remove all items
     */
    BinaryHeap.prototype.clear = function () {
        this._items.splice(0, this._items.length);
    };
    BinaryHeap.prototype.moveUp = function (pos) {
        while (pos > 0) {
            var parent_1 = Math.floor((pos - 1) / 2);
            if (!this._compareFn(this._items[pos], this._items[parent_1])) {
                if (this._items[pos] >= this._items[parent_1]) {
                    break;
                }
            }
            this.swap(pos, parent_1);
            pos = parent_1;
        }
    };
    BinaryHeap.prototype.moveDown = function (pos) {
        while (pos < Math.floor(this._items.length / 2)) {
            var child = 2 * pos + 1;
            if (child < this._items.length - 1
                && !this._compareFn(this._items[child], this._items[child + 1])) {
                ++child;
            }
            if (this._compareFn(this._items[pos], this._items[child])) {
                break;
            }
            this.swap(pos, child);
            pos = child;
        }
    };
    BinaryHeap.prototype.swap = function (index1, index2) {
        var _a;
        _a = [
            this._items[index2],
            this._items[index1],
        ], this._items[index1] = _a[0], this._items[index2] = _a[1];
    };
    Object.defineProperty(BinaryHeap.prototype, "length", {
        /**
         * Returns the amount of items
         */
        get: function () {
            return this._items.length;
        },
        enumerable: false,
        configurable: true
    });
    return BinaryHeap;
}());
exports.BinaryHeap = BinaryHeap;
