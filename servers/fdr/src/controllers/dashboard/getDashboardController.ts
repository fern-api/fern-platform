import { DashboardService } from "../../api/generated/api/resources/dashboard/service/DashboardService";
import { FdrApplication } from "../../app";

export function getDashboardController(app: FdrApplication): DashboardService {
  async function checkIsFernUser(authorization: string | undefined) {
    await app.services.auth.checkUserBelongsToOrg({
      authHeader: authorization,
      orgId: "fern",
    });
  }

  return new DashboardService({
    getDocsSitesForOrg: async (req, res) => {
      await checkIsFernUser(req.headers.authorization);
      const docsSites = await app.dao
        .docsV2()
        .listDocsSitesForOrg(req.body.orgId);
      await res.send(docsSites);
    },
  });
}
