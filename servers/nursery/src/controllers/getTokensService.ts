import { TokenService } from "../api/generated/api/resources/token/service/TokenService";

export function getTokensService(): TokenService {
    return new TokenService({
        create: async (req, _res) => {
            throw new Error();
        },
        getTokenMetadata: async (_req, _res) => {
            throw new Error();
        },
        getTokensForOwner: async (_req, _res) => {
            throw new Error();
        },
        revokeTokenById: async (_req, _res) => {
            throw new Error();
        },
        revokeToken: async (_req, _res) => {
            throw new Error();
        },
    });
}
