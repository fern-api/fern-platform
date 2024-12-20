import {
  PullRequestNotFoundError,
  RepositoryNotFoundError,
} from "../../api/generated/api";
import { GitService } from "../../api/generated/api/resources/git/service/GitService";
import { FdrApplication } from "../../app";

export function getGitController(app: FdrApplication): GitService {
  async function checkIsFernUser(authorization: string | undefined) {
    await app.services.auth.checkUserBelongsToOrg({
      authHeader: authorization,
      orgId: "fern",
    });
  }

  return new GitService({
    getRepository: async (req, res) => {
      await checkIsFernUser(req.headers.authorization);

      const nameAndOwner = {
        repositoryName: req.params.repositoryName,
        repositoryOwner: req.params.repositoryOwner,
      };
      const maybeRepo = await app.dao.git().getRepository(nameAndOwner);
      if (!maybeRepo) {
        throw new RepositoryNotFoundError(nameAndOwner);
      }

      return res.send(maybeRepo);
    },
    listRepositories: async (req, res) => {
      await checkIsFernUser(req.headers.authorization);

      const repos = await app.dao.git().listRepository({
        page: req.body.page,
        pageSize: req.body.pageSize,
        repositoryName: req.body.repositoryName,
        repositoryOwner: req.body.repositoryOwner,
        organizationId: req.body.organizationId,
      });

      return res.send(repos);
    },
    upsertRepository: async (req, res) => {
      await checkIsFernUser(req.headers.authorization);

      await app.dao.git().upsertRepository({ repository: req.body });
      return res.send();
    },
    deleteRepository: async (req, res) => {
      await checkIsFernUser(req.headers.authorization);

      await app.dao.git().deleteRepository({
        repositoryName: req.params.repositoryName,
        repositoryOwner: req.params.repositoryOwner,
      });
      return res.send();
    },
    getPullRequest: async (req, res) => {
      await checkIsFernUser(req.headers.authorization);

      const nameAndOwner = {
        repositoryName: req.params.repositoryName,
        repositoryOwner: req.params.repositoryOwner,
        pullRequestNumber: req.params.pullRequestNumber,
      };
      const maybePull = await app.dao.git().getPullRequest(nameAndOwner);
      if (!maybePull) {
        throw new PullRequestNotFoundError(nameAndOwner);
      }

      return res.send(maybePull);
    },
    listPullRequests: async (req, res) => {
      await checkIsFernUser(req.headers.authorization);

      const repos = await app.dao.git().listPullRequests({
        page: req.body.page,
        pageSize: req.body.pageSize,
        repositoryName: req.body.repositoryName,
        repositoryOwner: req.body.repositoryOwner,
        organizationId: req.body.organizationId,
        state: req.body.state,
        author: req.body.author,
      });

      return res.send(repos);
    },
    upsertPullRequest: async (req, res) => {
      await checkIsFernUser(req.headers.authorization);

      await app.dao.git().upsertPullRequest({ pullRequest: req.body });
      return res.send();
    },
    deletePullRequest: async (req, res) => {
      await checkIsFernUser(req.headers.authorization);

      await app.dao.git().deletePullRequest({
        repositoryName: req.params.repositoryName,
        repositoryOwner: req.params.repositoryOwner,
        pullRequestNumber: req.params.pullRequestNumber,
      });
      return res.send();
    },
  });
}
