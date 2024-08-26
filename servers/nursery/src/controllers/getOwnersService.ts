import { OwnerService } from "../api/generated/api/resources/owner/service/OwnerService";

export function getOwnersService(): OwnerService {
    return new OwnerService({
        create: async (req, res) => {
            return res.send();
        },
        get: async (req, res) => {
            return res.send();
        },
        update: async (req, res) => {
            return res.send();
        },
    });
}
