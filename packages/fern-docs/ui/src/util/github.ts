export const getGitHubRepo = (url: string): string | null => {
  return (
    url.match(/^https:\/\/(www\.)?github\.com\/([\w-]+\/[\w-]+)\/?$/)?.[2] ??
    null
  );
};

export type GitHubInfo = {
  repo: string;
  stars: number;
  forks: number;
};

export const getGitHubInfo = async (
  repo: string
): Promise<GitHubInfo | null> => {
  const res = await fetch(`https://api.github.com/repos/${repo}`);

  if (!res.ok) {
    return null;
  }

  const result = await res.json();
  return {
    repo: result.full_name,
    stars: result.stargazers_count,
    forks: result.forks,
  };
};
