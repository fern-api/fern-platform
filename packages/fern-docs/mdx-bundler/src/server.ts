import { NodeResolvePlugin } from "@esbuild-plugins/node-resolve";
import {
  globalExternals,
  ModuleInfo,
} from "@fal-works/esbuild-plugin-global-externals";
import type { Options } from "@mdx-js/esbuild";
import mdxESBuild from "@mdx-js/esbuild";
import crypto from "crypto";
import type { BuildOptions as ESBuildOptions } from "esbuild";
import * as esbuild from "esbuild";
import { readFile, unlink } from "fs/promises";
import grayMatter, { type GrayMatterOption, type Input } from "gray-matter";
import path from "path";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { StringDecoder } from "string_decoder";
import type { VFile, VFileOptions } from "vfile";

type BundleMDXOptions<Frontmatter> = {
  source: string | VFile | VFileOptions;

  /**
   * The dependencies of the MDX code to be bundled
   *
   * @example
   * ```
   * bundleMDX({
   *   source: mdxString,
   *   files: {
   *     './components.tsx': `
   *       import * as React from 'react'
   *
   *      type CounterProps = {initialCount: number, step: number}
   *
   *       function Counter({initialCount = 0, step = 1}: CounterProps) {
   *         const [count, setCount] = React.useState(initialCount)
   *         const increment = () => setCount(c => c + step)
   *         return <button onClick={increment}>{count}</button>
   *       }
   *     `
   *   },
   * })
   * ```
   */
  files?: Record<string, string>;
  /**
   * This allows you to modify the built-in MDX configuration (passed to @mdx-js/mdx compile).
   * This can be helpful for specifying your own remarkPlugins/rehypePlugins.
   *
   * @param vfileCompatible the path and contents of the mdx file being compiled
   * @param options the default options which you are expected to modify and return
   * @returns the options to be passed to @mdx-js/mdx compile
   *
   * @example
   * ```
   * bundleMDX({
   *   source: mdxString,
   *   mdxOptions(options) {
   *     // this is the recommended way to add custom remark/rehype plugins:
   *     // The syntax might look weird, but it protects you in case we add/remove
   *     // plugins in the future.
   *     options.remarkPlugins = [...(options.remarkPlugins ?? []), myRemarkPlugin]
   *     options.rehypePlugins = [...(options.rehypePlugins ?? []), myRehypePlugin]
   *
   *     return options
   *   }
   * })
   * ```
   */
  mdxOptions?: (options: Options, frontmatter: Frontmatter) => Options;
  /**
   * This allows you to modify the built-in esbuild configuration. This can be
   * especially helpful for specifying the compilation target.
   *
   * @example
   * ```
   * bundleMDX({
   *   source: mdxString,
   *   esbuildOptions(options) {
   *     options.target = [
   *       'es2020',
   *       'chrome58',
   *       'firefox57',
   *       'safari11',
   *       'edge16',
   *       'node12',
   *     ]
   *     return options
   *   }
   * })
   * ```
   */
  esbuildOptions?: (
    options: ESBuildOptions,
    frontmatter: Frontmatter
  ) => ESBuildOptions;
  /**
   * Any variables you want treated as global variables in the bundling.
   *
   * NOTE: These do not have to be technically global as you will be providing
   * their values when you use getMDXComponent, but as far as esbuild is concerned
   * it will treat these values as global variables so they will not be included
   * in the bundle.
   *
   * @example
   * ```
   * bundlMDX({
   *   source: mdxString,
   *   globals: {'left-pad': 'myLeftPad'},
   * })
   *
   * // on the client side
   *
   * import leftPad from 'left-pad'
   *
   * const Component = getMDXComponent(result.code, {myLeftPad: leftPad})
   * ```
   */
  globals?: Record<string, string | ModuleInfo>;
  /**
   * The current working directory for the mdx bundle. Supplying this allows
   * esbuild to resolve paths itself instead of using `files`.
   *
   * This could be the directory the mdx content was read from or in the case
   * of off-disk content a common root directory.
   *
   * @example
   * ```
   * bundleMDX({
   *  source: mdxString
   *  cwd: '/users/you/site/mdx_root'
   * })
   * ```
   */
  cwd?: string;
  /**
   * This allows you to configure the gray matter options.
   *
   * @example
   * ```
   * bundleMDX({
   *   source: mdxString,
   *   grayMatterOptions: (options) => {
   *     options.excerpt = true
   *
   *     return options
   *   }
   * })
   * ```
   */
  grayMatterOptions?: <I extends Input>(
    options: GrayMatterOption<I, any>
  ) => GrayMatterOption<I, any>;
  /**
   * This allows you to set the output directory of the bundle. You will need
   * to set `bundlePath` as well to give esbuild the public url to the folder.
   *
   * *Note, the javascrpt bundle will not be placed here, only assets
   * that can't be part of the main bundle.*
   *
   * @example
   * ```
   * bundleMDX({
   *   file: '/path/to/file.mdx',
   *   bundleDirectory: '/path/to/bundle'
   *   bundlePath: '/path/to/public/bundle'
   * })
   * ```
   */
  bundleDirectory?: string;
  /**
   * @see bundleDirectory
   */
  bundlePath?: string;
};

