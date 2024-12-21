import { FernVenusApi, FernVenusApiClient } from "@fern-api/venus-api-sdk";
import { v4 as uuidv4 } from "uuid";
import { UnauthorizedError } from "../../api/generated/api";
import { TokensService } from "../../api/generated/api/resources/tokens/service/TokensService";
import { type FdrApplication } from "../../app";
import { getTokenFromAuthHeader } from "../../services/auth/AuthService";

export function getTokensService(app: FdrApplication): TokensService {
  return new TokensService({
    generate: async (req, res) => {
      const authorization = req.headers.authorization;
      if (authorization == null) {
        throw new UnauthorizedError(
          "No token specified. Please use your FERN_TOKEN"
        );
      }
      const token = getTokenFromAuthHeader(authorization);
      const venus = new FernVenusApiClient({
        environment: app.config.venusUrl,
        token,
      });
      const response = await venus.registry.generateRegistryTokens({
        organizationId: FernVenusApi.OrganizationId(req.body.orgId),
      });
      if (response.ok) {
        return res.send({
          id: uuidv4(),
          token: response.body.npm.token,
        });
      }
      throw new Error("Failed to generate token.");
    },
    revoke: (req, res) => {
      return res.send();
    },
  });
}
