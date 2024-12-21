import { S3 } from "@aws-sdk/client-s3";
import { Env } from "@libs/env";
import { setupGithubApp } from "@libs/github";
import { json2csv } from "json-2-csv";
import { App } from "octokit";

interface RepoData {
  id: string;
  name: string;
  full_name: string;
  default_branch: string;
  clone_url: string;
}

// In order to parallelize actioning on the data (e.g. updating openapi specs)
// we first write the data to s3 and then trigger the action from there.
export async function updateRepoDataInternal(env: Env): Promise<void> {
  const app: App = setupGithubApp(env);
  const repos: RepoData[] = [];

  // Get repo data
  await app.eachRepository((installation) => {
    repos.push({
      id: installation.repository.id.toString(),
      name: installation.repository.name,
      full_name: installation.repository.full_name,
      default_branch: installation.repository.default_branch,
      clone_url: installation.repository.clone_url,
    });
  });

  // Write the data to S3
  const csvContent = json2csv(repos);
  const bucket = env.REPO_DATA_S3_BUCKET ?? "fern-bot-data";
  const key = env.REPO_DATA_S3_KEY ?? "lambdas/repos.csv";
  console.log(`Writing repo data to S3 at ${bucket}/${key}`);
  const s3 = new S3();
  await s3.putObject({
    Bucket: bucket,
    Key: key,
    Body: csvContent,
  });
}
