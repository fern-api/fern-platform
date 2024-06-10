import { Block } from "./Block";

export class BlockMerger {
    private original: Block[];
    private originalByID: Record<string, Block> = {};
    private updated: Block[];
    private updatedByID: Record<string, Block> = {};

    constructor({ original, updated }: { original: Block[]; updated: Block[] }) {
        this.original = original;
        this.original.map((block) => {
            this.originalByID[block.id] = block;
        });

        this.updated = updated;
        this.updated.map((block) => {
            this.updatedByID[block.id] = block;
        });
    }

    public merge(): Block[] {
        let originalIndex = 0;
        let updatedIndex = 0;

        const merged: BlockList = new BlockList();
        while (originalIndex < this.original.length && updatedIndex < this.updated.length) {
            const originalBlock = this.getOriginalBlock(originalIndex);
            const updatedBlock = this.getUpdatedBlock(updatedIndex);
            if (originalBlock.id === updatedBlock.id) {
                merged.addBlock(updatedBlock);
                originalIndex++;
                updatedIndex++;
                continue;
            }

            if (originalIndex <= updatedIndex) {
                while (originalIndex < this.original.length) {
                    const nextOriginalBlock = this.getOriginalBlock(originalIndex);
                    originalIndex++;
                    if (!this.blockExistsInUpdated(nextOriginalBlock)) {
                        merged.addBlock(nextOriginalBlock);
                    } else {
                        break;
                    }
                }
                continue;
            }

            merged.addBlock(updatedBlock);
            updatedIndex++;
        }

        while (originalIndex < this.original.length) {
            const block = this.getOriginalBlock(originalIndex);
            if (!this.blockExistsInUpdated(block)) {
                merged.addBlock(block);
            }
            originalIndex++;
        }

        while (updatedIndex < this.updated.length) {
            merged.addBlock(this.getUpdatedBlock(updatedIndex));
            updatedIndex++;
        }

        return merged.getBlocks();
    }

    private getOriginalBlock(index: number): Block {
        return this.getBlockOrThrow(this.original, index);
    }

    private getUpdatedBlock(index: number): Block {
        return this.getBlockOrThrow(this.updated, index);
    }

    private blockExistsInUpdated(block: Block): boolean {
        return this.updatedByID[block.id] !== undefined;
    }

    private getBlockOrThrow(blocks: Block[], index: number): Block {
        const block = blocks[index];
        if (block == null) {
            throw new Error(`index out of bounds: ${index}`);
        }
        return block;
    }
}

class BlockList {
    private ids: Set<string>;
    private blocks: Block[];

    constructor() {
        this.ids = new Set();
        this.blocks = [];
    }

    public addBlock(block: Block): void {
        if (this.hasBlock(block.id)) {
            throw new Error(`block with id "${block.id}" already exists`);
        }
        this.ids.add(block.id);
        this.blocks.push(block);
    }

    public hasBlock(id: string): boolean {
        return this.ids.has(id);
    }

    public getBlocks(): Block[] {
        return this.blocks;
    }
}
