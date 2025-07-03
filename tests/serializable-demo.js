"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var health_1 = require("../src/ecs/components/misc/health");
var named_1 = require("../src/ecs/components/misc/named");
var SerializableComponent_1 = require("../src/core/SerializableComponent");
// Crear instancias de componentes
var healthComp = (0, health_1.health)(10, 20);
var namedComp = (0, named_1.named)("Player1");
console.log("Estado inicial:");
console.log("healthComp:", healthComp.serialize());
console.log("namedComp:", namedComp.serialize());
// Modificar el estado
healthComp.hp = 5;
namedComp.name = "Player2";
console.log("\nEstado modificado:");
console.log("healthComp:", healthComp.serialize());
console.log("namedComp:", namedComp.serialize());
var savedState = (0, SerializableComponent_1.saveAll)();
console.log("\nEstado guardado:", savedState);
// Cambiar el estado nuevamente
healthComp.hp = 1;
namedComp.name = "Player3";
console.log("\nEstado antes de restaurar:");
console.log("healthComp:", healthComp.serialize());
console.log("namedComp:", namedComp.serialize());
// Restaurar el estado guardado
(0, SerializableComponent_1.loadAll)(savedState);
console.log("\nEstado restaurado:");
console.log("healthComp:", healthComp.serialize());
console.log("namedComp:", namedComp.serialize());
