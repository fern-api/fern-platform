var Component = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // global-externals:react/jsx-runtime
  var require_jsx_runtime = __commonJS({
    "global-externals:react/jsx-runtime"(exports, module) {
      module.exports = _jsx_runtime;
    }
  });

  // _mdx_bundler_entry_point-_random_uuid_.mdx
  var mdx_bundler_entry_point__random_uuid__exports = {};
  __export(mdx_bundler_entry_point__random_uuid__exports, {
    default: () => MDXContent,
    frontmatter: () => frontmatter
  });
  var import_jsx_runtime = __toESM(require_jsx_runtime());

  // global-externals:@mdx-js/react
  var { useMDXComponents } = MdxJsReact;

  // _mdx_bundler_entry_point-_random_uuid_.mdx
  var frontmatter = {
    "title": "Servers",
    "description": "Configure server URLs and environments to help users connect to your API.",
    "subtitle": "Define server URLs and environments to help users connect to your API."
  };
  function _createMdxContent(props) {
    const _components = {
      a: "a",
      code: "code",
      h2: "h2",
      li: "li",
      p: "p",
      ul: "ul",
      ...useMDXComponents(),
      ...props.components
    }, { CodeBlock, ErrorBoundary, Info } = _components;
    if (!CodeBlock) _missingMdxReference("CodeBlock", true);
    if (!ErrorBoundary) _missingMdxReference("ErrorBoundary", true);
    if (!Info) _missingMdxReference("Info", true);
    return (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, {
      children: [(0, import_jsx_runtime.jsxs)(_components.p, {
        children: ["OpenAPI allows you to specify one or more base URLs under the ", (0, import_jsx_runtime.jsx)(_components.code, {
          children: "servers"
        }), " key."]
      }), "\n", (0, import_jsx_runtime.jsx)(ErrorBoundary, {
        children: (0, import_jsx_runtime.jsx)(CodeBlock, {
          code: "servers:\n  - url: https://api.yourcompany.com/\n  - url: https://api.eu.yourcompany.com/\n",
          className: "language-yml",
          language: "yml",
          title: "openapi.yml"
        })
      }), "\n", (0, import_jsx_runtime.jsx)(_components.p, {
        children: "Specifying servers is valuable for both SDKs and Docs:"
      }), "\n", (0, import_jsx_runtime.jsxs)(_components.ul, {
        children: ["\n", (0, import_jsx_runtime.jsx)(_components.li, {
          children: "For SDKs, your users won\u2019t need to manually specify the baseURL at client instantiation"
        }), "\n", (0, import_jsx_runtime.jsx)(_components.li, {
          children: "For Docs, your API playground will automatically hit the correct server"
        }), "\n"]
      }), "\n", (0, import_jsx_runtime.jsx)(_components.h2, {
        id: "naming-your-servers",
        children: "Naming your servers"
      }), "\n", (0, import_jsx_runtime.jsxs)(_components.p, {
        children: ["If you have more than one server, we recommend specifying an ", (0, import_jsx_runtime.jsx)(_components.code, {
          children: "x-fern-server-name"
        }), " to name\nthe server."]
      }), "\n", (0, import_jsx_runtime.jsx)(ErrorBoundary, {
        children: (0, import_jsx_runtime.jsx)(CodeBlock, {
          code: "servers:\n  - x-fern-server-name: Production\n    url: https://api.yourcompany.com/\n  - x-fern-server-name: Production_EU\n    url: https://api.eu.yourcompany.com/\n",
          className: "language-yml",
          language: "yml",
          title: "openapi.yml",
          highlight: [3, 5]
        })
      }), "\n", (0, import_jsx_runtime.jsx)(_components.h2, {
        id: "multiple-base-urls-for-a-single-api",
        children: "Multiple Base URLs for a single API"
      }), "\n", (0, import_jsx_runtime.jsxs)(_components.p, {
        children: ["If you have a microservice architecture, it is possible that you may have different endpoints hosted\nat differnt URLs. For example, your AI endpoints might be hosted at ", (0, import_jsx_runtime.jsx)(_components.code, {
          children: "ai.yourcompany.com"
        }), " and the rest\nof your endpoins might be hosted at ", (0, import_jsx_runtime.jsx)(_components.code, {
          children: "api.yourcompany.com"
        }), "."]
      }), "\n", (0, import_jsx_runtime.jsxs)(_components.p, {
        children: ["To specify this, you will need to add configuration to both your ", (0, import_jsx_runtime.jsx)(_components.code, {
          children: "generators.yml"
        }), " and OpenAPI spec. The\nsnippet directly below shows how to configure an environment with multiple urls in your ", (0, import_jsx_runtime.jsx)(_components.code, {
          children: "generators.yml"
        }), "."]
      }), "\n", (0, import_jsx_runtime.jsx)(ErrorBoundary, {
        children: (0, import_jsx_runtime.jsx)(CodeBlock, {
          code: "api:\n  default-environment: Production\n  default-url: api\n  environments:\n    Production:\n      api: api.yourcompany.com\n      ai: ai.yourcompany.com\n  specs:\n    - openapi: ./path/to/your/openapi\n      overrides: ./path/to/your/overrides # optional\n",
          className: "language-yml",
          language: "yml",
          title: "generators.yml",
          highlight: [3, 4, 5, 6, 7, 8]
        })
      }), "\n", (0, import_jsx_runtime.jsxs)(_components.p, {
        children: ["Once you\u2019ve specified the environments in your ", (0, import_jsx_runtime.jsx)(_components.code, {
          children: "generators.yml"
        }), ", you can use the ", (0, import_jsx_runtime.jsx)(_components.code, {
          children: "x-fern-server-name"
        }), "\nextension to specify which server the operation belongs to."]
      }), "\n", (0, import_jsx_runtime.jsx)(ErrorBoundary, {
        children: (0, import_jsx_runtime.jsx)(CodeBlock, {
          code: "paths:\n  /chat:\n    post:\n      x-fern-server-name: ai\n",
          className: "language-yml",
          language: "yml",
          title: "openapi.yml",
          highlight: 4
        })
      }), "\n", (0, import_jsx_runtime.jsxs)(_components.p, {
        children: ["If you have multiple environments like development or staging, you can model those in your ", (0, import_jsx_runtime.jsx)(_components.code, {
          children: "generators.yml"
        }), "\nas well."]
      }), "\n", (0, import_jsx_runtime.jsx)(ErrorBoundary, {
        children: (0, import_jsx_runtime.jsx)(CodeBlock, {
          code: "api:\n  default-environment: Production\n  default-url: api\n  environments:\n    Production:\n      api: api.yourcompany.com\n      ai: ai.yourcompany.com\n    Staging:\n      api: api.staging.yourcompany.com\n      ai: ai.staging.yourcompany.com\n    Dev:\n      api: api.dev.yourcompany.com\n      ai: ai.dev.yourcompany.com\n",
          className: "language-yml",
          language: "yml",
          title: "generators.yml",
          highlight: [7, 8, 9, 10, 11, 12]
        })
      }), "\n", (0, import_jsx_runtime.jsx)(ErrorBoundary, {
        children: (0, import_jsx_runtime.jsx)(Info, {
          children: (0, import_jsx_runtime.jsxs)(_components.p, {
            children: ["To see an example of this in production, check out the Chariot\n", (0, import_jsx_runtime.jsx)(_components.a, {
              href: "https://github.com/chariot-giving/chariot-openapi/blob/main/fern/generators.yml",
              children: "generators.yml"
            })]
          })
        })
      })]
    });
  }
  function MDXContent(props = {}) {
    const { wrapper: MDXLayout } = {
      ...useMDXComponents(),
      ...props.components
    };
    return MDXLayout ? (0, import_jsx_runtime.jsx)(MDXLayout, {
      ...props,
      children: (0, import_jsx_runtime.jsx)(_createMdxContent, {
        ...props
      })
    }) : _createMdxContent(props);
  }
  function _missingMdxReference(id, component) {
    throw new Error("Expected " + (component ? "component" : "object") + " `" + id + "` to be defined: you likely forgot to import, pass, or provide it.");
  }
  return __toCommonJS(mdx_bundler_entry_point__random_uuid__exports);
})();
;return Component;