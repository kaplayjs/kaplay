"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.health = health;
var clamp_1 = require("../../../math/clamp");
var SerializableComponent_1 = require("../../../core/SerializableComponent");
function health(hp, maxHP) {
    if (hp == null) {
        throw new Error("health() requires the initial amount of hp");
    }
    var comp = {
        id: "health",
        add: function () {
            if (!this.maxHP)
                this.maxHP = this.hp;
        },
        get hp() {
            return hp;
        },
        set hp(val) {
            var origHP = this.hp;
            hp = this.maxHP ? (0, clamp_1.clamp)(val, 0, this.maxHP) : val;
            if (hp < origHP) {
                this.trigger("hurt", origHP - hp);
            }
            else if (hp > origHP) {
                this.trigger("heal", origHP - hp);
            }
            if (hp <= 0)
                this.trigger("death");
        },
        get maxHP() {
            return maxHP;
        },
        set maxHP(val) {
            maxHP = val;
        },
        get dead() {
            return this.hp <= 0;
        },
        onHurt: function (action) {
            return this.on("hurt", action);
        },
        onHeal: function (action) {
            return this.on("heal", action);
        },
        onDeath: function (action) {
            return this.on("death", action);
        },
        inspect: function () {
            return "health: ".concat(hp);
        },
        serialize: function () {
            return { hp: hp, maxHP: maxHP };
        },
        deserialize: function (data) {
            if (typeof data.hp === "number")
                hp = data.hp;
            if (typeof data.maxHP === "number")
                maxHP = data.maxHP;
        },
    };
    (0, SerializableComponent_1.registerSerializableComponent)("health", comp);
    return comp;
}
