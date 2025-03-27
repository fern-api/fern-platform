import { DashboardService } from "../../api/generated/api/resources/dashboard/service/DashboardService";
import { FdrApplication } from "../../app";

export function getDashboardController(app: FdrApplication): DashboardService {
  return new DashboardService({
    getDocsSitesForOrg: async (req, res) => {
      await app.services.auth.checkUserBelongsToOrg({
        authHeader: req.headers.authorization,
        orgId: req.body.orgId,
      });
      const docsSites = await app.dao
        .docsV2()
        .listDocsSitesForOrg(req.body.orgId);
      await res.send(docsSites);
    },
  });
}
