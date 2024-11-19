import { Block } from "./Block";
import { ParsedBlock } from "./ParsedBlock";

export class BlockMerger {
    private original: ParsedBlock[];
    private updated: Block[];
    private updatedByID: Record<string, Block> = {};

    constructor({ original, updated }: { original: ParsedBlock[]; updated: Block[] }) {
        this.original = original;

        this.updated = updated;
        this.updated.forEach((block) => {
            this.updatedByID[block.id] = block;
        });
    }

    public merge(): Block[] {
        let originalIndex = 0;
        let updatedIndex = 0;

        console.log("Starting merge process");
        const merged: BlockList = new BlockList();
        while (originalIndex < this.original.length && updatedIndex < this.updated.length) {
            console.log(`Comparing blocks: original[${originalIndex}] vs updated[${updatedIndex}]`);
            const originalBlock = this.getOriginalBlock(originalIndex);
            const updatedBlock = this.getUpdatedBlock(updatedIndex);
            if (originalBlock.computedId === updatedBlock.id) {
                console.log(`Matched blocks: ${originalBlock.computedId}`);
                merged.addBlock(updatedBlock);
                originalIndex++;
                updatedIndex++;
                continue;
            }

            if (originalIndex <= updatedIndex) {
                console.log("Processing original blocks");
                while (originalIndex < this.original.length) {
                    const nextOriginalBlock = this.getOriginalBlock(originalIndex);
                    originalIndex++;
                    if (!this.blockExistsInUpdated(nextOriginalBlock)) {
                        console.log(`Adding original block: ${nextOriginalBlock.computedId}`);
                        merged.addBlock(
                            new Block({ id: nextOriginalBlock.computedId, content: nextOriginalBlock.content }),
                        );
                    } else {
                        console.log(`Skipping original block: ${nextOriginalBlock.computedId}`);
                        break;
                    }
                }
                continue;
            }

            console.log(`Adding updated block: ${updatedBlock.id}`);
            merged.addBlock(updatedBlock);
            updatedIndex++;
        }

        console.log("Processing remaining original blocks");
        while (originalIndex < this.original.length) {
            const block = this.getOriginalBlock(originalIndex);
            if (!this.blockExistsInUpdated(block)) {
                console.log(`Adding remaining original block: ${block.computedId}`);
                merged.addBlock(new Block({ id: block.computedId, content: block.content }));
            } else {
                console.log(`Skipping remaining original block: ${block.computedId}`);
            }
            originalIndex++;
        }

        console.log("Processing remaining updated blocks");
        while (updatedIndex < this.updated.length) {
            const block = this.getUpdatedBlock(updatedIndex);
            console.log(`Adding remaining updated block: ${block.id}`);
            merged.addBlock(block);
            updatedIndex++;
        }

        console.log("Merge process completed");
        return merged.getBlocks();
    }

    private getOriginalBlock(index: number): ParsedBlock {
        return this.getBlockOrThrow(this.original, index);
    }

    private getUpdatedBlock(index: number): Block {
        return this.getBlockOrThrow(this.updated, index);
    }

    private blockExistsInUpdated(block: ParsedBlock): boolean {
        const isPresent = this.updatedByID[block.computedId] != null || this.updatedByID[block.sectionName] != null;
        return isPresent;
    }

    private getBlockOrThrow<T>(blocks: T[], index: number): T {
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
