import { APIV1Read, FdrAPI } from "@fern-api/fdr-sdk";
import * as prisma from "@prisma/client";

import {
  CheckRun,
  FernRepository,
  GithubUser,
  ListPullRequestsResponse,
  ListRepositoriesResponse,
  PullRequest,
  PullRequestReviewer,
  PullRequestState,
} from "../../api/generated/api";
import { readBuffer, writeBuffer } from "../../util";

export interface LoadSnippetAPIRequest {
  orgId: string;
  apiName: string;
}

export interface LoadSnippetAPIsRequest {
  orgIds: string[];
  apiName: string | undefined;
}

export type SnippetTemplatesByEndpoint = Record<
  FdrAPI.EndpointPathLiteral,
  Record<FdrAPI.HttpMethod, APIV1Read.EndpointSnippetTemplates>
>;

export type SnippetTemplatesByEndpointIdentifier = Record<
  string,
  APIV1Read.EndpointSnippetTemplates
>;

export interface GitDao {
  getRepository({
    repositoryOwner,
    repositoryName,
  }: {
    repositoryOwner: string;
    repositoryName: string;
  }): Promise<FernRepository | undefined>;

  listRepository({
    page,
    pageSize,
    repositoryOwner,
    repositoryName,
    organizationId,
  }: {
    page?: number | undefined;
    pageSize?: number | undefined;
    repositoryOwner: string | undefined;
    repositoryName: string | undefined;
    organizationId: string | undefined;
  }): Promise<ListRepositoriesResponse>;

  upsertRepository({
    repository,
  }: {
    repository: FernRepository;
  }): Promise<void>;

  deleteRepository({
    repositoryOwner,
    repositoryName,
  }: {
    repositoryOwner: string;
    repositoryName: string;
  }): Promise<void>;

  getPullRequest({
    repositoryOwner,
    repositoryName,
    pullRequestNumber,
  }: {
    repositoryOwner: string;
    repositoryName: string;
    pullRequestNumber: number;
  }): Promise<PullRequest | undefined>;

  listPullRequests({
    page,
    pageSize,
    repositoryOwner,
    repositoryName,
    organizationId,
    state,
    author,
  }: {
    page?: number | undefined;
    pageSize?: number | undefined;
    repositoryOwner: string | undefined;
    repositoryName: string | undefined;
    organizationId: string | undefined;
    state: PullRequestState[] | undefined;
    author: string[] | undefined;
  }): Promise<ListPullRequestsResponse>;

  upsertPullRequest({
    pullRequest,
  }: {
    pullRequest: PullRequest;
  }): Promise<void>;

  deletePullRequest({
    repositoryOwner,
    repositoryName,
    pullRequestNumber,
  }: {
    repositoryOwner: string;
    repositoryName: string;
    pullRequestNumber: number;
  }): Promise<void>;
}

