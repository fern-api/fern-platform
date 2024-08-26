import { OwnerService } from "../api/generated/api/resources/owner/service/OwnerService";

export function getOwnersService(): OwnerService {
    return new OwnerService({
        create: async (req, res) => {
            throw new Error();
        },
        get: async (req, res) => {
            throw new Error();
        },
        update: async (req, res) => {
            throw new Error();
        },
    });
}
