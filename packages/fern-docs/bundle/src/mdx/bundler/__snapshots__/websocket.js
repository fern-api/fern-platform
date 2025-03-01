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
  var frontmatter = void 0;
  function _createMdxContent(props) {
    const _components = {
      a: "a",
      code: "code",
      em: "em",
      li: "li",
      ol: "ol",
      p: "p",
      strong: "strong",
      ul: "ul",
      ...useMDXComponents(),
      ...props.components
    };
    return (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, {
      children: [(0, import_jsx_runtime.jsx)(_components.p, {
        children: "This endpoint creates a bidirectional WebSocket connection. The connection supports multiplexing, so you can send multiple requests and receive the corresponding responses in parallel."
      }), "\n", (0, import_jsx_runtime.jsxs)(_components.p, {
        children: ["The WebSocket API is built around ", (0, import_jsx_runtime.jsx)(_components.em, {
          children: "contexts"
        }), ":"]
      }), "\n", (0, import_jsx_runtime.jsxs)(_components.ul, {
        children: ["\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: ["When you send a generation request, you pass a ", (0, import_jsx_runtime.jsx)(_components.code, {
            children: "context_id"
          }), ". Further inputs on the same ", (0, import_jsx_runtime.jsx)(_components.code, {
            children: "context_id"
          }), " will ", (0, import_jsx_runtime.jsx)(_components.a, {
            href: "/build-with-sonic/capability-guides/stream-inputs-using-continuations",
            children: "continue the generation"
          }), ", maintaining prosody."]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: ["Responses for a context contain the ", (0, import_jsx_runtime.jsx)(_components.code, {
            children: "context_id"
          }), " you passed in so that you can match requests and responses."]
        }), "\n"]
      }), "\n", (0, import_jsx_runtime.jsxs)(_components.p, {
        children: ["Read the guide on ", (0, import_jsx_runtime.jsx)(_components.a, {
          href: "/api-reference/tts/working-with-web-sockets/contexts",
          children: "working with contexts"
        }), " to learn more."]
      }), "\n", (0, import_jsx_runtime.jsx)(_components.p, {
        children: "For the best performance, we recommend the following usage pattern:"
      }), "\n", (0, import_jsx_runtime.jsxs)(_components.ol, {
        children: ["\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.strong, {
            children: "Do many generations over a single WebSocket."
          }), " Just use a separate context for each generation. The WebSocket scales up to dozens of concurrent generations."]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.strong, {
            children: "Set up the WebSocket before the first generation."
          }), " This ensures you don\u2019t incur latency when you start generating speech."]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.strong, {
            children: "Buffer the first input on a context"
          }), " to at least 3 or 4 words for optimizing both latency and prosody."]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.strong, {
            children: "Split inputs into sentences:"
          }), " Sending inputs in sentences allows Sonic to generate speech more accurately and with better prosody. Include necessary spaces and punctuation.\nFor conversational agent use cases, we recommend the following usage pattern:"]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.strong, {
            children: "Each turn in a conversation should correspond to a context:"
          }), " For example, if you are using Sonic to power a voice agent, each turn in the conversation should be a new context."]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.strong, {
            children: "Start a new context for interruptions:"
          }), " If the user interrupts the agent, start a new context for the agent\u2019s response."]
        }), "\n"]
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
  return __toCommonJS(mdx_bundler_entry_point__random_uuid__exports);
})();
;return Component;