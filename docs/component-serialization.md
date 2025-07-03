# Kaplay Core Component Serialization System

## Overview
Kaplay's core now supports a modular and extensible serialization system for all components. This allows any component (official or community) to save and restore its state in a professional, decoupled way. The system is designed to be easy to use, robust, and future-proof.

---

## Goals
- **Modularity:** Each component is responsible for its own serialization logic.
- **Extensibility:** Community and plugin developers can register their own serializable components without modifying the core.
- **Professional Save/Load:** The system enables robust game state saving and loading, supporting both simple and complex games.

---

## How It Works

### 1. SerializableComponent Interface
Every serializable component must implement the following interface:

```typescript
export interface SerializableComponent {
    serialize(): Record<string, any>;
    deserialize(data: Record<string, any>): void;
}
```
- `serialize()`: Returns a plain object representing the current state of the component.
- `deserialize(data)`: Restores the component's state from the given object.

### 2. Global Registry
Kaplay core provides a global registry for serializable components:

```typescript
registerSerializableComponent(id: string, comp: SerializableComponent): void
```
- Call this function in your component's constructor to register it for save/load operations.

### 3. Saving and Loading All Components
To save the state of all registered components:

```typescript
const state = saveAll();
```

To load/restore the state:

```typescript
loadAll(state);
```

---

## Example: Making a Component Serializable

Suppose you have a component called `health`:

```typescript
import type { SerializableComponent } from "../core/SerializableComponent";
import { registerSerializableComponent } from "../core/SerializableComponent";

export interface HealthComp extends SerializableComponent {
    hp: number;
    maxHP: number;
    // ...other properties and methods...
    id?: string;
}

export function health(hp: number, maxHP?: number): HealthComp {
    const comp: HealthComp = {
        id: "health",
        hp,
        maxHP: maxHP ?? hp,
        serialize() {
            return { hp: this.hp, maxHP: this.maxHP };
        },
        deserialize(data: Record<string, any>) {
            if (typeof data.hp === "number") this.hp = data.hp;
            if (typeof data.maxHP === "number") this.maxHP = data.maxHP;
        },
        // ...other methods...
    };
    registerSerializableComponent("health", comp);
    return comp;
}
```

---

## Adapting Your Own Component
1. Extend your component's interface with `SerializableComponent`.
2. Implement `serialize()` and `deserialize()` methods.
3. Register your component using `registerSerializableComponent`.

**Template:**
```typescript
import type { SerializableComponent } from "../core/SerializableComponent";
import { registerSerializableComponent } from "../core/SerializableComponent";

export interface MyComp extends SerializableComponent {
    // ...your properties...
    id?: string;
}

export function myComp(...args): MyComp {
    const comp: MyComp = {
        id: "myComp",
        // ...your properties...
        serialize() {
            return { /* ... */ };
        },
        deserialize(data: Record<string, any>) {
            // ...restore state...
        },
    };
    registerSerializableComponent("myComp", comp);
    return comp;
}
```

---

## Best Practices
- Only include essential state in `serialize()` (avoid functions, DOM nodes, etc.).
- Always check types in `deserialize()` to avoid runtime errors.
- Use unique IDs for each component type when registering.
- Document your component's serializable state for future maintainers.

---

## FAQ

**Q: Where should I store the serialized state?**
A: The serialization system is agnostic about storage. You can store the result of `saveAll()` anywhere: localStorage, files, cloud, etc.

> **Note:** If you want to store the serialized state in the cloud, you must implement your own logic to send the data to a backend or cloud service (e.g., using `fetch` or another HTTP client). The serialization system only provides you with a plain object or JSON; it does not handle network communication or remote storage. This gives you full flexibility to integrate with any storage solution you prefer.


**Q: Can plugins register their own serializable components?**
A: Yes, any plugin or community component can use the same API to participate in save/load.

**Q: What if I want to remove a component from the registry?**
A: (Optional) You can extend the API to support unregistering if needed.

---

## Summary
- Implement `SerializableComponent` in your component.
- Register it with `registerSerializableComponent`.
- Use `saveAll()` and `loadAll()` to save and restore the game state.
- The system is modular, extensible, and ready for the community!

---

For more examples, see `docs/serializable-component-template.ts`.
