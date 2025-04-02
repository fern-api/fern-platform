/* eslint-disable @typescript-eslint/no-invalid-void-type */

export type DocsUrl = string & { __docsUrl: void };

export type ResolvedReturnType<T extends (...args: any[]) => any> = Awaited<
  ReturnType<T>
>;
