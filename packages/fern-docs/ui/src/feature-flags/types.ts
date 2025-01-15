export interface FeatureProps<T> {
  /**
   * The flag to check. This is typically kebab-case but depends on the feature flag provider.
   */
  flag: string;
  /**
   * The default value to use if the flag is not set
   * @default false
   */
  default?: T;
  /**
   * The value to match against the flag
   * @default true
   */
  match?: T;
  /**
   * The content to render if the flag is set and matches the match value
   */
  children: React.ReactNode;
}
