var Component = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
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

  // global-externals:@mdx-js/react
  var react_exports = {};
  __export(react_exports, {
    useMDXComponents: () => useMDXComponents
  });
  var useMDXComponents;
  var init_react = __esm({
    "global-externals:@mdx-js/react"() {
      ({ useMDXComponents } = MdxJsReact);
    }
  });

  // global-externals:react
  var require_react = __commonJS({
    "global-externals:react"(exports, module) {
      module.exports = React;
    }
  });

  // ../../../imports/JsonSchemaBlock.js
  var require_JsonSchemaBlock = __commonJS({
    "../../../imports/JsonSchemaBlock.js"(exports, module) {
      "use strict";
      var Re = Object.defineProperty;
      var Jt = Object.getOwnPropertyDescriptor;
      var Gt = Object.getOwnPropertyNames;
      var Kt = Object.prototype.hasOwnProperty;
      var Yt = (r, e) => {
        for (var t in e) Re(r, t, { get: e[t], enumerable: true });
      };
      var Xt = (r, e, t, n) => {
        if (e && typeof e == "object" || typeof e == "function") for (let a of Gt(e)) !Kt.call(r, a) && a !== t && Re(r, a, { get: () => e[a], enumerable: !(n = Jt(e, a)) || n.enumerable });
        return r;
      };
      var Qt = (r) => Xt(Re({}, "__esModule", { value: true }), r);
      var kn = {};
      Yt(kn, { JsonSchemaBlock: () => xn });
      module.exports = Qt(kn);
      var Ht = require_react();
      var k;
      (function(r) {
        r.assertEqual = (a) => a;
        function e(a) {
        }
        r.assertIs = e;
        function t(a) {
          throw new Error();
        }
        r.assertNever = t, r.arrayToEnum = (a) => {
          let s = {};
          for (let i of a) s[i] = i;
          return s;
        }, r.getValidEnumValues = (a) => {
          let s = r.objectKeys(a).filter((o) => typeof a[a[o]] != "number"), i = {};
          for (let o of s) i[o] = a[o];
          return r.objectValues(i);
        }, r.objectValues = (a) => r.objectKeys(a).map(function(s) {
          return a[s];
        }), r.objectKeys = typeof Object.keys == "function" ? (a) => Object.keys(a) : (a) => {
          let s = [];
          for (let i in a) Object.prototype.hasOwnProperty.call(a, i) && s.push(i);
          return s;
        }, r.find = (a, s) => {
          for (let i of a) if (s(i)) return i;
        }, r.isInteger = typeof Number.isInteger == "function" ? (a) => Number.isInteger(a) : (a) => typeof a == "number" && isFinite(a) && Math.floor(a) === a;
        function n(a, s = " | ") {
          return a.map((i) => typeof i == "string" ? `'${i}'` : i).join(s);
        }
        r.joinValues = n, r.jsonStringifyReplacer = (a, s) => typeof s == "bigint" ? s.toString() : s;
      })(k || (k = {}));
      var Ce;
      (function(r) {
        r.mergeShapes = (e, t) => ({ ...e, ...t });
      })(Ce || (Ce = {}));
      var f = k.arrayToEnum(["string", "nan", "number", "integer", "float", "boolean", "date", "bigint", "symbol", "function", "undefined", "null", "array", "object", "unknown", "promise", "void", "never", "map", "set"]);
      var L = (r) => {
        switch (typeof r) {
          case "undefined":
            return f.undefined;
          case "string":
            return f.string;
          case "number":
            return isNaN(r) ? f.nan : f.number;
          case "boolean":
            return f.boolean;
          case "function":
            return f.function;
          case "bigint":
            return f.bigint;
          case "symbol":
            return f.symbol;
          case "object":
            return Array.isArray(r) ? f.array : r === null ? f.null : r.then && typeof r.then == "function" && r.catch && typeof r.catch == "function" ? f.promise : typeof Map < "u" && r instanceof Map ? f.map : typeof Set < "u" && r instanceof Set ? f.set : typeof Date < "u" && r instanceof Date ? f.date : f.object;
          default:
            return f.unknown;
        }
      };
      var c = k.arrayToEnum(["invalid_type", "invalid_literal", "custom", "invalid_union", "invalid_union_discriminator", "invalid_enum_value", "unrecognized_keys", "invalid_arguments", "invalid_return_type", "invalid_date", "invalid_string", "too_small", "too_big", "invalid_intersection_types", "not_multiple_of", "not_finite"]);
      var er = (r) => JSON.stringify(r, null, 2).replace(/"([^"]+)":/g, "$1:");
      var E = class r extends Error {
        get errors() {
          return this.issues;
        }
        constructor(e) {
          super(), this.issues = [], this.addIssue = (n) => {
            this.issues = [...this.issues, n];
          }, this.addIssues = (n = []) => {
            this.issues = [...this.issues, ...n];
          };
          let t = new.target.prototype;
          Object.setPrototypeOf ? Object.setPrototypeOf(this, t) : this.__proto__ = t, this.name = "ZodError", this.issues = e;
        }
        format(e) {
          let t = e || function(s) {
            return s.message;
          }, n = { _errors: [] }, a = (s) => {
            for (let i of s.issues) if (i.code === "invalid_union") i.unionErrors.map(a);
            else if (i.code === "invalid_return_type") a(i.returnTypeError);
            else if (i.code === "invalid_arguments") a(i.argumentsError);
            else if (i.path.length === 0) n._errors.push(t(i));
            else {
              let o = n, u = 0;
              for (; u < i.path.length; ) {
                let l = i.path[u];
                u === i.path.length - 1 ? (o[l] = o[l] || { _errors: [] }, o[l]._errors.push(t(i))) : o[l] = o[l] || { _errors: [] }, o = o[l], u++;
              }
            }
          };
          return a(this), n;
        }
        static assert(e) {
          if (!(e instanceof r)) throw new Error(`Not a ZodError: ${e}`);
        }
        toString() {
          return this.message;
        }
        get message() {
          return JSON.stringify(this.issues, k.jsonStringifyReplacer, 2);
        }
        get isEmpty() {
          return this.issues.length === 0;
        }
        flatten(e = (t) => t.message) {
          let t = {}, n = [];
          for (let a of this.issues) a.path.length > 0 ? (t[a.path[0]] = t[a.path[0]] || [], t[a.path[0]].push(e(a))) : n.push(e(a));
          return { formErrors: n, fieldErrors: t };
        }
        get formErrors() {
          return this.flatten();
        }
      };
      E.create = (r) => new E(r);
      var ce = (r, e) => {
        let t;
        switch (r.code) {
          case c.invalid_type:
            r.received === f.undefined ? t = "Required" : t = `Expected ${r.expected}, received ${r.received}`;
            break;
          case c.invalid_literal:
            t = `Invalid literal value, expected ${JSON.stringify(r.expected, k.jsonStringifyReplacer)}`;
            break;
          case c.unrecognized_keys:
            t = `Unrecognized key(s) in object: ${k.joinValues(r.keys, ", ")}`;
            break;
          case c.invalid_union:
            t = "Invalid input";
            break;
          case c.invalid_union_discriminator:
            t = `Invalid discriminator value. Expected ${k.joinValues(r.options)}`;
            break;
          case c.invalid_enum_value:
            t = `Invalid enum value. Expected ${k.joinValues(r.options)}, received '${r.received}'`;
            break;
          case c.invalid_arguments:
            t = "Invalid function arguments";
            break;
          case c.invalid_return_type:
            t = "Invalid function return type";
            break;
          case c.invalid_date:
            t = "Invalid date";
            break;
          case c.invalid_string:
            typeof r.validation == "object" ? "includes" in r.validation ? (t = `Invalid input: must include "${r.validation.includes}"`, typeof r.validation.position == "number" && (t = `${t} at one or more positions greater than or equal to ${r.validation.position}`)) : "startsWith" in r.validation ? t = `Invalid input: must start with "${r.validation.startsWith}"` : "endsWith" in r.validation ? t = `Invalid input: must end with "${r.validation.endsWith}"` : k.assertNever(r.validation) : r.validation !== "regex" ? t = `Invalid ${r.validation}` : t = "Invalid";
            break;
          case c.too_small:
            r.type === "array" ? t = `Array must contain ${r.exact ? "exactly" : r.inclusive ? "at least" : "more than"} ${r.minimum} element(s)` : r.type === "string" ? t = `String must contain ${r.exact ? "exactly" : r.inclusive ? "at least" : "over"} ${r.minimum} character(s)` : r.type === "number" ? t = `Number must be ${r.exact ? "exactly equal to " : r.inclusive ? "greater than or equal to " : "greater than "}${r.minimum}` : r.type === "date" ? t = `Date must be ${r.exact ? "exactly equal to " : r.inclusive ? "greater than or equal to " : "greater than "}${new Date(Number(r.minimum))}` : t = "Invalid input";
            break;
          case c.too_big:
            r.type === "array" ? t = `Array must contain ${r.exact ? "exactly" : r.inclusive ? "at most" : "less than"} ${r.maximum} element(s)` : r.type === "string" ? t = `String must contain ${r.exact ? "exactly" : r.inclusive ? "at most" : "under"} ${r.maximum} character(s)` : r.type === "number" ? t = `Number must be ${r.exact ? "exactly" : r.inclusive ? "less than or equal to" : "less than"} ${r.maximum}` : r.type === "bigint" ? t = `BigInt must be ${r.exact ? "exactly" : r.inclusive ? "less than or equal to" : "less than"} ${r.maximum}` : r.type === "date" ? t = `Date must be ${r.exact ? "exactly" : r.inclusive ? "smaller than or equal to" : "smaller than"} ${new Date(Number(r.maximum))}` : t = "Invalid input";
            break;
          case c.custom:
            t = "Invalid input";
            break;
          case c.invalid_intersection_types:
            t = "Intersection results could not be merged";
            break;
          case c.not_multiple_of:
            t = `Number must be a multiple of ${r.multipleOf}`;
            break;
          case c.not_finite:
            t = "Number must be finite";
            break;
          default:
            t = e.defaultError, k.assertNever(r);
        }
        return { message: t };
      };
      var Ge = ce;
      function tr(r) {
        Ge = r;
      }
      function ke() {
        return Ge;
      }
      var Te = (r) => {
        let { data: e, path: t, errorMaps: n, issueData: a } = r, s = [...t, ...a.path || []], i = { ...a, path: s };
        if (a.message !== void 0) return { ...a, path: s, message: a.message };
        let o = "", u = n.filter((l) => !!l).slice().reverse();
        for (let l of u) o = l(i, { data: e, defaultError: o }).message;
        return { ...a, path: s, message: o };
      };
      var rr = [];
      function p(r, e) {
        let t = ke(), n = Te({ issueData: e, data: r.data, path: r.path, errorMaps: [r.common.contextualErrorMap, r.schemaErrorMap, t, t === ce ? void 0 : ce].filter((a) => !!a) });
        r.common.issues.push(n);
      }
      var T = class r {
        constructor() {
          this.value = "valid";
        }
        dirty() {
          this.value === "valid" && (this.value = "dirty");
        }
        abort() {
          this.value !== "aborted" && (this.value = "aborted");
        }
        static mergeArray(e, t) {
          let n = [];
          for (let a of t) {
            if (a.status === "aborted") return v;
            a.status === "dirty" && e.dirty(), n.push(a.value);
          }
          return { status: e.value, value: n };
        }
        static async mergeObjectAsync(e, t) {
          let n = [];
          for (let a of t) {
            let s = await a.key, i = await a.value;
            n.push({ key: s, value: i });
          }
          return r.mergeObjectSync(e, n);
        }
        static mergeObjectSync(e, t) {
          let n = {};
          for (let a of t) {
            let { key: s, value: i } = a;
            if (s.status === "aborted" || i.status === "aborted") return v;
            s.status === "dirty" && e.dirty(), i.status === "dirty" && e.dirty(), s.value !== "__proto__" && (typeof i.value < "u" || a.alwaysSet) && (n[s.value] = i.value);
          }
          return { status: e.value, value: n };
        }
      };
      var v = Object.freeze({ status: "aborted" });
      var ue = (r) => ({ status: "dirty", value: r });
      var A = (r) => ({ status: "valid", value: r });
      var je = (r) => r.status === "aborted";
      var Me = (r) => r.status === "dirty";
      var q = (r) => r.status === "valid";
      var ye = (r) => typeof Promise < "u" && r instanceof Promise;
      function we(r, e, t, n) {
        if (t === "a" && !n) throw new TypeError("Private accessor was defined without a getter");
        if (typeof e == "function" ? r !== e || !n : !e.has(r)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
        return t === "m" ? n : t === "a" ? n.call(r) : n ? n.value : e.get(r);
      }
      function Ke(r, e, t, n, a) {
        if (n === "m") throw new TypeError("Private method is not writable");
        if (n === "a" && !a) throw new TypeError("Private accessor was defined without a setter");
        if (typeof e == "function" ? r !== e || !a : !e.has(r)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
        return n === "a" ? a.call(r, t) : a ? a.value = t : e.set(r, t), t;
      }
      var m;
      (function(r) {
        r.errToObj = (e) => typeof e == "string" ? { message: e } : e || {}, r.toString = (e) => typeof e == "string" ? e : e?.message;
      })(m || (m = {}));
      var he;
      var ge;
      var Z = class {
        constructor(e, t, n, a) {
          this._cachedPath = [], this.parent = e, this.data = t, this._path = n, this._key = a;
        }
        get path() {
          return this._cachedPath.length || (this._key instanceof Array ? this._cachedPath.push(...this._path, ...this._key) : this._cachedPath.push(...this._path, this._key)), this._cachedPath;
        }
      };
      var We = (r, e) => {
        if (q(e)) return { success: true, data: e.value };
        if (!r.common.issues.length) throw new Error("Validation failed but no issues detected.");
        return { success: false, get error() {
          if (this._error) return this._error;
          let t = new E(r.common.issues);
          return this._error = t, this._error;
        } };
      };
      function _(r) {
        if (!r) return {};
        let { errorMap: e, invalid_type_error: t, required_error: n, description: a } = r;
        if (e && (t || n)) throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
        return e ? { errorMap: e, description: a } : { errorMap: (i, o) => {
          var u, l;
          let { message: g } = r;
          return i.code === "invalid_enum_value" ? { message: g ?? o.defaultError } : typeof o.data > "u" ? { message: (u = g ?? n) !== null && u !== void 0 ? u : o.defaultError } : i.code !== "invalid_type" ? { message: o.defaultError } : { message: (l = g ?? t) !== null && l !== void 0 ? l : o.defaultError };
        }, description: a };
      }
      var b = class {
        get description() {
          return this._def.description;
        }
        _getType(e) {
          return L(e.data);
        }
        _getOrReturnCtx(e, t) {
          return t || { common: e.parent.common, data: e.data, parsedType: L(e.data), schemaErrorMap: this._def.errorMap, path: e.path, parent: e.parent };
        }
        _processInputParams(e) {
          return { status: new T(), ctx: { common: e.parent.common, data: e.data, parsedType: L(e.data), schemaErrorMap: this._def.errorMap, path: e.path, parent: e.parent } };
        }
        _parseSync(e) {
          let t = this._parse(e);
          if (ye(t)) throw new Error("Synchronous parse encountered promise.");
          return t;
        }
        _parseAsync(e) {
          let t = this._parse(e);
          return Promise.resolve(t);
        }
        parse(e, t) {
          let n = this.safeParse(e, t);
          if (n.success) return n.data;
          throw n.error;
        }
        safeParse(e, t) {
          var n;
          let a = { common: { issues: [], async: (n = t?.async) !== null && n !== void 0 ? n : false, contextualErrorMap: t?.errorMap }, path: t?.path || [], schemaErrorMap: this._def.errorMap, parent: null, data: e, parsedType: L(e) }, s = this._parseSync({ data: e, path: a.path, parent: a });
          return We(a, s);
        }
        "~validate"(e) {
          var t, n;
          let a = { common: { issues: [], async: !!this["~standard"].async }, path: [], schemaErrorMap: this._def.errorMap, parent: null, data: e, parsedType: L(e) };
          if (!this["~standard"].async) try {
            let s = this._parseSync({ data: e, path: [], parent: a });
            return q(s) ? { value: s.value } : { issues: a.common.issues };
          } catch (s) {
            !((n = (t = s?.message) === null || t === void 0 ? void 0 : t.toLowerCase()) === null || n === void 0) && n.includes("encountered") && (this["~standard"].async = true), a.common = { issues: [], async: true };
          }
          return this._parseAsync({ data: e, path: [], parent: a }).then((s) => q(s) ? { value: s.value } : { issues: a.common.issues });
        }
        async parseAsync(e, t) {
          let n = await this.safeParseAsync(e, t);
          if (n.success) return n.data;
          throw n.error;
        }
        async safeParseAsync(e, t) {
          let n = { common: { issues: [], contextualErrorMap: t?.errorMap, async: true }, path: t?.path || [], schemaErrorMap: this._def.errorMap, parent: null, data: e, parsedType: L(e) }, a = this._parse({ data: e, path: n.path, parent: n }), s = await (ye(a) ? a : Promise.resolve(a));
          return We(n, s);
        }
        refine(e, t) {
          let n = (a) => typeof t == "string" || typeof t > "u" ? { message: t } : typeof t == "function" ? t(a) : t;
          return this._refinement((a, s) => {
            let i = e(a), o = () => s.addIssue({ code: c.custom, ...n(a) });
            return typeof Promise < "u" && i instanceof Promise ? i.then((u) => u ? true : (o(), false)) : i ? true : (o(), false);
          });
        }
        refinement(e, t) {
          return this._refinement((n, a) => e(n) ? true : (a.addIssue(typeof t == "function" ? t(n, a) : t), false));
        }
        _refinement(e) {
          return new N({ schema: this, typeName: d.ZodEffects, effect: { type: "refinement", refinement: e } });
        }
        superRefine(e) {
          return this._refinement(e);
        }
        constructor(e) {
          this.spa = this.safeParseAsync, this._def = e, this.parse = this.parse.bind(this), this.safeParse = this.safeParse.bind(this), this.parseAsync = this.parseAsync.bind(this), this.safeParseAsync = this.safeParseAsync.bind(this), this.spa = this.spa.bind(this), this.refine = this.refine.bind(this), this.refinement = this.refinement.bind(this), this.superRefine = this.superRefine.bind(this), this.optional = this.optional.bind(this), this.nullable = this.nullable.bind(this), this.nullish = this.nullish.bind(this), this.array = this.array.bind(this), this.promise = this.promise.bind(this), this.or = this.or.bind(this), this.and = this.and.bind(this), this.transform = this.transform.bind(this), this.brand = this.brand.bind(this), this.default = this.default.bind(this), this.catch = this.catch.bind(this), this.describe = this.describe.bind(this), this.pipe = this.pipe.bind(this), this.readonly = this.readonly.bind(this), this.isNullable = this.isNullable.bind(this), this.isOptional = this.isOptional.bind(this), this["~standard"] = { version: 1, vendor: "zod", validate: (t) => this["~validate"](t) };
        }
        optional() {
          return S.create(this, this._def);
        }
        nullable() {
          return D.create(this, this._def);
        }
        nullish() {
          return this.nullable().optional();
        }
        array() {
          return F.create(this);
        }
        promise() {
          return B.create(this, this._def);
        }
        or(e) {
          return X.create([this, e], this._def);
        }
        and(e) {
          return Q.create(this, e, this._def);
        }
        transform(e) {
          return new N({ ..._(this._def), schema: this, typeName: d.ZodEffects, effect: { type: "transform", transform: e } });
        }
        default(e) {
          let t = typeof e == "function" ? e : () => e;
          return new ae({ ..._(this._def), innerType: this, defaultValue: t, typeName: d.ZodDefault });
        }
        brand() {
          return new ve({ typeName: d.ZodBranded, type: this, ..._(this._def) });
        }
        catch(e) {
          let t = typeof e == "function" ? e : () => e;
          return new se({ ..._(this._def), innerType: this, catchValue: t, typeName: d.ZodCatch });
        }
        describe(e) {
          let t = this.constructor;
          return new t({ ...this._def, description: e });
        }
        pipe(e) {
          return _e.create(this, e);
        }
        readonly() {
          return ie.create(this);
        }
        isOptional() {
          return this.safeParse(void 0).success;
        }
        isNullable() {
          return this.safeParse(null).success;
        }
      };
      var nr = /^c[^\s-]{8,}$/i;
      var ar = /^[0-9a-z]+$/;
      var sr = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
      var ir = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
      var or = /^[a-z0-9_-]{21}$/i;
      var ur = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
      var cr = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
      var dr = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
      var lr = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
      var Ie;
      var pr = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
      var fr = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
      var mr = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
      var hr = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
      var gr = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
      var yr = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
      var Ye = "((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))";
      var vr = new RegExp(`^${Ye}$`);
      function Xe(r) {
        let e = "([01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d";
        return r.precision ? e = `${e}\\.\\d{${r.precision}}` : r.precision == null && (e = `${e}(\\.\\d+)?`), e;
      }
      function _r(r) {
        return new RegExp(`^${Xe(r)}$`);
      }
      function Qe(r) {
        let e = `${Ye}T${Xe(r)}`, t = [];
        return t.push(r.local ? "Z?" : "Z"), r.offset && t.push("([+-]\\d{2}:?\\d{2})"), e = `${e}(${t.join("|")})`, new RegExp(`^${e}$`);
      }
      function br(r, e) {
        return !!((e === "v4" || !e) && pr.test(r) || (e === "v6" || !e) && mr.test(r));
      }
      function xr(r, e) {
        if (!ur.test(r)) return false;
        try {
          let [t] = r.split("."), n = t.replace(/-/g, "+").replace(/_/g, "/").padEnd(t.length + (4 - t.length % 4) % 4, "="), a = JSON.parse(atob(n));
          return !(typeof a != "object" || a === null || !a.typ || !a.alg || e && a.alg !== e);
        } catch {
          return false;
        }
      }
      function kr(r, e) {
        return !!((e === "v4" || !e) && fr.test(r) || (e === "v6" || !e) && hr.test(r));
      }
      var U = class r extends b {
        _parse(e) {
          if (this._def.coerce && (e.data = String(e.data)), this._getType(e) !== f.string) {
            let s = this._getOrReturnCtx(e);
            return p(s, { code: c.invalid_type, expected: f.string, received: s.parsedType }), v;
          }
          let n = new T(), a;
          for (let s of this._def.checks) if (s.kind === "min") e.data.length < s.value && (a = this._getOrReturnCtx(e, a), p(a, { code: c.too_small, minimum: s.value, type: "string", inclusive: true, exact: false, message: s.message }), n.dirty());
          else if (s.kind === "max") e.data.length > s.value && (a = this._getOrReturnCtx(e, a), p(a, { code: c.too_big, maximum: s.value, type: "string", inclusive: true, exact: false, message: s.message }), n.dirty());
          else if (s.kind === "length") {
            let i = e.data.length > s.value, o = e.data.length < s.value;
            (i || o) && (a = this._getOrReturnCtx(e, a), i ? p(a, { code: c.too_big, maximum: s.value, type: "string", inclusive: true, exact: true, message: s.message }) : o && p(a, { code: c.too_small, minimum: s.value, type: "string", inclusive: true, exact: true, message: s.message }), n.dirty());
          } else if (s.kind === "email") dr.test(e.data) || (a = this._getOrReturnCtx(e, a), p(a, { validation: "email", code: c.invalid_string, message: s.message }), n.dirty());
          else if (s.kind === "emoji") Ie || (Ie = new RegExp(lr, "u")), Ie.test(e.data) || (a = this._getOrReturnCtx(e, a), p(a, { validation: "emoji", code: c.invalid_string, message: s.message }), n.dirty());
          else if (s.kind === "uuid") ir.test(e.data) || (a = this._getOrReturnCtx(e, a), p(a, { validation: "uuid", code: c.invalid_string, message: s.message }), n.dirty());
          else if (s.kind === "nanoid") or.test(e.data) || (a = this._getOrReturnCtx(e, a), p(a, { validation: "nanoid", code: c.invalid_string, message: s.message }), n.dirty());
          else if (s.kind === "cuid") nr.test(e.data) || (a = this._getOrReturnCtx(e, a), p(a, { validation: "cuid", code: c.invalid_string, message: s.message }), n.dirty());
          else if (s.kind === "cuid2") ar.test(e.data) || (a = this._getOrReturnCtx(e, a), p(a, { validation: "cuid2", code: c.invalid_string, message: s.message }), n.dirty());
          else if (s.kind === "ulid") sr.test(e.data) || (a = this._getOrReturnCtx(e, a), p(a, { validation: "ulid", code: c.invalid_string, message: s.message }), n.dirty());
          else if (s.kind === "url") try {
            new URL(e.data);
          } catch {
            a = this._getOrReturnCtx(e, a), p(a, { validation: "url", code: c.invalid_string, message: s.message }), n.dirty();
          }
          else s.kind === "regex" ? (s.regex.lastIndex = 0, s.regex.test(e.data) || (a = this._getOrReturnCtx(e, a), p(a, { validation: "regex", code: c.invalid_string, message: s.message }), n.dirty())) : s.kind === "trim" ? e.data = e.data.trim() : s.kind === "includes" ? e.data.includes(s.value, s.position) || (a = this._getOrReturnCtx(e, a), p(a, { code: c.invalid_string, validation: { includes: s.value, position: s.position }, message: s.message }), n.dirty()) : s.kind === "toLowerCase" ? e.data = e.data.toLowerCase() : s.kind === "toUpperCase" ? e.data = e.data.toUpperCase() : s.kind === "startsWith" ? e.data.startsWith(s.value) || (a = this._getOrReturnCtx(e, a), p(a, { code: c.invalid_string, validation: { startsWith: s.value }, message: s.message }), n.dirty()) : s.kind === "endsWith" ? e.data.endsWith(s.value) || (a = this._getOrReturnCtx(e, a), p(a, { code: c.invalid_string, validation: { endsWith: s.value }, message: s.message }), n.dirty()) : s.kind === "datetime" ? Qe(s).test(e.data) || (a = this._getOrReturnCtx(e, a), p(a, { code: c.invalid_string, validation: "datetime", message: s.message }), n.dirty()) : s.kind === "date" ? vr.test(e.data) || (a = this._getOrReturnCtx(e, a), p(a, { code: c.invalid_string, validation: "date", message: s.message }), n.dirty()) : s.kind === "time" ? _r(s).test(e.data) || (a = this._getOrReturnCtx(e, a), p(a, { code: c.invalid_string, validation: "time", message: s.message }), n.dirty()) : s.kind === "duration" ? cr.test(e.data) || (a = this._getOrReturnCtx(e, a), p(a, { validation: "duration", code: c.invalid_string, message: s.message }), n.dirty()) : s.kind === "ip" ? br(e.data, s.version) || (a = this._getOrReturnCtx(e, a), p(a, { validation: "ip", code: c.invalid_string, message: s.message }), n.dirty()) : s.kind === "jwt" ? xr(e.data, s.alg) || (a = this._getOrReturnCtx(e, a), p(a, { validation: "jwt", code: c.invalid_string, message: s.message }), n.dirty()) : s.kind === "cidr" ? kr(e.data, s.version) || (a = this._getOrReturnCtx(e, a), p(a, { validation: "cidr", code: c.invalid_string, message: s.message }), n.dirty()) : s.kind === "base64" ? gr.test(e.data) || (a = this._getOrReturnCtx(e, a), p(a, { validation: "base64", code: c.invalid_string, message: s.message }), n.dirty()) : s.kind === "base64url" ? yr.test(e.data) || (a = this._getOrReturnCtx(e, a), p(a, { validation: "base64url", code: c.invalid_string, message: s.message }), n.dirty()) : k.assertNever(s);
          return { status: n.value, value: e.data };
        }
        _regex(e, t, n) {
          return this.refinement((a) => e.test(a), { validation: t, code: c.invalid_string, ...m.errToObj(n) });
        }
        _addCheck(e) {
          return new r({ ...this._def, checks: [...this._def.checks, e] });
        }
        email(e) {
          return this._addCheck({ kind: "email", ...m.errToObj(e) });
        }
        url(e) {
          return this._addCheck({ kind: "url", ...m.errToObj(e) });
        }
        emoji(e) {
          return this._addCheck({ kind: "emoji", ...m.errToObj(e) });
        }
        uuid(e) {
          return this._addCheck({ kind: "uuid", ...m.errToObj(e) });
        }
        nanoid(e) {
          return this._addCheck({ kind: "nanoid", ...m.errToObj(e) });
        }
        cuid(e) {
          return this._addCheck({ kind: "cuid", ...m.errToObj(e) });
        }
        cuid2(e) {
          return this._addCheck({ kind: "cuid2", ...m.errToObj(e) });
        }
        ulid(e) {
          return this._addCheck({ kind: "ulid", ...m.errToObj(e) });
        }
        base64(e) {
          return this._addCheck({ kind: "base64", ...m.errToObj(e) });
        }
        base64url(e) {
          return this._addCheck({ kind: "base64url", ...m.errToObj(e) });
        }
        jwt(e) {
          return this._addCheck({ kind: "jwt", ...m.errToObj(e) });
        }
        ip(e) {
          return this._addCheck({ kind: "ip", ...m.errToObj(e) });
        }
        cidr(e) {
          return this._addCheck({ kind: "cidr", ...m.errToObj(e) });
        }
        datetime(e) {
          var t, n;
          return typeof e == "string" ? this._addCheck({ kind: "datetime", precision: null, offset: false, local: false, message: e }) : this._addCheck({ kind: "datetime", precision: typeof e?.precision > "u" ? null : e?.precision, offset: (t = e?.offset) !== null && t !== void 0 ? t : false, local: (n = e?.local) !== null && n !== void 0 ? n : false, ...m.errToObj(e?.message) });
        }
        date(e) {
          return this._addCheck({ kind: "date", message: e });
        }
        time(e) {
          return typeof e == "string" ? this._addCheck({ kind: "time", precision: null, message: e }) : this._addCheck({ kind: "time", precision: typeof e?.precision > "u" ? null : e?.precision, ...m.errToObj(e?.message) });
        }
        duration(e) {
          return this._addCheck({ kind: "duration", ...m.errToObj(e) });
        }
        regex(e, t) {
          return this._addCheck({ kind: "regex", regex: e, ...m.errToObj(t) });
        }
        includes(e, t) {
          return this._addCheck({ kind: "includes", value: e, position: t?.position, ...m.errToObj(t?.message) });
        }
        startsWith(e, t) {
          return this._addCheck({ kind: "startsWith", value: e, ...m.errToObj(t) });
        }
        endsWith(e, t) {
          return this._addCheck({ kind: "endsWith", value: e, ...m.errToObj(t) });
        }
        min(e, t) {
          return this._addCheck({ kind: "min", value: e, ...m.errToObj(t) });
        }
        max(e, t) {
          return this._addCheck({ kind: "max", value: e, ...m.errToObj(t) });
        }
        length(e, t) {
          return this._addCheck({ kind: "length", value: e, ...m.errToObj(t) });
        }
        nonempty(e) {
          return this.min(1, m.errToObj(e));
        }
        trim() {
          return new r({ ...this._def, checks: [...this._def.checks, { kind: "trim" }] });
        }
        toLowerCase() {
          return new r({ ...this._def, checks: [...this._def.checks, { kind: "toLowerCase" }] });
        }
        toUpperCase() {
          return new r({ ...this._def, checks: [...this._def.checks, { kind: "toUpperCase" }] });
        }
        get isDatetime() {
          return !!this._def.checks.find((e) => e.kind === "datetime");
        }
        get isDate() {
          return !!this._def.checks.find((e) => e.kind === "date");
        }
        get isTime() {
          return !!this._def.checks.find((e) => e.kind === "time");
        }
        get isDuration() {
          return !!this._def.checks.find((e) => e.kind === "duration");
        }
        get isEmail() {
          return !!this._def.checks.find((e) => e.kind === "email");
        }
        get isURL() {
          return !!this._def.checks.find((e) => e.kind === "url");
        }
        get isEmoji() {
          return !!this._def.checks.find((e) => e.kind === "emoji");
        }
        get isUUID() {
          return !!this._def.checks.find((e) => e.kind === "uuid");
        }
        get isNANOID() {
          return !!this._def.checks.find((e) => e.kind === "nanoid");
        }
        get isCUID() {
          return !!this._def.checks.find((e) => e.kind === "cuid");
        }
        get isCUID2() {
          return !!this._def.checks.find((e) => e.kind === "cuid2");
        }
        get isULID() {
          return !!this._def.checks.find((e) => e.kind === "ulid");
        }
        get isIP() {
          return !!this._def.checks.find((e) => e.kind === "ip");
        }
        get isCIDR() {
          return !!this._def.checks.find((e) => e.kind === "cidr");
        }
        get isBase64() {
          return !!this._def.checks.find((e) => e.kind === "base64");
        }
        get isBase64url() {
          return !!this._def.checks.find((e) => e.kind === "base64url");
        }
        get minLength() {
          let e = null;
          for (let t of this._def.checks) t.kind === "min" && (e === null || t.value > e) && (e = t.value);
          return e;
        }
        get maxLength() {
          let e = null;
          for (let t of this._def.checks) t.kind === "max" && (e === null || t.value < e) && (e = t.value);
          return e;
        }
      };
      U.create = (r) => {
        var e;
        return new U({ checks: [], typeName: d.ZodString, coerce: (e = r?.coerce) !== null && e !== void 0 ? e : false, ..._(r) });
      };
      function Tr(r, e) {
        let t = (r.toString().split(".")[1] || "").length, n = (e.toString().split(".")[1] || "").length, a = t > n ? t : n, s = parseInt(r.toFixed(a).replace(".", "")), i = parseInt(e.toFixed(a).replace(".", ""));
        return s % i / Math.pow(10, a);
      }
      var W = class r extends b {
        constructor() {
          super(...arguments), this.min = this.gte, this.max = this.lte, this.step = this.multipleOf;
        }
        _parse(e) {
          if (this._def.coerce && (e.data = Number(e.data)), this._getType(e) !== f.number) {
            let s = this._getOrReturnCtx(e);
            return p(s, { code: c.invalid_type, expected: f.number, received: s.parsedType }), v;
          }
          let n, a = new T();
          for (let s of this._def.checks) s.kind === "int" ? k.isInteger(e.data) || (n = this._getOrReturnCtx(e, n), p(n, { code: c.invalid_type, expected: "integer", received: "float", message: s.message }), a.dirty()) : s.kind === "min" ? (s.inclusive ? e.data < s.value : e.data <= s.value) && (n = this._getOrReturnCtx(e, n), p(n, { code: c.too_small, minimum: s.value, type: "number", inclusive: s.inclusive, exact: false, message: s.message }), a.dirty()) : s.kind === "max" ? (s.inclusive ? e.data > s.value : e.data >= s.value) && (n = this._getOrReturnCtx(e, n), p(n, { code: c.too_big, maximum: s.value, type: "number", inclusive: s.inclusive, exact: false, message: s.message }), a.dirty()) : s.kind === "multipleOf" ? Tr(e.data, s.value) !== 0 && (n = this._getOrReturnCtx(e, n), p(n, { code: c.not_multiple_of, multipleOf: s.value, message: s.message }), a.dirty()) : s.kind === "finite" ? Number.isFinite(e.data) || (n = this._getOrReturnCtx(e, n), p(n, { code: c.not_finite, message: s.message }), a.dirty()) : k.assertNever(s);
          return { status: a.value, value: e.data };
        }
        gte(e, t) {
          return this.setLimit("min", e, true, m.toString(t));
        }
        gt(e, t) {
          return this.setLimit("min", e, false, m.toString(t));
        }
        lte(e, t) {
          return this.setLimit("max", e, true, m.toString(t));
        }
        lt(e, t) {
          return this.setLimit("max", e, false, m.toString(t));
        }
        setLimit(e, t, n, a) {
          return new r({ ...this._def, checks: [...this._def.checks, { kind: e, value: t, inclusive: n, message: m.toString(a) }] });
        }
        _addCheck(e) {
          return new r({ ...this._def, checks: [...this._def.checks, e] });
        }
        int(e) {
          return this._addCheck({ kind: "int", message: m.toString(e) });
        }
        positive(e) {
          return this._addCheck({ kind: "min", value: 0, inclusive: false, message: m.toString(e) });
        }
        negative(e) {
          return this._addCheck({ kind: "max", value: 0, inclusive: false, message: m.toString(e) });
        }
        nonpositive(e) {
          return this._addCheck({ kind: "max", value: 0, inclusive: true, message: m.toString(e) });
        }
        nonnegative(e) {
          return this._addCheck({ kind: "min", value: 0, inclusive: true, message: m.toString(e) });
        }
        multipleOf(e, t) {
          return this._addCheck({ kind: "multipleOf", value: e, message: m.toString(t) });
        }
        finite(e) {
          return this._addCheck({ kind: "finite", message: m.toString(e) });
        }
        safe(e) {
          return this._addCheck({ kind: "min", inclusive: true, value: Number.MIN_SAFE_INTEGER, message: m.toString(e) })._addCheck({ kind: "max", inclusive: true, value: Number.MAX_SAFE_INTEGER, message: m.toString(e) });
        }
        get minValue() {
          let e = null;
          for (let t of this._def.checks) t.kind === "min" && (e === null || t.value > e) && (e = t.value);
          return e;
        }
        get maxValue() {
          let e = null;
          for (let t of this._def.checks) t.kind === "max" && (e === null || t.value < e) && (e = t.value);
          return e;
        }
        get isInt() {
          return !!this._def.checks.find((e) => e.kind === "int" || e.kind === "multipleOf" && k.isInteger(e.value));
        }
        get isFinite() {
          let e = null, t = null;
          for (let n of this._def.checks) {
            if (n.kind === "finite" || n.kind === "int" || n.kind === "multipleOf") return true;
            n.kind === "min" ? (t === null || n.value > t) && (t = n.value) : n.kind === "max" && (e === null || n.value < e) && (e = n.value);
          }
          return Number.isFinite(t) && Number.isFinite(e);
        }
      };
      W.create = (r) => new W({ checks: [], typeName: d.ZodNumber, coerce: r?.coerce || false, ..._(r) });
      var H = class r extends b {
        constructor() {
          super(...arguments), this.min = this.gte, this.max = this.lte;
        }
        _parse(e) {
          if (this._def.coerce) try {
            e.data = BigInt(e.data);
          } catch {
            return this._getInvalidInput(e);
          }
          if (this._getType(e) !== f.bigint) return this._getInvalidInput(e);
          let n, a = new T();
          for (let s of this._def.checks) s.kind === "min" ? (s.inclusive ? e.data < s.value : e.data <= s.value) && (n = this._getOrReturnCtx(e, n), p(n, { code: c.too_small, type: "bigint", minimum: s.value, inclusive: s.inclusive, message: s.message }), a.dirty()) : s.kind === "max" ? (s.inclusive ? e.data > s.value : e.data >= s.value) && (n = this._getOrReturnCtx(e, n), p(n, { code: c.too_big, type: "bigint", maximum: s.value, inclusive: s.inclusive, message: s.message }), a.dirty()) : s.kind === "multipleOf" ? e.data % s.value !== BigInt(0) && (n = this._getOrReturnCtx(e, n), p(n, { code: c.not_multiple_of, multipleOf: s.value, message: s.message }), a.dirty()) : k.assertNever(s);
          return { status: a.value, value: e.data };
        }
        _getInvalidInput(e) {
          let t = this._getOrReturnCtx(e);
          return p(t, { code: c.invalid_type, expected: f.bigint, received: t.parsedType }), v;
        }
        gte(e, t) {
          return this.setLimit("min", e, true, m.toString(t));
        }
        gt(e, t) {
          return this.setLimit("min", e, false, m.toString(t));
        }
        lte(e, t) {
          return this.setLimit("max", e, true, m.toString(t));
        }
        lt(e, t) {
          return this.setLimit("max", e, false, m.toString(t));
        }
        setLimit(e, t, n, a) {
          return new r({ ...this._def, checks: [...this._def.checks, { kind: e, value: t, inclusive: n, message: m.toString(a) }] });
        }
        _addCheck(e) {
          return new r({ ...this._def, checks: [...this._def.checks, e] });
        }
        positive(e) {
          return this._addCheck({ kind: "min", value: BigInt(0), inclusive: false, message: m.toString(e) });
        }
        negative(e) {
          return this._addCheck({ kind: "max", value: BigInt(0), inclusive: false, message: m.toString(e) });
        }
        nonpositive(e) {
          return this._addCheck({ kind: "max", value: BigInt(0), inclusive: true, message: m.toString(e) });
        }
        nonnegative(e) {
          return this._addCheck({ kind: "min", value: BigInt(0), inclusive: true, message: m.toString(e) });
        }
        multipleOf(e, t) {
          return this._addCheck({ kind: "multipleOf", value: e, message: m.toString(t) });
        }
        get minValue() {
          let e = null;
          for (let t of this._def.checks) t.kind === "min" && (e === null || t.value > e) && (e = t.value);
          return e;
        }
        get maxValue() {
          let e = null;
          for (let t of this._def.checks) t.kind === "max" && (e === null || t.value < e) && (e = t.value);
          return e;
        }
      };
      H.create = (r) => {
        var e;
        return new H({ checks: [], typeName: d.ZodBigInt, coerce: (e = r?.coerce) !== null && e !== void 0 ? e : false, ..._(r) });
      };
      var J = class extends b {
        _parse(e) {
          if (this._def.coerce && (e.data = !!e.data), this._getType(e) !== f.boolean) {
            let n = this._getOrReturnCtx(e);
            return p(n, { code: c.invalid_type, expected: f.boolean, received: n.parsedType }), v;
          }
          return A(e.data);
        }
      };
      J.create = (r) => new J({ typeName: d.ZodBoolean, coerce: r?.coerce || false, ..._(r) });
      var G = class r extends b {
        _parse(e) {
          if (this._def.coerce && (e.data = new Date(e.data)), this._getType(e) !== f.date) {
            let s = this._getOrReturnCtx(e);
            return p(s, { code: c.invalid_type, expected: f.date, received: s.parsedType }), v;
          }
          if (isNaN(e.data.getTime())) {
            let s = this._getOrReturnCtx(e);
            return p(s, { code: c.invalid_date }), v;
          }
          let n = new T(), a;
          for (let s of this._def.checks) s.kind === "min" ? e.data.getTime() < s.value && (a = this._getOrReturnCtx(e, a), p(a, { code: c.too_small, message: s.message, inclusive: true, exact: false, minimum: s.value, type: "date" }), n.dirty()) : s.kind === "max" ? e.data.getTime() > s.value && (a = this._getOrReturnCtx(e, a), p(a, { code: c.too_big, message: s.message, inclusive: true, exact: false, maximum: s.value, type: "date" }), n.dirty()) : k.assertNever(s);
          return { status: n.value, value: new Date(e.data.getTime()) };
        }
        _addCheck(e) {
          return new r({ ...this._def, checks: [...this._def.checks, e] });
        }
        min(e, t) {
          return this._addCheck({ kind: "min", value: e.getTime(), message: m.toString(t) });
        }
        max(e, t) {
          return this._addCheck({ kind: "max", value: e.getTime(), message: m.toString(t) });
        }
        get minDate() {
          let e = null;
          for (let t of this._def.checks) t.kind === "min" && (e === null || t.value > e) && (e = t.value);
          return e != null ? new Date(e) : null;
        }
        get maxDate() {
          let e = null;
          for (let t of this._def.checks) t.kind === "max" && (e === null || t.value < e) && (e = t.value);
          return e != null ? new Date(e) : null;
        }
      };
      G.create = (r) => new G({ checks: [], coerce: r?.coerce || false, typeName: d.ZodDate, ..._(r) });
      var de = class extends b {
        _parse(e) {
          if (this._getType(e) !== f.symbol) {
            let n = this._getOrReturnCtx(e);
            return p(n, { code: c.invalid_type, expected: f.symbol, received: n.parsedType }), v;
          }
          return A(e.data);
        }
      };
      de.create = (r) => new de({ typeName: d.ZodSymbol, ..._(r) });
      var K = class extends b {
        _parse(e) {
          if (this._getType(e) !== f.undefined) {
            let n = this._getOrReturnCtx(e);
            return p(n, { code: c.invalid_type, expected: f.undefined, received: n.parsedType }), v;
          }
          return A(e.data);
        }
      };
      K.create = (r) => new K({ typeName: d.ZodUndefined, ..._(r) });
      var Y = class extends b {
        _parse(e) {
          if (this._getType(e) !== f.null) {
            let n = this._getOrReturnCtx(e);
            return p(n, { code: c.invalid_type, expected: f.null, received: n.parsedType }), v;
          }
          return A(e.data);
        }
      };
      Y.create = (r) => new Y({ typeName: d.ZodNull, ..._(r) });
      var V = class extends b {
        constructor() {
          super(...arguments), this._any = true;
        }
        _parse(e) {
          return A(e.data);
        }
      };
      V.create = (r) => new V({ typeName: d.ZodAny, ..._(r) });
      var z = class extends b {
        constructor() {
          super(...arguments), this._unknown = true;
        }
        _parse(e) {
          return A(e.data);
        }
      };
      z.create = (r) => new z({ typeName: d.ZodUnknown, ..._(r) });
      var I = class extends b {
        _parse(e) {
          let t = this._getOrReturnCtx(e);
          return p(t, { code: c.invalid_type, expected: f.never, received: t.parsedType }), v;
        }
      };
      I.create = (r) => new I({ typeName: d.ZodNever, ..._(r) });
      var le = class extends b {
        _parse(e) {
          if (this._getType(e) !== f.undefined) {
            let n = this._getOrReturnCtx(e);
            return p(n, { code: c.invalid_type, expected: f.void, received: n.parsedType }), v;
          }
          return A(e.data);
        }
      };
      le.create = (r) => new le({ typeName: d.ZodVoid, ..._(r) });
      var F = class r extends b {
        _parse(e) {
          let { ctx: t, status: n } = this._processInputParams(e), a = this._def;
          if (t.parsedType !== f.array) return p(t, { code: c.invalid_type, expected: f.array, received: t.parsedType }), v;
          if (a.exactLength !== null) {
            let i = t.data.length > a.exactLength.value, o = t.data.length < a.exactLength.value;
            (i || o) && (p(t, { code: i ? c.too_big : c.too_small, minimum: o ? a.exactLength.value : void 0, maximum: i ? a.exactLength.value : void 0, type: "array", inclusive: true, exact: true, message: a.exactLength.message }), n.dirty());
          }
          if (a.minLength !== null && t.data.length < a.minLength.value && (p(t, { code: c.too_small, minimum: a.minLength.value, type: "array", inclusive: true, exact: false, message: a.minLength.message }), n.dirty()), a.maxLength !== null && t.data.length > a.maxLength.value && (p(t, { code: c.too_big, maximum: a.maxLength.value, type: "array", inclusive: true, exact: false, message: a.maxLength.message }), n.dirty()), t.common.async) return Promise.all([...t.data].map((i, o) => a.type._parseAsync(new Z(t, i, t.path, o)))).then((i) => T.mergeArray(n, i));
          let s = [...t.data].map((i, o) => a.type._parseSync(new Z(t, i, t.path, o)));
          return T.mergeArray(n, s);
        }
        get element() {
          return this._def.type;
        }
        min(e, t) {
          return new r({ ...this._def, minLength: { value: e, message: m.toString(t) } });
        }
        max(e, t) {
          return new r({ ...this._def, maxLength: { value: e, message: m.toString(t) } });
        }
        length(e, t) {
          return new r({ ...this._def, exactLength: { value: e, message: m.toString(t) } });
        }
        nonempty(e) {
          return this.min(1, e);
        }
      };
      F.create = (r, e) => new F({ type: r, minLength: null, maxLength: null, exactLength: null, typeName: d.ZodArray, ..._(e) });
      function oe(r) {
        if (r instanceof O) {
          let e = {};
          for (let t in r.shape) {
            let n = r.shape[t];
            e[t] = S.create(oe(n));
          }
          return new O({ ...r._def, shape: () => e });
        } else return r instanceof F ? new F({ ...r._def, type: oe(r.element) }) : r instanceof S ? S.create(oe(r.unwrap())) : r instanceof D ? D.create(oe(r.unwrap())) : r instanceof M ? M.create(r.items.map((e) => oe(e))) : r;
      }
      var O = class r extends b {
        constructor() {
          super(...arguments), this._cached = null, this.nonstrict = this.passthrough, this.augment = this.extend;
        }
        _getCached() {
          if (this._cached !== null) return this._cached;
          let e = this._def.shape(), t = k.objectKeys(e);
          return this._cached = { shape: e, keys: t };
        }
        _parse(e) {
          if (this._getType(e) !== f.object) {
            let l = this._getOrReturnCtx(e);
            return p(l, { code: c.invalid_type, expected: f.object, received: l.parsedType }), v;
          }
          let { status: n, ctx: a } = this._processInputParams(e), { shape: s, keys: i } = this._getCached(), o = [];
          if (!(this._def.catchall instanceof I && this._def.unknownKeys === "strip")) for (let l in a.data) i.includes(l) || o.push(l);
          let u = [];
          for (let l of i) {
            let g = s[l], w = a.data[l];
            u.push({ key: { status: "valid", value: l }, value: g._parse(new Z(a, w, a.path, l)), alwaysSet: l in a.data });
          }
          if (this._def.catchall instanceof I) {
            let l = this._def.unknownKeys;
            if (l === "passthrough") for (let g of o) u.push({ key: { status: "valid", value: g }, value: { status: "valid", value: a.data[g] } });
            else if (l === "strict") o.length > 0 && (p(a, { code: c.unrecognized_keys, keys: o }), n.dirty());
            else if (l !== "strip") throw new Error("Internal ZodObject error: invalid unknownKeys value.");
          } else {
            let l = this._def.catchall;
            for (let g of o) {
              let w = a.data[g];
              u.push({ key: { status: "valid", value: g }, value: l._parse(new Z(a, w, a.path, g)), alwaysSet: g in a.data });
            }
          }
          return a.common.async ? Promise.resolve().then(async () => {
            let l = [];
            for (let g of u) {
              let w = await g.key, xe = await g.value;
              l.push({ key: w, value: xe, alwaysSet: g.alwaysSet });
            }
            return l;
          }).then((l) => T.mergeObjectSync(n, l)) : T.mergeObjectSync(n, u);
        }
        get shape() {
          return this._def.shape();
        }
        strict(e) {
          return m.errToObj, new r({ ...this._def, unknownKeys: "strict", ...e !== void 0 ? { errorMap: (t, n) => {
            var a, s, i, o;
            let u = (i = (s = (a = this._def).errorMap) === null || s === void 0 ? void 0 : s.call(a, t, n).message) !== null && i !== void 0 ? i : n.defaultError;
            return t.code === "unrecognized_keys" ? { message: (o = m.errToObj(e).message) !== null && o !== void 0 ? o : u } : { message: u };
          } } : {} });
        }
        strip() {
          return new r({ ...this._def, unknownKeys: "strip" });
        }
        passthrough() {
          return new r({ ...this._def, unknownKeys: "passthrough" });
        }
        extend(e) {
          return new r({ ...this._def, shape: () => ({ ...this._def.shape(), ...e }) });
        }
        merge(e) {
          return new r({ unknownKeys: e._def.unknownKeys, catchall: e._def.catchall, shape: () => ({ ...this._def.shape(), ...e._def.shape() }), typeName: d.ZodObject });
        }
        setKey(e, t) {
          return this.augment({ [e]: t });
        }
        catchall(e) {
          return new r({ ...this._def, catchall: e });
        }
        pick(e) {
          let t = {};
          return k.objectKeys(e).forEach((n) => {
            e[n] && this.shape[n] && (t[n] = this.shape[n]);
          }), new r({ ...this._def, shape: () => t });
        }
        omit(e) {
          let t = {};
          return k.objectKeys(this.shape).forEach((n) => {
            e[n] || (t[n] = this.shape[n]);
          }), new r({ ...this._def, shape: () => t });
        }
        deepPartial() {
          return oe(this);
        }
        partial(e) {
          let t = {};
          return k.objectKeys(this.shape).forEach((n) => {
            let a = this.shape[n];
            e && !e[n] ? t[n] = a : t[n] = a.optional();
          }), new r({ ...this._def, shape: () => t });
        }
        required(e) {
          let t = {};
          return k.objectKeys(this.shape).forEach((n) => {
            if (e && !e[n]) t[n] = this.shape[n];
            else {
              let s = this.shape[n];
              for (; s instanceof S; ) s = s._def.innerType;
              t[n] = s;
            }
          }), new r({ ...this._def, shape: () => t });
        }
        keyof() {
          return et(k.objectKeys(this.shape));
        }
      };
      O.create = (r, e) => new O({ shape: () => r, unknownKeys: "strip", catchall: I.create(), typeName: d.ZodObject, ..._(e) });
      O.strictCreate = (r, e) => new O({ shape: () => r, unknownKeys: "strict", catchall: I.create(), typeName: d.ZodObject, ..._(e) });
      O.lazycreate = (r, e) => new O({ shape: r, unknownKeys: "strip", catchall: I.create(), typeName: d.ZodObject, ..._(e) });
      var X = class extends b {
        _parse(e) {
          let { ctx: t } = this._processInputParams(e), n = this._def.options;
          function a(s) {
            for (let o of s) if (o.result.status === "valid") return o.result;
            for (let o of s) if (o.result.status === "dirty") return t.common.issues.push(...o.ctx.common.issues), o.result;
            let i = s.map((o) => new E(o.ctx.common.issues));
            return p(t, { code: c.invalid_union, unionErrors: i }), v;
          }
          if (t.common.async) return Promise.all(n.map(async (s) => {
            let i = { ...t, common: { ...t.common, issues: [] }, parent: null };
            return { result: await s._parseAsync({ data: t.data, path: t.path, parent: i }), ctx: i };
          })).then(a);
          {
            let s, i = [];
            for (let u of n) {
              let l = { ...t, common: { ...t.common, issues: [] }, parent: null }, g = u._parseSync({ data: t.data, path: t.path, parent: l });
              if (g.status === "valid") return g;
              g.status === "dirty" && !s && (s = { result: g, ctx: l }), l.common.issues.length && i.push(l.common.issues);
            }
            if (s) return t.common.issues.push(...s.ctx.common.issues), s.result;
            let o = i.map((u) => new E(u));
            return p(t, { code: c.invalid_union, unionErrors: o }), v;
          }
        }
        get options() {
          return this._def.options;
        }
      };
      X.create = (r, e) => new X({ options: r, typeName: d.ZodUnion, ..._(e) });
      var $ = (r) => r instanceof ee ? $(r.schema) : r instanceof N ? $(r.innerType()) : r instanceof te ? [r.value] : r instanceof re ? r.options : r instanceof ne ? k.objectValues(r.enum) : r instanceof ae ? $(r._def.innerType) : r instanceof K ? [void 0] : r instanceof Y ? [null] : r instanceof S ? [void 0, ...$(r.unwrap())] : r instanceof D ? [null, ...$(r.unwrap())] : r instanceof ve || r instanceof ie ? $(r.unwrap()) : r instanceof se ? $(r._def.innerType) : [];
      var Ae = class r extends b {
        _parse(e) {
          let { ctx: t } = this._processInputParams(e);
          if (t.parsedType !== f.object) return p(t, { code: c.invalid_type, expected: f.object, received: t.parsedType }), v;
          let n = this.discriminator, a = t.data[n], s = this.optionsMap.get(a);
          return s ? t.common.async ? s._parseAsync({ data: t.data, path: t.path, parent: t }) : s._parseSync({ data: t.data, path: t.path, parent: t }) : (p(t, { code: c.invalid_union_discriminator, options: Array.from(this.optionsMap.keys()), path: [n] }), v);
        }
        get discriminator() {
          return this._def.discriminator;
        }
        get options() {
          return this._def.options;
        }
        get optionsMap() {
          return this._def.optionsMap;
        }
        static create(e, t, n) {
          let a = /* @__PURE__ */ new Map();
          for (let s of t) {
            let i = $(s.shape[e]);
            if (!i.length) throw new Error(`A discriminator value for key \`${e}\` could not be extracted from all schema options`);
            for (let o of i) {
              if (a.has(o)) throw new Error(`Discriminator property ${String(e)} has duplicate value ${String(o)}`);
              a.set(o, s);
            }
          }
          return new r({ typeName: d.ZodDiscriminatedUnion, discriminator: e, options: t, optionsMap: a, ..._(n) });
        }
      };
      function De(r, e) {
        let t = L(r), n = L(e);
        if (r === e) return { valid: true, data: r };
        if (t === f.object && n === f.object) {
          let a = k.objectKeys(e), s = k.objectKeys(r).filter((o) => a.indexOf(o) !== -1), i = { ...r, ...e };
          for (let o of s) {
            let u = De(r[o], e[o]);
            if (!u.valid) return { valid: false };
            i[o] = u.data;
          }
          return { valid: true, data: i };
        } else if (t === f.array && n === f.array) {
          if (r.length !== e.length) return { valid: false };
          let a = [];
          for (let s = 0; s < r.length; s++) {
            let i = r[s], o = e[s], u = De(i, o);
            if (!u.valid) return { valid: false };
            a.push(u.data);
          }
          return { valid: true, data: a };
        } else return t === f.date && n === f.date && +r == +e ? { valid: true, data: r } : { valid: false };
      }
      var Q = class extends b {
        _parse(e) {
          let { status: t, ctx: n } = this._processInputParams(e), a = (s, i) => {
            if (je(s) || je(i)) return v;
            let o = De(s.value, i.value);
            return o.valid ? ((Me(s) || Me(i)) && t.dirty(), { status: t.value, value: o.data }) : (p(n, { code: c.invalid_intersection_types }), v);
          };
          return n.common.async ? Promise.all([this._def.left._parseAsync({ data: n.data, path: n.path, parent: n }), this._def.right._parseAsync({ data: n.data, path: n.path, parent: n })]).then(([s, i]) => a(s, i)) : a(this._def.left._parseSync({ data: n.data, path: n.path, parent: n }), this._def.right._parseSync({ data: n.data, path: n.path, parent: n }));
        }
      };
      Q.create = (r, e, t) => new Q({ left: r, right: e, typeName: d.ZodIntersection, ..._(t) });
      var M = class r extends b {
        _parse(e) {
          let { status: t, ctx: n } = this._processInputParams(e);
          if (n.parsedType !== f.array) return p(n, { code: c.invalid_type, expected: f.array, received: n.parsedType }), v;
          if (n.data.length < this._def.items.length) return p(n, { code: c.too_small, minimum: this._def.items.length, inclusive: true, exact: false, type: "array" }), v;
          !this._def.rest && n.data.length > this._def.items.length && (p(n, { code: c.too_big, maximum: this._def.items.length, inclusive: true, exact: false, type: "array" }), t.dirty());
          let s = [...n.data].map((i, o) => {
            let u = this._def.items[o] || this._def.rest;
            return u ? u._parse(new Z(n, i, n.path, o)) : null;
          }).filter((i) => !!i);
          return n.common.async ? Promise.all(s).then((i) => T.mergeArray(t, i)) : T.mergeArray(t, s);
        }
        get items() {
          return this._def.items;
        }
        rest(e) {
          return new r({ ...this._def, rest: e });
        }
      };
      M.create = (r, e) => {
        if (!Array.isArray(r)) throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
        return new M({ items: r, typeName: d.ZodTuple, rest: null, ..._(e) });
      };
      var Pe = class r extends b {
        get keySchema() {
          return this._def.keyType;
        }
        get valueSchema() {
          return this._def.valueType;
        }
        _parse(e) {
          let { status: t, ctx: n } = this._processInputParams(e);
          if (n.parsedType !== f.object) return p(n, { code: c.invalid_type, expected: f.object, received: n.parsedType }), v;
          let a = [], s = this._def.keyType, i = this._def.valueType;
          for (let o in n.data) a.push({ key: s._parse(new Z(n, o, n.path, o)), value: i._parse(new Z(n, n.data[o], n.path, o)), alwaysSet: o in n.data });
          return n.common.async ? T.mergeObjectAsync(t, a) : T.mergeObjectSync(t, a);
        }
        get element() {
          return this._def.valueType;
        }
        static create(e, t, n) {
          return t instanceof b ? new r({ keyType: e, valueType: t, typeName: d.ZodRecord, ..._(n) }) : new r({ keyType: U.create(), valueType: e, typeName: d.ZodRecord, ..._(t) });
        }
      };
      var pe = class extends b {
        get keySchema() {
          return this._def.keyType;
        }
        get valueSchema() {
          return this._def.valueType;
        }
        _parse(e) {
          let { status: t, ctx: n } = this._processInputParams(e);
          if (n.parsedType !== f.map) return p(n, { code: c.invalid_type, expected: f.map, received: n.parsedType }), v;
          let a = this._def.keyType, s = this._def.valueType, i = [...n.data.entries()].map(([o, u], l) => ({ key: a._parse(new Z(n, o, n.path, [l, "key"])), value: s._parse(new Z(n, u, n.path, [l, "value"])) }));
          if (n.common.async) {
            let o = /* @__PURE__ */ new Map();
            return Promise.resolve().then(async () => {
              for (let u of i) {
                let l = await u.key, g = await u.value;
                if (l.status === "aborted" || g.status === "aborted") return v;
                (l.status === "dirty" || g.status === "dirty") && t.dirty(), o.set(l.value, g.value);
              }
              return { status: t.value, value: o };
            });
          } else {
            let o = /* @__PURE__ */ new Map();
            for (let u of i) {
              let l = u.key, g = u.value;
              if (l.status === "aborted" || g.status === "aborted") return v;
              (l.status === "dirty" || g.status === "dirty") && t.dirty(), o.set(l.value, g.value);
            }
            return { status: t.value, value: o };
          }
        }
      };
      pe.create = (r, e, t) => new pe({ valueType: e, keyType: r, typeName: d.ZodMap, ..._(t) });
      var fe = class r extends b {
        _parse(e) {
          let { status: t, ctx: n } = this._processInputParams(e);
          if (n.parsedType !== f.set) return p(n, { code: c.invalid_type, expected: f.set, received: n.parsedType }), v;
          let a = this._def;
          a.minSize !== null && n.data.size < a.minSize.value && (p(n, { code: c.too_small, minimum: a.minSize.value, type: "set", inclusive: true, exact: false, message: a.minSize.message }), t.dirty()), a.maxSize !== null && n.data.size > a.maxSize.value && (p(n, { code: c.too_big, maximum: a.maxSize.value, type: "set", inclusive: true, exact: false, message: a.maxSize.message }), t.dirty());
          let s = this._def.valueType;
          function i(u) {
            let l = /* @__PURE__ */ new Set();
            for (let g of u) {
              if (g.status === "aborted") return v;
              g.status === "dirty" && t.dirty(), l.add(g.value);
            }
            return { status: t.value, value: l };
          }
          let o = [...n.data.values()].map((u, l) => s._parse(new Z(n, u, n.path, l)));
          return n.common.async ? Promise.all(o).then((u) => i(u)) : i(o);
        }
        min(e, t) {
          return new r({ ...this._def, minSize: { value: e, message: m.toString(t) } });
        }
        max(e, t) {
          return new r({ ...this._def, maxSize: { value: e, message: m.toString(t) } });
        }
        size(e, t) {
          return this.min(e, t).max(e, t);
        }
        nonempty(e) {
          return this.min(1, e);
        }
      };
      fe.create = (r, e) => new fe({ valueType: r, minSize: null, maxSize: null, typeName: d.ZodSet, ..._(e) });
      var Se = class r extends b {
        constructor() {
          super(...arguments), this.validate = this.implement;
        }
        _parse(e) {
          let { ctx: t } = this._processInputParams(e);
          if (t.parsedType !== f.function) return p(t, { code: c.invalid_type, expected: f.function, received: t.parsedType }), v;
          function n(o, u) {
            return Te({ data: o, path: t.path, errorMaps: [t.common.contextualErrorMap, t.schemaErrorMap, ke(), ce].filter((l) => !!l), issueData: { code: c.invalid_arguments, argumentsError: u } });
          }
          function a(o, u) {
            return Te({ data: o, path: t.path, errorMaps: [t.common.contextualErrorMap, t.schemaErrorMap, ke(), ce].filter((l) => !!l), issueData: { code: c.invalid_return_type, returnTypeError: u } });
          }
          let s = { errorMap: t.common.contextualErrorMap }, i = t.data;
          if (this._def.returns instanceof B) {
            let o = this;
            return A(async function(...u) {
              let l = new E([]), g = await o._def.args.parseAsync(u, s).catch((Ze) => {
                throw l.addIssue(n(u, Ze)), l;
              }), w = await Reflect.apply(i, this, g);
              return await o._def.returns._def.type.parseAsync(w, s).catch((Ze) => {
                throw l.addIssue(a(w, Ze)), l;
              });
            });
          } else {
            let o = this;
            return A(function(...u) {
              let l = o._def.args.safeParse(u, s);
              if (!l.success) throw new E([n(u, l.error)]);
              let g = Reflect.apply(i, this, l.data), w = o._def.returns.safeParse(g, s);
              if (!w.success) throw new E([a(g, w.error)]);
              return w.data;
            });
          }
        }
        parameters() {
          return this._def.args;
        }
        returnType() {
          return this._def.returns;
        }
        args(...e) {
          return new r({ ...this._def, args: M.create(e).rest(z.create()) });
        }
        returns(e) {
          return new r({ ...this._def, returns: e });
        }
        implement(e) {
          return this.parse(e);
        }
        strictImplement(e) {
          return this.parse(e);
        }
        static create(e, t, n) {
          return new r({ args: e || M.create([]).rest(z.create()), returns: t || z.create(), typeName: d.ZodFunction, ..._(n) });
        }
      };
      var ee = class extends b {
        get schema() {
          return this._def.getter();
        }
        _parse(e) {
          let { ctx: t } = this._processInputParams(e);
          return this._def.getter()._parse({ data: t.data, path: t.path, parent: t });
        }
      };
      ee.create = (r, e) => new ee({ getter: r, typeName: d.ZodLazy, ..._(e) });
      var te = class extends b {
        _parse(e) {
          if (e.data !== this._def.value) {
            let t = this._getOrReturnCtx(e);
            return p(t, { received: t.data, code: c.invalid_literal, expected: this._def.value }), v;
          }
          return { status: "valid", value: e.data };
        }
        get value() {
          return this._def.value;
        }
      };
      te.create = (r, e) => new te({ value: r, typeName: d.ZodLiteral, ..._(e) });
      function et(r, e) {
        return new re({ values: r, typeName: d.ZodEnum, ..._(e) });
      }
      var re = class r extends b {
        constructor() {
          super(...arguments), he.set(this, void 0);
        }
        _parse(e) {
          if (typeof e.data != "string") {
            let t = this._getOrReturnCtx(e), n = this._def.values;
            return p(t, { expected: k.joinValues(n), received: t.parsedType, code: c.invalid_type }), v;
          }
          if (we(this, he, "f") || Ke(this, he, new Set(this._def.values), "f"), !we(this, he, "f").has(e.data)) {
            let t = this._getOrReturnCtx(e), n = this._def.values;
            return p(t, { received: t.data, code: c.invalid_enum_value, options: n }), v;
          }
          return A(e.data);
        }
        get options() {
          return this._def.values;
        }
        get enum() {
          let e = {};
          for (let t of this._def.values) e[t] = t;
          return e;
        }
        get Values() {
          let e = {};
          for (let t of this._def.values) e[t] = t;
          return e;
        }
        get Enum() {
          let e = {};
          for (let t of this._def.values) e[t] = t;
          return e;
        }
        extract(e, t = this._def) {
          return r.create(e, { ...this._def, ...t });
        }
        exclude(e, t = this._def) {
          return r.create(this.options.filter((n) => !e.includes(n)), { ...this._def, ...t });
        }
      };
      he = /* @__PURE__ */ new WeakMap();
      re.create = et;
      var ne = class extends b {
        constructor() {
          super(...arguments), ge.set(this, void 0);
        }
        _parse(e) {
          let t = k.getValidEnumValues(this._def.values), n = this._getOrReturnCtx(e);
          if (n.parsedType !== f.string && n.parsedType !== f.number) {
            let a = k.objectValues(t);
            return p(n, { expected: k.joinValues(a), received: n.parsedType, code: c.invalid_type }), v;
          }
          if (we(this, ge, "f") || Ke(this, ge, new Set(k.getValidEnumValues(this._def.values)), "f"), !we(this, ge, "f").has(e.data)) {
            let a = k.objectValues(t);
            return p(n, { received: n.data, code: c.invalid_enum_value, options: a }), v;
          }
          return A(e.data);
        }
        get enum() {
          return this._def.values;
        }
      };
      ge = /* @__PURE__ */ new WeakMap();
      ne.create = (r, e) => new ne({ values: r, typeName: d.ZodNativeEnum, ..._(e) });
      var B = class extends b {
        unwrap() {
          return this._def.type;
        }
        _parse(e) {
          let { ctx: t } = this._processInputParams(e);
          if (t.parsedType !== f.promise && t.common.async === false) return p(t, { code: c.invalid_type, expected: f.promise, received: t.parsedType }), v;
          let n = t.parsedType === f.promise ? t.data : Promise.resolve(t.data);
          return A(n.then((a) => this._def.type.parseAsync(a, { path: t.path, errorMap: t.common.contextualErrorMap })));
        }
      };
      B.create = (r, e) => new B({ type: r, typeName: d.ZodPromise, ..._(e) });
      var N = class extends b {
        innerType() {
          return this._def.schema;
        }
        sourceType() {
          return this._def.schema._def.typeName === d.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
        }
        _parse(e) {
          let { status: t, ctx: n } = this._processInputParams(e), a = this._def.effect || null, s = { addIssue: (i) => {
            p(n, i), i.fatal ? t.abort() : t.dirty();
          }, get path() {
            return n.path;
          } };
          if (s.addIssue = s.addIssue.bind(s), a.type === "preprocess") {
            let i = a.transform(n.data, s);
            if (n.common.async) return Promise.resolve(i).then(async (o) => {
              if (t.value === "aborted") return v;
              let u = await this._def.schema._parseAsync({ data: o, path: n.path, parent: n });
              return u.status === "aborted" ? v : u.status === "dirty" || t.value === "dirty" ? ue(u.value) : u;
            });
            {
              if (t.value === "aborted") return v;
              let o = this._def.schema._parseSync({ data: i, path: n.path, parent: n });
              return o.status === "aborted" ? v : o.status === "dirty" || t.value === "dirty" ? ue(o.value) : o;
            }
          }
          if (a.type === "refinement") {
            let i = (o) => {
              let u = a.refinement(o, s);
              if (n.common.async) return Promise.resolve(u);
              if (u instanceof Promise) throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
              return o;
            };
            if (n.common.async === false) {
              let o = this._def.schema._parseSync({ data: n.data, path: n.path, parent: n });
              return o.status === "aborted" ? v : (o.status === "dirty" && t.dirty(), i(o.value), { status: t.value, value: o.value });
            } else return this._def.schema._parseAsync({ data: n.data, path: n.path, parent: n }).then((o) => o.status === "aborted" ? v : (o.status === "dirty" && t.dirty(), i(o.value).then(() => ({ status: t.value, value: o.value }))));
          }
          if (a.type === "transform") if (n.common.async === false) {
            let i = this._def.schema._parseSync({ data: n.data, path: n.path, parent: n });
            if (!q(i)) return i;
            let o = a.transform(i.value, s);
            if (o instanceof Promise) throw new Error("Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.");
            return { status: t.value, value: o };
          } else return this._def.schema._parseAsync({ data: n.data, path: n.path, parent: n }).then((i) => q(i) ? Promise.resolve(a.transform(i.value, s)).then((o) => ({ status: t.value, value: o })) : i);
          k.assertNever(a);
        }
      };
      N.create = (r, e, t) => new N({ schema: r, typeName: d.ZodEffects, effect: e, ..._(t) });
      N.createWithPreprocess = (r, e, t) => new N({ schema: e, effect: { type: "preprocess", transform: r }, typeName: d.ZodEffects, ..._(t) });
      var S = class extends b {
        _parse(e) {
          return this._getType(e) === f.undefined ? A(void 0) : this._def.innerType._parse(e);
        }
        unwrap() {
          return this._def.innerType;
        }
      };
      S.create = (r, e) => new S({ innerType: r, typeName: d.ZodOptional, ..._(e) });
      var D = class extends b {
        _parse(e) {
          return this._getType(e) === f.null ? A(null) : this._def.innerType._parse(e);
        }
        unwrap() {
          return this._def.innerType;
        }
      };
      D.create = (r, e) => new D({ innerType: r, typeName: d.ZodNullable, ..._(e) });
      var ae = class extends b {
        _parse(e) {
          let { ctx: t } = this._processInputParams(e), n = t.data;
          return t.parsedType === f.undefined && (n = this._def.defaultValue()), this._def.innerType._parse({ data: n, path: t.path, parent: t });
        }
        removeDefault() {
          return this._def.innerType;
        }
      };
      ae.create = (r, e) => new ae({ innerType: r, typeName: d.ZodDefault, defaultValue: typeof e.default == "function" ? e.default : () => e.default, ..._(e) });
      var se = class extends b {
        _parse(e) {
          let { ctx: t } = this._processInputParams(e), n = { ...t, common: { ...t.common, issues: [] } }, a = this._def.innerType._parse({ data: n.data, path: n.path, parent: { ...n } });
          return ye(a) ? a.then((s) => ({ status: "valid", value: s.status === "valid" ? s.value : this._def.catchValue({ get error() {
            return new E(n.common.issues);
          }, input: n.data }) })) : { status: "valid", value: a.status === "valid" ? a.value : this._def.catchValue({ get error() {
            return new E(n.common.issues);
          }, input: n.data }) };
        }
        removeCatch() {
          return this._def.innerType;
        }
      };
      se.create = (r, e) => new se({ innerType: r, typeName: d.ZodCatch, catchValue: typeof e.catch == "function" ? e.catch : () => e.catch, ..._(e) });
      var me = class extends b {
        _parse(e) {
          if (this._getType(e) !== f.nan) {
            let n = this._getOrReturnCtx(e);
            return p(n, { code: c.invalid_type, expected: f.nan, received: n.parsedType }), v;
          }
          return { status: "valid", value: e.data };
        }
      };
      me.create = (r) => new me({ typeName: d.ZodNaN, ..._(r) });
      var wr = Symbol("zod_brand");
      var ve = class extends b {
        _parse(e) {
          let { ctx: t } = this._processInputParams(e), n = t.data;
          return this._def.type._parse({ data: n, path: t.path, parent: t });
        }
        unwrap() {
          return this._def.type;
        }
      };
      var _e = class r extends b {
        _parse(e) {
          let { status: t, ctx: n } = this._processInputParams(e);
          if (n.common.async) return (async () => {
            let s = await this._def.in._parseAsync({ data: n.data, path: n.path, parent: n });
            return s.status === "aborted" ? v : s.status === "dirty" ? (t.dirty(), ue(s.value)) : this._def.out._parseAsync({ data: s.value, path: n.path, parent: n });
          })();
          {
            let a = this._def.in._parseSync({ data: n.data, path: n.path, parent: n });
            return a.status === "aborted" ? v : a.status === "dirty" ? (t.dirty(), { status: "dirty", value: a.value }) : this._def.out._parseSync({ data: a.value, path: n.path, parent: n });
          }
        }
        static create(e, t) {
          return new r({ in: e, out: t, typeName: d.ZodPipeline });
        }
      };
      var ie = class extends b {
        _parse(e) {
          let t = this._def.innerType._parse(e), n = (a) => (q(a) && (a.value = Object.freeze(a.value)), a);
          return ye(t) ? t.then((a) => n(a)) : n(t);
        }
        unwrap() {
          return this._def.innerType;
        }
      };
      ie.create = (r, e) => new ie({ innerType: r, typeName: d.ZodReadonly, ..._(e) });
      function He(r, e) {
        let t = typeof r == "function" ? r(e) : typeof r == "string" ? { message: r } : r;
        return typeof t == "string" ? { message: t } : t;
      }
      function tt(r, e = {}, t) {
        return r ? V.create().superRefine((n, a) => {
          var s, i;
          let o = r(n);
          if (o instanceof Promise) return o.then((u) => {
            var l, g;
            if (!u) {
              let w = He(e, n), xe = (g = (l = w.fatal) !== null && l !== void 0 ? l : t) !== null && g !== void 0 ? g : true;
              a.addIssue({ code: "custom", ...w, fatal: xe });
            }
          });
          if (!o) {
            let u = He(e, n), l = (i = (s = u.fatal) !== null && s !== void 0 ? s : t) !== null && i !== void 0 ? i : true;
            a.addIssue({ code: "custom", ...u, fatal: l });
          }
        }) : V.create();
      }
      var Ar = { object: O.lazycreate };
      var d;
      (function(r) {
        r.ZodString = "ZodString", r.ZodNumber = "ZodNumber", r.ZodNaN = "ZodNaN", r.ZodBigInt = "ZodBigInt", r.ZodBoolean = "ZodBoolean", r.ZodDate = "ZodDate", r.ZodSymbol = "ZodSymbol", r.ZodUndefined = "ZodUndefined", r.ZodNull = "ZodNull", r.ZodAny = "ZodAny", r.ZodUnknown = "ZodUnknown", r.ZodNever = "ZodNever", r.ZodVoid = "ZodVoid", r.ZodArray = "ZodArray", r.ZodObject = "ZodObject", r.ZodUnion = "ZodUnion", r.ZodDiscriminatedUnion = "ZodDiscriminatedUnion", r.ZodIntersection = "ZodIntersection", r.ZodTuple = "ZodTuple", r.ZodRecord = "ZodRecord", r.ZodMap = "ZodMap", r.ZodSet = "ZodSet", r.ZodFunction = "ZodFunction", r.ZodLazy = "ZodLazy", r.ZodLiteral = "ZodLiteral", r.ZodEnum = "ZodEnum", r.ZodEffects = "ZodEffects", r.ZodNativeEnum = "ZodNativeEnum", r.ZodOptional = "ZodOptional", r.ZodNullable = "ZodNullable", r.ZodDefault = "ZodDefault", r.ZodCatch = "ZodCatch", r.ZodPromise = "ZodPromise", r.ZodBranded = "ZodBranded", r.ZodPipeline = "ZodPipeline", r.ZodReadonly = "ZodReadonly";
      })(d || (d = {}));
      var Pr = (r, e = { message: `Input not instance of ${r.name}` }) => tt((t) => t instanceof r, e);
      var rt = U.create;
      var nt = W.create;
      var Sr = me.create;
      var Or = H.create;
      var at = J.create;
      var Er = G.create;
      var Nr = de.create;
      var Zr = K.create;
      var Rr = Y.create;
      var Ir = V.create;
      var Cr = z.create;
      var jr = I.create;
      var Mr = le.create;
      var Dr = F.create;
      var $r = O.create;
      var Lr = O.strictCreate;
      var zr = X.create;
      var Fr = Ae.create;
      var Ur = Q.create;
      var Vr = M.create;
      var Br = Pe.create;
      var qr = pe.create;
      var Wr = fe.create;
      var Hr = Se.create;
      var Jr = ee.create;
      var Gr = te.create;
      var Kr = re.create;
      var Yr = ne.create;
      var Xr = B.create;
      var Je = N.create;
      var Qr = S.create;
      var en = D.create;
      var tn = N.createWithPreprocess;
      var rn = _e.create;
      var nn = () => rt().optional();
      var an = () => nt().optional();
      var sn = () => at().optional();
      var on = { string: (r) => U.create({ ...r, coerce: true }), number: (r) => W.create({ ...r, coerce: true }), boolean: (r) => J.create({ ...r, coerce: true }), bigint: (r) => H.create({ ...r, coerce: true }), date: (r) => G.create({ ...r, coerce: true }) };
      var un = v;
      var R = Object.freeze({ __proto__: null, defaultErrorMap: ce, setErrorMap: tr, getErrorMap: ke, makeIssue: Te, EMPTY_PATH: rr, addIssueToContext: p, ParseStatus: T, INVALID: v, DIRTY: ue, OK: A, isAborted: je, isDirty: Me, isValid: q, isAsync: ye, get util() {
        return k;
      }, get objectUtil() {
        return Ce;
      }, ZodParsedType: f, getParsedType: L, ZodType: b, datetimeRegex: Qe, ZodString: U, ZodNumber: W, ZodBigInt: H, ZodBoolean: J, ZodDate: G, ZodSymbol: de, ZodUndefined: K, ZodNull: Y, ZodAny: V, ZodUnknown: z, ZodNever: I, ZodVoid: le, ZodArray: F, ZodObject: O, ZodUnion: X, ZodDiscriminatedUnion: Ae, ZodIntersection: Q, ZodTuple: M, ZodRecord: Pe, ZodMap: pe, ZodSet: fe, ZodFunction: Se, ZodLazy: ee, ZodLiteral: te, ZodEnum: re, ZodNativeEnum: ne, ZodPromise: B, ZodEffects: N, ZodTransformer: N, ZodOptional: S, ZodNullable: D, ZodDefault: ae, ZodCatch: se, ZodNaN: me, BRAND: wr, ZodBranded: ve, ZodPipeline: _e, ZodReadonly: ie, custom: tt, Schema: b, ZodSchema: b, late: Ar, get ZodFirstPartyTypeKind() {
        return d;
      }, coerce: on, any: Ir, array: Dr, bigint: Or, boolean: at, date: Er, discriminatedUnion: Fr, effect: Je, enum: Kr, function: Hr, instanceof: Pr, intersection: Ur, lazy: Jr, literal: Gr, map: qr, nan: Sr, nativeEnum: Yr, never: jr, null: Rr, nullable: en, number: nt, object: $r, oboolean: sn, onumber: an, optional: Qr, ostring: nn, pipeline: rn, preprocess: tn, promise: Xr, record: Br, set: Wr, strictObject: Lr, string: rt, symbol: Nr, transformer: Je, tuple: Vr, undefined: Zr, union: zr, unknown: Cr, void: Mr, NEVER: un, ZodIssueCode: c, quotelessJson: er, ZodError: E });
      var it = Symbol("Let zodToJsonSchema decide on which parser to use");
      var st = { name: void 0, $refStrategy: "root", basePath: ["#"], effectStrategy: "input", pipeStrategy: "all", dateStrategy: "format:date-time", mapStrategy: "entries", removeAdditionalStrategy: "passthrough", definitionPath: "definitions", target: "jsonSchema7", strictUnions: false, definitions: {}, errorMessages: false, markdownDescription: false, patternStrategy: "escape", applyRegexFlags: false, emailStrategy: "format:email", base64Strategy: "contentEncoding:base64", nameStrategy: "ref" };
      var ot = (r) => typeof r == "string" ? { ...st, name: r } : { ...st, ...r };
      var ut = (r) => {
        let e = ot(r), t = e.name !== void 0 ? [...e.basePath, e.definitionPath, e.name] : e.basePath;
        return { ...e, currentPath: t, propertyPath: void 0, seen: new Map(Object.entries(e.definitions).map(([n, a]) => [a._def, { def: a._def, path: [...e.basePath, e.definitionPath, n], jsonSchema: void 0 }])) };
      };
      function $e(r, e, t, n) {
        n?.errorMessages && t && (r.errorMessage = { ...r.errorMessage, [e]: t });
      }
      function x(r, e, t, n, a) {
        r[e] = t, $e(r, e, n, a);
      }
      function ct() {
        return {};
      }
      function dt(r, e) {
        let t = { type: "array" };
        return r.type?._def && r.type?._def?.typeName !== d.ZodAny && (t.items = y(r.type._def, { ...e, currentPath: [...e.currentPath, "items"] })), r.minLength && x(t, "minItems", r.minLength.value, r.minLength.message, e), r.maxLength && x(t, "maxItems", r.maxLength.value, r.maxLength.message, e), r.exactLength && (x(t, "minItems", r.exactLength.value, r.exactLength.message, e), x(t, "maxItems", r.exactLength.value, r.exactLength.message, e)), t;
      }
      function lt(r, e) {
        let t = { type: "integer", format: "int64" };
        if (!r.checks) return t;
        for (let n of r.checks) switch (n.kind) {
          case "min":
            e.target === "jsonSchema7" ? n.inclusive ? x(t, "minimum", n.value, n.message, e) : x(t, "exclusiveMinimum", n.value, n.message, e) : (n.inclusive || (t.exclusiveMinimum = true), x(t, "minimum", n.value, n.message, e));
            break;
          case "max":
            e.target === "jsonSchema7" ? n.inclusive ? x(t, "maximum", n.value, n.message, e) : x(t, "exclusiveMaximum", n.value, n.message, e) : (n.inclusive || (t.exclusiveMaximum = true), x(t, "maximum", n.value, n.message, e));
            break;
          case "multipleOf":
            x(t, "multipleOf", n.value, n.message, e);
            break;
        }
        return t;
      }
      function pt() {
        return { type: "boolean" };
      }
      function Oe(r, e) {
        return y(r.type._def, e);
      }
      var ft = (r, e) => y(r.innerType._def, e);
      function Le(r, e, t) {
        let n = t ?? e.dateStrategy;
        if (Array.isArray(n)) return { anyOf: n.map((a, s) => Le(r, e, a)) };
        switch (n) {
          case "string":
          case "format:date-time":
            return { type: "string", format: "date-time" };
          case "format:date":
            return { type: "string", format: "date" };
          case "integer":
            return cn(r, e);
        }
      }
      var cn = (r, e) => {
        let t = { type: "integer", format: "unix-time" };
        if (e.target === "openApi3") return t;
        for (let n of r.checks) switch (n.kind) {
          case "min":
            x(t, "minimum", n.value, n.message, e);
            break;
          case "max":
            x(t, "maximum", n.value, n.message, e);
            break;
        }
        return t;
      };
      function mt(r, e) {
        return { ...y(r.innerType._def, e), default: r.defaultValue() };
      }
      function ht(r, e) {
        return e.effectStrategy === "input" ? y(r.schema._def, e) : {};
      }
      function gt(r) {
        return { type: "string", enum: Array.from(r.values) };
      }
      var dn = (r) => "type" in r && r.type === "string" ? false : "allOf" in r;
      function yt(r, e) {
        let t = [y(r.left._def, { ...e, currentPath: [...e.currentPath, "allOf", "0"] }), y(r.right._def, { ...e, currentPath: [...e.currentPath, "allOf", "1"] })].filter((s) => !!s), n = e.target === "jsonSchema2019-09" ? { unevaluatedProperties: false } : void 0, a = [];
        return t.forEach((s) => {
          if (dn(s)) a.push(...s.allOf), s.unevaluatedProperties === void 0 && (n = void 0);
          else {
            let i = s;
            if ("additionalProperties" in s && s.additionalProperties === false) {
              let { additionalProperties: o, ...u } = s;
              i = u;
            } else n = void 0;
            a.push(i);
          }
        }), a.length ? { allOf: a, ...n } : void 0;
      }
      function vt(r, e) {
        let t = typeof r.value;
        return t !== "bigint" && t !== "number" && t !== "boolean" && t !== "string" ? { type: Array.isArray(r.value) ? "array" : "object" } : e.target === "openApi3" ? { type: t === "bigint" ? "integer" : t, enum: [r.value] } : { type: t === "bigint" ? "integer" : t, const: r.value };
      }
      var ze;
      var C = { cuid: /^[cC][^\s-]{8,}$/, cuid2: /^[0-9a-z]+$/, ulid: /^[0-9A-HJKMNP-TV-Z]{26}$/, email: /^(?!\.)(?!.*\.\.)([a-zA-Z0-9_'+\-\.]*)[a-zA-Z0-9_+-]@([a-zA-Z0-9][a-zA-Z0-9\-]*\.)+[a-zA-Z]{2,}$/, emoji: () => (ze === void 0 && (ze = RegExp("^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$", "u")), ze), uuid: /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/, ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, ipv4Cidr: /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/, ipv6: /^(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))$/, ipv6Cidr: /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, base64: /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/, base64url: /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/, nanoid: /^[a-zA-Z0-9_-]{21}$/, jwt: /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/ };
      function Ee(r, e) {
        let t = { type: "string" };
        if (r.checks) for (let n of r.checks) switch (n.kind) {
          case "min":
            x(t, "minLength", typeof t.minLength == "number" ? Math.max(t.minLength, n.value) : n.value, n.message, e);
            break;
          case "max":
            x(t, "maxLength", typeof t.maxLength == "number" ? Math.min(t.maxLength, n.value) : n.value, n.message, e);
            break;
          case "email":
            switch (e.emailStrategy) {
              case "format:email":
                j(t, "email", n.message, e);
                break;
              case "format:idn-email":
                j(t, "idn-email", n.message, e);
                break;
              case "pattern:zod":
                P(t, C.email, n.message, e);
                break;
            }
            break;
          case "url":
            j(t, "uri", n.message, e);
            break;
          case "uuid":
            j(t, "uuid", n.message, e);
            break;
          case "regex":
            P(t, n.regex, n.message, e);
            break;
          case "cuid":
            P(t, C.cuid, n.message, e);
            break;
          case "cuid2":
            P(t, C.cuid2, n.message, e);
            break;
          case "startsWith":
            P(t, RegExp(`^${Fe(n.value, e)}`), n.message, e);
            break;
          case "endsWith":
            P(t, RegExp(`${Fe(n.value, e)}$`), n.message, e);
            break;
          case "datetime":
            j(t, "date-time", n.message, e);
            break;
          case "date":
            j(t, "date", n.message, e);
            break;
          case "time":
            j(t, "time", n.message, e);
            break;
          case "duration":
            j(t, "duration", n.message, e);
            break;
          case "length":
            x(t, "minLength", typeof t.minLength == "number" ? Math.max(t.minLength, n.value) : n.value, n.message, e), x(t, "maxLength", typeof t.maxLength == "number" ? Math.min(t.maxLength, n.value) : n.value, n.message, e);
            break;
          case "includes": {
            P(t, RegExp(Fe(n.value, e)), n.message, e);
            break;
          }
          case "ip": {
            n.version !== "v6" && j(t, "ipv4", n.message, e), n.version !== "v4" && j(t, "ipv6", n.message, e);
            break;
          }
          case "base64url":
            P(t, C.base64url, n.message, e);
            break;
          case "jwt":
            P(t, C.jwt, n.message, e);
            break;
          case "cidr": {
            n.version !== "v6" && P(t, C.ipv4Cidr, n.message, e), n.version !== "v4" && P(t, C.ipv6Cidr, n.message, e);
            break;
          }
          case "emoji":
            P(t, C.emoji(), n.message, e);
            break;
          case "ulid": {
            P(t, C.ulid, n.message, e);
            break;
          }
          case "base64": {
            switch (e.base64Strategy) {
              case "format:binary": {
                j(t, "binary", n.message, e);
                break;
              }
              case "contentEncoding:base64": {
                x(t, "contentEncoding", "base64", n.message, e);
                break;
              }
              case "pattern:zod": {
                P(t, C.base64, n.message, e);
                break;
              }
            }
            break;
          }
          case "nanoid":
            P(t, C.nanoid, n.message, e);
          case "toLowerCase":
          case "toUpperCase":
          case "trim":
            break;
          default:
        }
        return t;
      }
      function Fe(r, e) {
        return e.patternStrategy === "escape" ? pn(r) : r;
      }
      var ln = new Set("ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvxyz0123456789");
      function pn(r) {
        let e = "";
        for (let t = 0; t < r.length; t++) ln.has(r[t]) || (e += "\\"), e += r[t];
        return e;
      }
      function j(r, e, t, n) {
        r.format || r.anyOf?.some((a) => a.format) ? (r.anyOf || (r.anyOf = []), r.format && (r.anyOf.push({ format: r.format, ...r.errorMessage && n.errorMessages && { errorMessage: { format: r.errorMessage.format } } }), delete r.format, r.errorMessage && (delete r.errorMessage.format, Object.keys(r.errorMessage).length === 0 && delete r.errorMessage)), r.anyOf.push({ format: e, ...t && n.errorMessages && { errorMessage: { format: t } } })) : x(r, "format", e, t, n);
      }
      function P(r, e, t, n) {
        r.pattern || r.allOf?.some((a) => a.pattern) ? (r.allOf || (r.allOf = []), r.pattern && (r.allOf.push({ pattern: r.pattern, ...r.errorMessage && n.errorMessages && { errorMessage: { pattern: r.errorMessage.pattern } } }), delete r.pattern, r.errorMessage && (delete r.errorMessage.pattern, Object.keys(r.errorMessage).length === 0 && delete r.errorMessage)), r.allOf.push({ pattern: _t(e, n), ...t && n.errorMessages && { errorMessage: { pattern: t } } })) : x(r, "pattern", _t(e, n), t, n);
      }
      function _t(r, e) {
        if (!e.applyRegexFlags || !r.flags) return r.source;
        let t = { i: r.flags.includes("i"), m: r.flags.includes("m"), s: r.flags.includes("s") }, n = t.i ? r.source.toLowerCase() : r.source, a = "", s = false, i = false, o = false;
        for (let u = 0; u < n.length; u++) {
          if (s) {
            a += n[u], s = false;
            continue;
          }
          if (t.i) {
            if (i) {
              if (n[u].match(/[a-z]/)) {
                o ? (a += n[u], a += `${n[u - 2]}-${n[u]}`.toUpperCase(), o = false) : n[u + 1] === "-" && n[u + 2]?.match(/[a-z]/) ? (a += n[u], o = true) : a += `${n[u]}${n[u].toUpperCase()}`;
                continue;
              }
            } else if (n[u].match(/[a-z]/)) {
              a += `[${n[u]}${n[u].toUpperCase()}]`;
              continue;
            }
          }
          if (t.m) {
            if (n[u] === "^") {
              a += `(^|(?<=[\r
]))`;
              continue;
            } else if (n[u] === "$") {
              a += `($|(?=[\r
]))`;
              continue;
            }
          }
          if (t.s && n[u] === ".") {
            a += i ? `${n[u]}\r
` : `[${n[u]}\r
]`;
            continue;
          }
          a += n[u], n[u] === "\\" ? s = true : i && n[u] === "]" ? i = false : !i && n[u] === "[" && (i = true);
        }
        try {
          new RegExp(a);
        } catch {
          return console.warn(`Could not convert regex pattern at ${e.currentPath.join("/")} to a flag-independent form! Falling back to the flag-ignorant source`), r.source;
        }
        return a;
      }
      function Ne(r, e) {
        if (e.target === "openAi" && console.warn("Warning: OpenAI may not support records in schemas! Try an array of key-value pairs instead."), e.target === "openApi3" && r.keyType?._def.typeName === d.ZodEnum) return { type: "object", required: r.keyType._def.values, properties: r.keyType._def.values.reduce((n, a) => ({ ...n, [a]: y(r.valueType._def, { ...e, currentPath: [...e.currentPath, "properties", a] }) ?? {} }), {}), additionalProperties: false };
        let t = { type: "object", additionalProperties: y(r.valueType._def, { ...e, currentPath: [...e.currentPath, "additionalProperties"] }) ?? {} };
        if (e.target === "openApi3") return t;
        if (r.keyType?._def.typeName === d.ZodString && r.keyType._def.checks?.length) {
          let { type: n, ...a } = Ee(r.keyType._def, e);
          return { ...t, propertyNames: a };
        } else {
          if (r.keyType?._def.typeName === d.ZodEnum) return { ...t, propertyNames: { enum: r.keyType._def.values } };
          if (r.keyType?._def.typeName === d.ZodBranded && r.keyType._def.type._def.typeName === d.ZodString && r.keyType._def.type._def.checks?.length) {
            let { type: n, ...a } = Oe(r.keyType._def, e);
            return { ...t, propertyNames: a };
          }
        }
        return t;
      }
      function bt(r, e) {
        if (e.mapStrategy === "record") return Ne(r, e);
        let t = y(r.keyType._def, { ...e, currentPath: [...e.currentPath, "items", "items", "0"] }) || {}, n = y(r.valueType._def, { ...e, currentPath: [...e.currentPath, "items", "items", "1"] }) || {};
        return { type: "array", maxItems: 125, items: { type: "array", items: [t, n], minItems: 2, maxItems: 2 } };
      }
      function xt(r) {
        let e = r.values, n = Object.keys(r.values).filter((s) => typeof e[e[s]] != "number").map((s) => e[s]), a = Array.from(new Set(n.map((s) => typeof s)));
        return { type: a.length === 1 ? a[0] === "string" ? "string" : "number" : ["string", "number"], enum: n };
      }
      function kt() {
        return { not: {} };
      }
      function Tt(r) {
        return r.target === "openApi3" ? { enum: ["null"], nullable: true } : { type: "null" };
      }
      var be = { ZodString: "string", ZodNumber: "number", ZodBigInt: "integer", ZodBoolean: "boolean", ZodNull: "null" };
      function At(r, e) {
        if (e.target === "openApi3") return wt(r, e);
        let t = r.options instanceof Map ? Array.from(r.options.values()) : r.options;
        if (t.every((n) => n._def.typeName in be && (!n._def.checks || !n._def.checks.length))) {
          let n = t.reduce((a, s) => {
            let i = be[s._def.typeName];
            return i && !a.includes(i) ? [...a, i] : a;
          }, []);
          return { type: n.length > 1 ? n : n[0] };
        } else if (t.every((n) => n._def.typeName === "ZodLiteral" && !n.description)) {
          let n = t.reduce((a, s) => {
            let i = typeof s._def.value;
            switch (i) {
              case "string":
              case "number":
              case "boolean":
                return [...a, i];
              case "bigint":
                return [...a, "integer"];
              case "object":
                if (s._def.value === null) return [...a, "null"];
              case "symbol":
              case "undefined":
              case "function":
              default:
                return a;
            }
          }, []);
          if (n.length === t.length) {
            let a = n.filter((s, i, o) => o.indexOf(s) === i);
            return { type: a.length > 1 ? a : a[0], enum: t.reduce((s, i) => s.includes(i._def.value) ? s : [...s, i._def.value], []) };
          }
        } else if (t.every((n) => n._def.typeName === "ZodEnum")) return { type: "string", enum: t.reduce((n, a) => [...n, ...a._def.values.filter((s) => !n.includes(s))], []) };
        return wt(r, e);
      }
      var wt = (r, e) => {
        let t = (r.options instanceof Map ? Array.from(r.options.values()) : r.options).map((n, a) => y(n._def, { ...e, currentPath: [...e.currentPath, "anyOf", `${a}`] })).filter((n) => !!n && (!e.strictUnions || typeof n == "object" && Object.keys(n).length > 0));
        return t.length ? { anyOf: t } : void 0;
      };
      function Pt(r, e) {
        if (["ZodString", "ZodNumber", "ZodBigInt", "ZodBoolean", "ZodNull"].includes(r.innerType._def.typeName) && (!r.innerType._def.checks || !r.innerType._def.checks.length)) return e.target === "openApi3" ? { type: be[r.innerType._def.typeName], nullable: true } : { type: [be[r.innerType._def.typeName], "null"] };
        if (e.target === "openApi3") {
          let n = y(r.innerType._def, { ...e, currentPath: [...e.currentPath] });
          return n && "$ref" in n ? { allOf: [n], nullable: true } : n && { ...n, nullable: true };
        }
        let t = y(r.innerType._def, { ...e, currentPath: [...e.currentPath, "anyOf", "0"] });
        return t && { anyOf: [t, { type: "null" }] };
      }
      function St(r, e) {
        let t = { type: "number" };
        if (!r.checks) return t;
        for (let n of r.checks) switch (n.kind) {
          case "int":
            t.type = "integer", $e(t, "type", n.message, e);
            break;
          case "min":
            e.target === "jsonSchema7" ? n.inclusive ? x(t, "minimum", n.value, n.message, e) : x(t, "exclusiveMinimum", n.value, n.message, e) : (n.inclusive || (t.exclusiveMinimum = true), x(t, "minimum", n.value, n.message, e));
            break;
          case "max":
            e.target === "jsonSchema7" ? n.inclusive ? x(t, "maximum", n.value, n.message, e) : x(t, "exclusiveMaximum", n.value, n.message, e) : (n.inclusive || (t.exclusiveMaximum = true), x(t, "maximum", n.value, n.message, e));
            break;
          case "multipleOf":
            x(t, "multipleOf", n.value, n.message, e);
            break;
        }
        return t;
      }
      function fn(r, e) {
        return e.removeAdditionalStrategy === "strict" ? r.catchall._def.typeName === "ZodNever" ? r.unknownKeys !== "strict" : y(r.catchall._def, { ...e, currentPath: [...e.currentPath, "additionalProperties"] }) ?? true : r.catchall._def.typeName === "ZodNever" ? r.unknownKeys === "passthrough" : y(r.catchall._def, { ...e, currentPath: [...e.currentPath, "additionalProperties"] }) ?? true;
      }
      function Ot(r, e) {
        let t = e.target === "openAi", n = { type: "object", ...Object.entries(r.shape()).reduce((a, [s, i]) => {
          if (i === void 0 || i._def === void 0) return a;
          let o = i.isOptional();
          o && t && (i instanceof S && (i = i._def.innerType), i.isNullable() || (i = i.nullable()), o = false);
          let u = y(i._def, { ...e, currentPath: [...e.currentPath, "properties", s], propertyPath: [...e.currentPath, "properties", s] });
          return u === void 0 ? a : { properties: { ...a.properties, [s]: u }, required: o ? a.required : [...a.required, s] };
        }, { properties: {}, required: [] }), additionalProperties: fn(r, e) };
        return n.required.length || delete n.required, n;
      }
      var Et = (r, e) => {
        if (e.currentPath.toString() === e.propertyPath?.toString()) return y(r.innerType._def, e);
        let t = y(r.innerType._def, { ...e, currentPath: [...e.currentPath, "anyOf", "1"] });
        return t ? { anyOf: [{ not: {} }, t] } : {};
      };
      var Nt = (r, e) => {
        if (e.pipeStrategy === "input") return y(r.in._def, e);
        if (e.pipeStrategy === "output") return y(r.out._def, e);
        let t = y(r.in._def, { ...e, currentPath: [...e.currentPath, "allOf", "0"] }), n = y(r.out._def, { ...e, currentPath: [...e.currentPath, "allOf", t ? "1" : "0"] });
        return { allOf: [t, n].filter((a) => a !== void 0) };
      };
      function Zt(r, e) {
        return y(r.type._def, e);
      }
      function Rt(r, e) {
        let n = { type: "array", uniqueItems: true, items: y(r.valueType._def, { ...e, currentPath: [...e.currentPath, "items"] }) };
        return r.minSize && x(n, "minItems", r.minSize.value, r.minSize.message, e), r.maxSize && x(n, "maxItems", r.maxSize.value, r.maxSize.message, e), n;
      }
      function It(r, e) {
        return r.rest ? { type: "array", minItems: r.items.length, items: r.items.map((t, n) => y(t._def, { ...e, currentPath: [...e.currentPath, "items", `${n}`] })).reduce((t, n) => n === void 0 ? t : [...t, n], []), additionalItems: y(r.rest._def, { ...e, currentPath: [...e.currentPath, "additionalItems"] }) } : { type: "array", minItems: r.items.length, maxItems: r.items.length, items: r.items.map((t, n) => y(t._def, { ...e, currentPath: [...e.currentPath, "items", `${n}`] })).reduce((t, n) => n === void 0 ? t : [...t, n], []) };
      }
      function Ct() {
        return { not: {} };
      }
      function jt() {
        return {};
      }
      var Mt = (r, e) => y(r.innerType._def, e);
      var Dt = (r, e, t) => {
        switch (e) {
          case d.ZodString:
            return Ee(r, t);
          case d.ZodNumber:
            return St(r, t);
          case d.ZodObject:
            return Ot(r, t);
          case d.ZodBigInt:
            return lt(r, t);
          case d.ZodBoolean:
            return pt();
          case d.ZodDate:
            return Le(r, t);
          case d.ZodUndefined:
            return Ct();
          case d.ZodNull:
            return Tt(t);
          case d.ZodArray:
            return dt(r, t);
          case d.ZodUnion:
          case d.ZodDiscriminatedUnion:
            return At(r, t);
          case d.ZodIntersection:
            return yt(r, t);
          case d.ZodTuple:
            return It(r, t);
          case d.ZodRecord:
            return Ne(r, t);
          case d.ZodLiteral:
            return vt(r, t);
          case d.ZodEnum:
            return gt(r);
          case d.ZodNativeEnum:
            return xt(r);
          case d.ZodNullable:
            return Pt(r, t);
          case d.ZodOptional:
            return Et(r, t);
          case d.ZodMap:
            return bt(r, t);
          case d.ZodSet:
            return Rt(r, t);
          case d.ZodLazy:
            return () => r.getter()._def;
          case d.ZodPromise:
            return Zt(r, t);
          case d.ZodNaN:
          case d.ZodNever:
            return kt();
          case d.ZodEffects:
            return ht(r, t);
          case d.ZodAny:
            return ct();
          case d.ZodUnknown:
            return jt();
          case d.ZodDefault:
            return mt(r, t);
          case d.ZodBranded:
            return Oe(r, t);
          case d.ZodReadonly:
            return Mt(r, t);
          case d.ZodCatch:
            return ft(r, t);
          case d.ZodPipeline:
            return Nt(r, t);
          case d.ZodFunction:
          case d.ZodVoid:
          case d.ZodSymbol:
            return;
          default:
            return /* @__PURE__ */ ((n) => {
            })(e);
        }
      };
      function y(r, e, t = false) {
        let n = e.seen.get(r);
        if (e.override) {
          let o = e.override?.(r, e, n, t);
          if (o !== it) return o;
        }
        if (n && !t) {
          let o = mn(n, e);
          if (o !== void 0) return o;
        }
        let a = { def: r, path: e.currentPath, jsonSchema: void 0 };
        e.seen.set(r, a);
        let s = Dt(r, r.typeName, e), i = typeof s == "function" ? y(s(), e) : s;
        if (i && gn(r, e, i), e.postProcess) {
          let o = e.postProcess(i, r, e);
          return a.jsonSchema = i, o;
        }
        return a.jsonSchema = i, i;
      }
      var mn = (r, e) => {
        switch (e.$refStrategy) {
          case "root":
            return { $ref: r.path.join("/") };
          case "relative":
            return { $ref: hn(e.currentPath, r.path) };
          case "none":
          case "seen":
            return r.path.length < e.currentPath.length && r.path.every((t, n) => e.currentPath[n] === t) ? (console.warn(`Recursive reference detected at ${e.currentPath.join("/")}! Defaulting to any`), {}) : e.$refStrategy === "seen" ? {} : void 0;
        }
      };
      var hn = (r, e) => {
        let t = 0;
        for (; t < r.length && t < e.length && r[t] === e[t]; t++) ;
        return [(r.length - t).toString(), ...e.slice(t)].join("/");
      };
      var gn = (r, e, t) => (r.description && (t.description = r.description, e.markdownDescription && (t.markdownDescription = r.description)), t);
      var $t = (r, e) => {
        let t = ut(e), n = typeof e == "object" && e.definitions ? Object.entries(e.definitions).reduce((u, [l, g]) => ({ ...u, [l]: y(g._def, { ...t, currentPath: [...t.basePath, t.definitionPath, l] }, true) ?? {} }), {}) : void 0, a = typeof e == "string" ? e : e?.nameStrategy === "title" ? void 0 : e?.name, s = y(r._def, a === void 0 ? t : { ...t, currentPath: [...t.basePath, t.definitionPath, a] }, false) ?? {}, i = typeof e == "object" && e.name !== void 0 && e.nameStrategy === "title" ? e.name : void 0;
        i !== void 0 && (s.title = i);
        let o = a === void 0 ? n ? { ...s, [t.definitionPath]: n } : s : { $ref: [...t.$refStrategy === "relative" ? [] : t.basePath, t.definitionPath, a].join("/"), [t.definitionPath]: { ...n, [a]: s } };
        return t.target === "jsonSchema7" ? o.$schema = "http://json-schema.org/draft-07/schema#" : (t.target === "jsonSchema2019-09" || t.target === "openAi") && (o.$schema = "https://json-schema.org/draft/2019-09/schema#"), t.target === "openAi" && ("anyOf" in o || "oneOf" in o || "allOf" in o || "type" in o && Array.isArray(o.type)) && console.warn("Warning: OpenAI may not support schemas with unions as roots! Try wrapping it in an object property."), o;
      };
      var Lt = $t;
      function zt(r, e = { baseIndent: 0 }) {
        let t = r.split(`
`), n = t.map((i) => i.length - i.trimStart().length).filter((i) => i > 0), a = Math.min(...n) - e.baseIndent, s = Math.max(e.baseIndent - Math.min(...n), 0);
        return t.map((i, o) => {
          let u = i.length - i.trimStart().length;
          return s > 0 && o > 0 ? " ".repeat(s) + i : u >= a ? i.substring(a) : i;
        }).join(`
`);
      }
      function Ft(r) {
        return JSON.stringify(r, null, 2);
      }
      function Ut(r, e) {
        return zt(Ft(Lt(r, e)), { baseIndent: 4 });
      }
      var Ue = ((h) => (h.OpenAI = "OpenAI", h.Anthropic = "Anthropic", h.Google = "Google", h.GoogleAIStudio = "Google AI Studio", h.AmazonBedrock = "Amazon Bedrock", h.Groq = "Groq", h.SambaNova = "SambaNova", h.SambaNovaCloaked = "SambaNova 2", h.Cohere = "Cohere", h.Mistral = "Mistral", h.Together = "Together", h.TogetherLite = "Together 2", h.Fireworks = "Fireworks", h.DeepInfra = "DeepInfra", h.Lepton = "Lepton", h.Novita = "Novita", h.Avian = "Avian", h.Lambda = "Lambda", h.Azure = "Azure", h.Modal = "Modal", h.AnyScale = "AnyScale", h.Replicate = "Replicate", h.Perplexity = "Perplexity", h.Recursal = "Recursal", h.OctoAI = "OctoAI", h.DeepSeek = "DeepSeek", h.Infermatic = "Infermatic", h.AI21 = "AI21", h.Featherless = "Featherless", h.Inflection = "Inflection", h.XAI = "xAI", h.Cloudflare = "Cloudflare", h.SFCompute = "SF Compute", h.Minimax = "Minimax", h.Nineteen = "Nineteen", h.Liquid = "Liquid", h.InferenceNet = "InferenceNet", h.Friendli = "Friendli", h.AionLabs = "AionLabs", h.Alibaba = "Alibaba", h.Nebius = "Nebius", h.Chutes = "Chutes", h.Kluster = "Kluster", h.Crusoe = "Crusoe", h.Targon = "Targon", h.Ubicloud = "Ubicloud", h.Parasail = "Parasail", h.ZeroOneAI = "01.AI", h.HuggingFace = "HuggingFace", h.Mancer = "Mancer", h.MancerPrivate = "Mancer 2", h.Hyperbolic = "Hyperbolic", h.HyperbolicQuantized = "Hyperbolic 2", h.Lynn = "Lynn 2", h.LynnPrivate = "Lynn", h.Reflection = "Reflection", h))(Ue || {});
      var yn = /* @__PURE__ */ new Set(["01.AI", "Replicate", "HuggingFace", "Modal", "Recursal", "Lynn 2", "Lynn", "OctoAI", "AnyScale"]);
      var vn = /* @__PURE__ */ new Set(["SambaNova 2"]);
      function Vt(r) {
        return vn.has(r);
      }
      var Ve = Object.fromEntries(Object.entries(Ue).filter(([r, e]) => !Vt(e)));
      var _n = /* @__PURE__ */ new Set(["HuggingFace", "Replicate", "Lynn 2", "Lynn", "Modal", "Reflection", "01.AI", "OctoAI", "SambaNova 2"]);
      var hi = new Set(Object.values(Ue).filter((r) => !_n.has(r) && !yn.has(r) && !Vt(r)));
      var Be = ((l) => (l.Int4 = "int4", l.Int8 = "int8", l.FloatingPoint4 = "fp4", l.FloatingPoint6 = "fp6", l.FloatingPoint8 = "fp8", l.FloatingPoint16 = "fp16", l.BrainFloating16 = "bf16", l.FloatingPoint32 = "fp32", l.Unknown = "unknown", l))(Be || {});
      var qe = ((n) => (n.Price = "price", n.Throughput = "throughput", n.Latency = "latency", n))(qe || {});
      var Bt = R.object({ allow_fallbacks: R.boolean().nullish().describe(`Whether to allow backup providers to serve requests
- true: (default) when the primary provider (or your custom providers in "order") is unavailable, use the next best provider.
- false: use only the primary/custom provider, and return the upstream error if it's unavailable.
`), require_parameters: R.boolean().nullish().describe("Whether to filter providers to only those that support the parameters you've provided. If this setting is omitted or set to false, then providers will receive only the parameters they support, and ignore the rest."), data_collection: R.enum(["deny", "allow"]).nullish().describe(`Data collection setting. If no available model provider meets the requirement, your request will return an error.
- allow: (default) allow providers which store user data non-transiently and may train on it
- deny: use only providers which do not collect user data.
`), order: R.array(R.nativeEnum(Ve)).nullish().describe("An ordered list of provider names. The router will attempt to use the first provider in the subset of this list that supports your requested model, and fall back to the next if it is unavailable. If no providers are available, the request will fail with an error message."), ignore: R.array(R.nativeEnum(Ve)).nullish().describe("List of provider names to ignore. If provided, this list is merged with your account-wide ignored provider settings for this request."), quantizations: R.array(R.nativeEnum(Be)).nullish().describe("A list of quantization levels to filter the provider by."), sort: R.nativeEnum(qe).nullish().describe('The sorting strategy to use for this request, if "order" is not specified. When set, no load balancing is performed.') });
      var qt = (init_react(), __toCommonJS(react_exports));
      var Wt = () => (0, qt.useMDXComponents)();
      var bn = { ProviderPreferencesSchema: Bt };
      var xn = ({ schemaName: r, title: e = "JSON Schema" }) => {
        let { CodeBlocks: t } = Wt(), n = (0, Ht.useMemo)(() => [{ code: Ut(bn[r], r), title: e, language: "json" }], [r]);
        return React.createElement(t, { items: n });
      };
    }
  });

  // ../../../imports/TSFetchCodeBlock.js
  var require_TSFetchCodeBlock = __commonJS({
    "../../../imports/TSFetchCodeBlock.js"(exports, module) {
      "use strict";
      var s = Object.defineProperty;
      var d = Object.getOwnPropertyDescriptor;
      var u = Object.getOwnPropertyNames;
      var h = Object.prototype.hasOwnProperty;
      var m = (t, n) => {
        for (var r in n) s(t, r, { get: n[r], enumerable: true });
      };
      var f = (t, n, r, e) => {
        if (n && typeof n == "object" || typeof n == "function") for (let o of u(n)) !h.call(t, o) && o !== r && s(t, o, { get: () => n[o], enumerable: !(e = d(n, o)) || e.enumerable });
        return t;
      };
      var y = (t) => f(s({}, "__esModule", { value: true }), t);
      var R = {};
      m(R, { TSFetchCodeBlock: () => T });
      module.exports = y(R);
      var a = require_react();
      function p(t) {
        return JSON.stringify(t, null, 2);
      }
      var g = (init_react(), __toCommonJS(react_exports));
      var c = () => (0, g.useMDXComponents)();
      var l = "  ";
      function S({ uriPath: t, body: n }) {
        let e = p(n).split(`
`);
        e.shift(), e.pop();
        let o = e.map((i) => `${l}${i}`.replaceAll(/"/g, "'")).join(`
`);
        return `fetch('https://openrouter.ai${t}', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <OPENROUTER_API_KEY>',
    'HTTP-Referer': '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.
    'X-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
${o}
  }),
});`;
      }
      function C({ uriPath: t, body: n }) {
        let e = p(n).split(`
`);
        e.shift(), e.pop();
        let o = e.map((i) => `${l}${i}`.replaceAll(/"/g, "'")).join(`
`);
        return `import requests
headers = {
  'Authorization': 'Bearer <OPENROUTER_API_KEY>',
  'HTTP-Referer': '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.
  'X-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.
  'Content-Type': 'application/json',
}

response = requests.post('https://openrouter.ai${t}', headers=headers, json={
${o}
})`;
      }
      var T = ({ body: t, uriPath: n, title: r }) => {
        let { CodeBlocks: e } = c(), o = (0, a.useMemo)(() => S({ uriPath: n, body: t }), [t, n]), i = (0, a.useMemo)(() => C({ uriPath: n, body: t }), [t, n]);
        return React.createElement(e, { items: [{ code: o, language: "typescript", title: `TypeScript ${r}` }, { code: i, language: "python", title: `Python ${r}` }] });
      };
    }
  });

  // _mdx_bundler_entry_point-_random_uuid_.mdx
  var mdx_bundler_entry_point__random_uuid__exports = {};
  __export(mdx_bundler_entry_point__random_uuid__exports, {
    default: () => MDXContent,
    frontmatter: () => frontmatter
  });
  var import_jsx_runtime = __toESM(require_jsx_runtime());
  init_react();
  var import_JsonSchemaBlock = __toESM(require_JsonSchemaBlock());
  var import_TSFetchCodeBlock = __toESM(require_TSFetchCodeBlock());
  var frontmatter = {
    "title": "Provider Routing",
    "subtitle": "Route requests to the best provider",
    "headline": "Provider Routing | Intelligent Multi-Provider Request Routing",
    "canonical-url": "https://openrouter.ai/docs/features/provider-routing",
    "og:site_name": "OpenRouter Documentation",
    "og:title": "Provider Routing - Smart Multi-Provider Request Management",
    "og:description": "Route AI model requests across multiple providers intelligently. Learn how to optimize for cost, performance, and reliability with OpenRouter's provider routing.",
    "og:image": {
      "type": "url",
      "value": "https://openrouter.ai/dynamic-og?pathname=features/provider-routing&title=Smart%20Routing&description=Optimize%20AI%20requests%20across%20providers%20for%20best%20performance"
    },
    "og:image:width": 1200,
    "og:image:height": 630,
    "twitter:card": "summary_large_image",
    "twitter:site": "@OpenRouterAI",
    "noindex": false,
    "nofollow": false
  };
  function _createMdxContent(props) {
    const _components = {
      a: "a",
      annotation: "annotation",
      code: "code",
      em: "em",
      h2: "h2",
      h3: "h3",
      li: "li",
      math: "math",
      mi: "mi",
      mn: "mn",
      mo: "mo",
      mrow: "mrow",
      msup: "msup",
      ol: "ol",
      p: "p",
      semantics: "semantics",
      span: "span",
      strong: "strong",
      table: "table",
      tbody: "tbody",
      td: "td",
      th: "th",
      thead: "thead",
      tr: "tr",
      ul: "ul",
      ...useMDXComponents(),
      ...props.components
    }, { ErrorBoundary, Note, Tip, Warning } = _components;
    if (!ErrorBoundary) _missingMdxReference("ErrorBoundary", true);
    if (!Note) _missingMdxReference("Note", true);
    if (!Tip) _missingMdxReference("Tip", true);
    if (!Warning) _missingMdxReference("Warning", true);
    return (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, {
      children: [(0, import_jsx_runtime.jsxs)(_components.p, {
        children: ["OpenRouter routes requests to the best available providers for your model. By default, ", (0, import_jsx_runtime.jsx)(_components.a, {
          href: "#load-balancing-default-strategy",
          children: "requests are load balanced"
        }), " across the top providers to maximize uptime."]
      }), "\n", (0, import_jsx_runtime.jsxs)(_components.p, {
        children: ["You can customize how your requests are routed using the ", (0, import_jsx_runtime.jsx)(_components.code, {
          children: "provider"
        }), " object in the request body for ", (0, import_jsx_runtime.jsx)(_components.a, {
          href: "/docs/api-reference/chat-completion",
          children: "Chat Completions"
        }), " and ", (0, import_jsx_runtime.jsx)(_components.a, {
          href: "/docs/api-reference/completion",
          children: "Completions"
        }), "."]
      }), "\n", (0, import_jsx_runtime.jsx)(ErrorBoundary, {
        children: (0, import_jsx_runtime.jsx)(Tip, {
          children: (0, import_jsx_runtime.jsxs)(_components.p, {
            children: ["For a complete list of valid provider names to use in the API, see the ", (0, import_jsx_runtime.jsx)(_components.a, {
              href: "#json-schema-for-provider-preferences",
              children: "full\nprovider schema"
            }), "."]
          })
        })
      }), "\n", (0, import_jsx_runtime.jsxs)(_components.p, {
        children: ["The ", (0, import_jsx_runtime.jsx)(_components.code, {
          children: "provider"
        }), " object can contain the following fields:"]
      }), "\n", (0, import_jsx_runtime.jsxs)(_components.table, {
        children: [(0, import_jsx_runtime.jsx)(_components.thead, {
          children: (0, import_jsx_runtime.jsxs)(_components.tr, {
            children: [(0, import_jsx_runtime.jsx)(_components.th, {
              children: "Field"
            }), (0, import_jsx_runtime.jsx)(_components.th, {
              children: "Type"
            }), (0, import_jsx_runtime.jsx)(_components.th, {
              children: "Default"
            }), (0, import_jsx_runtime.jsx)(_components.th, {
              children: "Description"
            })]
          })
        }), (0, import_jsx_runtime.jsxs)(_components.tbody, {
          children: [(0, import_jsx_runtime.jsxs)(_components.tr, {
            children: [(0, import_jsx_runtime.jsx)(_components.td, {
              children: (0, import_jsx_runtime.jsx)(_components.code, {
                children: "order"
              })
            }), (0, import_jsx_runtime.jsx)(_components.td, {
              children: "string[]"
            }), (0, import_jsx_runtime.jsx)(_components.td, {
              children: "-"
            }), (0, import_jsx_runtime.jsxs)(_components.td, {
              children: ["List of provider names to try in order (e.g. ", (0, import_jsx_runtime.jsx)(_components.code, {
                children: '["Anthropic", "OpenAI"]'
              }), "). ", (0, import_jsx_runtime.jsx)(_components.a, {
                href: "#ordering-specific-providers",
                children: "Learn more"
              })]
            })]
          }), (0, import_jsx_runtime.jsxs)(_components.tr, {
            children: [(0, import_jsx_runtime.jsx)(_components.td, {
              children: (0, import_jsx_runtime.jsx)(_components.code, {
                children: "allow_fallbacks"
              })
            }), (0, import_jsx_runtime.jsx)(_components.td, {
              children: "boolean"
            }), (0, import_jsx_runtime.jsx)(_components.td, {
              children: (0, import_jsx_runtime.jsx)(_components.code, {
                children: "true"
              })
            }), (0, import_jsx_runtime.jsxs)(_components.td, {
              children: ["Whether to allow backup providers when the primary is unavailable. ", (0, import_jsx_runtime.jsx)(_components.a, {
                href: "#disabling-fallbacks",
                children: "Learn more"
              })]
            })]
          }), (0, import_jsx_runtime.jsxs)(_components.tr, {
            children: [(0, import_jsx_runtime.jsx)(_components.td, {
              children: (0, import_jsx_runtime.jsx)(_components.code, {
                children: "require_parameters"
              })
            }), (0, import_jsx_runtime.jsx)(_components.td, {
              children: "boolean"
            }), (0, import_jsx_runtime.jsx)(_components.td, {
              children: (0, import_jsx_runtime.jsx)(_components.code, {
                children: "false"
              })
            }), (0, import_jsx_runtime.jsxs)(_components.td, {
              children: ["Only use providers that support all parameters in your request. ", (0, import_jsx_runtime.jsx)(_components.a, {
                href: "#requiring-providers-to-support-all-parameters-beta",
                children: "Learn more"
              })]
            })]
          }), (0, import_jsx_runtime.jsxs)(_components.tr, {
            children: [(0, import_jsx_runtime.jsx)(_components.td, {
              children: (0, import_jsx_runtime.jsx)(_components.code, {
                children: "data_collection"
              })
            }), (0, import_jsx_runtime.jsx)(_components.td, {
              children: '\u201Dallow\u201D | \u201Cdeny"'
            }), (0, import_jsx_runtime.jsx)(_components.td, {
              children: '"allow\u201D'
            }), (0, import_jsx_runtime.jsxs)(_components.td, {
              children: ["Control whether to use providers that may store data. ", (0, import_jsx_runtime.jsx)(_components.a, {
                href: "#requiring-providers-to-comply-with-data-policies",
                children: "Learn more"
              })]
            })]
          }), (0, import_jsx_runtime.jsxs)(_components.tr, {
            children: [(0, import_jsx_runtime.jsx)(_components.td, {
              children: (0, import_jsx_runtime.jsx)(_components.code, {
                children: "ignore"
              })
            }), (0, import_jsx_runtime.jsx)(_components.td, {
              children: "string[]"
            }), (0, import_jsx_runtime.jsx)(_components.td, {
              children: "-"
            }), (0, import_jsx_runtime.jsxs)(_components.td, {
              children: ["List of provider names to skip for this request. ", (0, import_jsx_runtime.jsx)(_components.a, {
                href: "#ignoring-providers",
                children: "Learn more"
              })]
            })]
          }), (0, import_jsx_runtime.jsxs)(_components.tr, {
            children: [(0, import_jsx_runtime.jsx)(_components.td, {
              children: (0, import_jsx_runtime.jsx)(_components.code, {
                children: "quantizations"
              })
            }), (0, import_jsx_runtime.jsx)(_components.td, {
              children: "string[]"
            }), (0, import_jsx_runtime.jsx)(_components.td, {
              children: "-"
            }), (0, import_jsx_runtime.jsxs)(_components.td, {
              children: ["List of quantization levels to filter by (e.g. ", (0, import_jsx_runtime.jsx)(_components.code, {
                children: '["int4", "int8"]'
              }), "). ", (0, import_jsx_runtime.jsx)(_components.a, {
                href: "#quantization",
                children: "Learn more"
              })]
            })]
          }), (0, import_jsx_runtime.jsxs)(_components.tr, {
            children: [(0, import_jsx_runtime.jsx)(_components.td, {
              children: (0, import_jsx_runtime.jsx)(_components.code, {
                children: "sort"
              })
            }), (0, import_jsx_runtime.jsx)(_components.td, {
              children: "string"
            }), (0, import_jsx_runtime.jsx)(_components.td, {
              children: "-"
            }), (0, import_jsx_runtime.jsxs)(_components.td, {
              children: ["Sort providers by price or throughput. (e.g. ", (0, import_jsx_runtime.jsx)(_components.code, {
                children: '"price"'
              }), " or ", (0, import_jsx_runtime.jsx)(_components.code, {
                children: '"throughput"'
              }), "). ", (0, import_jsx_runtime.jsx)(_components.a, {
                href: "#provider-sorting",
                children: "Learn more"
              })]
            })]
          })]
        })]
      }), "\n", (0, import_jsx_runtime.jsx)(_components.h2, {
        id: "price-based-load-balancing-default-strategy",
        children: "Price-Based Load Balancing (Default Strategy)"
      }), "\n", (0, import_jsx_runtime.jsx)(_components.p, {
        children: "For each model in your request, OpenRouter\u2019s default behavior is to load balance requests across providers, prioritizing price."
      }), "\n", (0, import_jsx_runtime.jsxs)(_components.p, {
        children: ["If you are more sensitive to throughput than price, you can use the ", (0, import_jsx_runtime.jsx)(_components.code, {
          children: "sort"
        }), " field to explicitly prioritize throughput."]
      }), "\n", (0, import_jsx_runtime.jsx)(ErrorBoundary, {
        children: (0, import_jsx_runtime.jsx)(Tip, {
          children: (0, import_jsx_runtime.jsxs)(_components.p, {
            children: ["When you send a request with ", (0, import_jsx_runtime.jsx)(_components.code, {
              children: "tools"
            }), " or ", (0, import_jsx_runtime.jsx)(_components.code, {
              children: "tool_choice"
            }), ", OpenRouter will only\nroute to providers that support tool use. Similarly, if you set a\n", (0, import_jsx_runtime.jsx)(_components.code, {
              children: "max_tokens"
            }), ", then OpenRouter will only route to providers that support a\nresponse of that length."]
          })
        })
      }), "\n", (0, import_jsx_runtime.jsx)(_components.p, {
        children: "Here is OpenRouter\u2019s default load balancing strategy:"
      }), "\n", (0, import_jsx_runtime.jsxs)(_components.ol, {
        children: ["\n", (0, import_jsx_runtime.jsx)(_components.li, {
          children: "Prioritize providers that have not seen significant outages in the last 30 seconds."
        }), "\n", (0, import_jsx_runtime.jsx)(_components.li, {
          children: "For the stable providers, look at the lowest-cost candidates and select one weighted by inverse square of the price (example below)."
        }), "\n", (0, import_jsx_runtime.jsx)(_components.li, {
          children: "Use the remaining providers as fallbacks."
        }), "\n"]
      }), "\n", (0, import_jsx_runtime.jsx)(ErrorBoundary, {
        children: (0, import_jsx_runtime.jsxs)(Note, {
          title: "A Load Balancing Example",
          children: [(0, import_jsx_runtime.jsx)(_components.p, {
            children: "If Provider A costs $1 per million tokens, Provider B costs $2, and Provider C costs $3, and Provider B recently saw a few outages."
          }), (0, import_jsx_runtime.jsxs)(_components.ul, {
            children: ["\n", (0, import_jsx_runtime.jsxs)(_components.li, {
              children: ["Your request is routed to Provider A. Provider A is 9x more likely to be first routed to Provider A than Provider C because ", (0, import_jsx_runtime.jsxs)(_components.span, {
                className: "katex",
                children: [(0, import_jsx_runtime.jsx)(_components.span, {
                  className: "katex-mathml",
                  children: (0, import_jsx_runtime.jsx)(_components.math, {
                    xmlns: "http://www.w3.org/1998/Math/MathML",
                    children: (0, import_jsx_runtime.jsxs)(_components.semantics, {
                      children: [(0, import_jsx_runtime.jsxs)(_components.mrow, {
                        children: [(0, import_jsx_runtime.jsx)(_components.mo, {
                          stretchy: "false",
                          children: "("
                        }), (0, import_jsx_runtime.jsx)(_components.mn, {
                          children: "1"
                        }), (0, import_jsx_runtime.jsx)(_components.mi, {
                          mathvariant: "normal",
                          children: "/"
                        }), (0, import_jsx_runtime.jsxs)(_components.msup, {
                          children: [(0, import_jsx_runtime.jsx)(_components.mn, {
                            children: "3"
                          }), (0, import_jsx_runtime.jsx)(_components.mn, {
                            children: "2"
                          })]
                        }), (0, import_jsx_runtime.jsx)(_components.mo, {
                          children: "="
                        }), (0, import_jsx_runtime.jsx)(_components.mn, {
                          children: "1"
                        }), (0, import_jsx_runtime.jsx)(_components.mi, {
                          mathvariant: "normal",
                          children: "/"
                        }), (0, import_jsx_runtime.jsx)(_components.mn, {
                          children: "9"
                        }), (0, import_jsx_runtime.jsx)(_components.mo, {
                          stretchy: "false",
                          children: ")"
                        })]
                      }), (0, import_jsx_runtime.jsx)(_components.annotation, {
                        encoding: "application/x-tex",
                        children: "(1 / 3^2 = 1/9)"
                      })]
                    })
                  })
                }), (0, import_jsx_runtime.jsxs)(_components.span, {
                  className: "katex-html",
                  "aria-hidden": "true",
                  children: [(0, import_jsx_runtime.jsxs)(_components.span, {
                    className: "base",
                    children: [(0, import_jsx_runtime.jsx)(_components.span, {
                      className: "strut",
                      style: {
                        height: "1.0641em",
                        verticalAlign: "-0.25em"
                      }
                    }), (0, import_jsx_runtime.jsx)(_components.span, {
                      className: "mopen",
                      children: "("
                    }), (0, import_jsx_runtime.jsx)(_components.span, {
                      className: "mord",
                      children: "1/"
                    }), (0, import_jsx_runtime.jsxs)(_components.span, {
                      className: "mord",
                      children: [(0, import_jsx_runtime.jsx)(_components.span, {
                        className: "mord",
                        children: "3"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        className: "msupsub",
                        children: (0, import_jsx_runtime.jsx)(_components.span, {
                          className: "vlist-t",
                          children: (0, import_jsx_runtime.jsx)(_components.span, {
                            className: "vlist-r",
                            children: (0, import_jsx_runtime.jsx)(_components.span, {
                              className: "vlist",
                              style: {
                                height: "0.8141em"
                              },
                              children: (0, import_jsx_runtime.jsxs)(_components.span, {
                                style: {
                                  top: "-3.063em",
                                  marginRight: "0.05em"
                                },
                                children: [(0, import_jsx_runtime.jsx)(_components.span, {
                                  className: "pstrut",
                                  style: {
                                    height: "2.7em"
                                  }
                                }), (0, import_jsx_runtime.jsx)(_components.span, {
                                  className: "sizing reset-size6 size3 mtight",
                                  children: (0, import_jsx_runtime.jsx)(_components.span, {
                                    className: "mord mtight",
                                    children: "2"
                                  })
                                })]
                              })
                            })
                          })
                        })
                      })]
                    }), (0, import_jsx_runtime.jsx)(_components.span, {
                      className: "mspace",
                      style: {
                        marginRight: "0.2778em"
                      }
                    }), (0, import_jsx_runtime.jsx)(_components.span, {
                      className: "mrel",
                      children: "="
                    }), (0, import_jsx_runtime.jsx)(_components.span, {
                      className: "mspace",
                      style: {
                        marginRight: "0.2778em"
                      }
                    })]
                  }), (0, import_jsx_runtime.jsxs)(_components.span, {
                    className: "base",
                    children: [(0, import_jsx_runtime.jsx)(_components.span, {
                      className: "strut",
                      style: {
                        height: "1em",
                        verticalAlign: "-0.25em"
                      }
                    }), (0, import_jsx_runtime.jsx)(_components.span, {
                      className: "mord",
                      children: "1/9"
                    }), (0, import_jsx_runtime.jsx)(_components.span, {
                      className: "mclose",
                      children: ")"
                    })]
                  })]
                })]
              }), " (inverse square of the price)."]
            }), "\n", (0, import_jsx_runtime.jsx)(_components.li, {
              children: "If Provider A fails, then Provider C will be tried next."
            }), "\n", (0, import_jsx_runtime.jsx)(_components.li, {
              children: "If Provider C also fails, Provider B will be tried last."
            }), "\n"]
          })]
        })
      }), "\n", (0, import_jsx_runtime.jsxs)(_components.p, {
        children: ["If you have ", (0, import_jsx_runtime.jsx)(_components.code, {
          children: "sort"
        }), " or ", (0, import_jsx_runtime.jsx)(_components.code, {
          children: "order"
        }), " set in your provider preferences, load balancing will be disabled."]
      }), "\n", (0, import_jsx_runtime.jsx)(_components.h2, {
        id: "provider-sorting",
        children: "Provider Sorting"
      }), "\n", (0, import_jsx_runtime.jsx)(_components.p, {
        children: "As described above, OpenRouter load balances based on price, while taking uptime into account."
      }), "\n", (0, import_jsx_runtime.jsxs)(_components.p, {
        children: ["If you instead want to ", (0, import_jsx_runtime.jsx)(_components.em, {
          children: "explicitly"
        }), " prioritize a particular provider attribute, you can include the ", (0, import_jsx_runtime.jsx)(_components.code, {
          children: "sort"
        }), " field in the ", (0, import_jsx_runtime.jsx)(_components.code, {
          children: "provider"
        }), " preferences. Load balancing will be disabled, and the router will try providers in order."]
      }), "\n", (0, import_jsx_runtime.jsx)(_components.p, {
        children: "The three sort options are:"
      }), "\n", (0, import_jsx_runtime.jsxs)(_components.ul, {
        children: ["\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: '"price"'
          }), ": prioritize lowest price"]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: '"throughput"'
          }), ": prioritize highest throughput"]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: '"latency"'
          }), ": prioritize lowest latency"]
        }), "\n"]
      }), "\n", (0, import_jsx_runtime.jsx)(ErrorBoundary, {
        children: (0, import_jsx_runtime.jsx)(import_TSFetchCodeBlock.TSFetchCodeBlock, {
          title: "Example with Fallbacks Enabled",
          uriPath: "/api/v1/chat/completions",
          body: {
            model: "meta-llama/llama-3.1-70b-instruct",
            messages: [{
              role: "user",
              content: "Hello"
            }],
            provider: {
              sort: "throughput"
            }
          }
        })
      }), "\n", (0, import_jsx_runtime.jsxs)(_components.p, {
        children: ["To ", (0, import_jsx_runtime.jsx)(_components.em, {
          children: "always"
        }), " prioritize low prices, and not apply any load balancing, set ", (0, import_jsx_runtime.jsx)(_components.code, {
          children: "sort"
        }), " to ", (0, import_jsx_runtime.jsx)(_components.code, {
          children: '"price"'
        }), "."]
      }), "\n", (0, import_jsx_runtime.jsxs)(_components.p, {
        children: ["To ", (0, import_jsx_runtime.jsx)(_components.em, {
          children: "always"
        }), " prioritize low latency, and not apply any load balancing, set ", (0, import_jsx_runtime.jsx)(_components.code, {
          children: "sort"
        }), " to ", (0, import_jsx_runtime.jsx)(_components.code, {
          children: '"latency"'
        }), "."]
      }), "\n", (0, import_jsx_runtime.jsx)(_components.h2, {
        id: "nitro-shortcut",
        children: "Nitro Shortcut"
      }), "\n", (0, import_jsx_runtime.jsxs)(_components.p, {
        children: ["You can append ", (0, import_jsx_runtime.jsx)(_components.code, {
          children: ":nitro"
        }), " to any model slug as a shortcut to sort by throughput. This is exactly equivalent to setting ", (0, import_jsx_runtime.jsx)(_components.code, {
          children: "provider.sort"
        }), " to ", (0, import_jsx_runtime.jsx)(_components.code, {
          children: '"throughput"'
        }), "."]
      }), "\n", (0, import_jsx_runtime.jsx)(ErrorBoundary, {
        children: (0, import_jsx_runtime.jsx)(import_TSFetchCodeBlock.TSFetchCodeBlock, {
          title: "Example using Nitro shortcut",
          uriPath: "/api/v1/chat/completions",
          body: {
            model: "meta-llama/llama-3.1-70b-instruct:nitro",
            messages: [{
              role: "user",
              content: "Hello"
            }]
          }
        })
      }), "\n", (0, import_jsx_runtime.jsx)(_components.h2, {
        id: "floor-price-shortcut",
        children: "Floor Price Shortcut"
      }), "\n", (0, import_jsx_runtime.jsxs)(_components.p, {
        children: ["You can append ", (0, import_jsx_runtime.jsx)(_components.code, {
          children: ":floor"
        }), " to any model slug as a shortcut to sort by price. This is exactly equivalent to setting ", (0, import_jsx_runtime.jsx)(_components.code, {
          children: "provider.sort"
        }), " to ", (0, import_jsx_runtime.jsx)(_components.code, {
          children: '"price"'
        }), "."]
      }), "\n", (0, import_jsx_runtime.jsx)(ErrorBoundary, {
        children: (0, import_jsx_runtime.jsx)(import_TSFetchCodeBlock.TSFetchCodeBlock, {
          title: "Example using Floor shortcut",
          uriPath: "/api/v1/chat/completions",
          body: {
            model: "meta-llama/llama-3.1-70b-instruct:floor",
            messages: [{
              role: "user",
              content: "Hello"
            }]
          }
        })
      }), "\n", (0, import_jsx_runtime.jsx)(_components.h2, {
        id: "ordering-specific-providers",
        children: "Ordering Specific Providers"
      }), "\n", (0, import_jsx_runtime.jsxs)(_components.p, {
        children: ["You can set the providers that OpenRouter will prioritize for your request using the ", (0, import_jsx_runtime.jsx)(_components.code, {
          children: "order"
        }), " field."]
      }), "\n", (0, import_jsx_runtime.jsxs)(_components.table, {
        children: [(0, import_jsx_runtime.jsx)(_components.thead, {
          children: (0, import_jsx_runtime.jsxs)(_components.tr, {
            children: [(0, import_jsx_runtime.jsx)(_components.th, {
              children: "Field"
            }), (0, import_jsx_runtime.jsx)(_components.th, {
              children: "Type"
            }), (0, import_jsx_runtime.jsx)(_components.th, {
              children: "Default"
            }), (0, import_jsx_runtime.jsx)(_components.th, {
              children: "Description"
            })]
          })
        }), (0, import_jsx_runtime.jsx)(_components.tbody, {
          children: (0, import_jsx_runtime.jsxs)(_components.tr, {
            children: [(0, import_jsx_runtime.jsx)(_components.td, {
              children: (0, import_jsx_runtime.jsx)(_components.code, {
                children: "order"
              })
            }), (0, import_jsx_runtime.jsx)(_components.td, {
              children: "string[]"
            }), (0, import_jsx_runtime.jsx)(_components.td, {
              children: "-"
            }), (0, import_jsx_runtime.jsxs)(_components.td, {
              children: ["List of provider names to try in order (e.g. ", (0, import_jsx_runtime.jsx)(_components.code, {
                children: '["Anthropic", "OpenAI"]'
              }), ")."]
            })]
          })
        })]
      }), "\n", (0, import_jsx_runtime.jsxs)(_components.p, {
        children: ["The router will prioritize providers in this list, and in this order, for the model you\u2019re using. If you don\u2019t set this field, the router will ", (0, import_jsx_runtime.jsx)(_components.a, {
          href: "#load-balancing-default-strategy",
          children: "load balance"
        }), " across the top providers to maximize uptime."]
      }), "\n", (0, import_jsx_runtime.jsxs)(_components.p, {
        children: ["OpenRouter will try them one at a time and proceed to other providers if none are operational. If you don\u2019t want to allow any other providers, you should ", (0, import_jsx_runtime.jsx)(_components.a, {
          href: "#disabling-fallbacks",
          children: "disable fallbacks"
        }), " as well."]
      }), "\n", (0, import_jsx_runtime.jsx)(_components.h3, {
        id: "example-specifying-providers-with-fallbacks",
        children: "Example: Specifying providers with fallbacks"
      }), "\n", (0, import_jsx_runtime.jsx)(_components.p, {
        children: "This example skips over OpenAI (which doesn\u2019t host Mixtral), tries Together, and then falls back to the normal list of providers on OpenRouter:"
      }), "\n", (0, import_jsx_runtime.jsx)(ErrorBoundary, {
        children: (0, import_jsx_runtime.jsx)(import_TSFetchCodeBlock.TSFetchCodeBlock, {
          title: "Example with Fallbacks Enabled",
          uriPath: "/api/v1/chat/completions",
          body: {
            model: "mistralai/mixtral-8x7b-instruct",
            messages: [{
              role: "user",
              content: "Hello"
            }],
            provider: {
              order: ["OpenAI", "Together"]
            }
          }
        })
      }), "\n", (0, import_jsx_runtime.jsx)(_components.h3, {
        id: "example-specifying-providers-with-fallbacks-disabled",
        children: "Example: Specifying providers with fallbacks disabled"
      }), "\n", (0, import_jsx_runtime.jsxs)(_components.p, {
        children: ["Here\u2019s an example with ", (0, import_jsx_runtime.jsx)(_components.code, {
          children: "allow_fallbacks"
        }), " set to ", (0, import_jsx_runtime.jsx)(_components.code, {
          children: "false"
        }), " that skips over OpenAI (which doesn\u2019t host Mixtral), tries Together, and then fails if Together fails:"]
      }), "\n", (0, import_jsx_runtime.jsx)(ErrorBoundary, {
        children: (0, import_jsx_runtime.jsx)(import_TSFetchCodeBlock.TSFetchCodeBlock, {
          title: "Example with Fallbacks Disabled",
          uriPath: "/api/v1/chat/completions",
          body: {
            model: "mistralai/mixtral-8x7b-instruct",
            messages: [{
              role: "user",
              content: "Hello"
            }],
            provider: {
              order: ["OpenAI", "Together"],
              allow_fallbacks: false
            }
          }
        })
      }), "\n", (0, import_jsx_runtime.jsx)(_components.h2, {
        id: "requiring-providers-to-support-all-parameters-beta",
        children: "Requiring Providers to Support All Parameters (beta)"
      }), "\n", (0, import_jsx_runtime.jsxs)(_components.p, {
        children: ["You can restrict requests only to providers that support all parameters in your request using the ", (0, import_jsx_runtime.jsx)(_components.code, {
          children: "require_parameters"
        }), " field."]
      }), "\n", (0, import_jsx_runtime.jsxs)(_components.table, {
        children: [(0, import_jsx_runtime.jsx)(_components.thead, {
          children: (0, import_jsx_runtime.jsxs)(_components.tr, {
            children: [(0, import_jsx_runtime.jsx)(_components.th, {
              children: "Field"
            }), (0, import_jsx_runtime.jsx)(_components.th, {
              children: "Type"
            }), (0, import_jsx_runtime.jsx)(_components.th, {
              children: "Default"
            }), (0, import_jsx_runtime.jsx)(_components.th, {
              children: "Description"
            })]
          })
        }), (0, import_jsx_runtime.jsx)(_components.tbody, {
          children: (0, import_jsx_runtime.jsxs)(_components.tr, {
            children: [(0, import_jsx_runtime.jsx)(_components.td, {
              children: (0, import_jsx_runtime.jsx)(_components.code, {
                children: "require_parameters"
              })
            }), (0, import_jsx_runtime.jsx)(_components.td, {
              children: "boolean"
            }), (0, import_jsx_runtime.jsx)(_components.td, {
              children: (0, import_jsx_runtime.jsx)(_components.code, {
                children: "false"
              })
            }), (0, import_jsx_runtime.jsx)(_components.td, {
              children: "Only use providers that support all parameters in your request."
            })]
          })
        })]
      }), "\n", (0, import_jsx_runtime.jsxs)(_components.p, {
        children: ["With the default routing strategy, providers that don\u2019t support all the ", (0, import_jsx_runtime.jsx)(_components.a, {
          href: "/docs/api-reference/parameters",
          children: "LLM parameters"
        }), " specified in your request can still receive the request, but will ignore unknown parameters. When you set ", (0, import_jsx_runtime.jsx)(_components.code, {
          children: "require_parameters"
        }), " to ", (0, import_jsx_runtime.jsx)(_components.code, {
          children: "true"
        }), ", the request won\u2019t even be routed to that provider."]
      }), "\n", (0, import_jsx_runtime.jsx)(_components.h3, {
        id: "example-excluding-providers-that-dont-support-json-formatting",
        children: "Example: Excluding providers that don\u2019t support JSON formatting"
      }), "\n", (0, import_jsx_runtime.jsx)(_components.p, {
        children: "For example, to only use providers that support JSON formatting:"
      }), "\n", (0, import_jsx_runtime.jsx)(ErrorBoundary, {
        children: (0, import_jsx_runtime.jsx)(import_TSFetchCodeBlock.TSFetchCodeBlock, {
          uriPath: "/api/v1/chat/completions",
          body: {
            messages: [{
              role: "user",
              content: "Hello"
            }],
            provider: {
              require_parameters: true
            },
            response_format: {
              type: "json_object"
            }
          }
        })
      }), "\n", (0, import_jsx_runtime.jsx)(_components.h2, {
        id: "requiring-providers-to-comply-with-data-policies",
        children: "Requiring Providers to Comply with Data Policies"
      }), "\n", (0, import_jsx_runtime.jsxs)(_components.p, {
        children: ["You can restrict requests only to providers that comply with your data policies using the ", (0, import_jsx_runtime.jsx)(_components.code, {
          children: "data_collection"
        }), " field."]
      }), "\n", (0, import_jsx_runtime.jsxs)(_components.table, {
        children: [(0, import_jsx_runtime.jsx)(_components.thead, {
          children: (0, import_jsx_runtime.jsxs)(_components.tr, {
            children: [(0, import_jsx_runtime.jsx)(_components.th, {
              children: "Field"
            }), (0, import_jsx_runtime.jsx)(_components.th, {
              children: "Type"
            }), (0, import_jsx_runtime.jsx)(_components.th, {
              children: "Default"
            }), (0, import_jsx_runtime.jsx)(_components.th, {
              children: "Description"
            })]
          })
        }), (0, import_jsx_runtime.jsx)(_components.tbody, {
          children: (0, import_jsx_runtime.jsxs)(_components.tr, {
            children: [(0, import_jsx_runtime.jsx)(_components.td, {
              children: (0, import_jsx_runtime.jsx)(_components.code, {
                children: "data_collection"
              })
            }), (0, import_jsx_runtime.jsx)(_components.td, {
              children: '\u201Dallow\u201D | \u201Cdeny"'
            }), (0, import_jsx_runtime.jsx)(_components.td, {
              children: '"allow\u201D'
            }), (0, import_jsx_runtime.jsx)(_components.td, {
              children: "Control whether to use providers that may store data."
            })]
          })
        })]
      }), "\n", (0, import_jsx_runtime.jsxs)(_components.ul, {
        children: ["\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "allow"
          }), ": (default) allow providers which store user data non-transiently and may train on it"]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "deny"
          }), ": use only providers which do not collect user data"]
        }), "\n"]
      }), "\n", (0, import_jsx_runtime.jsxs)(_components.p, {
        children: ["Some model providers may log prompts, so we display them with a ", (0, import_jsx_runtime.jsx)(_components.strong, {
          children: "Data Policy"
        }), " tag on model pages. This is not a definitive source of third party data policies, but represents our best knowledge."]
      }), "\n", (0, import_jsx_runtime.jsx)(ErrorBoundary, {
        children: (0, import_jsx_runtime.jsx)(Tip, {
          title: "Account-Wide Data Policy Filtering",
          children: (0, import_jsx_runtime.jsxs)(_components.p, {
            children: ["This is also available as an account-wide setting in ", (0, import_jsx_runtime.jsx)(_components.a, {
              href: "https://openrouter.ai/settings/privacy",
              children: "your privacy\nsettings"
            }), ". You can disable third party\nmodel providers that store inputs for training."]
          })
        })
      }), "\n", (0, import_jsx_runtime.jsx)(_components.h3, {
        id: "example-excluding-providers-that-dont-comply-with-data-policies",
        children: "Example: Excluding providers that don\u2019t comply with data policies"
      }), "\n", (0, import_jsx_runtime.jsxs)(_components.p, {
        children: ["To exclude providers that don\u2019t comply with your data policies, set ", (0, import_jsx_runtime.jsx)(_components.code, {
          children: "data_collection"
        }), " to ", (0, import_jsx_runtime.jsx)(_components.code, {
          children: "deny"
        }), ":"]
      }), "\n", (0, import_jsx_runtime.jsx)(ErrorBoundary, {
        children: (0, import_jsx_runtime.jsx)(import_TSFetchCodeBlock.TSFetchCodeBlock, {
          uriPath: "/api/v1/chat/completions",
          body: {
            messages: [{
              role: "user",
              content: "Hello"
            }],
            provider: {
              // or "allow"
              data_collection: "deny"
            }
          }
        })
      }), "\n", (0, import_jsx_runtime.jsx)(_components.h2, {
        id: "disabling-fallbacks",
        children: "Disabling Fallbacks"
      }), "\n", (0, import_jsx_runtime.jsx)(_components.p, {
        children: "To guarantee that your request is only served by the top (lowest-cost) provider, you can disable fallbacks."
      }), "\n", (0, import_jsx_runtime.jsxs)(_components.p, {
        children: ["This is combined with the ", (0, import_jsx_runtime.jsx)(_components.code, {
          children: "order"
        }), " field from ", (0, import_jsx_runtime.jsx)(_components.a, {
          href: "#ordering-specific-providers",
          children: "Ordering Specific Providers"
        }), " to restrict the providers that OpenRouter will prioritize to just your chosen list."]
      }), "\n", (0, import_jsx_runtime.jsx)(ErrorBoundary, {
        children: (0, import_jsx_runtime.jsx)(import_TSFetchCodeBlock.TSFetchCodeBlock, {
          uriPath: "/api/v1/chat/completions",
          body: {
            messages: [{
              role: "user",
              content: "Hello"
            }],
            provider: {
              allow_fallbacks: false
            }
          }
        })
      }), "\n", (0, import_jsx_runtime.jsx)(_components.h2, {
        id: "ignoring-providers",
        children: "Ignoring Providers"
      }), "\n", (0, import_jsx_runtime.jsxs)(_components.p, {
        children: ["You can ignore providers for a request by setting the ", (0, import_jsx_runtime.jsx)(_components.code, {
          children: "ignore"
        }), " field in the ", (0, import_jsx_runtime.jsx)(_components.code, {
          children: "provider"
        }), " object."]
      }), "\n", (0, import_jsx_runtime.jsxs)(_components.table, {
        children: [(0, import_jsx_runtime.jsx)(_components.thead, {
          children: (0, import_jsx_runtime.jsxs)(_components.tr, {
            children: [(0, import_jsx_runtime.jsx)(_components.th, {
              children: "Field"
            }), (0, import_jsx_runtime.jsx)(_components.th, {
              children: "Type"
            }), (0, import_jsx_runtime.jsx)(_components.th, {
              children: "Default"
            }), (0, import_jsx_runtime.jsx)(_components.th, {
              children: "Description"
            })]
          })
        }), (0, import_jsx_runtime.jsx)(_components.tbody, {
          children: (0, import_jsx_runtime.jsxs)(_components.tr, {
            children: [(0, import_jsx_runtime.jsx)(_components.td, {
              children: (0, import_jsx_runtime.jsx)(_components.code, {
                children: "ignore"
              })
            }), (0, import_jsx_runtime.jsx)(_components.td, {
              children: "string[]"
            }), (0, import_jsx_runtime.jsx)(_components.td, {
              children: "-"
            }), (0, import_jsx_runtime.jsx)(_components.td, {
              children: "List of provider names to skip for this request."
            })]
          })
        })]
      }), "\n", (0, import_jsx_runtime.jsx)(ErrorBoundary, {
        children: (0, import_jsx_runtime.jsx)(Warning, {
          children: (0, import_jsx_runtime.jsx)(_components.p, {
            children: "Ignoring multiple providers may significantly reduce fallback options and\nlimit request recovery."
          })
        })
      }), "\n", (0, import_jsx_runtime.jsx)(ErrorBoundary, {
        children: (0, import_jsx_runtime.jsxs)(Tip, {
          title: "Account-Wide Ignored Providers",
          children: [(0, import_jsx_runtime.jsxs)(_components.p, {
            children: ["You can ignore providers for all account requests by configuring your ", (0, import_jsx_runtime.jsx)(_components.a, {
              href: "/settings/preferences",
              children: "preferences"
            }), ". This configuration applies to all API requests and chatroom messages."]
          }), (0, import_jsx_runtime.jsx)(_components.p, {
            children: "Note that when you ignore providers for a specific request, the list of ignored providers is merged with your account-wide ignored providers."
          })]
        })
      }), "\n", (0, import_jsx_runtime.jsx)(_components.h3, {
        id: "example-ignoring-azure-for-a-request-calling-gpt-4-omni",
        children: "Example: Ignoring Azure for a request calling GPT-4 Omni"
      }), "\n", (0, import_jsx_runtime.jsx)(_components.p, {
        children: "Here\u2019s an example that will ignore Azure for a request calling GPT-4 Omni:"
      }), "\n", (0, import_jsx_runtime.jsx)(ErrorBoundary, {
        children: (0, import_jsx_runtime.jsx)(import_TSFetchCodeBlock.TSFetchCodeBlock, {
          uriPath: "/api/v1/chat/completions",
          body: {
            model: "openai/gpt-4o",
            messages: [{
              role: "user",
              content: "Hello"
            }],
            provider: {
              ignore: ["Azure"]
            }
          }
        })
      }), "\n", (0, import_jsx_runtime.jsx)(_components.h2, {
        id: "quantization",
        children: "Quantization"
      }), "\n", (0, import_jsx_runtime.jsx)(_components.p, {
        children: "Quantization reduces model size and computational requirements while aiming to preserve performance. Most LLMs today use FP16 or BF16 for training and inference, cutting memory requirements in half compared to FP32. Some optimizations use FP8 or quantization to reduce size further (e.g., INT8, INT4)."
      }), "\n", (0, import_jsx_runtime.jsxs)(_components.table, {
        children: [(0, import_jsx_runtime.jsx)(_components.thead, {
          children: (0, import_jsx_runtime.jsxs)(_components.tr, {
            children: [(0, import_jsx_runtime.jsx)(_components.th, {
              children: "Field"
            }), (0, import_jsx_runtime.jsx)(_components.th, {
              children: "Type"
            }), (0, import_jsx_runtime.jsx)(_components.th, {
              children: "Default"
            }), (0, import_jsx_runtime.jsx)(_components.th, {
              children: "Description"
            })]
          })
        }), (0, import_jsx_runtime.jsx)(_components.tbody, {
          children: (0, import_jsx_runtime.jsxs)(_components.tr, {
            children: [(0, import_jsx_runtime.jsx)(_components.td, {
              children: (0, import_jsx_runtime.jsx)(_components.code, {
                children: "quantizations"
              })
            }), (0, import_jsx_runtime.jsx)(_components.td, {
              children: "string[]"
            }), (0, import_jsx_runtime.jsx)(_components.td, {
              children: "-"
            }), (0, import_jsx_runtime.jsxs)(_components.td, {
              children: ["List of quantization levels to filter by (e.g. ", (0, import_jsx_runtime.jsx)(_components.code, {
                children: '["int4", "int8"]'
              }), "). ", (0, import_jsx_runtime.jsx)(_components.a, {
                href: "#quantization",
                children: "Learn more"
              })]
            })]
          })
        })]
      }), "\n", (0, import_jsx_runtime.jsx)(ErrorBoundary, {
        children: (0, import_jsx_runtime.jsx)(Warning, {
          children: (0, import_jsx_runtime.jsx)(_components.p, {
            children: "Quantized models may exhibit degraded performance for certain prompts,\ndepending on the method used."
          })
        })
      }), "\n", (0, import_jsx_runtime.jsx)(_components.p, {
        children: "Providers can support various quantization levels for open-weight models."
      }), "\n", (0, import_jsx_runtime.jsx)(_components.h3, {
        id: "quantization-levels",
        children: "Quantization Levels"
      }), "\n", (0, import_jsx_runtime.jsxs)(_components.p, {
        children: ["By default, requests are load-balanced across all available providers, ordered by price. To filter providers by quantization level, specify the ", (0, import_jsx_runtime.jsx)(_components.code, {
          children: "quantizations"
        }), " field in the ", (0, import_jsx_runtime.jsx)(_components.code, {
          children: "provider"
        }), " parameter with the following values:"]
      }), "\n", (0, import_jsx_runtime.jsxs)(_components.ul, {
        children: ["\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "int4"
          }), ": Integer (4 bit)"]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "int8"
          }), ": Integer (8 bit)"]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "fp4"
          }), ": Floating point (4 bit)"]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "fp6"
          }), ": Floating point (6 bit)"]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "fp8"
          }), ": Floating point (8 bit)"]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "fp16"
          }), ": Floating point (16 bit)"]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "bf16"
          }), ": Brain floating point (16 bit)"]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "fp32"
          }), ": Floating point (32 bit)"]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "unknown"
          }), ": Unknown"]
        }), "\n"]
      }), "\n", (0, import_jsx_runtime.jsx)(_components.h3, {
        id: "example-requesting-fp8-quantization",
        children: "Example: Requesting FP8 Quantization"
      }), "\n", (0, import_jsx_runtime.jsx)(_components.p, {
        children: "Here\u2019s an example that will only use providers that support FP8 quantization:"
      }), "\n", (0, import_jsx_runtime.jsx)(ErrorBoundary, {
        children: (0, import_jsx_runtime.jsx)(import_TSFetchCodeBlock.TSFetchCodeBlock, {
          uriPath: "/api/v1/chat/completions",
          body: {
            model: "meta-llama/llama-3.1-8b-instruct",
            messages: [{
              role: "user",
              content: "Hello"
            }],
            provider: {
              quantizations: ["fp8"]
            }
          }
        })
      }), "\n", (0, import_jsx_runtime.jsx)(_components.h2, {
        id: "terms-of-service",
        children: "Terms of Service"
      }), "\n", (0, import_jsx_runtime.jsx)(_components.p, {
        children: "You can view the terms of service for each provider below. You may not violate the terms of service or policies of third-party providers that power the models on OpenRouter."
      }), "\n", (0, import_jsx_runtime.jsxs)(_components.ul, {
        children: ["\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "OpenAI"
          }), ": ", (0, import_jsx_runtime.jsx)(_components.a, {
            href: "https://openai.com/policies/row-terms-of-use/",
            children: "https://openai.com/policies/row-terms-of-use/"
          })]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "Anthropic"
          }), ": ", (0, import_jsx_runtime.jsx)(_components.a, {
            href: "https://www.anthropic.com/legal/commercial-terms",
            children: "https://www.anthropic.com/legal/commercial-terms"
          })]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "Google Vertex"
          }), ": ", (0, import_jsx_runtime.jsx)(_components.a, {
            href: "https://cloud.google.com/terms/",
            children: "https://cloud.google.com/terms/"
          })]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "Google AI Studio"
          }), ": ", (0, import_jsx_runtime.jsx)(_components.a, {
            href: "https://cloud.google.com/terms/",
            children: "https://cloud.google.com/terms/"
          })]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "Amazon Bedrock"
          }), ": ", (0, import_jsx_runtime.jsx)(_components.a, {
            href: "https://aws.amazon.com/service-terms/",
            children: "https://aws.amazon.com/service-terms/"
          })]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "Groq"
          }), ": ", (0, import_jsx_runtime.jsx)(_components.a, {
            href: "https://groq.com/terms-of-use/",
            children: "https://groq.com/terms-of-use/"
          })]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "SambaNova"
          }), ": ", (0, import_jsx_runtime.jsx)(_components.a, {
            href: "https://sambanova.ai/terms-and-conditions",
            children: "https://sambanova.ai/terms-and-conditions"
          })]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "Cohere"
          }), ": ", (0, import_jsx_runtime.jsx)(_components.a, {
            href: "https://cohere.com/terms-of-use",
            children: "https://cohere.com/terms-of-use"
          })]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "Mistral"
          }), ": ", (0, import_jsx_runtime.jsx)(_components.a, {
            href: "https://mistral.ai/terms/#terms-of-use",
            children: "https://mistral.ai/terms/#terms-of-use"
          })]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "Together"
          }), ": ", (0, import_jsx_runtime.jsx)(_components.a, {
            href: "https://www.together.ai/terms-of-service",
            children: "https://www.together.ai/terms-of-service"
          })]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "Together (lite)"
          }), ": ", (0, import_jsx_runtime.jsx)(_components.a, {
            href: "https://www.together.ai/terms-of-service",
            children: "https://www.together.ai/terms-of-service"
          })]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "Fireworks"
          }), ": ", (0, import_jsx_runtime.jsx)(_components.a, {
            href: "https://fireworks.ai/terms-of-service",
            children: "https://fireworks.ai/terms-of-service"
          })]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "DeepInfra"
          }), ": ", (0, import_jsx_runtime.jsx)(_components.a, {
            href: "https://deepinfra.com/docs/data",
            children: "https://deepinfra.com/docs/data"
          })]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "Lepton"
          }), ": ", (0, import_jsx_runtime.jsx)(_components.a, {
            href: "https://www.lepton.ai/policies/tos",
            children: "https://www.lepton.ai/policies/tos"
          })]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "NovitaAI"
          }), ": ", (0, import_jsx_runtime.jsx)(_components.a, {
            href: "https://novita.ai/legal/terms-of-service",
            children: "https://novita.ai/legal/terms-of-service"
          })]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "Avian.io"
          }), ": ", (0, import_jsx_runtime.jsx)(_components.a, {
            href: "https://avian.io/privacy",
            children: "https://avian.io/privacy"
          })]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "Lambda"
          }), ": ", (0, import_jsx_runtime.jsx)(_components.a, {
            href: "https://lambdalabs.com/legal/privacy-policy",
            children: "https://lambdalabs.com/legal/privacy-policy"
          })]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "Azure"
          }), ": ", (0, import_jsx_runtime.jsx)(_components.a, {
            href: "https://www.microsoft.com/en-us/legal/terms-of-use?oneroute=true",
            children: "https://www.microsoft.com/en-us/legal/terms-of-use?oneroute=true"
          })]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "Modal"
          }), ": ", (0, import_jsx_runtime.jsx)(_components.a, {
            href: "https://modal.com/legal/terms",
            children: "https://modal.com/legal/terms"
          })]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "AnyScale"
          }), ": ", (0, import_jsx_runtime.jsx)(_components.a, {
            href: "https://www.anyscale.com/terms",
            children: "https://www.anyscale.com/terms"
          })]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "Replicate"
          }), ": ", (0, import_jsx_runtime.jsx)(_components.a, {
            href: "https://replicate.com/terms",
            children: "https://replicate.com/terms"
          })]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "Perplexity"
          }), ": ", (0, import_jsx_runtime.jsx)(_components.a, {
            href: "https://www.perplexity.ai/hub/legal/perplexity-api-terms-of-service",
            children: "https://www.perplexity.ai/hub/legal/perplexity-api-terms-of-service"
          })]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "Recursal"
          }), ": ", (0, import_jsx_runtime.jsx)(_components.a, {
            href: "https://featherless.ai/terms",
            children: "https://featherless.ai/terms"
          })]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "OctoAI"
          }), ": ", (0, import_jsx_runtime.jsx)(_components.a, {
            href: "https://octo.ai/docs/faqs/privacy-and-security",
            children: "https://octo.ai/docs/faqs/privacy-and-security"
          })]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "DeepSeek"
          }), ": ", (0, import_jsx_runtime.jsx)(_components.a, {
            href: "https://chat.deepseek.com/downloads/DeepSeek%20Terms%20of%20Use.html",
            children: "https://chat.deepseek.com/downloads/DeepSeek%20Terms%20of%20Use.html"
          })]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "Infermatic"
          }), ": ", (0, import_jsx_runtime.jsx)(_components.a, {
            href: "https://infermatic.ai/privacy-policy/",
            children: "https://infermatic.ai/privacy-policy/"
          })]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "AI21"
          }), ": ", (0, import_jsx_runtime.jsx)(_components.a, {
            href: "https://studio.ai21.com/privacy-policy",
            children: "https://studio.ai21.com/privacy-policy"
          })]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "Featherless"
          }), ": ", (0, import_jsx_runtime.jsx)(_components.a, {
            href: "https://featherless.ai/terms",
            children: "https://featherless.ai/terms"
          })]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "Inflection"
          }), ": ", (0, import_jsx_runtime.jsx)(_components.a, {
            href: "https://developers.inflection.ai/tos",
            children: "https://developers.inflection.ai/tos"
          })]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "xAI"
          }), ": ", (0, import_jsx_runtime.jsx)(_components.a, {
            href: "https://x.ai/legal/terms-of-service",
            children: "https://x.ai/legal/terms-of-service"
          })]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "Cloudflare"
          }), ": ", (0, import_jsx_runtime.jsx)(_components.a, {
            href: "https://www.cloudflare.com/service-specific-terms-developer-platform/#developer-platform-terms",
            children: "https://www.cloudflare.com/service-specific-terms-developer-platform/#developer-platform-terms"
          })]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "SF Compute"
          }), ": ", (0, import_jsx_runtime.jsx)(_components.a, {
            href: "https://inference.sfcompute.com/privacy",
            children: "https://inference.sfcompute.com/privacy"
          })]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "Minimax"
          }), ": ", (0, import_jsx_runtime.jsx)(_components.a, {
            href: "https://intl.minimaxi.com/protocol/terms-of-service",
            children: "https://intl.minimaxi.com/protocol/terms-of-service"
          })]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "Nineteen"
          }), ": ", (0, import_jsx_runtime.jsx)(_components.a, {
            href: "https://nineteen.ai/tos",
            children: "https://nineteen.ai/tos"
          })]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "Liquid"
          }), ": ", (0, import_jsx_runtime.jsx)(_components.a, {
            href: "https://www.liquid.ai/terms-conditions",
            children: "https://www.liquid.ai/terms-conditions"
          })]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "inference.net"
          }), ": ", (0, import_jsx_runtime.jsx)(_components.a, {
            href: "https://inference.net/terms",
            children: "https://inference.net/terms"
          })]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "Friendli"
          }), ": ", (0, import_jsx_runtime.jsx)(_components.a, {
            href: "https://friendli.ai/terms-of-service",
            children: "https://friendli.ai/terms-of-service"
          })]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "AionLabs"
          }), ": ", (0, import_jsx_runtime.jsx)(_components.a, {
            href: "https://www.aionlabs.ai/terms/",
            children: "https://www.aionlabs.ai/terms/"
          })]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "Alibaba"
          }), ": ", (0, import_jsx_runtime.jsx)(_components.a, {
            href: "https://www.alibabacloud.com/help/en/legal/latest/alibaba-cloud-international-website-product-terms-of-service-v-3-8-0",
            children: "https://www.alibabacloud.com/help/en/legal/latest/alibaba-cloud-international-website-product-terms-of-service-v-3-8-0"
          })]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "Nebius AI Studio"
          }), ": ", (0, import_jsx_runtime.jsx)(_components.a, {
            href: "https://docs.nebius.com/legal/studio/terms-of-use/",
            children: "https://docs.nebius.com/legal/studio/terms-of-use/"
          })]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "Chutes"
          }), ": ", (0, import_jsx_runtime.jsx)(_components.a, {
            href: "https://chutes.ai/tos",
            children: "https://chutes.ai/tos"
          })]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "kluster.ai"
          }), ": ", (0, import_jsx_runtime.jsx)(_components.a, {
            href: "https://www.kluster.ai/terms-of-use",
            children: "https://www.kluster.ai/terms-of-use"
          })]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "Crusoe"
          }), ": ", (0, import_jsx_runtime.jsx)(_components.a, {
            href: "https://legal.crusoe.ai/open-router#managed-inference-tos-open-router",
            children: "https://legal.crusoe.ai/open-router#managed-inference-tos-open-router"
          })]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "Targon"
          }), ": ", (0, import_jsx_runtime.jsx)(_components.a, {
            href: "https://targon.com/terms",
            children: "https://targon.com/terms"
          })]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "Ubicloud"
          }), ": ", (0, import_jsx_runtime.jsx)(_components.a, {
            href: "https://www.ubicloud.com/docs/about/terms-of-service",
            children: "https://www.ubicloud.com/docs/about/terms-of-service"
          })]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "Parasail"
          }), ": ", (0, import_jsx_runtime.jsx)(_components.a, {
            href: "https://www.parasail.io/legal/terms",
            children: "https://www.parasail.io/legal/terms"
          })]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "01.AI"
          }), ": ", (0, import_jsx_runtime.jsx)(_components.a, {
            href: "https://platform.01.ai/privacypolicy",
            children: "https://platform.01.ai/privacypolicy"
          })]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "HuggingFace"
          }), ": ", (0, import_jsx_runtime.jsx)(_components.a, {
            href: "https://huggingface.co/terms-of-service",
            children: "https://huggingface.co/terms-of-service"
          })]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "Mancer"
          }), ": ", (0, import_jsx_runtime.jsx)(_components.a, {
            href: "https://mancer.tech/terms",
            children: "https://mancer.tech/terms"
          })]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "Mancer (private)"
          }), ": ", (0, import_jsx_runtime.jsx)(_components.a, {
            href: "https://mancer.tech/terms",
            children: "https://mancer.tech/terms"
          })]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "Hyperbolic"
          }), ": ", (0, import_jsx_runtime.jsx)(_components.a, {
            href: "https://hyperbolic.xyz/privacy",
            children: "https://hyperbolic.xyz/privacy"
          })]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "Hyperbolic (quantized)"
          }), ": ", (0, import_jsx_runtime.jsx)(_components.a, {
            href: "https://hyperbolic.xyz/privacy",
            children: "https://hyperbolic.xyz/privacy"
          })]
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: [(0, import_jsx_runtime.jsx)(_components.code, {
            children: "Lynn"
          }), ": ", (0, import_jsx_runtime.jsx)(_components.a, {
            href: "https://api.lynn.app/policy",
            children: "https://api.lynn.app/policy"
          })]
        }), "\n"]
      }), "\n", (0, import_jsx_runtime.jsx)(_components.h2, {
        id: "json-schema-for-provider-preferences",
        children: "JSON Schema for Provider Preferences"
      }), "\n", (0, import_jsx_runtime.jsx)(_components.p, {
        children: "For a complete list of options, see this JSON schema:"
      }), "\n", (0, import_jsx_runtime.jsx)(ErrorBoundary, {
        children: (0, import_jsx_runtime.jsx)(import_JsonSchemaBlock.JsonSchemaBlock, {
          schemaName: "ProviderPreferencesSchema",
          title: "Provider Preferences Schema"
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