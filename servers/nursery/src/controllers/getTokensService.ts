import { TokenService } from "../api/generated/api/resources/token/service/TokenService";

export function getTokensService(): TokenService {
    return new TokenService({
        create: async (req, res) => {
            return res.send();
        },
        getTokenMetadata: async (_req, _res) => {
            return res.send();
        },
        getTokensForOwner: async (_req, _res) => {
            return res.send();
        },
        revokeTokenById: async (_req, _res) => {
            return res.send();
        },
        revokeToken: async (_req, _res) => {
            return res.send();
        },
    });
}
