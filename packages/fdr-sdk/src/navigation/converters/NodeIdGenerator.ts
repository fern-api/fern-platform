import { FernNavigation } from "../generated";

export class NodeIdGenerator {
    #ids: string[] = [];
    public with<T>(key: string, cb: (id: FernNavigation.NodeId) => T): T {
        this.#ids.push(key);
        const result = cb(this.#stableId());
        this.#ids.pop();
        return result;
    }

    #generatedIds = new Set<string>();
    #stableId(): FernNavigation.NodeId {
        const id = this.#ids.join(".");
        let uniqId = id;
        let i = 0;
        while (this.#generatedIds.has(uniqId)) {
            uniqId = `${id}-${i}`;
            i++;
        }
        this.#generatedIds.add(uniqId);
        return FernNavigation.NodeId(uniqId);
    }
}
