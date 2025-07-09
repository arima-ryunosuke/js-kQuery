(() => {
  var __defProp = Object.defineProperty;
  var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // src/API.js
  var API_exports = {};
  __export(API_exports, {
    $CSSRuleList: () => $CSSRuleList,
    $FileList: () => $FileList,
    $NodeList: () => $NodeList,
    AsyncFunction: () => AsyncFunction,
    AsyncGeneratorFunction: () => AsyncGeneratorFunction,
    Collection: () => Collection,
    Configuration: () => Configuration,
    CookieObserver: () => CookieObserver,
    CustomEvent: () => CustomEvent,
    Dictionary: () => Dictionary,
    F: () => F,
    FileReader: () => FileReader,
    GeneratorFunction: () => GeneratorFunction,
    IntersectionObserver: () => IntersectionObserver,
    Logger: () => Logger,
    MutationObserver: () => MutationObserver,
    Nullable: () => Nullable,
    ObjectStorage: () => ObjectStorage,
    Options: () => Options,
    Promise: () => Promise2,
    Proxy: () => Proxy2,
    ResizeObserver: () => ResizeObserver,
    Timer: () => Timer,
    TimerObserver: () => TimerObserver,
    Vector2: () => Vector2,
    WeakMap: () => WeakMap
  });
  var GT = globalThis;
  var AsyncFunction = (async () => {
  }).constructor;
  var GeneratorFunction = function* () {
  }.constructor;
  var AsyncGeneratorFunction = async function* () {
  }.constructor;
  var Nullable = /* @__PURE__ */ __name(function Nullable2(v) {
    return v == null;
  }, "Nullable");
  var Dictionary = /* @__PURE__ */ __name(function Dictionary2(v) {
    if (typeof v !== "object") {
      return false;
    }
    if (!Object.hasOwn(v, "entries") && typeof v.entries === "function") {
      return true;
    }
    if (!Object.hasOwn(v, "keys") && typeof v.keys === "function") {
      return true;
    }
    if (!Object.hasOwn(v, "values") && typeof v.values === "function") {
      return true;
    }
    if (!Object.hasOwn(v, "length") && "length" in v) {
      return true;
    }
    if (Symbol.iterator in v) {
      return false;
    }
    return true;
  }, "Dictionary");
  var $NodeList = /* @__PURE__ */ __name(function() {
    return [NodeList.name, HTMLCollection.name];
  }, "$NodeList");
  var $CSSRuleList = /* @__PURE__ */ __name(function() {
    return [CSSRuleList.name];
  }, "$CSSRuleList");
  var $FileList = /* @__PURE__ */ __name(function() {
    return [FileList.name];
  }, "$FileList");
  var F = {
    anyIsPrimitive(value, ...specials) {
      if (value == null) {
        return true;
      }
      for (const special of specials) {
        if (special === Object) {
          if (F.objectIsPlain(value)) {
            return true;
          }
          continue;
        }
        if (value instanceof special) {
          return true;
        }
      }
      return !["object", "function"].includes(typeof value);
    },
    anyIsStringable(value) {
      if (F.anyIsPrimitive(value)) {
        return true;
      }
      return value?.toString && value.toString !== Object.prototype.toString;
    },
    stringToKebabCase(string) {
      return ("" + string).replaceAll(/([A-Z])/g, (...m) => "-" + m[1].toLowerCase());
    },
    stringToPascalCase(string, delimiter) {
      delimiter ??= "-";
      const regex = new RegExp(`(\\${delimiter}([a-z]))`, "ig");
      return ("" + string).replaceAll(regex, (...m) => m[2].toUpperCase());
    },
    stringEscape(string, mode) {
      const htmlTargets = {
        "&": "&amp;",
        '"': "&quot;",
        "'": "&#39;",
        "<": "&lt;",
        ">": "&gt;"
      };
      string += "";
      switch (mode) {
        default:
          throw new Error(`${mode} is undefied`);
        case "attr-name": {
          const div = document.createElement("div");
          div.setAttribute(string, "");
          return div.attributes[0].name;
        }
        case "attr-value": {
          return string.replace(/[&"]/g, (e) => htmlTargets[e]);
        }
        case "content": {
          return string.replace(/[&<>]/g, (e) => htmlTargets[e]);
        }
        case "html": {
          return string.replace(/[&"'<>]/g, (e) => htmlTargets[e]);
        }
        case "regex": {
          return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, "\\$&");
        }
        case "css":
        case "selector": {
          return CSS.escape(string);
        }
      }
    },
    stringQuote(string, mode) {
      string += "";
      switch (mode) {
        default:
          throw new Error(`${mode} is undefied`);
        // https://developer.mozilla.org/docs/Web/CSS/url_function#syntax
        case "css-url": {
          if (!string.includes('"')) {
            return '"' + string + '"';
          }
          if (!string.includes("'")) {
            return "'" + string + "'";
          }
          return string.replaceAll(/([ '"()])/g, "\\$1");
        }
      }
    },
    stringUnquote(string, mode) {
      string += "";
      switch (mode) {
        default:
          throw new Error(`${mode} is undefied`);
        // https://developer.mozilla.org/docs/Web/CSS/url_function#syntax
        case "css-url": {
          if (string.at(0) === '"' && string.at(-1) === '"') {
            return string.slice(1, -1);
          }
          if (string.at(0) === "'" && string.at(-1) === "'") {
            return string.slice(1, -1).replaceAll(/\\'/g, "'");
          }
          return string.replaceAll(/\\([ '"()])/g, "$1");
        }
      }
    },
    stringIsNaN(string) {
      return Number.isNaN(parseFloat(string));
    },
    stringRender: /* @__PURE__ */ function() {
      const cache = {};
      return function(template, values, tag = null) {
        const tagFunction = /* @__PURE__ */ __name((hashes, ...values2) => {
          return values2.map((value) => {
            if (tag == null || value instanceof String) {
              return value;
            }
            return tag(value);
          }).map((value, index) => hashes[index] + value).concat(hashes.slice(values2.length)).join("");
        }, "tagFunction");
        const cachekey = `${tag}\`${template}\``;
        const f = cache[cachekey] ??= new Function("", `return globalThis.$__internalTagFunctions.at(-1)\`${template}\`;`);
        GT.$__internalTagFunctions ??= [];
        GT.$__internalTagFunctions.push(tagFunction);
        try {
          return f.call(values);
        } finally {
          GT.$__internalTagFunctions.pop();
        }
      };
    }(),
    objectId: function() {
      const objectMap = new GT.WeakMap();
      let objectCounter = 0;
      return function(object) {
        if (object === null || typeof object !== "object") {
          return null;
        }
        if (!objectMap.has(object)) {
          objectMap.set(object, ++objectCounter);
        }
        return objectMap.get(object);
      };
    }(),
    objectFinalize: function() {
      const finalizer = new FinalizationRegistry((heldValue) => heldValue());
      return function(object, destructor) {
        finalizer.register(object, destructor, object);
      };
    }(),
    objectIsPlain(object) {
      if (object == null || typeof object !== "object") {
        return false;
      }
      return object.constructor === Object || object.constructor == null;
    },
    /**
     * check ArraryLike Object
     *
     * ArrayLike is:
     * - property contains 'length' (optional)
     * - property has consecutive enumerable keys
     * - 'length' and the keys.length are same
     *
     * @param {Object} object
     * @param {Boolean} [requireLength=true]
     * @returns {Boolean}
     */
    objectIsArrayLike(object, requireLength = true) {
      if (object instanceof Array) {
        return true;
      }
      if (object == null || typeof object !== "object") {
        return false;
      }
      const keys = Object.keys(object);
      if (!("length" in object) && keys.length === 0) {
        return false;
      }
      const length = object.length ?? (requireLength ? null : keys.length);
      if (length == null) {
        return false;
      }
      const lengthIndex = keys.indexOf("length");
      if (lengthIndex !== -1) {
        keys.splice(lengthIndex, 1);
      }
      if (keys.length !== +length) {
        return false;
      }
      const indexKeys = keys.map((v) => +v);
      for (let i = 0; i < length; i++) {
        if (indexKeys[i] !== i) {
          return false;
        }
      }
      return true;
    },
    /**
     * @param {Object} object
     * @param {String} [prefix='']
     * @return {Object<String, String|Boolean>}
     */
    objectToAttributes(object, prefix = "") {
      const result = {};
      for (const [name, value] of F.objectToEntries(object)) {
        let fullname = prefix ? `${prefix}-${name}` : name;
        if (fullname.startsWith("data-")) {
          fullname = F.stringToKebabCase(fullname);
        }
        if (fullname === "style" && F.objectIsPlain(value)) {
          const styles = [];
          for (const [css, style] of F.objectToEntries(value)) {
            styles.push(F.stringToKebabCase(css) + ":" + style);
          }
          if (styles.length) {
            result[fullname] = styles.join(";") + ";";
          }
        } else if (fullname === "class") {
          const classes = [];
          for (const [token, flag] of F.objectToEntries(F.objectToClasses(value))) {
            if (flag) {
              classes.push(token);
            }
          }
          if (classes.length) {
            result[fullname] = classes.join(" ");
          }
        } else if (F.objectIsPlain(value)) {
          Object.assign(result, F.objectToAttributes(value, name));
        } else {
          result[fullname] = value;
        }
      }
      return result;
    },
    /**
     * @param {Object} object
     * @return {Object<String, Boolean>}
     */
    objectToClasses(object) {
      const normalizeToken = /* @__PURE__ */ __name(function(token) {
        return ("" + token).split(" ").filter((t) => t.length);
      }, "normalizeToken");
      const result = {};
      if (object instanceof Array) {
        for (const token of object) {
          Object.assign(result, F.objectToClasses(token));
        }
      } else if (F.objectIsPlain(object)) {
        for (const [key, flag] of F.objectToEntries(object)) {
          for (const token of normalizeToken(key)) {
            result[normalizeToken(token)] = !!flag;
          }
        }
      } else {
        for (const token of normalizeToken(object)) {
          result[normalizeToken(token)] = true;
        }
      }
      return result;
    },
    /**
     * @param {Object} object
     * @param {String} [prefix='']
     * @return {Object<String, String>}
     */
    objectToDataset(object, prefix = "") {
      const result = {};
      for (const [name, data] of F.objectToEntries(object)) {
        const fullname = F.stringToKebabCase(prefix ? `${prefix}-${name}` : name);
        if (F.objectIsPlain(data) || data instanceof Array) {
          for (const [name2, data2] of F.objectToEntries(F.objectToDataset(data, fullname))) {
            result[name2] = data2;
          }
          if (data instanceof Array) {
            result[fullname + "-length"] = data.length;
          }
        } else {
          result[fullname] = data;
        }
      }
      return result;
    },
    /**
     * @param {Object} object
     * @returns {([any, any])[]}
     */
    objectToEntries(object) {
      if (object instanceof NamedNodeMap) {
        return Array.from(object).map((attr) => [attr.name, attr.value]);
      }
      if (object instanceof CSSStyleDeclaration) {
        return Array.from(object).map((name) => [name, object[name]]);
      }
      if (!Object.hasOwn(object, "entries") && typeof object.entries === "function") {
        return [...object.entries()];
      }
      if (!Object.hasOwn(object, "keys") && typeof object.keys === "function") {
        return [...Array.from(object.keys()).flatMap((e) => [[e, object[e]]])];
      }
      if (!Object.hasOwn(object, "values") && typeof object.values === "function") {
        return [...Array.from(object.values()).entries()];
      }
      if (!Object.hasOwn(object, "length") && "length" in object) {
        return [...Array.from(object).entries()];
      }
      if (Symbol.iterator in object) {
      }
      return Object.entries(object);
    },
    objectToArrayEntries(object, parentKey) {
      let entries = [];
      for (const [key, value] of F.objectToEntries(object)) {
        let currentKey = parentKey ? `${parentKey}[${key}]` : key;
        if (value instanceof Array) {
          for (const [index, item] of value.entries()) {
            if (F.objectIsPlain(item)) {
              entries = entries.concat(F.objectToArrayEntries(item, `${currentKey}[${index}]`));
            } else {
              entries.push([`${currentKey}[]`, item]);
            }
          }
        } else if (F.objectIsPlain(value)) {
          entries = entries.concat(F.objectToArrayEntries(value, currentKey));
        } else {
          entries.push([currentKey, value]);
        }
      }
      return entries;
    },
    /**
     * @param {Object} object
     * @param {Object} properties
     * @returns {Object}
     */
    objectDeleteProperties(object, properties) {
      const result = /* @__PURE__ */ Object.create(null);
      for (const [propertyName, defaultValue] of F.objectToEntries(properties)) {
        let propertyValue = object[propertyName] ?? defaultValue;
        delete object[propertyName];
        if (defaultValue != null) {
          propertyValue = (() => {
            switch (typeof defaultValue) {
              case "boolean":
                return !!propertyValue;
              case "number":
                return +propertyValue;
              case "bigint":
                return 0n + propertyValue;
              case "string":
                return "" + propertyValue;
              default:
                if (defaultValue instanceof Array) {
                  return propertyValue instanceof Array ? propertyValue : [propertyValue];
                }
                return propertyValue;
            }
          })();
        }
        result[propertyName] = propertyValue;
      }
      return result;
    },
    /**
     * @param {Object} object
     * @param {String} separator
     * @param {Function|String} [delimiter='=']
     * @returns {String}
     */
    objectJoin(object, separator, delimiter = "=") {
      const result = [];
      for (let [key, value] of F.objectToEntries(object)) {
        if (value === void 0) {
          continue;
        }
        if (F.objectIsPlain(value)) {
          value = F.objectJoin(value, separator, delimiter);
        }
        if (delimiter instanceof Function) {
          const entry = delimiter(value, key);
          if (entry) {
            result.push(entry);
          }
        } else {
          result.push(`${key}${delimiter}${value}`);
        }
      }
      return result.join(separator);
    },
    objectWalkRecursive(object, callback) {
      const isAsync = callback instanceof AsyncFunction;
      const promises = [];
      for (const [key, value] of F.objectToEntries(object)) {
        const assign = /* @__PURE__ */ __name((v2) => object[key] = v2, "assign");
        const v = value instanceof Array || F.objectIsPlain(value) ? F.objectWalkRecursive(value, callback) : callback(value, key, object);
        if (isAsync) {
          promises.push(v.then(assign));
        } else {
          assign(v);
        }
      }
      if (isAsync) {
        return Promise2.all(promises).then((dummy) => object);
      }
      return object;
    },
    iterableToNodeList(iterable) {
      if (iterable instanceof NodeList) {
        Logger.instance.notice(`meaningless call to iterableToNodeList`);
      }
      let i = 0;
      const properties = {};
      for (const property of iterable) {
        properties[i++] = {
          value: property,
          configurable: false,
          writable: false,
          enumerable: true
        };
      }
      properties.length = {
        value: i,
        configurable: false,
        writable: false,
        enumerable: false
      };
      return Object.create(NodeList.prototype, properties);
    },
    arrayLikeToArrayRecursive(object, requireLength = true) {
      for (const [key, value] of F.objectToEntries(object)) {
        if (typeof value === "object") {
          object[key] = F.arrayLikeToArrayRecursive(value, requireLength);
        }
      }
      if (F.objectIsArrayLike(object, requireLength)) {
        if (requireLength || "length" in object) {
          object = Array.from(object);
        } else {
          object = Object.values(object);
        }
      }
      return object;
    },
    entriesToObject(entries, arrayable) {
      const result = {};
      for (const [names, value] of entries) {
        names.reduce((target, subname, i) => target[subname] ??= i + 1 in names ? {} : value, result);
      }
      if (arrayable != null) {
        return F.arrayLikeToArrayRecursive(result, arrayable);
      }
      return result;
    },
    functionIsNative(func) {
      return Function.prototype.toString.call(func).slice(-15, -2) === "[native code]";
    },
    functionToCallbackable(func, callbackThis, ...callbackArgs) {
      return function(...args) {
        for (const [i, arg] of args.entries()) {
          const callback = typeof arg === "function" && !(arg instanceof Proxy2) ? arg : null;
          if (callback) {
            args[i] = callback.call(callbackThis, ...callbackArgs);
            if (args[i] === void 0) {
              return;
            }
          }
        }
        return func.call(this, ...args);
      };
    },
    .../* @__PURE__ */ function() {
      const handleHeaders = /* @__PURE__ */ __name(function(headers, url) {
        headers ??= {};
        if (!(headers instanceof Headers)) {
          headers = new Headers(headers);
        }
        if (window.location.origin === url.origin) {
          headers.append("X-Requested-With", "XMLHttpRequest");
        }
        return headers;
      }, "handleHeaders");
      const handleBody = /* @__PURE__ */ __name(function(options, url) {
        if (!options.body) {
          return;
        }
        if ((options.method ?? "GET").toUpperCase() === "GET") {
          if (typeof options.body === "string" || options.body instanceof URLSearchParams || F.objectIsPlain(options.body)) {
            url.searchParams.$assign(new URLSearchParams(options.body));
          } else {
            Logger.instance.error(`GET, but a body is specified. fetch silently ignores the body`);
          }
          delete options.body;
        } else {
          if (F.objectIsPlain(options.body)) {
            if (options.headers.get("content-type")?.startsWith("application/json")) {
              options.body = JSON.stringify(options.body);
            } else {
              const entries = F.objectToArrayEntries(options.body);
              if (entries.map(([k, v]) => v).find((v) => v instanceof Blob)) {
                options.body = new FormData();
              } else {
                options.body = new URLSearchParams();
              }
              for (const [name, value] of entries) {
                options.body.append(name, value);
              }
            }
          }
        }
        return options.body;
      }, "handleBody");
      const handleRetry = /* @__PURE__ */ __name(function(response, retryCount) {
        const MAX_COUNT = 3;
        const MAX_BACKOFF = 30;
        const JITTER = Math.floor(Math.random() * 1e3);
        if (retryCount < MAX_COUNT) {
          if (response instanceof Response && response.headers.has("retry-after")) {
            const retryAfter = response.headers.get("retry-after");
            if (isNaN(retryAfter)) {
              return Math.max(1e3, new Date(retryAfter).getTime() - Date.now()) + JITTER;
            } else {
              return retryAfter * 1e3 + JITTER;
            }
          }
          if (response instanceof Error || [503, 504].includes(response.status)) {
            return Math.min(MAX_BACKOFF * 1e3, 2 ** retryCount * 1e3) + JITTER;
          }
        }
        return 0;
      }, "handleRetry");
      return {
        async fetch(url, options = {}) {
          url = new URL(url, window.location.href);
          const { ok, timeout, retryer } = F.objectDeleteProperties(options, {
            ok: false,
            timeout: void 0,
            retryer: handleRetry
          });
          if (timeout) {
            const ctrl = new AbortController();
            setTimeout(() => ctrl.abort(), timeout);
            if (options.signal) {
              options.signal = AbortSignal.any([options.signal, ctrl.signal]);
            } else {
              options.signal = ctrl.signal;
            }
          }
          options.headers = handleHeaders(options.headers, url);
          options.body = handleBody(options, url);
          let retryCount = 0;
          while (true) {
            let response;
            try {
              response = await GT.fetch(url, options);
            } catch (e) {
              response = e;
            }
            const retry = retryer(response, retryCount++);
            if (retry) {
              const message = response instanceof Error ? response.message : `${response.status}: ${response.statusText}`;
              Logger.instance.warn(`retry ${url} ${retryCount} ${message}, after ${retry}ms`);
              await Timer.wait(retry);
              continue;
            }
            if (response instanceof Error) {
              response.cause ??= {};
              response.cause.retryCount = retryCount - 1;
              throw response;
            }
            if (!ok && !response.ok) {
              response.retryCount = retryCount - 1;
              throw new Error(`${response.status}: ${response.statusText}`, {
                cause: response
              });
            }
            return response;
          }
        },
        async xhr(url, options) {
          url = new URL(url, window.location.href);
          options = Object.assign({
            method: "GET",
            headers: {},
            body: null,
            credentials: "same-origin",
            // 'omit' | 'same-origin' | 'include'
            timeout: 0,
            ok: false,
            signal: null,
            progress: /* @__PURE__ */ __name(() => null, "progress")
          }, options);
          options.headers = handleHeaders(options.headers, url);
          options.body = handleBody(options, url);
          const xhr = new XMLHttpRequest();
          xhr.open(options.method.toUpperCase(), url, true);
          xhr.timeout = options.timeout;
          xhr.withCredentials = ((credentials) => {
            switch (credentials) {
              case "omit":
                return false;
              case "same-origin":
                return window.location.origin === url.origin;
              case "include":
                return true;
            }
          })(options.credentials);
          xhr.responseType = "arraybuffer";
          if (options.signal) {
            options.signal.addEventListener("abort", () => {
              xhr.abort();
            });
          }
          for (const [name, value] of F.objectToEntries(options.headers)) {
            xhr.setRequestHeader(name, value);
          }
          xhr.send(options.body);
          return new Promise2((resolve, reject) => {
            const newResponse = /* @__PURE__ */ __name(function() {
              const response = new Response(xhr.response, {
                status: xhr.status,
                statusText: xhr.statusText,
                headers: xhr.getAllResponseHeaders().split(/\r\n?/).reduce(function(headers, line) {
                  if (line.trim()) {
                    const [name, value] = line.split(":");
                    headers.append(name.trim(), value.trim());
                  }
                  return headers;
                }, new Headers())
              });
              return Object.defineProperties(response, {
                url: {
                  get() {
                    return xhr.responseURL;
                  }
                }
              });
            }, "newResponse");
            xhr.addEventListener("readystatechange", function() {
              if (xhr.readyState === XMLHttpRequest.HEADERS_RECEIVED) {
                if (!options.ok && !(200 <= xhr.status && xhr.status < 300)) {
                  reject(new Error(`${xhr.status}: ${xhr.statusText}`, {
                    cause: newResponse()
                  }));
                }
              }
            });
            xhr.addEventListener("load", () => {
              resolve(newResponse());
            });
            xhr.addEventListener("error", (e) => {
              reject(e);
            });
            xhr.addEventListener("abort", (e) => {
              reject(e);
            });
            xhr.addEventListener("timeout", (e) => {
              reject(e);
            });
            xhr.upload.addEventListener("progress", (e) => {
              options.progress(e, options.body);
            });
          });
        }
      };
    }()
  };
  var Configuration = class _Configuration {
    static {
      __name(this, "Configuration");
    }
    static TRUES = Object.freeze(["true", "yes", "1"]);
    static instance;
    #source;
    constructor(source) {
      _Configuration.instance = this;
      this.#source = source;
    }
    configure(defaults, force = false) {
      for (const [name, value] of Object.entries(defaults)) {
        if (force || this.#source[name] === void 0) {
          this[name] = value;
          continue;
        }
        if (typeof value === "boolean") {
          this[name] = _Configuration.TRUES.includes(this.#source[name]);
        } else if (typeof value === "number") {
          this[name] = +this.#source[name];
        } else if (typeof value === "string") {
          this[name] = "" + this.#source[name];
        } else if (typeof value === "function") {
          this[name] = value(this.#source[name], name, this.#source);
        } else {
          this[name] = JSON.parse(this.#source[name]);
        }
      }
      return this;
    }
  };
  var Logger = class _Logger {
    static {
      __name(this, "Logger");
    }
    static instance;
    static anyIsInstanceOf(value, prototype) {
      if (value === prototype) {
        return true;
      }
      if (Nullable === prototype && prototype(value)) {
        return true;
      }
      if (Dictionary === prototype && prototype(value)) {
        return true;
      }
      if (prototype === Object && F.objectIsPlain(value)) {
        return true;
      }
      if (prototype !== Object && typeof prototype === "function" && Object(value) instanceof prototype) {
        return true;
      }
      if (prototype === Boolean && F.anyIsPrimitive(value)) {
        return true;
      }
      if (prototype === Number && (Object(value) instanceof prototype || !isNaN(value))) {
        return true;
      }
      if (prototype === String && (Object(value) instanceof prototype || value?.toString && value.toString !== Object.prototype.toString)) {
        return true;
      }
      return false;
    }
    static anyToDisplayName(value) {
      if (value == null) {
        return "" + value;
      }
      if (typeof value === "function") {
        return value.name ?? "" + value;
      }
      return "" + value;
    }
    constructor(debug, level, prefix, console) {
      _Logger.instance = this;
      const noop = /* @__PURE__ */ __name(() => null, "noop");
      const noop2 = /* @__PURE__ */ __name(() => noop, "noop2");
      this.error = level < 3 ? noop : console.error.bind(this, prefix);
      this.warn = level < 4 ? noop : console.warn.bind(this, prefix);
      this.info = level < 6 ? noop : console.info.bind(this, prefix);
      this.debug = level < 7 ? noop : console.debug.bind(this, prefix);
      this.notice = level < 5 ? noop : debug ? console.warn.bind(this, prefix) : console.info.bind(this, prefix);
      this.time = level < 7 ? noop : (label) => console.time.call(this, `${prefix} ${label}`);
      this.timeEnd = level < 7 ? noop : (label) => console.timeEnd.call(this, `${prefix} ${label}`);
      this.assert = !debug ? noop2 : (actual, ...args) => {
        let others = args;
        if (actual instanceof Function) {
          others = ["" + actual];
          actual = actual(...args);
        }
        return console.assert.bind(this, actual, prefix, ...others);
      };
      this.assertInstanceOf = !debug ? noop2 : (actual, ...expecteds) => {
        for (const expected of expecteds) {
          if (_Logger.anyIsInstanceOf(actual, expected)) {
            return noop;
          }
        }
        return console.assert.bind(this, false, prefix, `${_Logger.anyToDisplayName(actual)} type must be ${expecteds.map(_Logger.anyToDisplayName).join("|")}`);
      };
      this.assertElementsInstanceOf = !debug ? noop2 : (actual, ...expecteds) => {
        for (const expected of expecteds) {
          if (Object.values(actual).every((v) => _Logger.anyIsInstanceOf(v, expected))) {
            return noop;
          }
        }
        return console.assert.bind(this, false, prefix, `${_Logger.anyToDisplayName(actual)} type must be ${expecteds.map(_Logger.anyToDisplayName).join("|")}`);
      };
      this.assertElementOf = !debug ? noop2 : (actual, ...expecteds) => {
        for (const expected of expecteds) {
          if (expected.includes(actual)) {
            return noop;
          }
        }
        return console.assert.bind(this, false, prefix, `${_Logger.anyToDisplayName(actual)} must be one of ${expecteds.map(_Logger.anyToDisplayName).join("|")}`);
      };
      this.assertElementsOf = !debug ? noop2 : (actual, ...expecteds) => {
        for (const expected of expecteds) {
          if (Object.values(actual).every((v) => expected.includes(v))) {
            return noop;
          }
        }
        return console.assert.bind(this, false, prefix, `${_Logger.anyToDisplayName(actual)} must be one of ${expecteds.map(_Logger.anyToDisplayName).join("|")}`);
      };
    }
  };
  var Collection = class _Collection extends null {
    static {
      __name(this, "Collection");
    }
    constructor(array, name, ancestor) {
      ancestor ??= array;
      const collection = Object.defineProperties(() => {
      }, {
        name: { value: `Collection of ${name}` },
        length: { value: array.length }
      });
      if (Configuration.instance.debug) {
        array.forEach((e, i) => collection[i] = e);
      }
      return new Proxy2(collection, {
        has(target, property) {
          if (property in array) {
            return Reflect.has(array, property);
          }
          if (array.length === 0) {
            Logger.instance.notice(`Tried to manipulate empty list, but mostly a bug. Please check selectors etc. if not intended`);
          }
          return array.some((e) => Reflect.has(e, property));
        },
        get(target, property) {
          if (property in array) {
            return Reflect.get(array, property);
          }
          if (array.length === 0) {
            Logger.instance.notice(`Tried to manipulate empty list, but mostly a bug. Please check selectors etc. if not intended`);
          }
          if (property === Symbol.toPrimitive) {
            return (hint) => array.map((e) => F.anyIsPrimitive(e, Array) ? e : Reflect.get(e, property)?.call(e, hint)).join();
          }
          const mapped = array.map((e) => F.anyIsPrimitive(e, Array) ? e : Reflect.get(e, property));
          if (mapped.every((e) => F.anyIsPrimitive(e, Object, Array))) {
            return mapped;
          }
          return new _Collection(mapped, `${name}.${property}`, ancestor);
        },
        set(target, property, value) {
          if (property in array) {
            return Reflect.set(array, property, value);
          }
          if (array.length === 0) {
            Logger.instance.notice(`Tried to manipulate empty list, but mostly a bug. Please check selectors etc. if not intended`);
          }
          array.forEach((e, i) => F.functionToCallbackable((v) => Reflect.set(e, property, v), e, ancestor?.[i], i)(value));
          return true;
        },
        deleteProperty(target, property) {
          if (property in array) {
            return Reflect.deleteProperty(array, property);
          }
          if (array.length === 0) {
            Logger.instance.notice(`Tried to manipulate empty list, but mostly a bug. Please check selectors etc. if not intended`);
          }
          array.forEach((e) => Reflect.deleteProperty(e, property));
          return true;
        },
        apply(target, thisArg, argArray) {
          if (array.length === 0) {
            Logger.instance.notice(`Tried to manipulate empty list, but mostly a bug. Please check selectors etc. if not intended`);
            return [];
          }
          if (array.some((e) => typeof e === "function")) {
            let emptyFlag = false;
            let undefinedFlag = true;
            let primitiveFlag = true;
            let sameFlag = true;
            let promiseFlag = false;
            const results = array.map((e, i) => {
              if (typeof e === "function") {
                if (e instanceof Proxy2 && argArray.length === 0) {
                  emptyFlag = true;
                  return;
                }
                if (!(e instanceof Proxy2)) {
                  e.i = i;
                }
                const result = Reflect.apply(e, thisArg?.[i], argArray);
                undefinedFlag = undefinedFlag && result === void 0;
                primitiveFlag = primitiveFlag && F.anyIsPrimitive(result, Object, Array);
                sameFlag = sameFlag && result === ancestor?.[i];
                promiseFlag = promiseFlag || result instanceof GT.Promise;
                return result;
              }
            });
            if (emptyFlag) {
              return array;
            }
            if (undefinedFlag) {
              return thisArg;
            }
            if (primitiveFlag) {
              return results;
            }
            if (sameFlag) {
              return ancestor;
            }
            if (promiseFlag) {
              return GT.Promise.all(results);
            }
            return new _Collection(results, `${name}()`, ancestor);
          }
          if (argArray.length === 0) {
            return array;
          }
          if (argArray.length === 1) {
          }
          Logger.instance.error(`apply called, but not a single case was executed`, target);
        }
      });
    }
  };
  var WeakMap = class {
    static {
      __name(this, "WeakMap");
    }
    constructor() {
      this.map = new GT.Map();
    }
    has(key) {
      return this.map.has(F.objectId(key));
    }
    get(key) {
      return this.map.get(F.objectId(key))?.value;
    }
    getOrSet(key, provider) {
      if (!this.has(key)) {
        this.set(key, provider(key));
      }
      return this.get(key);
    }
    set(key, value) {
      return this.map.set(F.objectId(key), {
        ref: new WeakRef(key),
        value
      });
    }
    reset(key, converter) {
      const oldValue = this.get(key);
      this.set(key, converter(oldValue));
      return oldValue;
    }
    delete(key) {
      return this.map.delete(F.objectId(key));
    }
    clear() {
      return this.map.clear();
    }
    *entries() {
      for (const obj of this.map.values()) {
        const object = obj.ref.deref();
        if (object === void 0) {
          this.map.delete(object);
          continue;
        }
        yield [object, obj.value];
      }
    }
    get size() {
      return [...this.entries()].length;
    }
  };
  var ObjectStorage = class {
    static {
      __name(this, "ObjectStorage");
    }
    constructor() {
      this.weakmap = new WeakMap();
    }
    has(key, subkey) {
      if (subkey == null) {
        return this.weakmap.has(key);
      }
      const object = this.weakmap.get(key) ?? {};
      return subkey in object;
    }
    get(key, subkey) {
      if (subkey == null) {
        return this.weakmap.get(key) ?? {};
      }
      const object = this.weakmap.get(key) ?? {};
      return object?.[subkey];
    }
    getOrSet(key, subkey, provider) {
      if (!this.has(key, subkey)) {
        this.set(key, subkey, provider(key, subkey));
      }
      return this.get(key, subkey);
    }
    set(key, subkey, value) {
      if (subkey == null) {
        return this.weakmap.set(key, value);
      }
      const object = this.weakmap.get(key) ?? {};
      object[subkey] = value;
      return this.weakmap.set(key, object);
    }
    reset(key, subkey, converter) {
      const oldValue = this.get(key, subkey);
      this.set(key, subkey, converter(oldValue));
      return oldValue;
    }
    delete(key, subkey) {
      if (subkey == null) {
        return this.weakmap.delete(key);
      }
      const object = this.weakmap.get(key) ?? {};
      delete object[subkey];
      if (!Object.keys(object).length) {
        return this.weakmap.delete(key);
      }
      return false;
    }
    clear() {
      return this.weakmap.clear();
    }
    *entries() {
      yield* this.weakmap.entries();
    }
    get size() {
      return this.weakmap.size;
    }
  };
  var Promise2 = class _Promise extends GT.Promise {
    static {
      __name(this, "Promise");
    }
    static resolvedReasonSymbol = Symbol("resolved");
    static async #concurrency(asyncs, throwable, concurrency = null) {
      Logger.instance.assertElementsInstanceOf(asyncs, Function, AsyncFunction)();
      concurrency ??= window.navigator.hardwareConcurrency;
      const keys = F.objectToEntries(asyncs).map(([k]) => k);
      const result = asyncs instanceof Array ? new Array(asyncs.length) : {};
      let index = 0;
      await _Promise.all(Array.from({ length: concurrency }).map(async () => {
        while (true) {
          const key = keys[index++];
          if (!asyncs[key]) {
            return;
          }
          try {
            result[key] = await asyncs[key](key);
          } catch (e) {
            if (throwable) {
              throw e;
            } else {
              result[key] = e;
            }
          }
        }
      }));
      return result;
    }
    static async concurrencyAll(asyncs, concurrency = null) {
      return _Promise.#concurrency(asyncs, true, concurrency);
    }
    static async concurrencyAllSettled(asyncs, concurrency = null) {
      return _Promise.#concurrency(asyncs, false, concurrency);
    }
    constructor(callback) {
      let resolve, reject;
      super((resolve22, reject22) => {
        resolve = resolve22;
        reject = reject22;
      });
      const resolve2 = /* @__PURE__ */ __name((v) => {
        this.status = "fulfilled";
        resolve(v);
      }, "resolve2");
      const reject2 = /* @__PURE__ */ __name((v) => {
        this.status = "rejected";
        reject(v);
      }, "reject2");
      const controller = new AbortController();
      controller.signal.addEventListener("abort", (e) => {
        if (e.target.reason === _Promise.resolvedReasonSymbol) {
          resolve2(this.resolved);
        } else {
          reject2(e.target.reason);
        }
      });
      callback(resolve2, reject2);
      this.controller = controller;
      this.resolved = null;
      this.status = "pending";
    }
    cancel(resolved) {
      this.resolved = resolved;
      this.controller.abort(_Promise.resolvedReasonSymbol);
    }
    abort(reason) {
      this.controller.abort(reason);
    }
  };
  var FileReader = class extends GT.FileReader {
    static {
      __name(this, "FileReader");
    }
    promise() {
      return new Promise2((resolve, reject) => {
        this.addEventListener("load", (e) => resolve(e.target.result));
        this.addEventListener("error", (e) => reject(e.target.error));
      });
    }
  };
  var Proxy2 = class _Proxy extends null {
    static {
      __name(this, "Proxy");
    }
    static instances = /* @__PURE__ */ new WeakSet();
    static [Symbol.hasInstance](instance2) {
      return _Proxy.instances.has(instance2);
    }
    constructor(object, handlers) {
      const instance2 = new GT.Proxy(object, handlers);
      _Proxy.instances.add(instance2);
      return instance2;
    }
  };
  var Timer = class extends EventTarget {
    static {
      __name(this, "Timer");
    }
    constructor() {
      super();
      this.id = null;
      this.millisecond = null;
    }
    static wait(millisecond) {
      const timer = new this();
      return new Promise2((resolve, reject) => {
        timer.addEventListener("alarm", (e) => resolve(Date.now() - e.detail.time));
        timer.start(millisecond);
      }).finally(() => timer.stop());
    }
    start(millisecond, repeat = 1) {
      Logger.instance.assert(this.id === null)(`Timer is started, please use restart`);
      this.millisecond = millisecond;
      const start = /* @__PURE__ */ __name((tick, time) => {
        this.id = setTimeout(() => {
          this.dispatchEvent(new CustomEvent("alarm", {
            detail: {
              id: this.id,
              tick,
              time
            }
          }));
          if (tick < repeat) {
            start(tick + 1, Date.now());
          }
        }, this.millisecond);
      }, "start");
      start(1, Date.now());
    }
    restart(millisecond, repeat) {
      this.stop();
      return this.start(millisecond, repeat);
    }
    stop() {
      clearTimeout(this.id);
      this.id = null;
    }
  };
  var Options = class _Options {
    static {
      __name(this, "Options");
    }
    constructor(defaultOptions, handleNull = false, handleUndefined = false) {
      this.options = defaultOptions;
      this.handleNull = handleNull;
      this.handleUndefined = handleUndefined;
    }
    extends(otherOptions) {
      return new _Options(Object.assign({}, this.options, otherOptions), this.handleNull, this.handleUndefined);
    }
    merge(otherOptions) {
      const options = {};
      for (const key of Object.keys(this.options)) {
        if (this.handleNull && key in otherOptions && otherOptions[key] === null) {
          options[key] = otherOptions[key];
        } else if (this.handleUndefined && key in otherOptions && otherOptions[key] === void 0) {
          options[key] = otherOptions[key];
        } else {
          options[key] = otherOptions[key] ?? this.options[key];
        }
      }
      return options;
    }
  };
  var TimerObserver = class _TimerObserver {
    static {
      __name(this, "TimerObserver");
    }
    static observers = new GT.Set();
    static timer = new Timer();
    static defaultOptions = new Options({
      interval: 1e3
    });
    constructor(callback, options = {}) {
      this.options = _TimerObserver.defaultOptions.merge(options);
      this.observedNodes = new ObjectStorage();
      this.callback = (e) => {
        const entries = [];
        for (const [target, value] of this.observedNodes.entries()) {
          const news = this._data(target);
          const diffs = this._compare(value.data, news);
          this.observedNodes.set(target, "data", news);
          for (const diff of diffs) {
            entries.push(Object.assign(diff, {
              target,
              time: e.timeStamp
            }));
          }
        }
        for (const entry of entries) {
          callback(entry, this.observedNodes.reset(entry.target, "last", () => entry));
        }
      };
      _TimerObserver.timer.addEventListener("alarm", this.callback);
    }
    _data(target) {
    }
    _compare(data1, data2) {
    }
    observe(target) {
      this.observedNodes.set(target, "data", this._data(target));
      _TimerObserver.timer.restart(Math.min(_TimerObserver.timer.millisecond ?? this.options.interval, this.options.interval), Infinity);
      _TimerObserver.observers.add(this);
    }
    unobserve(target) {
      this.observedNodes.delete(target);
      if (this.observedNodes.size === 0) {
        this.disconnect();
      }
    }
    disconnect() {
      this.observedNodes.clear();
      _TimerObserver.timer.removeEventListener("alarm", this.callback);
      _TimerObserver.observers.delete(this);
      if (_TimerObserver.observers.size === 0) {
        _TimerObserver.timer.stop();
      }
    }
    entries() {
      return this.observedNodes.entries();
    }
  };
  var CookieObserver = class _CookieObserver extends TimerObserver {
    static {
      __name(this, "CookieObserver");
    }
    static defaultOptions = TimerObserver.defaultOptions.extends({
      cookieName: void 0
    });
    static getOptionsKey(options) {
      return JSON.stringify(this.defaultOptions.merge(options));
    }
    constructor(callback, options = {}) {
      super(callback, options);
      this.options = _CookieObserver.defaultOptions.merge(options);
    }
    _data(target) {
      return {
        cookie: target.cookie,
        cookies: Object.fromEntries(target.cookie.split("; ").map((v) => v.split(/=(.*)/s).map(decodeURIComponent)))
      };
    }
    _compare(data1, data2) {
      if (data1.cookie === data2.cookie) {
        return [];
      }
      const names = /* @__PURE__ */ new Set();
      Object.keys(data1.cookies).forEach((name) => names.add(name));
      Object.keys(data2.cookies).forEach((name) => names.add(name));
      const diffs = [];
      for (const name of names.values()) {
        if (this.options.cookieName == null || this.options.cookieName.includes(name)) {
          const oldValue = data1.cookies[name];
          const newValue = data2.cookies[name];
          if (oldValue !== newValue) {
            diffs.push({
              cookieName: name,
              oldValue,
              newValue
            });
          }
        }
      }
      return diffs;
    }
  };
  var MutationObserver = class _MutationObserver extends GT.MutationObserver {
    static {
      __name(this, "MutationObserver");
    }
    static defaultOptions = new Options({
      attributes: void 0,
      attributeFilter: void 0,
      attributeOldValue: void 0,
      characterData: void 0,
      characterDataOldValue: void 0,
      childList: void 0,
      subtree: void 0
    });
    static getOptionsKey(options) {
      return JSON.stringify(this.defaultOptions.merge(options));
    }
    constructor(callback, options = {}) {
      super(function(entries) {
        for (const entry of entries) {
          callback(entry, this.observedNodes.reset(entry.target, () => entry));
        }
      });
      this.options = _MutationObserver.defaultOptions.merge(options);
      this.observedNodes = new WeakMap();
    }
    observe(target) {
      this.observedNodes.set(target, null);
      return super.observe(target, this.options);
    }
    unobserve(target) {
      super.disconnect();
      for (const [node] of this.observedNodes.entries()) {
        if (node === target) {
          this.observedNodes.delete(node);
        } else {
          this.observe(node, this.options);
        }
      }
    }
    disconnect() {
      this.observedNodes.clear();
      return super.disconnect();
    }
    entries() {
      return this.observedNodes.entries();
    }
  };
  var ResizeObserver = class _ResizeObserver extends GT.ResizeObserver {
    static {
      __name(this, "ResizeObserver");
    }
    static defaultOptions = new Options({
      box: void 0
    });
    static getOptionsKey(options) {
      return JSON.stringify(this.defaultOptions.merge(options));
    }
    constructor(callback, options = {}) {
      super(function(entries) {
        for (const entry of entries) {
          callback(entry, this.observedNodes.reset(entry.target, () => entry));
        }
      }, options);
      this.options = _ResizeObserver.defaultOptions.merge(options);
      this.observedNodes = new WeakMap();
    }
    observe(target) {
      this.observedNodes.set(target, null);
      return super.observe(target, this.options);
    }
    unobserve(target) {
      this.observedNodes.delete(target);
      return super.unobserve(target);
    }
    disconnect() {
      this.observedNodes.clear();
      return super.disconnect();
    }
    entries() {
      return this.observedNodes.entries();
    }
  };
  var IntersectionObserver = class _IntersectionObserver extends GT.IntersectionObserver {
    static {
      __name(this, "IntersectionObserver");
    }
    static defaultOptions = new Options({
      root: void 0,
      rootMargin: void 0,
      threshold: void 0
    });
    static getOptionsKey(options) {
      const observer = new GT.IntersectionObserver(() => {
      }, options);
      const keyObject = {
        root: observer.root,
        rootMargin: observer.rootMargin,
        threshold: observer.thresholds
      };
      keyObject.root = F.objectId(keyObject.root);
      return JSON.stringify(keyObject);
    }
    constructor(callback, options = {}) {
      options = _IntersectionObserver.defaultOptions.merge(options);
      super(function(entries) {
        for (const entry of entries) {
          entry.realIntersectionRatio = entry.intersectionRatio;
          if (entry.realIntersectionRatio === 0 && entry.isIntersecting) {
            entry.realIntersectionRatio = Number.EPSILON;
          }
          callback(entry, this.observedNodes.reset(entry.target, () => entry));
        }
      }, options);
      this.options = options;
      this.observedNodes = new WeakMap();
    }
    observe(target) {
      this.observedNodes.set(target, null);
      return super.observe(target);
    }
    unobserve(target) {
      this.observedNodes.delete(target);
      return super.unobserve(target);
    }
    disconnect() {
      this.observedNodes.clear();
      return super.disconnect();
    }
    entries() {
      return this.observedNodes.entries();
    }
  };
  var CustomEvent = class extends GT.CustomEvent {
    static {
      __name(this, "CustomEvent");
    }
    constructor(type, options) {
      super(type, options);
      this.$original = options.$original;
    }
  };
  var Vector2 = class extends DOMPoint {
    static {
      __name(this, "Vector2");
    }
    constructor(x, y, t) {
      super(x, y);
      this.t = t;
    }
    during(target) {
      return target.t - this.t;
    }
    deltaX(target) {
      return target.x - this.x;
    }
    deltaY(target) {
      return target.y - this.y;
    }
    distance(target) {
      return Math.sqrt(this.deltaX(target) ** 2 + this.deltaY(target) ** 2);
    }
    degree(target) {
      let degree = Math.atan2(this.deltaY(target), this.deltaX(target)) * (180 / Math.PI) + 90;
      if (degree < 0) {
        degree += 360;
      }
      return degree;
    }
    velocity(target) {
      return this.distance(target) / this.during(target);
    }
  };

  // src/KQuery.js
  var KQuery = class {
    static {
      __name(this, "KQuery");
    }
    constructor(meta) {
      const kQuery = this;
      this.API = API_exports;
      this.config = new Configuration(function() {
        if (F.objectIsPlain(meta) && !meta.url) {
          return meta;
        }
        const result = {};
        if (meta.url || meta.src) {
          for (const [key, value] of new URL(meta.url || meta.src).searchParams.entries()) {
            if (key.startsWith("kQuery-")) {
              result[key.substring("kQuery-".length)] = value;
            }
          }
        }
        if (meta instanceof HTMLScriptElement) {
          for (const [key, value] of F.objectToEntries(meta.dataset)) {
            if (key.startsWith("kquery")) {
              const key2 = key.substring("kquery".length);
              result[key2.charAt(0).toLowerCase() + key2.substring(1)] = value;
            }
          }
        }
        return result;
      }());
      this.config.configure({
        debug: false,
        logLevel: 0,
        global: "kQuery"
      });
      globalThis[this.config.global] = this;
      this.logger = new Logger(this.config.debug, this.config.logLevel, "[kQuery]", globalThis.console);
    }
    extends(plugin) {
      const kQuery = this;
      const pluginName = plugin.name ? plugin.name : plugin;
      this.logger.time(pluginName);
      for (const [types, properties] of Object.entries(plugin(kQuery))) {
        const descriptors = Object.getOwnPropertyDescriptors(properties);
        for (const descriptor of Object.values(descriptors)) {
          if (descriptor.set) {
            const original = descriptor.set;
            if (kQuery.config.resetNative || !F.functionIsNative(original)) {
              descriptor.set = function(...args) {
                return F.functionToCallbackable(original.bind(this), this, this)(...args);
              };
            }
          }
        }
        for (const type of types.split(",")) {
          if (type.charAt(0) === "$") {
            for (const listtype of API_exports[type]()) {
              for (const [name, descriptor] of Object.entries(descriptors)) {
                if (name === "length") {
                  continue;
                }
                Object.defineProperty(globalThis[listtype].prototype, name, {
                  get() {
                    const mapped = F.objectToEntries(this).map(([i, e]) => e?.[name]);
                    if (mapped.length && mapped.every((e) => F.anyIsPrimitive(e, Object, Array, FileList))) {
                      return mapped;
                    }
                    return new Collection(mapped, name, this);
                  },
                  set(value) {
                    return F.objectToEntries(this).forEach(([i, e]) => {
                      if (name in e) {
                        F.functionToCallbackable((v) => e[name] = v, this, e, i)(value);
                      }
                    });
                  },
                  configurable: descriptor.configurable,
                  enumerable: descriptor.enumerable
                });
              }
            }
          } else {
            Object.defineProperties(globalThis[type].prototype, descriptors);
          }
        }
      }
      this.logger.timeEnd(pluginName);
    }
  };

  // src/plugins/@autoproperties.js
  function autoproperties(kQuery) {
    const ignoreProperties = {
      EventTarget: ["dispatchEvent"],
      Element: ["computedStyleMap", "elementTiming", "getInnerHTML", "onbeforecopy", "onbeforecut", "onbeforepaste", "onfullscreenchange", "onfullscreenerror", "onsearch", "scrollIntoViewIfNeeded"],
      HTMLAnchorElement: ["attributionSrc", "charset", "coords", "name", "rev", "shape"],
      HTMLAreaElement: ["noHref"],
      HTMLBRElement: ["clear"],
      HTMLBodyElement: ["aLink", "background", "bgColor", "link", "onafterprint", "onbeforeprint", "onbeforeunload", "onblur", "onerror", "onfocus", "onhashchange", "onlanguagechange", "onload", "onmessage", "onmessageerror", "onoffline", "ononline", "onpagehide", "onpageshow", "onpopstate", "onrejectionhandled", "onresize", "onscroll", "onstorage", "onunhandledrejection", "onunload", "text", "vLink"],
      HTMLDListElement: ["compact"],
      HTMLDirectoryElement: ["*"],
      HTMLDivElement: ["align"],
      HTMLElement: ["attributeStyleMap", "editContext", "onabort", "onanimationend", "onanimationiteration", "onanimationstart", "onauxclick", "onbeforeinput", "onbeforematch", "onbeforetoggle", "onbeforexrselect", "onblur", "oncancel", "oncanplay", "oncanplaythrough", "onchange", "onclick", "onclose", "oncontentvisibilityautostatechange", "oncontextlost", "oncontextmenu", "oncontextrestored", "oncopy", "oncuechange", "oncut", "ondblclick", "ondrag", "ondragend", "ondragenter", "ondragleave", "ondragover", "ondragstart", "ondrop", "ondurationchange", "onemptied", "onended", "onerror", "onfocus", "onformdata", "ongotpointercapture", "oninput", "oninvalid", "onkeydown", "onkeypress", "onkeyup", "onload", "onloadeddata", "onloadedmetadata", "onloadstart", "onlostpointercapture", "onmousedown", "onmouseenter", "onmouseleave", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "onmousewheel", "onpaste", "onpause", "onplay", "onplaying", "onpointercancel", "onpointerdown", "onpointerenter", "onpointerleave", "onpointermove", "onpointerout", "onpointerover", "onpointerrawupdate", "onpointerup", "onprogress", "onratechange", "onreset", "onresize", "onscroll", "onscrollend", "onscrollsnapchange", "onscrollsnapchanging", "onsecuritypolicyviolation", "onseeked", "onseeking", "onselect", "onselectionchange", "onselectstart", "onslotchange", "onstalled", "onsubmit", "onsuspend", "ontimeupdate", "ontoggle", "ontransitioncancel", "ontransitionend", "ontransitionrun", "ontransitionstart", "onvolumechange", "onwaiting", "onwheel", "virtualKeyboardPolicy", "writingSuggestions"],
      HTMLEmbedElement: ["align", "name"],
      HTMLFencedFrameElement: ["*"],
      HTMLFontElement: ["color", "face", "size"],
      HTMLFormElement: ["requestAutocomplete"],
      HTMLFrameElement: ["*"],
      HTMLFrameSetElement: ["cols", "onafterprint", "onbeforeprint", "onbeforeunload", "onblur", "onerror", "onfocus", "onhashchange", "onlanguagechange", "onload", "onmessage", "onmessageerror", "onoffline", "ononline", "onpagehide", "onpageshow", "onpopstate", "onrejectionhandled", "onresize", "onscroll", "onstorage", "onunhandledrejection", "onunload", "rows"],
      HTMLHRElement: ["align", "color", "noShade", "size", "width"],
      HTMLHeadingElement: ["align"],
      HTMLHtmlElement: ["version"],
      HTMLIFrameElement: ["adAuctionHeaders", "align", "allowPaymentRequest", "credentialless", "csp", "featurePolicy", "frameBorder", "longDesc", "marginHeight", "marginWidth", "privateToken", "sharedStorageWritable", "scrolling"],
      HTMLImageElement: ["align", "attributionSrc", "border", "fetchPriority", "hspace", "longDesc", "name", "sharedStorageWritable", "vspace"],
      HTMLInputElement: ["align", "incremental", "useMap", "webkitdirectory"],
      HTMLLIElement: ["type"],
      HTMLLegendElement: ["align"],
      HTMLLinkElement: ["charset", "blocking", "fetchPriority", "rev", "target"],
      HTMLMarqueeElement: ["*"],
      HTMLMediaElement: ["captureStream", "controller", "controlsList", "disableRemotePlayback", "mediaGroup", "onencrypted", "onwaitingforkey", "remote", "setSinkId", "sinkId"],
      HTMLMenuElement: ["compact"],
      HTMLMetaElement: ["scheme"],
      HTMLOListElement: ["compact"],
      HTMLObjectElement: ["align", "archive", "border", "code", "codeBase", "codeType", "declare", "hspace", "standby", "vspace"],
      HTMLParagraphElement: ["align"],
      HTMLParamElement: ["name", "type", "value", "valueType"],
      HTMLPreElement: ["width"],
      HTMLScriptElement: ["attributionSrc", "blocking", "charset", "event", "fetchPriority"],
      HTMLStyleElement: ["blocking", "type"],
      HTMLTableCaptionElement: ["align"],
      HTMLTableCellElement: ["align", "axis", "bgColor", "ch", "chOff", "height", "noWrap", "vAlign", "width"],
      HTMLTableColElement: ["align", "ch", "chOff", "span", "vAlign", "width"],
      HTMLTableElement: ["align", "bgColor", "border", "cellPadding", "cellSpacing", "frame", "rules", "summary", "width"],
      HTMLTableRowElement: ["align", "bgColor", "ch", "chOff", "vAlign"],
      HTMLTableSectionElement: ["align", "ch", "chOff", "vAlign"],
      HTMLUListElement: ["compact", "type"],
      HTMLVideoElement: ["cancelVideoFrameCallback", "onenterpictureinpicture", "onleavepictureinpicture", "playsInline", "requestPictureInPicture", "requestVideoFrameCallback"]
    };
    const targetProperties = {
      // https://developer.mozilla.org/docs/Web/API/Blob
      Blob: ["arrayBuffer", "size", "slice", "stream", "text", "type"],
      // https://developer.mozilla.org/docs/Web/API/Element
      Element: ["after", "animate", "append", "ariaAtomic", "ariaAutoComplete", "ariaBrailleLabel", "ariaBrailleRoleDescription", "ariaBusy", "ariaChecked", "ariaColCount", "ariaColIndex", "ariaColIndexText", "ariaColSpan", "ariaCurrent", "ariaDescription", "ariaDisabled", "ariaExpanded", "ariaHasPopup", "ariaHidden", "ariaInvalid", "ariaKeyShortcuts", "ariaLabel", "ariaLevel", "ariaLive", "ariaModal", "ariaMultiLine", "ariaMultiSelectable", "ariaOrientation", "ariaPlaceholder", "ariaPosInSet", "ariaPressed", "ariaReadOnly", "ariaRelevant", "ariaRequired", "ariaRoleDescription", "ariaRowCount", "ariaRowIndex", "ariaRowIndexText", "ariaRowSpan", "ariaSelected", "ariaSetSize", "ariaSort", "ariaValueMax", "ariaValueMin", "ariaValueNow", "ariaValueText", "assignedSlot", "attachShadow", "attributes", "before", "checkVisibility", "childElementCount", "children", "classList", "className", "clientHeight", "clientLeft", "clientTop", "clientWidth", "closest", "currentCSSZoom", "firstElementChild", "getAnimations", "getAttribute", "getAttributeNS", "getAttributeNames", "getAttributeNode", "getAttributeNodeNS", "getBoundingClientRect", "getClientRects", "getElementsByClassName", "getElementsByTagName", "getElementsByTagNameNS", "getHTML", "hasAttribute", "hasAttributeNS", "hasAttributes", "hasPointerCapture", "id", "innerHTML", "insertAdjacentElement", "insertAdjacentHTML", "insertAdjacentText", "lastElementChild", "localName", "matches", "moveBefore", "namespaceURI", "nextElementSibling", "outerHTML", "part", "prefix", "prepend", "previousElementSibling", "querySelector", "querySelectorAll", "releasePointerCapture", "remove", "removeAttribute", "removeAttributeNS", "removeAttributeNode", "replaceChildren", "replaceWith", "requestFullscreen", "requestPointerLock", "role", "scroll", "scrollBy", "scrollHeight", "scrollIntoView", "scrollLeft", "scrollTo", "scrollTop", "scrollWidth", "setAttribute", "setAttributeNS", "setAttributeNode", "setAttributeNodeNS", "setHTMLUnsafe", "setPointerCapture", "shadowRoot", "slot", "tagName", "toggleAttribute"],
      // https://developer.mozilla.org/docs/Web/API/EventTarget
      EventTarget: ["addEventListener", "removeEventListener"],
      // https://developer.mozilla.org/docs/Web/API/File
      File: ["lastModified", "lastModifiedDate", "name"],
      // https://developer.mozilla.org/docs/Web/API/HTMLAnchorElement
      HTMLAnchorElement: ["download", "hash", "host", "hostname", "href", "hreflang", "origin", "password", "pathname", "ping", "port", "protocol", "referrerPolicy", "rel", "relList", "search", "target", "text", "toString", "type", "username"],
      // https://developer.mozilla.org/docs/Web/API/HTMLAreaElement
      HTMLAreaElement: ["alt", "coords", "download", "hash", "host", "hostname", "href", "origin", "password", "pathname", "ping", "port", "protocol", "referrerPolicy", "rel", "relList", "search", "shape", "target", "toString", "username"],
      // https://developer.mozilla.org/docs/Web/API/HTMLBaseElement
      HTMLBaseElement: ["href", "target"],
      // https://developer.mozilla.org/docs/Web/API/HTMLButtonElement
      HTMLButtonElement: ["checkValidity", "disabled", "form", "formAction", "formEnctype", "formMethod", "formNoValidate", "formTarget", "labels", "name", "popoverTargetAction", "popoverTargetElement", "reportValidity", "setCustomValidity", "type", "validationMessage", "validity", "value", "willValidate"],
      // https://developer.mozilla.org/docs/Web/API/HTMLCanvasElement
      HTMLCanvasElement: ["captureStream", "getContext", "height", "toBlob", "toDataURL", "transferControlToOffscreen", "width"],
      // https://developer.mozilla.org/docs/Web/API/HTMLDataElement
      HTMLDataElement: ["value"],
      // https://developer.mozilla.org/docs/Web/API/HTMLDataListElement
      HTMLDataListElement: ["options"],
      // https://developer.mozilla.org/docs/Web/API/HTMLDetailsElement
      HTMLDetailsElement: ["name", "open"],
      // https://developer.mozilla.org/docs/Web/API/HTMLDialogElement
      HTMLDialogElement: ["close", "closedBy", "open", "requestClose", "returnValue", "show", "showModal"],
      // https://developer.mozilla.org/docs/Web/API/HTMLElement
      HTMLElement: ["accessKey", "attachInternals", "autocapitalize", "autofocus", "blur", "click", "contentEditable", "dataset", "dir", "draggable", "enterKeyHint", "focus", "hidden", "hidePopover", "inert", "innerText", "inputMode", "isContentEditable", "lang", "nonce", "offsetHeight", "offsetLeft", "offsetParent", "offsetTop", "offsetWidth", "outerText", "popover", "showPopover", "spellcheck", "style", "tabIndex", "title", "togglePopover", "translate"],
      // https://developer.mozilla.org/docs/Web/API/HTMLEmbedElement
      HTMLEmbedElement: ["getSVGDocument", "height", "src", "type", "width"],
      // https://developer.mozilla.org/docs/Web/API/HTMLFieldSetElement
      HTMLFieldSetElement: ["checkValidity", "disabled", "elements", "form", "name", "reportValidity", "setCustomValidity", "type", "validationMessage", "validity", "willValidate"],
      // https://developer.mozilla.org/docs/Web/API/HTMLFormElement
      HTMLFormElement: ["acceptCharset", "action", "autocomplete", "checkValidity", "elements", "encoding", "enctype", "length", "method", "name", "noValidate", "rel", "relList", "reportValidity", "requestSubmit", "reset", "submit", "target"],
      // https://developer.mozilla.org/docs/Web/API/HTMLIFrameElement
      HTMLIFrameElement: ["allow", "allowFullscreen", "contentDocument", "contentWindow", "getSVGDocument", "height", "loading", "name", "referrerPolicy", "sandbox", "src", "srcdoc", "width"],
      // https://developer.mozilla.org/docs/Web/API/HTMLImageElement
      HTMLImageElement: ["alt", "complete", "crossOrigin", "currentSrc", "decode", "decoding", "height", "isMap", "loading", "lowsrc", "naturalHeight", "naturalWidth", "referrerPolicy", "sizes", "src", "srcset", "useMap", "width", "x", "y"],
      // https://developer.mozilla.org/docs/Web/API/HTMLInputElement
      HTMLInputElement: ["accept", "alt", "autocomplete", "checkValidity", "checked", "defaultChecked", "defaultValue", "dirName", "disabled", "files", "form", "formAction", "formEnctype", "formMethod", "formNoValidate", "formTarget", "height", "indeterminate", "labels", "list", "max", "maxLength", "min", "minLength", "multiple", "name", "pattern", "placeholder", "popoverTargetAction", "popoverTargetElement", "readOnly", "reportValidity", "required", "select", "selectionDirection", "selectionEnd", "selectionStart", "setCustomValidity", "setRangeText", "setSelectionRange", "showPicker", "size", "src", "step", "stepDown", "stepUp", "type", "validationMessage", "validity", "value", "valueAsDate", "valueAsNumber", "width", "willValidate"],
      // https://developer.mozilla.org/docs/Web/API/HTMLLIElement
      HTMLLIElement: ["value"],
      // https://developer.mozilla.org/docs/Web/API/HTMLLabelElement
      HTMLLabelElement: ["control", "form", "htmlFor"],
      // https://developer.mozilla.org/docs/Web/API/HTMLLegendElement
      HTMLLegendElement: ["form"],
      // https://developer.mozilla.org/docs/Web/API/HTMLLinkElement
      HTMLLinkElement: ["as", "crossOrigin", "disabled", "href", "hreflang", "imageSizes", "imageSrcset", "integrity", "media", "referrerPolicy", "rel", "relList", "sheet", "sizes", "type"],
      // https://developer.mozilla.org/docs/Web/API/HTMLMapElement
      HTMLMapElement: ["areas", "name"],
      // https://developer.mozilla.org/docs/Web/API/HTMLMediaElement
      HTMLMediaElement: ["addTextTrack", "autoplay", "buffered", "canPlayType", "controls", "crossOrigin", "currentSrc", "currentTime", "defaultMuted", "defaultPlaybackRate", "duration", "ended", "error", "load", "loop", "muted", "networkState", "pause", "paused", "play", "playbackRate", "played", "preload", "preservesPitch", "readyState", "seekable", "seeking", "src", "srcObject", "textTracks", "volume"],
      // https://developer.mozilla.org/docs/Web/API/HTMLMetaElement
      HTMLMetaElement: ["content", "httpEquiv", "media", "name"],
      // https://developer.mozilla.org/docs/Web/API/HTMLMeterElement
      HTMLMeterElement: ["high", "labels", "low", "max", "min", "optimum", "value"],
      // https://developer.mozilla.org/docs/Web/API/HTMLModElement
      HTMLModElement: ["cite", "dateTime"],
      // https://developer.mozilla.org/docs/Web/API/HTMLOListElement
      HTMLOListElement: ["reversed", "start", "type"],
      // https://developer.mozilla.org/docs/Web/API/HTMLObjectElement
      HTMLObjectElement: ["checkValidity", "contentDocument", "contentWindow", "data", "form", "getSVGDocument", "height", "name", "reportValidity", "setCustomValidity", "type", "useMap", "validationMessage", "validity", "width", "willValidate"],
      // https://developer.mozilla.org/docs/Web/API/HTMLOptGroupElement
      HTMLOptGroupElement: ["disabled", "label"],
      // https://developer.mozilla.org/docs/Web/API/HTMLOptionElement
      HTMLOptionElement: ["defaultSelected", "disabled", "form", "index", "label", "selected", "text", "value"],
      // https://developer.mozilla.org/docs/Web/API/HTMLOutputElement
      HTMLOutputElement: ["checkValidity", "defaultValue", "form", "htmlFor", "labels", "name", "reportValidity", "setCustomValidity", "type", "validationMessage", "validity", "value", "willValidate"],
      // https://developer.mozilla.org/docs/Web/API/HTMLProgressElement
      HTMLProgressElement: ["labels", "max", "position", "value"],
      // https://developer.mozilla.org/docs/Web/API/HTMLQuoteElement
      HTMLQuoteElement: ["cite"],
      // https://developer.mozilla.org/docs/Web/API/HTMLScriptElement
      HTMLScriptElement: ["async", "crossOrigin", "defer", "htmlFor", "integrity", "noModule", "referrerPolicy", "src", "text", "type"],
      // https://developer.mozilla.org/docs/Web/API/HTMLSelectElement
      HTMLSelectElement: ["add", "autocomplete", "checkValidity", "disabled", "form", "item", "labels", "length", "multiple", "name", "namedItem", "options", "remove", "reportValidity", "required", "selectedIndex", "selectedOptions", "setCustomValidity", "showPicker", "size", "type", "validationMessage", "validity", "value", "willValidate"],
      // https://developer.mozilla.org/docs/Web/API/HTMLSlotElement
      HTMLSlotElement: ["assign", "assignedElements", "assignedNodes", "name"],
      // https://developer.mozilla.org/docs/Web/API/HTMLSourceElement
      HTMLSourceElement: ["height", "media", "sizes", "src", "srcset", "type", "width"],
      // https://developer.mozilla.org/docs/Web/API/HTMLStyleElement
      HTMLStyleElement: ["disabled", "media", "sheet"],
      // https://developer.mozilla.org/docs/Web/API/HTMLTableCellElement
      HTMLTableCellElement: ["abbr", "cellIndex", "colSpan", "headers", "rowSpan", "scope"],
      // https://developer.mozilla.org/docs/Web/API/HTMLTableElement
      HTMLTableElement: ["caption", "createCaption", "createTBody", "createTFoot", "createTHead", "deleteCaption", "deleteRow", "deleteTFoot", "deleteTHead", "insertRow", "rows", "tBodies", "tFoot", "tHead"],
      // https://developer.mozilla.org/docs/Web/API/HTMLTableRowElement
      HTMLTableRowElement: ["cells", "deleteCell", "insertCell", "rowIndex", "sectionRowIndex"],
      // https://developer.mozilla.org/docs/Web/API/HTMLTableSectionElement
      HTMLTableSectionElement: ["deleteRow", "insertRow", "rows"],
      // https://developer.mozilla.org/docs/Web/API/HTMLTemplateElement
      HTMLTemplateElement: ["content", "shadowRootClonable", "shadowRootDelegatesFocus", "shadowRootMode", "shadowRootSerializable"],
      // https://developer.mozilla.org/docs/Web/API/HTMLTextAreaElement
      HTMLTextAreaElement: ["autocomplete", "checkValidity", "cols", "defaultValue", "dirName", "disabled", "form", "labels", "maxLength", "minLength", "name", "placeholder", "readOnly", "reportValidity", "required", "rows", "select", "selectionDirection", "selectionEnd", "selectionStart", "setCustomValidity", "setRangeText", "setSelectionRange", "textLength", "type", "validationMessage", "validity", "value", "willValidate", "wrap"],
      // https://developer.mozilla.org/docs/Web/API/HTMLTimeElement
      HTMLTimeElement: ["dateTime"],
      // https://developer.mozilla.org/docs/Web/API/HTMLTitleElement
      HTMLTitleElement: ["text"],
      // https://developer.mozilla.org/docs/Web/API/HTMLTrackElement
      HTMLTrackElement: ["default", "kind", "label", "readyState", "src", "srclang", "track"],
      // https://developer.mozilla.org/docs/Web/API/HTMLVideoElement
      HTMLVideoElement: ["disablePictureInPicture", "getVideoPlaybackQuality", "height", "poster", "videoHeight", "videoWidth", "width"],
      // https://developer.mozilla.org/docs/Web/API/Node
      Node: ["appendChild", "baseURI", "childNodes", "cloneNode", "compareDocumentPosition", "contains", "firstChild", "getRootNode", "hasChildNodes", "insertBefore", "isConnected", "isDefaultNamespace", "isEqualNode", "isSameNode", "lastChild", "lookupNamespaceURI", "lookupPrefix", "nextSibling", "nodeName", "nodeType", "nodeValue", "normalize", "ownerDocument", "parentElement", "parentNode", "previousSibling", "removeChild", "replaceChild", "textContent"]
    };
    const typeProperties = !kQuery.config.debug ? targetProperties : function() {
      const result = /* @__PURE__ */ Object.create(null);
      for (const name of Object.keys(Object.getOwnPropertyDescriptors(globalThis))) {
        if (!name.match(/^((EventTarget)|(Blob|File)|(Node|Element)|(HTML.*Element))$/)) {
          continue;
        }
        const prototype = globalThis[name];
        for (const property in prototype.prototype) {
          if (property.toUpperCase() === property) {
            continue;
          }
          if (property.match(/^(webkit|moz)[A-Z]/) || property.startsWith("onwebkit")) {
            continue;
          }
          if (!Object.prototype.hasOwnProperty.call(prototype.prototype, property)) {
            continue;
          }
          if (name in ignoreProperties && (ignoreProperties[name].includes(property) || ignoreProperties[name].includes("*"))) {
            continue;
          }
          result[prototype.name] = (result[prototype.name] ?? /* @__PURE__ */ new Set()).add(property);
        }
      }
      const result2 = {};
      for (const name of Object.keys(result).toSorted()) {
        result2[name] = [...result[name]].toSorted();
      }
      kQuery.logger.debug(Object.keys(result2).map((name) => `// https://developer.mozilla.org/docs/Web/API/${name}
${name}: ${JSON.stringify(result2[name])},`).join("\n"));
      return result2;
    }();
    kQuery.config.configure({
      appendNative: true,
      resetNative: true
    });
    const defineProperties = kQuery.config.appendNative ? {
      [[Node.name]]: (
        /** @lends Node.prototype */
        {
          /**
           * to HTML for debug or utility
           *
           * @return {String}
           */
          [Symbol.toPrimitive]() {
            return this.outerHTML ?? this.nodeValue ?? null;
          }
        }
      ),
      [[NodeList.name]]: (
        /** @lends NodeList.prototype */
        {
          /**
           * to HTML for debug or utility
           *
           * @return {String}
           */
          [Symbol.toPrimitive]() {
            return [...this].join("");
          },
          /**
           * same as dispatchEvent for NodeList
           *
           * original dispatchEvent is fired only once sometimes. probably because the EventObject is consumed
           *
           * @param {Event} event
           * @return {Boolean[]}
           */
          dispatchEvent(event) {
            const result = [];
            for (const node of this) {
              const newevent = new event.constructor(event.type, event);
              result.push(node.dispatchEvent(newevent));
            }
            return result;
          }
        }
      ),
      [[RadioNodeList.name]]: (
        /** @lends RadioNodeList.prototype */
        {
          /**
           * get name of RadioNodeList
           *
           * @descriptor get
           *
           * @return {?String}
           */
          get name() {
            return this[0]?.name;
          },
          /**
           * set name of RadioNodeList
           *
           * @descriptor set
           *
           * @param {String} name
           */
          set name(name) {
            [...this].forEach(function(e) {
              e.name = name;
            });
          }
        }
      )
    } : {};
    const defineProperty = /* @__PURE__ */ __name(function(type, property, descriptor) {
      defineProperties[type] ??= {};
      Object.defineProperty(defineProperties[type], property, descriptor);
    }, "defineProperty");
    for (const [type, properties] of Object.entries(typeProperties)) {
      if (type in globalThis) {
        const prototype = globalThis[type].prototype;
        for (const property of properties) {
          const descriptor = Object.getOwnPropertyDescriptor(prototype, property);
          if (descriptor) {
            defineProperty(type, property, descriptor);
            if (globalThis[type] === globalThis["EventTarget"] || prototype instanceof EventTarget) {
              defineProperty($NodeList.name, property, descriptor);
            }
            if (globalThis[type] === globalThis["Node"] || prototype instanceof Node) {
              defineProperty($NodeList.name, property, descriptor);
            }
            if (globalThis[type] === globalThis["Blob"] || prototype instanceof Blob) {
              defineProperty($FileList.name, property, descriptor);
            }
          }
        }
      }
    }
    return defineProperties;
  }
  __name(autoproperties, "autoproperties");

  // src/plugins/@events.js
  function events(kQuery) {
    kQuery.config.configure({
      customEventPrefix: "$"
    });
    Object.assign(
      kQuery,
      /** @lends KQuery.prototype */
      {
        wellknownEvents: {
          click: PointerEvent
        },
        customEvents: {}
      }
    );
    const eventDataMap = new WeakMap();
    const eachType = /* @__PURE__ */ __name(function(allowEmpty, type) {
      if (type == null) {
        if (!allowEmpty) {
          throw new Error(`Empty EventType is only allowed this context`);
        }
        return [[null, []]];
      }
      return ("" + type).trim().split(/\s+/).map((e) => e.trim().split(".")).map(([t, ...n]) => {
        if (!allowEmpty && !t.length) {
          throw new Error(`Empty EventType is only allowed this context`);
        }
        return [t, n.filter((e) => e.length)];
      });
    }, "eachType");
    const internalEventName = /* @__PURE__ */ __name(function(type) {
      if (type in kQuery.customEvents) {
        type = kQuery.config.customEventPrefix + type;
      }
      return type;
    }, "internalEventName");
    const emulateDelegationWatcher = new class {
      constructor() {
        const querySelectorThisAndAll = /* @__PURE__ */ __name(function(nodelist, selector) {
          const result = /* @__PURE__ */ new Set();
          for (const node of nodelist) {
            if (node instanceof Element) {
              if (node.matches(selector)) {
                result.add(node);
              }
              for (const child of node.querySelectorAll(selector)) {
                result.add(child);
              }
            }
          }
          return result;
        }, "querySelectorThisAndAll");
        this.nodeSelectorCallback = new WeakMap();
        this.observer = new MutationObserver((entry) => {
          for (const [node, selectorCallbacks] of this.nodeSelectorCallback.entries()) {
            for (const { selector, callbacks } of selectorCallbacks) {
              for (const child of querySelectorThisAndAll(entry.addedNodes, selector)) {
                kQuery.logger.debug(`Insert node to delegation emulation of `, node);
                callbacks.insert(child);
              }
              for (const child of querySelectorThisAndAll(entry.removedNodes, selector)) {
                kQuery.logger.debug(`Delete node to delegation emulation of `, node);
                callbacks.delete(child);
              }
            }
          }
        }, {
          attributes: false,
          attributeOldValue: false,
          characterData: false,
          characterDataOldValue: false,
          childList: true,
          subtree: true
        });
      }
      watch(node, selector, callbacks) {
        if (selector == null) {
          callbacks.insert(node);
        } else {
          this.nodeSelectorCallback.getOrSet(node, () => []).push({ selector, callbacks });
          for (const child of node.querySelectorAll(selector)) {
            kQuery.logger.debug(`Initial node to delegation emulation of `, child);
            callbacks.insert(child);
          }
          return this.observer.observe(node);
        }
      }
      unwatch(node, selector, callbacks) {
        if (selector == null) {
          callbacks.delete(node);
        } else {
          this.nodeSelectorCallback.reset(node, (selectorCallbacks) => selectorCallbacks.filter((selectorCallback) => {
            if (selectorCallback.selector === selector && selectorCallback.callbacks === callbacks) {
              kQuery.logger.debug(`Unwatch node to delegation emulation of `, node);
              return false;
            }
            return true;
          }));
        }
      }
    }();
    return {
      [[EventTarget.name, $NodeList.name]]: (
        /** @lends EventTarget.prototype */
        {
          /**
           * addEventListener
           *
           * type format:
           * - click: single event
           * - click change: multiple event
           * - click.ns: single namespace event
           *
           * delegation:
           * - specify selector argument, enable delegation(like jQuery)
           * - specify options ownself:true, trigger only matched element
           *   - default ownself:false, trigger until closest
           * - specify options once:true, trigger event per element only once
           *
           * listener(e):
           * - this: bound target
           * - e.target: triggered element always
           * - e.currentTarget: listened element always(=this)
           * - e.$delegateTarget: selector element delegation only
           *
           * misc:
           * - options is not allowed bool(useCapture). must be Object
           * - throttle: continual events dispatch interval
           * - debounce: continual events dispatch after last
           * - leading: fire at first time
           * - trailing: fire after last time
           *
           * ```
           *          | throttle | (l)throttle | (t)throttle | (lt)throttle | debounce | (l)debounce | (t)debounce | (lt)debounce |
           *  leading:|          | fire        |             | fire         |          | fire        |             | fire         |
           *      100:|          |             |             |              |          |             |             |              |
           *      200:| fire     | fire        | fire        | fire         |          |             |             |              |
           *      300:|          |             |             |              |          |             |             |              |
           *      400:| fire     | fire        | fire        | fire         |          |             |             |              |
           *      500:|          |             |             |              |          |             |             |              |
           *      600:| fire     | fire        | fire        | fire         |          |             |             |              |
           * trailing:|          |             | fire        | fire         |          |             | fire        | fire         |
           * ```
           *
           * @param {String} types
           * @param {String|Function} selector
           * @param {Function|ListenerOptions} [listener]
           * @param {ListenerOptions} [options={}]
           * @return {this}
           */
          $on(types, selector, listener, options) {
            if (typeof selector === "function") {
              options = listener;
              listener = selector;
              selector = null;
            }
            options = Object.assign({
              // standard: https://developer.mozilla.org/docs/Web/API/EventTarget/addEventListener
              ...{
                // bool
                once: void 0,
                // bool
                capture: void 0,
                // bool
                passive: void 0,
                // https://developer.mozilla.org/docs/Web/API/AbortSignal
                signal: void 0
              },
              // commons
              ...{
                // bool
                ownself: false,
                // int
                interval: void 0,
                // int
                throttle: void 0,
                // int
                debounce: void 0,
                // bool
                leading: void 0,
                // bool
                trailing: void 0
              }
              // other events...
            }, options);
            kQuery.logger.assertInstanceOf(types, String)();
            kQuery.logger.assertInstanceOf(selector, Nullable, String)();
            kQuery.logger.assertInstanceOf(listener, Function)();
            kQuery.logger.assertInstanceOf(options, Object)();
            if (selector != null && options.capture) {
              kQuery.logger.warn(`Delegation of capture phase isn't tested, so might not work well`);
            }
            if (options.throttle && !options.debounce) {
              options.leading ??= true;
              options.trailing ??= false;
            }
            if (options.debounce && !options.throttle) {
              options.leading ??= false;
              options.trailing ??= true;
            }
            for (const [type, namespaces] of eachType(false, types)) {
              const eventData = { type, namespaces, selector, listener, options, counter: new WeakMap(), collectors: [] };
              let customEvent;
              if (!(this instanceof Window) && type in kQuery.customEvents) {
                customEvent = new kQuery.customEvents[type](this, selector, options, function(target, detail = {}, options2 = {}) {
                  customEvent.bubbles = "bubbles" in options2;
                  options2.$original ??= {};
                  options2.$original.$eventId ??= customEvent.eventId;
                  options2.bubbles ??= (customEvent.selector ?? selector) != null;
                  options2.detail ??= detail;
                  target.$trigger(type, options2);
                });
                customEvent.handlers ??= {};
                customEvent.handlers.insert ??= (node) => {
                };
                customEvent.handlers.delete ??= (node) => {
                };
                emulateDelegationWatcher.watch(this, customEvent.selector ?? selector, customEvent.handlers);
                eventData.collectors.push(() => {
                  emulateDelegationWatcher.unwatch(this, customEvent.selector ?? selector, customEvent.handlers);
                  customEvent.destructor?.(this);
                });
              }
              const waitStorage = new ObjectStorage();
              const handler = /* @__PURE__ */ __name(async (e) => {
                if (e.$namespaces?.length && e.$namespaces.some((ns) => !eventData.namespaces.includes(ns))) {
                  return;
                }
                if (customEvent?.eventId !== e.$original?.$eventId) {
                  return;
                }
                const target = e.target;
                const debounce = /* @__PURE__ */ __name(async (msec, leading) => {
                  const timer = Timer.wait(msec);
                  const current = waitStorage.reset(target, "timer", () => timer);
                  if (!leading || current?.status === "pending") {
                    current?.cancel(null);
                    if (await timer === null) {
                      return false;
                    }
                    if (!options.trailing) {
                      return false;
                    }
                  }
                  return true;
                }, "debounce");
                if (options.debounce != null) {
                  if (!await debounce(options.debounce, options.leading)) {
                    return;
                  }
                }
                if (options.throttle != null) {
                  const start = waitStorage.getOrSet(target, "start", () => Date.now() - (options.leading ? options.throttle : 0));
                  if (start + options.throttle > Date.now()) {
                    if (!await debounce(options.throttle, false)) {
                      return;
                    }
                  }
                  waitStorage.set(target, "start", Date.now());
                }
                e.$abort = (reason) => eventData.abortController.abort(reason);
                if (eventData.selector == null) {
                  return eventData.listener.call(this, e);
                }
                for (let parent = target; parent && parent !== this; parent = parent.parentElement) {
                  if (parent.matches(eventData.selector) && !(options.once && eventData.counter.get(target))) {
                    if (!eventData.counter.reset(target, (count) => (count ?? 0) + 1) && options.once) {
                      customEvent?.handlers?.delete?.(target);
                    }
                    if (customEvent && !customEvent.bubbles) {
                      e.stopPropagation();
                    }
                    e.$delegateTarget = parent;
                    return eventData.listener.call(this, e);
                  }
                  if (options.ownself) {
                    break;
                  }
                }
              }, "handler");
              eventData.handler = new WeakRef(handler);
              eventDataMap.getOrSet(this, () => []).push(eventData);
              const internalOptions = eventData.selector == null ? options : Object.assign({}, options, { once: false });
              eventData.abortController = new AbortController();
              eventData.abortController.signal.addEventListener("abort", eventData.destructor);
              if (internalOptions.signal) {
                internalOptions.signal = AbortSignal.any([internalOptions.signal, eventData.abortController.signal]);
              } else {
                internalOptions.signal = eventData.abortController.signal;
              }
              this.addEventListener(internalEventName(type), handler, internalOptions);
              eventData.destructor = function() {
                kQuery.logger.debug(`Release of `, type, selector, options);
                eventData.collectors.forEach((collector) => collector());
                eventData.collectors = [];
              };
              F.objectFinalize(handler, eventData.destructor);
            }
            return this;
          },
          /**
           * removeEventListener
           *
           * all arguments are optional
           * - $off(): remove all event
           * - $off('click'): remove all click event
           * - $off('click', 'selector'): remove all click event of selector
           * - $off('click', 'selector', listener): remove same listener event of selector
           *
           * @param {String} [types]
           * @param {String|Function} [selector]
           * @param {Function|Object} [listener]
           * @param {Object} [options={}]
           * @return {this}
           */
          $off(types, selector, listener, options) {
            if (typeof selector === "function") {
              options = listener;
              listener = selector;
              selector = null;
            }
            kQuery.logger.assertInstanceOf(types, Nullable, String)();
            kQuery.logger.assertInstanceOf(selector, Nullable, String)();
            kQuery.logger.assertInstanceOf(listener, Nullable, Function)();
            kQuery.logger.assertInstanceOf(options, Nullable, Object)();
            for (const [type, namespaces] of eachType(true, types)) {
              eventDataMap.reset(this, (eventDatas) => (eventDatas ?? []).filter((eventData) => {
                if (type && type !== eventData.type) {
                  return true;
                }
                if (namespaces.length && namespaces.some((ns) => !eventData.namespaces.includes(ns))) {
                  return true;
                }
                if (selector && selector !== eventData.selector) {
                  return true;
                }
                if (listener && listener !== eventData.listener) {
                  return true;
                }
                if (options?.capture !== eventData.options.capture) {
                  return true;
                }
                this.removeEventListener(internalEventName(eventData.type), eventData.handler.deref(), eventData.options);
                eventData.destructor();
                return false;
              }));
            }
            return this;
          },
          /**
           * dispatch Event
           *
           * types allows multiple event
           *
           * some event are special treated, e.g. click is PointerEvent
           *
           * @param {String} types
           * @param {EventOptions} options={}
           * @return {Boolean}
           */
          $trigger(types, options = {}) {
            kQuery.logger.assertInstanceOf(types, String)();
            kQuery.logger.assertInstanceOf(options, Object)();
            let result = true;
            for (const [type, namespaces] of eachType(false, types)) {
              const event = kQuery.wellknownEvents[type] ?? CustomEvent;
              const eventObject = new event(internalEventName(type), Object.assign({
                bubbles: true,
                cancelable: true,
                composed: true
              }, options));
              eventObject.$namespaces = namespaces;
              const completed = this.dispatchEvent(eventObject);
              kQuery.logger.debug(`Event ${type} is ${completed ? "completed" : "canceled"}`, this, eventObject);
              result = result && completed;
            }
            return result;
          },
          /**
           * get Event data
           *
           * this method is very unsafe and changed without any notice
           * eventdata is live, changing it changes the handler itself
           *
           * @param {String} [types]
           * @param {Boolean} [ancestor]
           * @param {Boolean} [capture=false]
           * @return {{type: String, namespaces: Array, selector: String, listener: Function, options: Object}[]}
           */
          $events(types, ancestor, capture = false) {
            kQuery.logger.assertInstanceOf(types, Nullable, String)();
            kQuery.logger.assertInstanceOf(ancestor, Nullable, Boolean)();
            kQuery.logger.assertInstanceOf(capture, Boolean)();
            const result = eventDataMap.get(this) ?? [];
            if (ancestor) {
              for (let parent = this.parentNode; parent; parent = parent.parentNode) {
                for (const ev of eventDataMap.get(parent) ?? []) {
                  if (ev.selector != null && this.matches(ev.selector)) {
                    if (!(ev.options.once && ev.counter.get(this))) {
                      result.push(ev);
                    }
                  }
                }
              }
            }
            return result.filter((ev) => {
              if (!ev.handler.deref()) {
                return false;
              }
              for (const [type, namespaces] of eachType(true, types)) {
                if (type && type !== ev.type) {
                  return false;
                }
                if (namespaces.length && namespaces.some((ns) => !ev.namespaces.includes(ns))) {
                  return false;
                }
              }
              if (capture !== (ev.options.capture ?? false)) {
                return false;
              }
              return true;
            });
          }
        }
      )
    };
  }
  __name(events, "events");

  // index-core.js
  var instance = new KQuery(document.currentScript);
  instance.logger.time("register Plugins");
  instance.extends(autoproperties);
  instance.extends(events);
  instance.logger.timeEnd("register Plugins");
  var index_core_default = instance;
})();
/**!
 * kQuery
 *
 * @file
 * @license MIT
 * @copyright ryunosuke
 * @ignore
 */
//# sourceMappingURL=kQuery-core.js.map