async function bundleMDX<Frontmatter = Record<string, any>>({
  source,
  files = {},
  mdxOptions = (options) => options,
  esbuildOptions = (options) => options,
  globals = {},
  cwd = path.join(process.cwd(), `__mdx_bundler_fake_dir__`),
  grayMatterOptions = (options) => options,
  bundleDirectory,
  bundlePath,
}: BundleMDXOptions<Frontmatter>) {
  if (!process.env.ESBUILD_BINARY_PATH) {
    console.warn(
      `mdx-bundler warning: esbuild maybe unable to find its binary, if your build fails you'll need to set ESBUILD_BINARY_PATH. Learn more: https://github.com/kentcdodds/mdx-bundler/blob/main/README.md#nextjs-esbuild-enoent`
    );
  }

  let code: string;
  let entryPath: string;
  let matter: Omit<grayMatter.GrayMatterFile<string>, "data"> & {
    data: Frontmatter;
  };

  /** @type Record<string, string> */
  const absoluteFiles = {};

  const isWriting = typeof bundleDirectory === "string";

  if (typeof bundleDirectory !== typeof bundlePath) {
    throw new Error(
      "When using `bundleDirectory` or `bundlePath` the other must be set."
    );
  }

  function isVFile(vfile: unknown): vfile is VFile {
    return typeof vfile === "object" && vfile !== null && "value" in vfile;
  }

  if (typeof source === "string") {
    // The user has supplied MDX source.
    /** @type any */ // Slight type hack to get the graymatter front matter typed correctly.
    const gMatter = grayMatter(source, grayMatterOptions({}));
    matter = gMatter;
    entryPath = path.join(
      cwd,
      `./_mdx_bundler_entry_point-${crypto.randomUUID()}.mdx`
    );
    absoluteFiles[entryPath] = source;
  } else if (isVFile(source)) {
    const value = String(source.value);
    /** @type any */ // Slight type hack to get the graymatter front matter typed correctly.
    const gMatter = grayMatter(value, grayMatterOptions({}));
    matter = gMatter;
    entryPath = source.path
      ? path.isAbsolute(source.path)
        ? source.path
        : path.join(source.cwd, source.path)
      : path.join(cwd, `./_mdx_bundler_entry_point-${crypto.randomUUID()}.mdx`);
    absoluteFiles[entryPath] = value;
  } else {
    // The user supplied neither file or source.
    // The typings should prevent reaching this point.
    // It is ignored from coverage as the tests wouldn't run in a way that can get here.
    throw new Error("`source` must be defined");
  }
  /* c8 ignore end*/

  for (const [filepath, fileCode] of Object.entries(files)) {
    absoluteFiles[path.join(cwd, filepath)] = fileCode;
  }

  /** @type import('esbuild').Plugin */
  const inMemoryPlugin = {
    name: "inMemory",
    setup(build) {
      build.onResolve({ filter: /.*/ }, ({ path: filePath, importer }) => {
        if (filePath === entryPath) {
          return {
            path: filePath,
            pluginData: { inMemory: true, contents: absoluteFiles[filePath] },
          };
        }

        const modulePath = path.resolve(path.dirname(importer), filePath);

        if (modulePath in absoluteFiles) {
          return {
            path: modulePath,
            pluginData: { inMemory: true, contents: absoluteFiles[modulePath] },
          };
        }

        for (const ext of [".js", ".ts", ".jsx", ".tsx", ".json", ".mdx"]) {
          const fullModulePath = `${modulePath}${ext}`;
          if (fullModulePath in absoluteFiles) {
            return {
              path: fullModulePath,
              pluginData: {
                inMemory: true,
                contents: absoluteFiles[fullModulePath],
              },
            };
          }
        }

        // Return an empty object so that esbuild will handle resolving the file itself.
        return {};
      });

      build.onLoad({ filter: /.*/ }, async ({ path: filePath, pluginData }) => {
        if (pluginData === undefined || !pluginData.inMemory) {
          // Return an empty object so that esbuild will load & parse the file contents itself.
          return null;
        }

        // the || .js allows people to exclude a file extension
        const fileType = (path.extname(filePath) || ".jsx").slice(1);
        const contents = absoluteFiles[filePath];

        if (fileType === "mdx") return null;

        /** @type import('esbuild').Loader */
        let loader;

        if (
          build.initialOptions.loader &&
          build.initialOptions.loader[`.${fileType}`]
        ) {
          loader = build.initialOptions.loader[`.${fileType}`];
        } else {
          loader = /** @type import('esbuild').Loader */ fileType;
        }

        return {
          contents,
          loader,
        };
      });
    },
  };

  const buildOptions = esbuildOptions(
    {
      entryPoints: [entryPath],
      write: isWriting,
      outdir: isWriting ? bundleDirectory : undefined,
      publicPath: isWriting ? bundlePath : undefined,
      absWorkingDir: cwd,
      define: {
        "process.env.NODE_ENV": JSON.stringify(
          process.env.NODE_ENV ?? "production"
        ),
      },
      plugins: [
        globalExternals({
          ...globals,
          react: {
            varName: "React",
            type: "cjs",
          },
          "react-dom": {
            varName: "ReactDOM",
            type: "cjs",
          },
          "react/jsx-runtime": {
            varName: "_jsx_runtime",
            type: "cjs",
          },
        }),
        // eslint-disable-next-line new-cap
        NodeResolvePlugin({
          extensions: [".js", ".ts", ".jsx", ".tsx"],
          resolveOptions: { basedir: cwd },
        }),
        inMemoryPlugin,
        mdxESBuild(
          mdxOptions(
            {
              remarkPlugins: [
                remarkFrontmatter,
                [remarkMdxFrontmatter, { name: "frontmatter" }],
              ],
            },
            matter.data
          )
        ),
      ],
      bundle: true,
      format: "iife",
      globalName: "Component",
      minify: true,
    },
    matter.data
  );

  const bundled = await esbuild.build(buildOptions);

  if (bundled.outputFiles) {
    const decoder = new StringDecoder("utf8");

    code = decoder.write(Buffer.from(bundled.outputFiles[0].contents));
  } else if (buildOptions.outdir && buildOptions.write) {
    // We know that this has to be an array of entry point strings, with a single entry
    const entryFile =
      /** @type {{entryPoints: string[]}} */ buildOptions.entryPoints[0];

    const fileName = path.basename(entryFile).replace(/\.[^/.]+$/, ".js");

    code = (
      await readFile(path.join(buildOptions.outdir, fileName))
    ).toString();

    await unlink(path.join(buildOptions.outdir, fileName));
  } else {
    throw new Error(
      "You must either specify `write: false` or `write: true` and `outdir: '/path'` in your esbuild options"
    );
  }

  return {
    code: `${code};return Component;`,
    frontmatter: matter.data,
    errors: bundled.errors,
    matter,
  };
}

export { bundleMDX };
