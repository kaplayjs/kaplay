"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EdgeMask = exports.BlendMode = void 0;
var BlendMode;
(function(BlendMode) {
    BlendMode[BlendMode["Normal"] = 0] = "Normal";
    BlendMode[BlendMode["Add"] = 1] = "Add";
    BlendMode[BlendMode["Multiply"] = 2] = "Multiply";
    BlendMode[BlendMode["Screen"] = 3] = "Screen";
    BlendMode[BlendMode["Overlay"] = 4] = "Overlay";
})(BlendMode || (exports.BlendMode = BlendMode = {}));
/**
 * @group Math
 */
var EdgeMask;
(function(EdgeMask) {
    EdgeMask[EdgeMask["None"] = 0] = "None";
    EdgeMask[EdgeMask["Left"] = 1] = "Left";
    EdgeMask[EdgeMask["Top"] = 2] = "Top";
    EdgeMask[EdgeMask["LeftTop"] = 3] = "LeftTop";
    EdgeMask[EdgeMask["Right"] = 4] = "Right";
    EdgeMask[EdgeMask["Horizontal"] = 5] = "Horizontal";
    EdgeMask[EdgeMask["RightTop"] = 6] = "RightTop";
    EdgeMask[EdgeMask["HorizontalTop"] = 7] = "HorizontalTop";
    EdgeMask[EdgeMask["Bottom"] = 8] = "Bottom";
    EdgeMask[EdgeMask["LeftBottom"] = 9] = "LeftBottom";
    EdgeMask[EdgeMask["Vertical"] = 10] = "Vertical";
    EdgeMask[EdgeMask["LeftVertical"] = 11] = "LeftVertical";
    EdgeMask[EdgeMask["RightBottom"] = 12] = "RightBottom";
    EdgeMask[EdgeMask["HorizontalBottom"] = 13] = "HorizontalBottom";
    EdgeMask[EdgeMask["RightVertical"] = 14] = "RightVertical";
    EdgeMask[EdgeMask["All"] = 15] = "All";
})(EdgeMask || (exports.EdgeMask = EdgeMask = {}));
