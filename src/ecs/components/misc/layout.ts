import { vec2 } from "../../../math/math";
import type { Vec2 } from "../../../math/Vec2";
import type { Comp, GameObj } from "../../../types";

export type LayoutType = "row" | "column" | "grid" | "flex";
export type LayoutAlign = "begin" | "end" | "center" | "stretch";
export type LayoutElementCompOpt = {
    type?: LayoutType;
    padding?: number;
    spacing?: number;
    columns?: number;
    maxWidth?: number;
    halign?: LayoutAlign;
    valign?: LayoutAlign;
};
export interface LayoutElementComp extends Comp {
    /**
     * Lays out children and returns the accumulated size
     */
    doLayout(): Vec2;
    /**
     * The type of layout
     */
    type: LayoutType;
    /**
     * The horizontal and vertical padding between parent and child
     */
    padding: Vec2;
    /**
     * the horizontal and vertical spacing between children
     */
    spacing: Vec2;
    /**
     * For a grid layout, the amount of columns, unused otherwise
     */
    columns?: number;
    /**
     * For a flex layout, The maximum allowed width
     */
    maxWidth: number;
    /**
     * If set, the layout does not just position the controls, but aligns them as well
     */
    halign?: LayoutAlign;
    valign?: LayoutAlign;
}

export function layout(opt: LayoutElementCompOpt): LayoutElementComp {
    let _type = opt.type || "row";
    let _padding = vec2(opt.padding ?? 0);
    let _spacing = vec2(opt.spacing ?? 0);
    let _columns = opt.columns;
    let _maxWidth = opt.maxWidth ?? Infinity;
    let _halign = opt.halign;
    let _valign = opt.valign;
    return {
        add(this: GameObj) {
            // Initialization
            this.tag(_type);
            this.doLayout();
        },
        doLayout(this: GameObj) {
            switch (_type) {
                case "row": {
                    let pos = _padding;
                    let height = 0;
                    this.children.forEach((child: GameObj) => {
                        child.pos = pos;
                        pos = pos.add(child.width + _spacing.x, 0);
                        height = Math.max(height, child.height);
                    });
                    if (_valign) {
                        if (_valign == "stretch") {
                            this.children.forEach((child: GameObj) => {
                                child.height = height;
                            });
                        }
                        else if (_valign == "center" || _valign == "end") {
                            const factor = _valign == "center" ? 0.5 : 1;
                            this.children.forEach((child: GameObj) => {
                                child.pos.y = _padding.y
                                    + (height - child.height) * factor;
                            });
                        }
                    }
                    return vec2(
                        pos.x - _spacing.x + _padding.x,
                        height + _padding.y * 2,
                    );
                }
                case "column": {
                    let pos = _padding;
                    let width = 0;
                    this.children.forEach((child: GameObj) => {
                        child.pos = pos;
                        pos = pos.add(0, child.height + _spacing.y);
                        width = Math.max(width, child.width);
                    });
                    if (_halign) {
                        if (_halign == "stretch") {
                            this.children.forEach((child: GameObj) => {
                                child.width = width;
                            });
                        }
                        else if (_halign == "center" || _halign == "end") {
                            const factor = _halign == "center" ? 0.5 : 1;
                            this.children.forEach((child: GameObj) => {
                                child.pos.x = _padding.y
                                    + (width - child.width) * factor;
                            });
                        }
                    }
                    return vec2(
                        width + _padding.x * 2,
                        pos.y - _spacing.y + _padding.y,
                    );
                }
                case "grid": {
                    // Fix vertical position, collect column width for second pass
                    let pos = vec2(_padding);
                    let column = 0;
                    let row = 0;
                    let columnWidth: number[] = [];
                    let rowHeight: number[] = [];
                    this.children.forEach((child: GameObj) => {
                        child.pos = vec2(pos);
                        columnWidth[column] = Math.max(
                            columnWidth[column] || 0,
                            child.width,
                        );
                        rowHeight[row] = Math.max(
                            rowHeight[row] || 0,
                            child.height,
                        );
                        column++;
                        if (column === _columns) {
                            pos.y += rowHeight[row] + _spacing.y;
                            column = 0;
                            row++;
                        }
                    });
                    // Fix horizontal position
                    let x = vec2(_padding).x;
                    column = 0;
                    this.children.forEach((child: GameObj) => {
                        child.pos.x = x;
                        x += columnWidth[column] + _spacing.x;
                        column++;
                        if (column === _columns) {
                            x = _spacing.x;
                            column = 0;
                        }
                    });
                    return vec2(
                        _padding.x * 2 + _spacing.x * (columnWidth.length - 1)
                            + columnWidth.reduce((sum, w) => sum + w, 0),
                        _padding.y * 2 + _spacing.y * (rowHeight.length - 1)
                            + rowHeight.reduce((sum, h) => sum + h, 0),
                    );
                }
                case "flex": {
                    let pos = vec2(_padding);
                    let column = 0;
                    let width = 0;
                    let maxHeight = 0;
                    this.children.forEach((child: GameObj) => {
                        child.pos = vec2(pos);
                        column++;
                        if (
                            column > 0 && child.pos.x + child.width > _maxWidth
                        ) {
                            // Push last child a row down since there is not enough space
                            child.pos = vec2(
                                _padding.x,
                                pos.y + maxHeight + _spacing.y,
                            );
                            pos.x = _padding.x + child.width + _spacing.x;
                            pos.y += maxHeight + _spacing.y;
                            column = 1;
                            maxHeight = child.height;
                            width = Math.max(width, pos.x);
                        }
                        else {
                            // Just append to the right since we need at least one item per row
                            maxHeight = Math.max(maxHeight, child.height);
                            pos.x += child.width + _spacing.x;
                            width = Math.max(width, pos.x);
                        }
                    });
                    return vec2(width, pos.y + _padding.y + maxHeight);
                }
            }
        },
        get type() {
            return _type;
        },
        set type(type: LayoutType) {
            _type = type;
            this.doLayout();
        },
        get padding(): Vec2 {
            return _padding;
        },
        set padding(padding: Vec2) {
            _padding = vec2(padding);
            this.doLayout();
        },
        get spacing(): Vec2 {
            return _spacing;
        },
        set spacing(spacing: Vec2) {
            _spacing = vec2(spacing);
            this.doLayout();
        },
        get columns(): number | undefined {
            return _columns;
        },
        set columns(columns: number) {
            _columns = columns;
            this.doLayout();
        },
        get maxWidth(): number {
            return _maxWidth;
        },
        set maxWidth(maxWidth: number) {
            _maxWidth = maxWidth;
            this.doLayout();
        },
    };
}
