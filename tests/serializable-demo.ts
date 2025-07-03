import { health } from "../src/ecs/components/misc/health.js";
import { named } from "../src/ecs/components/misc/named.js";
import { saveAll, loadAll } from "../src/core/SerializableComponent.js";

// Crear instancias de componentes
const healthComp = health(10, 20);
const namedComp = named("Player1");

console.log("Estado inicial:");
console.log("healthComp:", healthComp.serialize());
console.log("namedComp:", namedComp.serialize());

// Modificar el estado
healthComp.hp = 5;
namedComp.name = "Player2";

console.log("\nEstado modificado:");
console.log("healthComp:", healthComp.serialize());
console.log("namedComp:", namedComp.serialize());

// Guardar el estado actual
type State = Record<string, any>;
const savedState: State = saveAll();
console.log("\nEstado guardado:", savedState);

// Cambiar el estado nuevamente
healthComp.hp = 1;
namedComp.name = "Player3";

console.log("\nEstado antes de restaurar:");
console.log("healthComp:", healthComp.serialize());
console.log("namedComp:", namedComp.serialize());

// Restaurar el estado guardado
loadAll(savedState);

console.log("\nEstado restaurado:");
console.log("healthComp:", healthComp.serialize());
console.log("namedComp:", namedComp.serialize());
