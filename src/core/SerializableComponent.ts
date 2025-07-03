// Interfaz base para componentes serializables
export interface SerializableComponent {
    serialize(): Record<string, any>;
    deserialize(data: Record<string, any>): void;
}

// Registro global de componentes serializables
const serializableRegistry: Map<string, SerializableComponent> = new Map();

export function registerSerializableComponent(
    id: string,
    comp: SerializableComponent,
) {
    serializableRegistry.set(id, comp);
}

export function saveAll(): Record<string, any> {
    const state: Record<string, any> = {};
    for (const [id, comp] of serializableRegistry.entries()) {
        state[id] = comp.serialize();
    }
    return state;
}

export function loadAll(state: Record<string, any>) {
    for (const [id, data] of Object.entries(state)) {
        const comp = serializableRegistry.get(id);
        if (comp) {
            comp.deserialize(data);
        }
    }
}