export class GitDaoImpl implements GitDao {
  constructor(private readonly prisma: prisma.PrismaClient) {}
  async listPullRequests({
    page = 0,
    pageSize = 20,
    repositoryOwner,
    repositoryName,
    organizationId,
    state,
    author,
  }: {
    page?: number | undefined;
    pageSize?: number | undefined;
    repositoryOwner: string | undefined;
    repositoryName: string | undefined;
    organizationId: string | undefined;
    state: PullRequestState[] | undefined;
    author: string[] | undefined;
  }): Promise<ListPullRequestsResponse> {
    const where: Record<string, unknown> = {};
    if (repositoryOwner != null) {
      where.repositoryOwner = repositoryOwner;
    }
    if (repositoryName != null) {
      where.repositoryName = repositoryName;
    }
    if (organizationId != null) {
      where.repository = {
        repositoryOwnerOrganizationId: organizationId,
      };
    }
    if (state != null) {
      where.state = {
        in: state,
      };
    }
    if (author != null) {
      where.authorLogin = {
        in: author,
      };
    }
    const pull = await this.prisma.pullRequest.findMany({
      skip: page * pageSize,
      take: pageSize,
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      pullRequests: pull
        .map(convertPrismaPullRequest)
        .filter((g): g is PullRequest => g != null),
    };
  }

  async upsertPullRequest({
    pullRequest,
  }: {
    pullRequest: PullRequest;
  }): Promise<void> {
    const data: prisma.PullRequest = {
      pullRequestNumber: pullRequest.pullRequestNumber,
      repositoryOwner: pullRequest.repositoryOwner,
      repositoryName: pullRequest.repositoryName,
      author: writeBuffer(pullRequest.author),
      authorLogin: pullRequest.author?.username
        ? pullRequest.author?.username
        : null,
      reviewers: writeBuffer(pullRequest.reviewers),
      checks: writeBuffer(pullRequest.checks),
      title: pullRequest.title,
      url: pullRequest.url,
      state: pullRequest.state,
      createdAt: new Date(pullRequest.createdAt),
      updatedAt: pullRequest.updatedAt ? new Date(pullRequest.updatedAt) : null,
      closedAt: pullRequest.closedAt ? new Date(pullRequest.closedAt) : null,
      mergedAt: pullRequest.mergedAt ? new Date(pullRequest.mergedAt) : null,
    };

    await this.prisma.pullRequest.upsert({
      where: {
        pullRequestNumber_repositoryOwner_repositoryName: {
          pullRequestNumber: pullRequest.pullRequestNumber,
          repositoryOwner: pullRequest.repositoryOwner,
          repositoryName: pullRequest.repositoryName,
        },
      },
      update: data,
      create: data,
    });
  }

  async deletePullRequest({
    repositoryOwner,
    repositoryName,
    pullRequestNumber,
  }: {
    repositoryOwner: string;
    repositoryName: string;
    pullRequestNumber: number;
  }): Promise<void> {
    await this.prisma.pullRequest.delete({
      where: {
        pullRequestNumber_repositoryOwner_repositoryName: {
          pullRequestNumber,
          repositoryOwner,
          repositoryName,
        },
      },
    });
  }

  async getPullRequest({
    repositoryOwner,
    repositoryName,
    pullRequestNumber,
  }: {
    repositoryOwner: string;
    repositoryName: string;
    pullRequestNumber: number;
  }): Promise<PullRequest | undefined> {
    return convertPrismaPullRequest(
      await this.prisma.pullRequest.findUnique({
        where: {
          pullRequestNumber_repositoryOwner_repositoryName: {
            pullRequestNumber,
            repositoryOwner,
            repositoryName,
          },
        },
      })
    );
  }

  async upsertRepository({
    repository,
  }: {
    repository: FernRepository;
  }): Promise<void> {
    const data: prisma.Repository = {
      id: repository.id.id,
      name: repository.name,
      owner: repository.owner,
      fullName: repository.fullName,
      url: repository.url,
      repositoryOwnerOrganizationId: repository.repositoryOwnerOrganizationId,
      defaultBranchChecks: writeBuffer(repository.defaultBranchChecks),
      contentType: repository.type,
      systemType: repository.id.type,

      rawRepository: writeBuffer(repository),
    };

    await this.prisma.repository.upsert({
      where: {
        owner_name: {
          name: repository.name,
          owner: repository.owner,
        },
      },
      update: data,
      create: data,
    });
  }

  async listRepository({
    page = 0,
    pageSize = 20,
    repositoryOwner,
    repositoryName,
    organizationId,
  }: {
    page?: number | undefined;
    pageSize?: number | undefined;
    repositoryOwner: string | undefined;
    repositoryName: string | undefined;
    organizationId: string | undefined;
  }): Promise<ListRepositoriesResponse> {
    const where: Record<string, string> = {};
    if (repositoryOwner != null) {
      where.repositoryOwner = repositoryOwner;
    }
    if (repositoryName != null) {
      where.repositoryName = repositoryName;
    }
    if (organizationId != null) {
      where.repositoryOwnerOrganizationId = organizationId;
    }
    const repos = await this.prisma.repository.findMany({
      skip: page * pageSize,
      take: pageSize,
      where,
      orderBy: {
        fullName: "asc",
      },
    });

    return {
      repositories: repos
        .map(convertPrismaRepo)
        .filter((g): g is FernRepository => g != null),
    };
  }

  async getRepository({
    repositoryOwner,
    repositoryName,
  }: {
    repositoryOwner: string;
    repositoryName: string;
  }): Promise<FernRepository | undefined> {
    const maybeRepo = await this.prisma.repository.findUnique({
      where: {
        owner_name: {
          owner: repositoryOwner,
          name: repositoryName,
        },
      },
    });
    return convertPrismaRepo(maybeRepo);
  }

  async deleteRepository({
    repositoryOwner,
    repositoryName,
  }: {
    repositoryOwner: string;
    repositoryName: string;
  }): Promise<void> {
    await this.prisma.repository.delete({
      where: {
        owner_name: {
          owner: repositoryOwner,
          name: repositoryName,
        },
      },
    });
  }
}

function convertPrismaRepo(
  maybeRepo: prisma.Repository | null
): FernRepository | undefined {
  if (!maybeRepo) {
    return undefined;
  }

  return readBuffer(maybeRepo.rawRepository) as FernRepository;
}

function convertPrismaPullRequest(
  maybePR: prisma.PullRequest | null
): PullRequest | undefined {
  if (!maybePR) {
    return undefined;
  }

  return {
    pullRequestNumber: maybePR.pullRequestNumber,
    repositoryName: maybePR.repositoryName,
    repositoryOwner: maybePR.repositoryOwner,
    author:
      maybePR.author != null
        ? (readBuffer(maybePR.author) as GithubUser)
        : undefined,
    reviewers: readBuffer(maybePR.reviewers) as PullRequestReviewer[],
    checks: readBuffer(maybePR.checks) as CheckRun[],
    title: maybePR.title,
    url: FdrAPI.Url(maybePR.url),
    state: maybePR.state,
    createdAt: maybePR.createdAt.toISOString(),
    updatedAt: maybePR.updatedAt?.toISOString(),
    closedAt: maybePR.closedAt?.toISOString(),
    mergedAt: maybePR.mergedAt?.toISOString(),
  };
}
