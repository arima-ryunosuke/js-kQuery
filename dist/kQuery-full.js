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
    $FileList: () => $FileList,
    $NodeList: () => $NodeList,
    AsyncFunction: () => AsyncFunction,
    AsyncGeneratorFunction: () => AsyncGeneratorFunction,
    Collection: () => Collection,
    Configuration: () => Configuration,
    CookieObserver: () => CookieObserver,
    CustomEvent: () => CustomEvent,
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
  var Nullable = /* @__PURE__ */ __name(function Nullable2() {
  }, "Nullable");
  var AsyncFunction = (async () => {
  }).constructor;
  var GeneratorFunction = function* () {
  }.constructor;
  var AsyncGeneratorFunction = async function* () {
  }.constructor;
  var $NodeList = /* @__PURE__ */ __name(function() {
    return [NodeList.name, HTMLCollection.name];
  }, "$NodeList");
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
      for (const [name, data2] of F.objectToEntries(object)) {
        const fullname = F.stringToKebabCase(prefix ? `${prefix}-${name}` : name);
        if (F.objectIsPlain(data2) || data2 instanceof Array) {
          for (const [name2, data22] of F.objectToEntries(F.objectToDataset(data2, fullname))) {
            result[name2] = data22;
          }
          if (data2 instanceof Array) {
            result[fullname + "-length"] = data2.length;
          }
        } else {
          result[fullname] = data2;
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
          const callback = typeof arg === "function" ? arg : null;
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
    async fetch(url, options = {}) {
      if (options.timeout) {
        const ctrl = new AbortController();
        setTimeout(() => ctrl.abort(), options.timeout);
        if (options.signal) {
          options.signal = AbortSignal.any([options.signal, ctrl.signal]);
        } else {
          options.signal = ctrl.signal;
        }
        delete options.timeout;
      }
      const response = await GT.fetch(url, options);
      if (!(options.ok ?? false) && !response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`, {
          cause: response
        });
      }
      return response;
    }
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
      if (Nullable === prototype && value == null) {
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
      this.assert = !debug ? noop2 : (actual, ...others) => {
        if (actual instanceof Function) {
          others.unshift("" + actual);
          actual = actual();
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
    static #concurrency(asyncs, throwable, concurrency = null) {
      Logger.instance.assertElementsInstanceOf(asyncs, Function, AsyncFunction)();
      concurrency ??= window.navigator.hardwareConcurrency;
      const keys = F.objectToEntries(asyncs).map(([k]) => k);
      let index = 0;
      const result = asyncs instanceof Array ? new Array(asyncs.length) : {};
      const execute = /* @__PURE__ */ __name(async function(key) {
        index++;
        try {
          result[key] = await asyncs[key](key);
        } catch (e) {
          if (throwable) {
            throw e;
          } else {
            result[key] = e;
          }
        }
        const next = keys[index];
        if (next && asyncs[next] != null) {
          return execute(next);
        }
      }, "execute");
      const promises = [];
      for (const key of keys.slice(0, concurrency)) {
        promises.push(execute(key));
      }
      return [promises, result];
    }
    static async concurrencyAll(asyncs, concurrency = null) {
      const [promises, result] = _Promise.#concurrency(asyncs, true, concurrency);
      await _Promise.all(promises);
      return result;
    }
    static async concurrencyAllSettled(asyncs, concurrency = null) {
      const [promises, result] = _Promise.#concurrency(asyncs, false, concurrency);
      await _Promise.allSettled(promises);
      return result;
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
      Logger.instance.assert(this.id === null, `Timer is started, please use restart`)();
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

  // src/events/attribute.js
  var attribute_default = class {
    static {
      __name(this, "default");
    }
    static observers = {};
    constructor(target, selector, options, trigger) {
      if (options.attributeName) {
        options.attributeFilter = F.objectIsArrayLike(options.attributeName) ? options.attributeName : [options.attributeName];
      }
      options = Object.assign(options, {
        attributes: true,
        attributeOldValue: true
      });
      this.eventId = MutationObserver.getOptionsKey(options);
      this.observer = this.constructor.observers[this.eventId] ??= new MutationObserver((entry, last) => {
        trigger(entry.target, {
          subtype: entry.attributeName,
          oldValue: entry.oldValue,
          newValue: entry.target.getAttribute(entry.attributeName)
        }, {
          $original: {
            observer: this.observer,
            entry
          }
        });
      }, options);
      this.handlers = {
        insert: /* @__PURE__ */ __name((node) => this.observer.observe(node), "insert"),
        delete: /* @__PURE__ */ __name((node) => this.observer.unobserve(node), "delete")
      };
    }
  };

  // src/events/child.js
  var child_default = class {
    static {
      __name(this, "default");
    }
    static observers = {};
    constructor(target, selector, options, trigger) {
      const withAttributes = options.attributes;
      options = Object.assign(options, {
        childList: true,
        attributes: false
      });
      this.eventId = MutationObserver.getOptionsKey(options);
      this.observer = this.constructor.observers[this.eventId] ??= new MutationObserver((entry, last) => {
        for (const child of entry.addedNodes) {
          if (!(child instanceof Element)) {
            continue;
          }
          trigger(entry.target, {
            subtype: "insert",
            node: child
          }, {
            $original: {
              observer: this.observer,
              entry
            }
          });
          this.constructor.observers["attribute" + this.eventId]?.observe?.(child);
        }
        for (const child of entry.removedNodes) {
          if (!(child instanceof Element)) {
            continue;
          }
          trigger(entry.target, {
            subtype: "remove",
            node: child
          }, {
            $original: {
              observer: this.observer,
              entry
            }
          });
          this.constructor.observers["attribute" + this.eventId]?.unobserve?.(child);
        }
      }, options);
      if (withAttributes) {
        this.attributer = this.constructor.observers["attribute" + this.eventId] ??= new MutationObserver((entry, last) => {
          trigger(entry.target.parentElement, {
            subtype: "change",
            node: entry.target,
            name: entry.attributeName,
            oldValue: entry.oldValue,
            newValue: entry.target.getAttribute(entry.attributeName)
          }, {
            $original: {
              observer: this.attributer,
              entry
            }
          });
        }, {
          subtree: options.subtree,
          childList: false,
          attributes: true,
          attributeOldValue: true
        });
      }
      this.handlers = {
        insert: /* @__PURE__ */ __name((node) => this.observer.observe(node), "insert"),
        delete: /* @__PURE__ */ __name((node) => this.observer.unobserve(node), "delete")
      };
    }
  };

  // src/events/cookie.js
  var cookie_default = class {
    static {
      __name(this, "default");
    }
    static observers = {};
    constructor(target, selector, options, trigger) {
      this.eventId = CookieObserver.getOptionsKey(options);
      this.observer = this.constructor.observers[this.eventId] ??= new CookieObserver((entry, last) => {
        trigger(entry.target, {
          subtype: entry.cookieName,
          oldValue: entry.oldValue,
          newValue: entry.newValue
        }, {
          $original: {
            observer: this.observer,
            entry
          },
          bubbles: false,
          cancelable: false,
          composed: false
        });
      }, options);
      this.observer.observe(target);
    }
    destructor(target) {
      this.observer.unobserve(target);
    }
  };

  // src/events/disable.js
  var disable_default = class {
    static {
      __name(this, "default");
    }
    static observers = {};
    constructor(target, selector, options, trigger) {
      options = Object.assign(options, {
        attributes: true,
        attributeOldValue: true,
        attributeFilter: ["disabled"]
      });
      this.eventId = MutationObserver.getOptionsKey(options);
      this.selector = selector ? `${selector}, fieldset` : null;
      this.observer = this.constructor.observers[selector + this.eventId] ??= new MutationObserver((entry, last) => {
        const trigger2 = /* @__PURE__ */ __name((target2) => {
          const valuer = /* @__PURE__ */ __name(function(target3, withSelf) {
            for (let node = target3; node != null; node = node.parentElement) {
              if (withSelf && node === entry.target) {
                if (entry.oldValue != null) {
                  return true;
                }
              } else if (node.disabled) {
                return true;
              }
            }
            return false;
          }, "valuer");
          const oldValue = valuer(target2, true);
          const newValue = valuer(target2, false);
          if (oldValue !== newValue) {
            trigger(target2, {
              subtype: oldValue ? "enable" : "disable",
              oldValue,
              newValue
            }, {
              $original: {
                observer: this.observer,
                entry
              }
            });
          }
        }, "trigger2");
        if (!selector || entry.target.matches(selector)) {
          trigger2(entry.target);
        }
        if (selector) {
          entry.target.querySelectorAll(selector).forEach((node) => trigger2(node));
        }
      }, options);
      this.handlers = {
        insert: /* @__PURE__ */ __name((node) => this.observer.observe(node), "insert"),
        delete: /* @__PURE__ */ __name((node) => this.observer.unobserve(node), "delete")
      };
    }
  };

  // src/events/flick.js
  var flick_default = class {
    static {
      __name(this, "default");
    }
    constructor(target, selector, options, trigger) {
      options.buttons ??= 1;
      this.starting = false;
      this.vectors = [];
      this.down = (e) => {
        e.target.setPointerCapture(e.pointerId);
        this.starting = true;
        this.vectors.splice(0);
      };
      this.move = (e) => {
        if (e.buttons & options.buttons && this.starting) {
          this.vectors.push(new Vector2(e.offsetX, e.offsetY, e.timeStamp));
        }
      };
      this.up = (e) => {
        e.target.releasePointerCapture(e.pointerId);
        if (this.starting) {
          this.starting = false;
          if (this.vectors.length === 0) {
            return;
          }
          const threshold = options.threshold ?? 50;
          const currentVenctor = new Vector2(e.offsetX, e.offsetY, e.timeStamp);
          const startIndex = 1 + this.vectors.findLastIndex((v) => v.during(currentVenctor) > threshold);
          const firstVector = this.vectors[startIndex];
          const vectors = this.vectors.slice(startIndex);
          const distance = vectors.slice(0, -1).reduce((acc, v, i) => acc + vectors[i].distance(vectors[i + 1]), 0);
          if (distance === 0) {
            return;
          }
          this.vectors.splice(0);
          trigger(e.target, {
            velocity: distance / firstVector.during(currentVenctor),
            degree: firstVector.degree(currentVenctor),
            during: firstVector.during(currentVenctor)
          }, { $original: e, bubbles: true });
        }
      };
      this.cancel = (e) => {
        e.target.releasePointerCapture(e.pointerId);
        this.starting = false;
        this.vectors.splice(0);
      };
      target.addEventListener("pointerdown", this.down);
      target.addEventListener("pointercancel", this.cancel);
      target.addEventListener("pointermove", this.move);
      target.addEventListener("pointerup", this.up);
    }
    destructor(target) {
      target.removeEventListener("pointerdown", this.down);
      target.removeEventListener("pointercancel", this.cancel);
      target.removeEventListener("pointermove", this.move);
      target.removeEventListener("pointerup", this.up);
    }
  };

  // src/events/intersect.js
  var intersect_default = class {
    static {
      __name(this, "default");
    }
    static observers = {};
    constructor(target, selector, options, trigger) {
      options.first ??= true;
      this.eventId = IntersectionObserver.getOptionsKey(options);
      this.observer = this.constructor.observers[this.eventId] ??= new IntersectionObserver((entry, last) => {
        if (options.first || last) {
          const subtype = last ? !last.isIntersecting && entry.isIntersecting ? "enter" : last.isIntersecting && !entry.isIntersecting ? "leave" : "hover" : null;
          trigger(entry.target, {
            subtype,
            oldValue: last?.realIntersectionRatio ?? null,
            newValue: entry.realIntersectionRatio
          }, {
            $original: {
              observer: this.observer,
              entry
            }
          });
        }
      }, options);
      this.handlers = {
        insert: /* @__PURE__ */ __name((node) => this.observer.observe(node), "insert"),
        delete: /* @__PURE__ */ __name((node) => this.observer.unobserve(node), "delete")
      };
    }
  };

  // src/events/resize.js
  var resize_default = class {
    static {
      __name(this, "default");
    }
    static observers = {};
    constructor(target, selector, options, trigger) {
      options.first ??= true;
      this.eventId = ResizeObserver.getOptionsKey(options);
      this.observer = this.constructor.observers[this.eventId] ??= new ResizeObserver((entry, last) => {
        if (options.first || last) {
          const optionsBoxPascalCaseSize = F.stringToPascalCase(options.box ?? "content-box", "-") + "Size";
          trigger(entry.target, {
            subtype: options.box ?? "content-box",
            // in most use cases, what is needed is [0]
            oldValue: last == null ? null : last[optionsBoxPascalCaseSize][0],
            newValue: entry[optionsBoxPascalCaseSize][0]
          }, {
            $original: {
              observer: this.observer,
              entry
            }
          });
        }
      }, options);
      this.handlers = {
        insert: /* @__PURE__ */ __name((node) => this.observer.observe(node), "insert"),
        delete: /* @__PURE__ */ __name((node) => this.observer.unobserve(node), "delete")
      };
    }
  };

  // src/events/swipe.js
  var swipe_default = class {
    static {
      __name(this, "default");
    }
    constructor(target, selector, options, trigger) {
      options.buttons ??= 1;
      this.firstVector = null;
      this.down = (e) => {
        e.target.setPointerCapture(e.pointerId);
        this.firstVector = new Vector2(e.offsetX, e.offsetY, e.timeStamp);
      };
      this.move = (e) => {
        if (e.buttons & options.buttons && this.firstVector) {
          const currentVector = new Vector2(e.offsetX, e.offsetY, e.timeStamp);
          const distance = this.firstVector.distance(currentVector);
          if (distance !== 0) {
            trigger(e.target, {
              distance,
              deltaX: this.firstVector.deltaX(currentVector),
              deltaY: this.firstVector.deltaY(currentVector),
              velocity: this.firstVector.velocity(currentVector),
              degree: this.firstVector.degree(currentVector),
              during: this.firstVector.during(currentVector)
            }, { $original: e, bubbles: true });
          }
        }
      };
      this.up = (e) => {
        e.target.releasePointerCapture(e.pointerId);
        this.firstVector = null;
      };
      this.cancel = (e) => {
        e.target.releasePointerCapture(e.pointerId);
        this.firstVector = null;
      };
      target.addEventListener("pointerdown", this.down);
      target.addEventListener("pointermove", this.move);
      target.addEventListener("pointerup", this.up);
      target.addEventListener("pointercancel", this.cancel);
    }
    destructor(target) {
      target.removeEventListener("pointerdown", this.down);
      target.removeEventListener("pointermove", this.move);
      target.removeEventListener("pointerup", this.up);
      target.removeEventListener("pointercancel", this.cancel);
    }
  };

  // src/events/visible.js
  var visible_default = class {
    static {
      __name(this, "default");
    }
    static observers = {};
    constructor(target, selector, options, trigger) {
      options.first ??= true;
      this.eventId = ResizeObserver.getOptionsKey(options);
      this.observer = this.constructor.observers[this.eventId] ??= new ResizeObserver((entry, last) => {
        const visible = entry.contentRect.x > 0 || entry.contentRect.y > 0 || entry.contentRect.width > 0 || entry.contentRect.height > 0;
        if (options.first || last) {
          if (visible !== last?.visible) {
            trigger(entry.target, {
              subtype: "content-visibility",
              // if found better way, support also opacity, visibility, etc
              oldValue: last == null ? null : !visible,
              newValue: visible
            }, {
              $original: {
                observer: this.observer,
                entry
              }
            });
          }
        }
      }, options);
      this.handlers = {
        insert: /* @__PURE__ */ __name((node) => this.observer.observe(node), "insert"),
        delete: /* @__PURE__ */ __name((node) => this.observer.unobserve(node), "delete")
      };
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
    return {
      [[EventTarget.name, $NodeList.name]]: function() {
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
        return (
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
             * @param {Function|Object} [listener]
             * @param {Object} [options={}]
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
                  if (eventData.selector == null) {
                    return eventData.listener.call(this, e);
                  }
                  for (let parent = target; parent && parent !== this; parent = parent.parentNode) {
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
             * @param {Object} options={}
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
        );
      }()
    };
  }
  __name(events, "events");

  // src/plugins/attributes.js
  function attributes(kQuery) {
    return {
      [[Element.name, $NodeList.name]]: function() {
        const nodeStorage = new ObjectStorage();
        class ProxyProperty {
          static {
            __name(this, "ProxyProperty");
          }
          static NotImplemented = Symbol("NotImplemented");
          constructor(node, name) {
            this.node = node;
            this.name = name;
            this.object = node[name];
          }
          has(target, property) {
            return this._hasValue(property);
          }
          _hasValue(property) {
            return Reflect.has(this.object, property);
          }
          get(target, property) {
            if (property === Symbol.toPrimitive || property === "toString") {
              return () => this._getString();
            }
            if (property.charAt(0) === "$") {
              const $value = this._get$Value(property.substring(1));
              if ($value !== ProxyProperty.NotImplemented) {
                return $value;
              }
            }
            const base = Reflect.get(this.object, property);
            if (typeof base === "function") {
              return this._getFunction(property, base);
            }
            return this._getValue(property, base);
          }
          _getString() {
          }
          _get$Value(property) {
            return ProxyProperty.NotImplemented;
          }
          _getFunction(property, value) {
            const method = /* @__PURE__ */ __name((...args) => {
              const result = F.functionToCallbackable(value, this.node, this.node, method.i).call(this.object, ...args);
              return result === void 0 ? nodeStorage.get(this.node, this.name) : result;
            }, "method");
            return method;
          }
          _getValue(property, value) {
            return value;
          }
          set(target, property, value) {
            if (typeof value === "function") {
              value = this._setFunction(property, value);
            }
            this._setValue(property, value);
            return true;
          }
          _setFunction(property, value) {
            return value.call(this.object, this.node);
          }
          _setValue(property, value) {
            if (value === void 0) {
              return;
            }
            this.apply(null, null, [{ [property]: value }]);
          }
          deleteProperty(target, property) {
            const value = Reflect.get(this.object, property);
            this._deleteValue(property, value);
            return true;
          }
          _deleteValue(property, value) {
            Reflect.deleteProperty(this.object, property);
          }
          apply(target, thisArg, argArray) {
            if (argArray[0] instanceof Array || F.objectIsPlain(argArray[0])) {
              this._applySet(...argArray);
              return nodeStorage.get(this.node, this.name);
            } else {
              return this._applyGet(...argArray);
            }
          }
          _applyGet(...args) {
          }
          _applySet(...args) {
          }
        }
        return (
          /** @lends Element.prototype */
          {
            /**
             * simple accessor to NamedNodeMap(attribute)
             *
             * @descriptor get
             *
             * @return {Object|Function}
             *
             * @example
             * $$('input').$attrs.name;             // getter
             * $$('input').$attrs.name = 'value';   // setter
             * $$('input').$attrs({name: 'value'}); // mass setting(keep other)
             * $$('input').$attrs();                // get all key-value object
             *
             * @example
             * // false is delete that attribute
             * $$('input').$attrs.name = false;
             * $$('input').$attrs({name: false});
             *
             * @example
             * // $prefix means inherited attribute
             * $$('input').$attrs.$disabled; // returns true if the parent is disabled even if itself none
             */
            get $attrs() {
              return nodeStorage.getOrSet(this, "attributes", (node, name) => new Proxy2(/* @__PURE__ */ __name(function $Attrs() {
              }, "$Attrs"), new class extends ProxyProperty {
                _getString() {
                  return Object.values(node.attributes).map((attr) => `${F.stringEscape(attr.name, "attr-name")}="${F.stringEscape(attr.value, "attr-value")}"`).join(" ");
                }
                _get$Value(property) {
                  return node.closest(`[${F.stringEscape(property, "css")}]`)?.getAttribute(property) ?? null;
                }
                _getValue(property, value) {
                  return value?.value;
                }
                _deleteValue(property, value) {
                  node.removeAttribute(property);
                }
                _applyGet() {
                  return Object.fromEntries(Array.from(node.attributes, (attr) => [attr.name, attr.value]));
                }
                _applySet(object) {
                  const normalizedAttributes = F.objectToAttributes(object);
                  for (const [name2, value] of Object.entries(normalizedAttributes)) {
                    if (typeof value === "boolean") {
                      node.toggleAttribute(name2, value);
                    } else {
                      node.setAttribute(name2, value);
                    }
                  }
                }
              }(node, name)));
            },
            /**
             * mass assign NamedNodeMap(attribute)
             *
             * @descriptor set
             *
             * @param {Object} value
             *
             * @example
             * $$('input').$attrs = {name: 'value'};                // mass assign(delete other)
             * $$('input').$attrs = (node, i) => ({name: 'value'}); // mass assign by callback(delete other)
             */
            set $attrs(value) {
              kQuery.logger.assertInstanceOf(value, Nullable, Object)();
              if (value == null) {
                return;
              }
              for (const attr of Object.values(this.attributes)) {
                this.attributes.removeNamedItem(attr.name);
              }
              this.$attrs(value);
            },
            /**
             * simple accessor to DOMStringMap(dataset)
             *
             * @descriptor get
             *
             * @return {Object|Function}
             *
             * @example
             * $$('input').$data.name;             // getter
             * $$('input').$data.name = 'value';   // setter
             * $$('input').$data({name: 'value'}); // mass setting(keep other)
             * $$('input').$data();                // get all key-value object
             * $$('input').$data('prefix');        // get structured object
             *
             * @example
             * // $prefix means objective data
             * $$('input').$data.$hoge; // returns Object starting with hoge
             */
            get $data() {
              return nodeStorage.getOrSet(this, "dataset", (node, name) => new Proxy2(/* @__PURE__ */ __name(function $Data() {
              }, "$Data"), new class extends ProxyProperty {
                _getString() {
                  return JSON.stringify(this.apply(null, null, [""]));
                }
                _get$Value(property) {
                  return this._applyGet(property);
                }
                _applyGet(property) {
                  const result = {};
                  for (const [name2, data2] of Object.entries(node.dataset)) {
                    result[name2] = data2;
                  }
                  if (typeof property !== "string") {
                    return result;
                  }
                  const targetPrefix = F.stringToKebabCase(property);
                  const regex = new RegExp(targetPrefix ? `^${property}[A-Z]` : `.*`);
                  const member = {};
                  for (const [name2, data2] of Object.entries(result)) {
                    if (regex.test(name2)) {
                      member[F.stringToKebabCase(name2)] = data2;
                    }
                  }
                  const entries = Object.entries(member).map(([name2, value]) => [name2.split("-"), value]);
                  const object = F.entriesToObject(entries, true);
                  return targetPrefix ? targetPrefix.split("-").reduce((target, key) => target?.[key], object) ?? {} : object;
                }
                _applySet(object) {
                  for (const [name2, data2] of Object.entries(F.objectToDataset(object))) {
                    node.dataset[F.stringToPascalCase(name2)] = data2;
                  }
                }
              }(node, name)));
            },
            /**
             * mass assign DOMStringMap(dataset)
             *
             * @descriptor set
             *
             * @param {Object} value
             *
             * @example
             * $$('input').$data = {name: 'value'};                // mass assign(delete other)
             * $$('input').$data = (node, i) => ({name: 'value'}); // mass assign by callback(delete other)
             */
            set $data(value) {
              kQuery.logger.assertInstanceOf(value, Nullable, Object)();
              if (value == null) {
                return;
              }
              for (const name of Object.keys(this.dataset)) {
                delete this.dataset[name];
              }
              this.$data(value);
            },
            /**
             * simple accessor to CSSStyleDeclaration(style)
             *
             * @descriptor get
             *
             * @return {Object|Function}
             *
             * @example
             * $$('input').$style.color;             // getter
             * $$('input').$style.color = 'value';   // setter
             * $$('input').$style({color: 'value'}); // mass setting(keep other)
             * $$('input').$style();                 // get all key-value object
             * $$('input').$style(true);             // get all key-value object with important
             *
             * @example
             * // $prefix means computed style
             * $$('input').$style.$;                // returns computed style
             * $$('input').$style.$color;           // returns computed style's color
             * $$('input').$style['$color::after']; // returns computed style's pseudo color
             */
            get $style() {
              return nodeStorage.getOrSet(this, "style", (node, name) => new Proxy2(/* @__PURE__ */ __name(function $Style() {
              }, "$Style"), new class extends ProxyProperty {
                _hasValue(property) {
                  return !!Reflect.get(node.style, property);
                }
                _getString() {
                  return node.style.cssText;
                }
                _get$Value(property) {
                  let [name2, pseudo] = property.split("::");
                  pseudo = pseudo ? `::${pseudo}` : null;
                  const cstyle = node.$window.getComputedStyle(node, pseudo);
                  if (!name2.length) {
                    return cstyle;
                  }
                  return cstyle.getPropertyValue(F.stringToKebabCase(name2));
                }
                _getValue(property, value) {
                  if (property.startsWith("--")) {
                    return node.style.getPropertyValue(F.stringToKebabCase(property));
                  }
                  return value || value === void 0 ? value : null;
                }
                _deleteValue(property, value) {
                  node.style.removeProperty(F.stringToKebabCase(property));
                }
                _applyGet(priority) {
                  const result = {};
                  for (let i = 0; true; i++) {
                    const name2 = node.style[i];
                    if (!name2) {
                      break;
                    }
                    if (priority === true) {
                      const priority2 = node.style.getPropertyPriority(name2);
                      result[name2] = node.style.getPropertyValue(name2) + (priority2 ? `!${priority2}` : "");
                    } else {
                      result[name2] = node.style.getPropertyValue(name2);
                    }
                  }
                  return result;
                }
                _applySet(object) {
                  for (const [name2, style] of F.objectToEntries(object)) {
                    const strstyle = "" + style;
                    const rawstyle = strstyle.replace(/!important$/, "");
                    node.style.setProperty(F.stringToKebabCase(name2), rawstyle, strstyle === rawstyle ? "" : "important");
                  }
                }
              }(node, name)));
            },
            /**
             * mass assign CSSStyleDeclaration(style)
             *
             * @descriptor set
             *
             * @param {Object} value
             *
             * @example
             * $$('input').$style = {color: 'value'};                // mass assign(delete other)
             * $$('input').$style = (node, i) => ({color: 'value'}); // mass assign by callback(delete other)
             */
            set $style(value) {
              kQuery.logger.assertInstanceOf(value, Nullable, Object)();
              if (value == null) {
                return;
              }
              this.setAttribute("style", "");
              this.$style(value);
            },
            /**
             * simple accessor to DOMTokenList(classList)
             *
             * @descriptor get
             *
             * @return {Object|Function}
             *
             * @example
             * $$('input').$class.name;             // getter(always boolean)
             * $$('input').$class.name = 'flag';    // setter(cast to boolean)
             * $$('input').$class({name: 'flag'});  // mass setting(keep other)
             * $$('input').$class();                // get all keys array
             *
             * @example
             * // object|array is treated like vue.js
             * $$('input').$class({name: false});
             * $$('input').$class([{name: false}, 'other']);
             */
            get $class() {
              return nodeStorage.getOrSet(this, "classList", (node, name) => new Proxy2(/* @__PURE__ */ __name(function $Class() {
              }, "$Class"), new class extends ProxyProperty {
                _hasValue(property) {
                  return node.classList.contains(property);
                }
                _getString() {
                  return node.classList.value;
                }
                _getValue(property, value) {
                  return node.classList.contains(property);
                }
                _deleteValue(property, value) {
                  node.classList.remove(property);
                }
                _applyGet() {
                  return [...node.classList.values()];
                }
                _applySet(object) {
                  for (const [token, flag] of F.objectToEntries(F.objectToClasses(object))) {
                    node.classList.toggle(token, flag);
                  }
                }
              }(node, name)));
            },
            /**
             * mass assign DOMTokenList(classList)
             *
             * @descriptor set
             *
             * @param {Object|Array} value
             *
             * @example
             * $$('input').$class = {name: 'flag'};                // mass assign(delete other)
             * $$('input').$class = (node, i) => ({name: 'flag'}); // mass assign by callback(delete other)
             */
            set $class(value) {
              kQuery.logger.assertInstanceOf(value, Nullable, String, Object, Array)();
              if (value == null) {
                return;
              }
              this.classList.value = "";
              this.$class(value);
            }
          }
        );
      }()
    };
  }
  __name(attributes, "attributes");

  // src/plugins/data.js
  function data(kQuery) {
    return {
      [[Node.name, $NodeList.name]]: function() {
        const nodeBag = new WeakMap();
        return (
          /** @lends Node.prototype */
          {
            /**
             * get Bag for anything
             *
             * @descriptor get
             *
             * @example
             * $('input').$bag.hoge;             // getter
             * $('input').$bag.hoge = 'value';   // setter
             * $('input').$bag({hoge: 'value'}); // mass setting(keep other)
             * $('input').$bag();                // get all key-value object
             */
            get $bag() {
              const bag = {};
              return nodeBag.getOrSet(this, () => new Proxy2(/* @__PURE__ */ __name(function $Bag() {
              }, "$Bag"), {
                has(target, property) {
                  return Reflect.has(bag, property);
                },
                get(target, property) {
                  if (property === Symbol.toPrimitive || property === "toString") {
                    return () => JSON.stringify(bag);
                  }
                  return Reflect.get(bag, property);
                },
                set(target, property, value) {
                  Reflect.set(bag, property, value);
                  return true;
                },
                deleteProperty(target, property) {
                  Reflect.deleteProperty(bag, property);
                  return true;
                },
                apply(target, thisArg, argArray) {
                  if (F.objectIsPlain(argArray[0])) {
                    Object.assign(bag, argArray[0]);
                  }
                  return bag;
                }
              }));
            },
            /**
             * mass assign $bag
             *
             * @descriptor set
             *
             * @param {Object} value
             *
             * @example
             * $('input').$bag = {hoge: 'value'};                // mass assign(delete other)
             * $('input').$bag = (node, i) => ({hoge: 'value'}); // mass assign by callback(delete other)
             */
            set $bag(value) {
              kQuery.logger.assertInstanceOf(value, Nullable, Object)();
              if (value == null) {
                return;
              }
              const $bag = this.$bag;
              for (const key of Object.keys($bag())) {
                delete $bag[key];
              }
              $bag(value);
            }
          }
        );
      }(),
      [[HTMLStyleElement.name, HTMLLinkElement.name, $NodeList.name]]: (
        /** @lends HTMLStylableElement.prototype */
        {
          /**
           * get contents as text
           *
           * - premised stylesheet
           * - should have href
           * - if href requires CORS
           *
           * @param {Boolean} [resolveUrl=true]
           * @return {Promise<String>}
           */
          async $contents(resolveUrl = true) {
            let contents;
            if (this instanceof HTMLLinkElement) {
              contents = await (await F.fetch(this.href)).text();
            } else {
              contents = this.textContent;
            }
            if (resolveUrl) {
              const regex = /url\(((['"])?.+?\2?)\)/g;
              const normalize = /* @__PURE__ */ __name((url) => {
                url = F.stringUnquote(url, "css-url");
                if (url.charAt(0) === "#") {
                  return null;
                }
                return new URL(url, this.href);
              }, "normalize");
              const requests = {};
              for (const [, url] of contents.matchAll(regex)) {
                const fullurl = normalize(url);
                if (fullurl) {
                  requests[fullurl] ??= async (fullurl2) => {
                    const response = await F.fetch(fullurl2).catch((v) => ({ ok: false }));
                    if (!response.ok) {
                      return null;
                    }
                    return (await response.blob()).$dataURL();
                  };
                }
              }
              const responses = await Promise2.concurrencyAll(requests, 6);
              contents = contents.replace(regex, (m0, url) => {
                const fullurl = normalize(url);
                if (fullurl && responses[fullurl]) {
                  return "url(" + F.stringQuote(responses[fullurl] + fullurl.hash, "css-url") + ")";
                }
                return m0;
              });
            }
            return contents;
          }
        }
      ),
      [[HTMLScriptElement.name, $NodeList.name]]: (
        /** @lends HTMLScriptElement.prototype */
        {
          /**
           * get contents as text
           *
           * - should have src
           * - if src requires CORS
           *
           * @return {Promise<String>}
           */
          async $contents() {
            let contents;
            if (this.src) {
              contents = await (await F.fetch(this.src)).text();
            } else {
              contents = this.textContent;
            }
            return contents;
          }
        }
      ),
      [[HTMLImageElement.name, $NodeList.name]]: (
        /** @lends HTMLImageElement.prototype */
        {
          /**
           * create URL based on this src
           *
           * @descriptor get
           *
           * @return {URL}
           */
          get $URL() {
            return new URL(this.src, this.baseURI);
          },
          /**
           * set src by URL
           *
           * @descriptor set
           *
           * @param {URL} url
           */
          set $URL(url) {
            this.src = url;
          },
          /**
           * get contents as file
           *
           * - must have src
           * - requires CORS
           *
           * @return {Promise<File>}
           */
          async $contents() {
            const url = new URL(this.currentSrc, this.baseURI);
            const response = await F.fetch(url);
            const blob = await response.blob();
            return new File([blob], url.pathname.split("/").at(-1) ?? this.currentSrc, {
              type: blob.type,
              ...response.headers.has("last-modified") ? {
                lastModified: new Date(response.headers.get("last-modified")).getTime()
              } : {}
            });
          },
          /**
           * convert to dataURL
           *
           * @param {?String} [mimetype]
           * @param {?Number} [quality]
           * @return {Promise<String>}
           */
          async $dataURL(mimetype, quality) {
            kQuery.logger.assertInstanceOf(mimetype, Nullable, String)();
            kQuery.logger.assertInstanceOf(quality, Nullable, Number)();
            return new Promise2((resolve) => {
              const canvas = this.$document.createElement("canvas");
              canvas.width = this.width;
              canvas.height = this.height;
              canvas.getContext("2d").drawImage(this, 0, 0);
              resolve(canvas.toDataURL(mimetype, quality));
            });
          },
          /**
           * convert to Blob
           *
           * @param {?String} [mimetype]
           * @param {?Number} [quality]
           * @return {Promise<Blob>}
           */
          async $blob(mimetype, quality) {
            kQuery.logger.assertInstanceOf(mimetype, Nullable, String)();
            kQuery.logger.assertInstanceOf(quality, Nullable, Number)();
            return new Promise2((resolve) => {
              const canvas = this.$document.createElement("canvas");
              canvas.width = this.width;
              canvas.height = this.height;
              canvas.getContext("2d").drawImage(this, 0, 0);
              canvas.toBlob(resolve, mimetype, quality);
            });
          },
          /**
           * convert to File
           *
           * @param {?String} [mimetype]
           * @param {?Number} [quality]
           * @return {Promise<File>}
           */
          async $file(mimetype, quality) {
            kQuery.logger.assertInstanceOf(mimetype, Nullable, String)();
            kQuery.logger.assertInstanceOf(quality, Nullable, Number)();
            const url = new URL(this.currentSrc, this.baseURI);
            return new File([await this.$blob(mimetype, quality)], url.pathname.split("/").at(-1) ?? this.currentSrc, {
              type: mimetype
            });
          }
        }
      ),
      [[HTMLAnchorElement.name, $NodeList.name]]: (
        /** @lends HTMLAnchorElement.prototype */
        {
          /**
           * create URL based on this href
           *
           * @descriptor get
           *
           * @return {URL}
           */
          get $URL() {
            return new URL(this.href, this.baseURI);
          },
          /**
           * set href by URL
           *
           * @descriptor set
           *
           * @param {URL} url
           */
          set $URL(url) {
            this.href = url;
          }
        }
      ),
      [[HTMLFormElement.name, $NodeList.name]]: (
        /** @lends HTMLFormElement.prototype */
        {
          /**
           * create URL based on this action
           *
           * @descriptor get
           *
           * @return {URL}
           */
          get $URL() {
            return new URL(this.action, this.baseURI);
          },
          /**
           * set action by URL
           *
           * @descriptor set
           *
           * @param {URL} url
           */
          set $URL(url) {
            this.action = url;
          }
        }
      ),
      [[Blob.name, $FileList.name]]: (
        /** @lends Blob.prototype */
        {
          /**
           * download as file
           *
           * @param {?String} [filename]
           */
          $download(filename) {
            kQuery.logger.assertInstanceOf(filename, Nullable, String)();
            filename ??= this.name ?? "";
            const url = URL.createObjectURL(this);
            const a = document.$createElement("a", {
              href: url,
              download: filename
            });
            a.click();
            setTimeout(function() {
              URL.revokeObjectURL(url);
            }, 1e3);
          },
          /**
           * read as text
           *
           * @param {?String} [encoding]
           * @return {Promise<String>}
           */
          async $text(encoding) {
            kQuery.logger.assertInstanceOf(encoding, Nullable, String)();
            const textDecoder = new TextDecoder(encoding);
            return textDecoder.decode(await this.arrayBuffer());
          },
          /**
           * read as base64
           *
           * @return {Promise<String>}
           */
          async $base64() {
            const dataURL = await this.$dataURL();
            return dataURL.substring(dataURL.indexOf(",") + 1);
          },
          /**
           * read as dataURL
           *
           * @param {?String} [mimetype]
           * @return {Promise<String>}
           */
          async $dataURL(mimetype) {
            kQuery.logger.assertInstanceOf(mimetype, Nullable, String)();
            const that = mimetype ? this.slice(0, this.size, mimetype) : this;
            const reader = new FileReader();
            reader.readAsDataURL(that);
            return reader.promise();
          }
        }
      )
    };
  }
  __name(data, "data");

  // src/plugins/dimensions.js
  function dimensions(kQuery) {
    return {
      [[Document.name]]: (
        /** @lends Document.prototype */
        {
          /**
           * get top-layer element
           *
           * in the future, ":top-layer" pseudo-class may come, but not now
           *
           * @return {?Element}
           */
          get $topLayerElement() {
            const tops = this.$$(":modal, :popover-open, :fullscreen");
            if (tops.length <= 1) {
              return tops[0] ?? null;
            }
            for (const top of tops) {
              if (top === this.elementFromPoint(0, 0)) {
                return top;
              }
            }
            return null;
          },
          /**
           * get current modal element
           *
           * @return {?Element}
           */
          get $modalElement() {
            const modals = this.querySelectorAll(":modal");
            const top = this.elementFromPoint(0, 0);
            return Array.prototype.find.call(modals, (e) => e === top) ?? null;
          }
        }
      ),
      [[HTMLElement.name, $NodeList.name]]: /* @__PURE__ */ function() {
        const boxsize = /* @__PURE__ */ __name(function(element) {
          const backup = element.getAttribute("style");
          try {
            const cstyle = element.$window.getComputedStyle(element);
            const marginWidth = parseFloat(cstyle.marginLeft) + parseFloat(cstyle.marginRight);
            const marginHeight = parseFloat(cstyle.marginTop) + parseFloat(cstyle.marginBottom);
            element.style.setProperty("box-sizing", "content-box", "important");
            element.style.setProperty("overflow", "hidden", "important");
            const box = element.getBoundingClientRect();
            let contentWidth = box.width;
            let contentHeight = box.height;
            element.style.setProperty("border", "none", "important");
            const borderWidth = contentWidth - element.offsetWidth;
            const borderHeight = contentHeight - element.offsetHeight;
            contentWidth -= borderWidth;
            contentHeight -= borderHeight;
            element.style.setProperty("padding", 0, "important");
            const paddingWidth = contentWidth - element.offsetWidth;
            const paddingHeight = contentHeight - element.offsetHeight;
            const scrollWidth = element.scrollWidth;
            const scrollHeight = element.scrollHeight;
            contentWidth -= paddingWidth;
            contentHeight -= paddingHeight;
            const clientWidth = element.clientWidth;
            const offsetHeight = element.offsetHeight;
            element.style.setProperty("overflow", "scroll", "important");
            const scrollbarWidth = clientWidth - element.clientWidth;
            const scrollbarHeight = element.offsetHeight - offsetHeight;
            contentWidth -= scrollbarWidth;
            return {
              marginWidth,
              borderWidth,
              paddingWidth,
              scrollbarWidth,
              contentWidth,
              marginHeight,
              borderHeight,
              paddingHeight,
              scrollbarHeight,
              contentHeight
            };
          } finally {
            if (backup == null) {
              element.removeAttribute("style");
            } else {
              element.setAttribute("style", backup);
            }
          }
        }, "boxsize");
        return (
          /** @lends HTMLElement.prototype */
          {
            /**
             * normalize cssUnit to pixel
             *
             * @param {Number|String} cssLength
             * @return {Number}
             *
             * @example
             * document.body.$cssPixel('2lh');
             * // 58.2188
             */
            $cssPixel(cssLength) {
              kQuery.logger.assertInstanceOf(cssLength, Number, String)();
              if (typeof cssLength === "number") {
                return cssLength;
              }
              const value = parseFloat(cssLength);
              const unit = cssLength.replace(/^-?[0-9.]+/, "");
              switch (unit) {
                case "":
                  return value;
                case "px":
                  return value * 1;
                case "in":
                  return value * 96;
                case "pc":
                  return value * 96 / 6;
                case "pt":
                  return value * 96 / 6 / 12;
                case "cm":
                  return value * 96 / 2.54;
                case "mm":
                  return value * 96 / 2.54 / 10;
                case "Q":
                  return value * 96 / 2.54 / 10 / 4;
              }
              const backup = this.getAttribute("style");
              try {
                this.style.marginBottom = cssLength;
                return parseFloat(this.$window.getComputedStyle(this).marginBottom);
              } finally {
                if (backup == null) {
                  this.removeAttribute("style");
                } else {
                  this.setAttribute("style", backup);
                }
              }
            },
            /**
             * get left/top absolute/relative node
             *
             * @param {{relative?: Boolean, margin?: Boolean}} [options={}]
             * @return {{left: Number, top: Number}}
             */
            $offset(options = {}) {
              options = Object.assign({
                relative: false,
                margin: false
              }, options);
              kQuery.logger.assertInstanceOf(options, Object)();
              let marginLeft = 0;
              let marginTop = 0;
              if (!options.margin) {
                const cstyle = this.$window.getComputedStyle(this);
                marginLeft = parseFloat(cstyle.marginLeft);
                marginTop = parseFloat(cstyle.marginTop);
              }
              if (options.relative) {
                return {
                  left: this.offsetLeft - marginLeft,
                  top: this.offsetTop - marginTop
                };
              }
              const box = this.getBoundingClientRect();
              return {
                left: box.left + window.scrollX - document.documentElement.clientLeft - marginLeft,
                top: box.top + window.scrollY - document.documentElement.clientTop - marginTop
              };
            },
            /**
             * get width/height irrespective of css
             *
             * ```
             * ┌margin────────────────────────────────────┐
             * │                                                                              │
             * │   ┌border───────────────────────────────┐   │
             * │   │                                                                    │   │
             * │   │   ┌padding ───────────────────────┬SB┐   │   │
             * │   │   │                                                      │  │   │   │
             * │   │   │   ┌content─────────────────────┤  │   │   │
             * │   │   │   │                                                 │  │   │   │
             * │   │   │   └-────────────────────────┤  │   │   │
             * │   │   │                                                      │  │   │   │
             * │   │   ├───────────────────────────┴─┤   │   │
             * │   │   ├scroll bar────────────────────────┤   │   │
             * │   │   └─────────────────────────────┘   │   │
             * │   │                                                                    │   │
             * │   └──────────────────────────────────┘   │
             * │                                                                              │
             * └───────────────────────────────────────┘
             * ```
             *
             * @param {String|{scroll?: Boolean, margin?: Boolean, border?: Boolean, padding?: Boolean, scrollbar?: Boolean}} [options={}]
             * @return {{width: Number, height: Number}}
             */
            $size(options = {}) {
              if (typeof options === "string") {
                const presets = {
                  "": {
                    scrollbar: true
                  },
                  client: {
                    padding: true
                  },
                  inner: {
                    padding: true,
                    scrollbar: true
                  },
                  offset: {
                    padding: true,
                    border: true
                  },
                  outer: {
                    padding: true,
                    border: true,
                    scrollbar: true
                  },
                  margin: {
                    padding: true,
                    border: true,
                    margin: true,
                    scrollbar: true
                  }
                };
                options = presets[options];
              }
              kQuery.logger.assertInstanceOf(options, Object)();
              options = Object.assign({
                scroll: false,
                margin: false,
                border: false,
                padding: false,
                scrollbar: false
              }, options);
              const box = boxsize(this);
              let width = options.scroll ? this.scrollWidth : box.contentWidth;
              let height = options.scroll ? this.scrollHeight : box.contentHeight;
              if (options.margin) {
                width += box.marginWidth;
                height += box.marginHeight;
              }
              if (options.border) {
                width += box.borderWidth;
                height += box.borderHeight;
              }
              if (options.padding) {
                width += box.paddingWidth;
                height += box.paddingHeight;
              }
              if (options.scrollbar && !options.scroll) {
                width += box.scrollbarWidth;
                height += box.scrollbarHeight;
              }
              return { width, height };
            },
            /**
             * get/set width irrespective of css
             *
             * @param {Number|String|{scroll?: Boolean, margin?: Boolean, border?: Boolean, padding?: Boolean, scrollbar?: Boolean}} [options={}]
             * @return {Number}
             */
            $width(options = {}) {
              if (typeof options === "number" || typeof options === "string") {
                if (F.stringIsNaN(options)) {
                  kQuery.logger.error(`options(${options}) is NaN`);
                }
                let size = this.$cssPixel(options);
                const cstyle = this.$window.getComputedStyle(this);
                if (cstyle.boxSizing !== "border-box") {
                  const box = boxsize(this);
                  size -= box.borderWidth + box.paddingWidth;
                }
                this.style.width = size + "px";
                return size;
              }
              return this.$size(options).width;
            },
            /**
             * get/set height irrespective of css
             *
             * @param {Number|String|{scroll?: Boolean, margin?: Boolean, border?: Boolean, padding?: Boolean, scrollbar?: Boolean}} [options={}]
             * @return {Number}
             */
            $height(options = {}) {
              if (typeof options === "number" || typeof options === "string") {
                if (F.stringIsNaN(options)) {
                  kQuery.logger.error(`options(${options}) is NaN`);
                }
                let size = this.$cssPixel(options);
                const cstyle = this.$window.getComputedStyle(this);
                if (cstyle.boxSizing !== "border-box") {
                  const box = boxsize(this);
                  size -= box.borderHeight + box.paddingHeight;
                }
                this.style.height = size + "px";
                return size;
              }
              return this.$size(options).height;
            },
            /**
             * get closest scrollable parent
             *
             * @param {{height: Boolean, width: Boolean}} scrollableOptions
             * @return {?Element}
             */
            $scrollParent(scrollableOptions = { height: true, width: true }) {
              kQuery.logger.assertInstanceOf(scrollableOptions, Object)();
              if (scrollableOptions.height && this.scrollHeight > this.clientHeight) {
                return this;
              }
              if (scrollableOptions.width && this.scrollWidth > this.clientWidth) {
                return this;
              }
              return this.parentElement?.$scrollParent(scrollableOptions) ?? null;
            }
          }
        );
      }(),
      [[DOMRectReadOnly.name]]: (
        /** @lends DOMRectReadOnly.prototype */
        {
          /**
           * contains other Geometry interfaces
           *
           * ```
           * true:
           * ┌this─────────────┐
           * │                              │
           * │   ┌other ───────┐   │
           * │   │                    │   │
           * │   │                    │   │
           * │   └──────────┘   │
           * │                              │
           * └───────────────┘
           *
           * false:
           * ┌this─────────────┐
           * │                              │
           * │              ┌other ────┼──┐
           * │              │              │    │
           * │              │              │    │
           * │              └───────┼──┘
           * │                              │
           * └───────────────┘
           *
           * false:
           * ┌this─────────────┐
           * │                              │
           * │                              │    ┌other ───────┐
           * │                              │    │                    │
           * │                              │    │                    │
           * │                              │    └──────────┘
           * │                              │
           * └───────────────┘
           * ```
           *
           * @param {DOMRectReadOnly|DOMPointReadOnly} other
           * @return {Boolean}
           */
          $contains(other) {
            if (other instanceof DOMPointReadOnly) {
              return this.left <= other.x && other.x <= this.right && this.top <= other.y && other.y <= this.bottom;
            }
            if (other instanceof DOMRectReadOnly) {
              return this.$contains(new DOMPoint(other.left, other.top)) && this.$contains(new DOMPoint(other.right, other.top)) && this.$contains(new DOMPoint(other.left, other.bottom)) && this.$contains(new DOMPoint(other.right, other.bottom));
            }
            throw new Error(`Unknown type(${other.constructor.name})`);
          },
          /**
           * intersect other Geometry interfaces
           *
           * ```
           * true:
           * ┌this─────────────┐
           * │                              │
           * │   ┌other ───────┐   │
           * │   │                    │   │
           * │   │                    │   │
           * │   └──────────┘   │
           * │                              │
           * └───────────────┘
           *
           * true:
           * ┌this─────────────┐
           * │                              │
           * │              ┌other ────┼──┐
           * │              │              │    │
           * │              │              │    │
           * │              └───────┼──┘
           * │                              │
           * └───────────────┘
           *
           * false:
           * ┌this─────────────┐
           * │                              │
           * │                              │    ┌other ───────┐
           * │                              │    │                    │
           * │                              │    │                    │
           * │                              │    └──────────┘
           * │                              │
           * └───────────────┘
           * ```
           *
           * @param {DOMRectReadOnly|DOMPointReadOnly} other
           * @return {Boolean}
           */
          $intersects(other) {
            if (other instanceof DOMPointReadOnly) {
              return this.left <= other.x && other.x <= this.right && this.top <= other.y && other.y <= this.bottom;
            }
            if (other instanceof DOMRectReadOnly) {
              return this.$intersects(new DOMPoint(other.left, other.top)) || this.$intersects(new DOMPoint(other.right, other.top)) || this.$intersects(new DOMPoint(other.left, other.bottom)) || this.$intersects(new DOMPoint(other.right, other.bottom));
            }
            throw new Error(`Unknown type(${other.constructor.name})`);
          }
        }
      )
    };
  }
  __name(dimensions, "dimensions");

  // src/plugins/effects.js
  function effects(kQuery) {
    return {
      [[Element.name, $NodeList.name]]: function() {
        const handleArguments = /* @__PURE__ */ __name(function(args) {
          if (typeof args[0] === "number") {
            args[1] ??= {};
            args[1].duration = args[0];
            args[0] = args[1];
          }
          return Object.assign({
            initial: {},
            reset: true
          }, args[0]);
        }, "handleArguments");
        const nodeStyleBackup = new WeakMap();
        const nodeWillChangeBackup = new WeakMap();
        const willChangeTimer = new Timer();
        willChangeTimer.addEventListener("alarm", function() {
          for (const [e, backup] of nodeWillChangeBackup.entries()) {
            e.style.setProperty("will-change", backup);
          }
          nodeWillChangeBackup.clear();
        });
        return (
          /** @lends Element.prototype */
          {
            /**
             * change css will-change property
             *
             * changes are undone after a certain amount of time
             *
             * @param {String|Array} value
             * @param {Number} [timeout=1000]
             * @return {this}
             */
            $willChange(value, timeout = 1e3) {
              kQuery.logger.assertInstanceOf(value, String, Array)();
              kQuery.logger.assertInstanceOf(timeout, Number)();
              value = value instanceof Array ? value : [value];
              const current = this.style.getPropertyValue("will-change");
              nodeWillChangeBackup.getOrSet(this, () => current);
              if (current) {
                value.push(current);
              }
              this.style.setProperty("will-change", [...new Set(value)].join(","));
              willChangeTimer.restart(timeout, 1);
              return this;
            },
            /**
             * change css with transition
             *
             * options.initial: first css styles
             * options.reset: reset all when finish
             * options.duration: reference transition css
             * options.timing: reference transition css
             *
             * @param {Object} properties
             * @param {Object} [options={}]
             * @return {Promise<Boolean>}
             */
            async $transition(properties, options) {
              kQuery.logger.assertInstanceOf(properties, Object)();
              kQuery.logger.assertInstanceOf(options, Nullable, Object)();
              options = Object.assign({
                initial: {},
                reset: false,
                duration: 400,
                timing: "ease"
              }, options);
              const current = nodeStyleBackup.getOrSet(this, () => ({
                count: 0,
                style: this.getAttribute("style"),
                transitionValue: this.style.getPropertyValue("transition") ?? "",
                transitionPriority: this.style.getPropertyPriority("transition") ?? ""
              }));
              current.count++;
              for (const [css, value] of Object.entries(options.initial)) {
                this.style.setProperty(css, value, "important");
              }
              this.getClientRects();
              const currentTransitions = (this.style.getPropertyValue("transition") ?? "").split(",").filter((v) => v);
              for (const [css, value] of Object.entries(properties)) {
                this.style.setProperty(css, value, "important");
                currentTransitions.push(`${css} ${options.duration}ms ${options.timing}`);
              }
              this.style.setProperty("transition", currentTransitions.join(","), "important");
              let resolve, reject;
              const promise = new Promise2((res, rej) => {
                resolve = res;
                reject = rej;
              });
              const complete = /* @__PURE__ */ __name(() => {
                this.removeEventListener("transitionend", listener);
                const current2 = nodeStyleBackup.get(this);
                if (--current2.count === 0) {
                  nodeStyleBackup.delete(this);
                  if (options.reset) {
                    this.setAttribute("style", current2.style);
                  } else {
                    this.style.setProperty("transition", current2.transitionValue, current2.transitionPriority);
                    for (const [css, value] of Object.entries(properties)) {
                      this.style.setProperty(css, value, "");
                    }
                  }
                }
              }, "complete");
              const queue = new Set(Object.keys(properties));
              const listener = /* @__PURE__ */ __name((e) => {
                queue.delete(e.propertyName);
                if (queue.size === 0) {
                  clearTimeout(timer);
                  complete();
                  resolve(true);
                }
              }, "listener");
              const timer = setTimeout(function() {
                complete();
                resolve(false);
              }, options.duration + 32);
              this.addEventListener("transitionend", listener);
              return promise;
            },
            /**
             * fade in element
             *
             * this does not involve visibility, you have to do it ourselves.
             *
             * @param {Number|Object} [durationOrOptions=400]
             * @param {Object} [options={}]
             * @return {Promise<Boolean>}
             *
             * @example
             * node.hidden = false;
             * await node.$fadeIn();
             */
            async $fadeIn(durationOrOptions = 400, options = {}) {
              const opts = handleArguments(arguments);
              const cstyle = this.$window.getComputedStyle(this);
              opts.initial = Object.assign(opts.initial, {
                opacity: 0
              });
              return this.$transition({
                opacity: cstyle.opacity
              }, opts);
            },
            /**
             * fade out element
             *
             * this does not involve visibility, you have to do it ourselves.
             *
             * @param {Number|Object} [durationOrOptions=400]
             * @param {Object} [options={}]
             * @return {Promise<Boolean>}
             *
             * @example
             * await node.$fadeOut();
             * node.hidden = true;
             */
            async $fadeOut(durationOrOptions = 400, options = {}) {
              const opts = handleArguments(arguments);
              const cstyle = this.$window.getComputedStyle(this);
              opts.initial = Object.assign(opts.initial, {
                opacity: cstyle.opacity
              });
              return this.$transition({
                opacity: 0
              }, opts);
            },
            /**
             * slide to down element
             *
             * this does not involve visibility, you have to do it ourselves.
             *
             * @param {Number|Object} [durationOrOptions=400]
             * @param {Object} [options={}]
             * @return {Promise<Boolean>}
             */
            async $slideDown(durationOrOptions = 400, options = {}) {
              const opts = handleArguments(arguments);
              const cstyle = this.$window.getComputedStyle(this);
              opts.initial = Object.assign(opts.initial, {
                overflow: "hidden",
                height: 0,
                "margin-top": 0,
                "margin-bottom": 0,
                "padding-top": 0,
                "padding-bottom": 0
              });
              return this.$transition({
                height: parseFloat(cstyle.height),
                "margin-top": parseFloat(cstyle.marginTop),
                "margin-bottom": parseFloat(cstyle.marginBottom),
                "padding-top": parseFloat(cstyle.paddingTop),
                "padding-bottom": parseFloat(cstyle.paddingBottom)
              }, opts);
            },
            /**
             * slide to top element
             *
             * this does not involve visibility, you have to do it ourselves.
             *
             * @param {Number|Object} [durationOrOptions=400]
             * @param {Object} [options={}]
             * @return {Promise<Boolean>}
             */
            async $slideUp(durationOrOptions = 400, options = {}) {
              const opts = handleArguments(arguments);
              const cstyle = this.$window.getComputedStyle(this);
              opts.initial = Object.assign(opts.initial, {
                overflow: "hidden",
                height: parseFloat(cstyle.height),
                "margin-top": parseFloat(cstyle.marginTop),
                "margin-bottom": parseFloat(cstyle.marginBottom),
                "padding-top": parseFloat(cstyle.paddingTop),
                "padding-bottom": parseFloat(cstyle.paddingBottom)
              });
              return this.$transition({
                height: 0,
                "margin-top": 0,
                "margin-bottom": 0,
                "padding-top": 0,
                "padding-bottom": 0
              }, opts);
            },
            /**
             * slide to right element
             *
             * this does not involve visibility, you have to do it ourselves.
             *
             * @param {Number|Object} [durationOrOptions=400]
             * @param {Object} [options={}]
             * @return {Promise<Boolean>}
             */
            async $slideRight(durationOrOptions = 400, options = {}) {
              const opts = handleArguments(arguments);
              const cstyle = this.$window.getComputedStyle(this);
              opts.initial = Object.assign(opts.initial, {
                overflow: "hidden",
                width: 0,
                "margin-left": 0,
                "margin-right": 0,
                "padding-left": 0,
                "padding-right": 0,
                "max-height": parseFloat(cstyle.height)
              });
              return this.$transition({
                width: parseFloat(cstyle.width),
                "margin-left": parseFloat(cstyle.marginLeft),
                "margin-right": parseFloat(cstyle.marginRight),
                "padding-left": parseFloat(cstyle.paddingLeft),
                "padding-right": parseFloat(cstyle.paddingRight)
              }, opts);
            },
            /**
             * slide to left element
             *
             * this does not involve visibility, you have to do it ourselves.
             *
             * @param {Number|Object} [durationOrOptions=400]
             * @param {Object} [options={}]
             * @return {Promise<Boolean>}
             */
            async $slideLeft(durationOrOptions = 400, options = {}) {
              const opts = handleArguments(arguments);
              const cstyle = this.$window.getComputedStyle(this);
              opts.initial = Object.assign(opts.initial, {
                overflow: "hidden",
                width: parseFloat(cstyle.width),
                "margin-left": parseFloat(cstyle.marginLeft),
                "margin-right": parseFloat(cstyle.marginRight),
                "padding-left": parseFloat(cstyle.paddingLeft),
                "padding-right": parseFloat(cstyle.paddingRight),
                "max-height": parseFloat(cstyle.height)
              });
              return this.$transition({
                width: 0,
                "margin-left": 0,
                "margin-right": 0,
                "padding-left": 0,
                "padding-right": 0
              }, opts);
            }
          }
        );
      }()
    };
  }
  __name(effects, "effects");

  // src/plugins/forms.js
  function forms(kQuery) {
    return {
      [[FormData.name]]: (
        /** @lends FormData.prototype */
        {
          /**
           * from Entries
           *
           * @param {Object} values
           */
          $appendFromEntries(values) {
            for (const [name, value] of F.objectToEntries(values)) {
              this.append(name, value);
            }
            return this;
          },
          /**
           * to SearchParam(unset File entry)
           *
           * @return {URLSearchParams}
           */
          $toSearchParams() {
            const result = new URLSearchParams(this);
            for (const [name, value] of F.objectToEntries(this)) {
              if (value instanceof Blob) {
                kQuery.logger.info(`Unset ${name} because file`);
                result.set(name, "");
              }
            }
            return result;
          },
          /**
           * to Object
           *
           * @return {Object}
           */
          $toObject() {
            const indexes = {};
            const entries = F.objectToEntries(this).map(([name, value]) => {
              let names = name.split(/\]\[|\[|\]/);
              if (names.length > 1) {
                names.pop();
              }
              const parents = [];
              for (const [i, subname] of names.entries()) {
                if (!subname.length) {
                  const key = parents.join("[@]");
                  indexes[key] ??= 0;
                  names[i] = indexes[key]++;
                }
                parents.push(subname);
              }
              return [names, value];
            });
            return F.entriesToObject(entries, false);
          },
          /**
           * to JSON
           *
           * @param {String|Function} [fileConverter='base64']
           * @return {Promise<String>}
           */
          async $json(fileConverter = "base64") {
            const object = await F.objectWalkRecursive(this.$toObject(), async function(value) {
              if (value instanceof Blob) {
                value = function() {
                  if (fileConverter === "text") {
                    return value.$text();
                  }
                  if (fileConverter === "base64") {
                    return value.$base64();
                  }
                  if (typeof fileConverter === "function") {
                    return fileConverter(value);
                  }
                  throw new Error(`Unknown convert(${fileConverter})`);
                }();
              }
              return value;
            });
            return JSON.stringify(object);
          }
        }
      ),
      [[HTMLInputElement.name, RadioNodeList.name, $NodeList.name]]: (
        /** @lends HTMLInputCheckableElement.prototype */
        {
          /**
           * get input indeterminate
           *
           * returns undefined if not checkbox and supports RadioNodeList.
           *
           * @descriptor get
           *
           * @return {?Boolean}
           */
          get $indeterminate() {
            if (this instanceof RadioNodeList) {
              return this.value === "";
            }
            if (this.type !== "checkbox") {
              return void 0;
            }
            return this.indeterminate;
          },
          /**
           * set input indeterminate
           *
           * accepts Array of Boolean
           * - empty(e.g.[null, undefined])
           *   - indeterminate=false
           *   - checked no touch
           * - all false(e.g.[false, ..., false])
           *   - indeterminate=false
           *   - checked=false
           * - all true(e.g.[true, ..., true])
           *   - indeterminate=false
           *   - checked=true
           * - mixed(e.g.[true, false, true])
           *   - indeterminate=true
           *   - checked no touch
           *
           * @descriptor set
           *
           * @param {Boolean|Boolean[]} value
           */
          set $indeterminate(value) {
            kQuery.logger.assertInstanceOf(value, Boolean, Array)();
            if (this instanceof RadioNodeList) {
              if (!value) {
                kQuery.logger.error(`RadioNodeList's $indeterminate is readonly`);
              }
              this.forEach((e) => e.checked = false);
              return;
            }
            if (this.type !== "checkbox") {
              return;
            }
            if (!(value instanceof Array)) {
              this.indeterminate = value;
              return;
            }
            value = value.filter((v) => v != null);
            if (value.length === 0) {
              this.indeterminate = false;
            } else if (value.every((v) => !v)) {
              this.indeterminate = false;
              this.checked = false;
            } else if (value.every((v) => v)) {
              this.indeterminate = false;
              this.checked = true;
            } else {
              this.indeterminate = true;
            }
          }
        }
      ),
      [[HTMLInputElement.name, HTMLTextAreaElement.name, HTMLSelectElement.name, $NodeList.name]]: (
        /** @lends HTMLInputLikeElement.prototype */
        {
          /**
           * get input value
           *
           * - simple input: String
           * - radiobox: checked String or null
           * - checkbox: checked String or null
           * - select(single): selected String or null
           * - select(multiple): selected Array always
           * - file(single): File or null
           * - file(multiple): FileList always
           *
           * @descriptor get
           *
           * @return {null|String|Array|File|FileList}
           */
          get $value() {
            if (["select-one"].includes(this.type)) {
              return Array.prototype.find.call(this.options, (option) => option.selected)?.value ?? null;
            }
            if (["select-multiple"].includes(this.type)) {
              return [...this.options].filter((option) => option.selected).map((option) => option.value);
            }
            if (["radio", "checkbox"].includes(this.type)) {
              return this.checked ? this.value : null;
            }
            if (["file"].includes(this.type)) {
              return this.multiple ? this.files : this.files[0] ?? null;
            }
            if (this.type) {
              return this.value;
            }
          },
          /**
           * set input value
           *
           * - simple input: must be String
           * - radiobox: must be String
           * - checkbox: must be String
           * - select(single): must be String
           * - select(multiple): must be Array
           * - file(single): must be File|FileList
           * - file(multiple): must be FileList
           *
           * @descriptor set
           */
          set $value(value) {
            if (["select-one"].includes(this.type)) {
              this.value = value;
            } else if (["select-multiple"].includes(this.type)) {
              const values = (value instanceof Array ? value : [value]).map((v) => "" + v);
              for (const option of this.options) {
                option.selected = values.includes(option.value);
              }
            } else if (["radio", "checkbox"].includes(this.type)) {
              this.checked = this.value === value;
            } else if (["file"].includes(this.type)) {
              if (value instanceof File) {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(value);
                this.files = dataTransfer.files;
              } else if (value instanceof FileList) {
                this.files = value;
              }
            } else if (this.type) {
              this.value = value;
            }
          },
          /**
           * clear input value
           *
           * clear doesn't mean reset. all input set blank, uncheck, unselect, empty file
           *
           * @return {this}
           */
          $clear() {
            if (["select-one", "select-multiple"].includes(this.type)) {
              this.value = null;
            } else if (["radio", "checkbox"].includes(this.type)) {
              this.checked = false;
            } else if (["file"].includes(this.type)) {
              this.files = new DataTransfer().files;
            } else if (this.type) {
              this.value = "";
            }
            return this;
          },
          /**
           * writeback value to attribute
           *
           * @return {this}
           */
          $resetAttribute() {
            if (["select-one", "select-multiple"].includes(this.type)) {
              Array.from(this.options).forEach((option) => option.toggleAttribute("selected", option.selected));
            } else if (this.type === "textarea") {
              this.textContent = this.value;
            } else if (["radio", "checkbox"].includes(this.type)) {
              this.toggleAttribute("checked", this.checked);
            } else {
              this.setAttribute("value", this.value);
            }
            return this;
          }
        }
      ),
      [[HTMLSelectElement.name, HTMLDataListElement.name, $NodeList.name]]: (
        /** @lends HTMLOptionableElement.prototype */
        {
          /**
           * set option elements
           *
           * preserveValue
           * - false: fully replace all options, selection state is lost
           * - true: fully replace all options, selection state is kept
           * - String: keep selected options and insertion method
           *
           * @param {HTMLOptionElement[]|HTMLOptGroupElement[]|Object} options
           * @param {Boolean|String} [preserveValue]
           * @return {this}
           */
          $options(options, preserveValue = void 0) {
            preserveValue ??= this instanceof HTMLSelectElement ? "append" : null;
            kQuery.logger.assertInstanceOf(preserveValue, Nullable, Boolean, String)();
            this.$willChange("scroll-position");
            const scroll = {
              top: this.scrollTop,
              left: this.scrollLeft
            };
            const recover = /* @__PURE__ */ __name(() => {
              this.scrollTop = scroll.top;
              this.scrollLeft = scroll.left;
            }, "recover");
            const build = /* @__PURE__ */ __name((data2) => {
              const options2 = [];
              for (const [value, label] of F.objectToEntries(data2)) {
                if (label instanceof Array) {
                  options2.push(this.$document.$createElement("optgroup", { label: value }, ...label));
                } else if (F.objectIsPlain(label)) {
                  options2.push(this.$document.$createElement("optgroup", { label: value }, ...build(label)));
                } else {
                  options2.push(this.$document.$createElement("option", { value, title: label }, label));
                }
              }
              return options2;
            }, "build");
            if (F.objectIsPlain(options)) {
              options = build(options);
            }
            const $value = preserveValue ? this.$value : null;
            if (preserveValue && typeof preserveValue === "string") {
              const $values = ($value instanceof Array ? $value : [$value]).filter((v) => v != null).map((v) => "" + v);
              this.$$("option").$except((o) => $values.includes(o.value)).forEach((e) => e.remove());
              this.$$("optgroup").$except((o) => o.$contains("option")).forEach((e) => e.remove());
              this.$$("hr.kQuery-option-separator").forEach((e) => e.remove());
              for (const optgroup of this.$$("optgroup")) {
                const nexts = optgroup.$nextElements(`optgroup[label="${F.stringEscape(optgroup.label ?? "", "selector")}"]`);
                for (const next of [...nexts]) {
                  optgroup[preserveValue](...next.$$("option"));
                  if (!next.$contains("option")) {
                    next.remove();
                  }
                }
              }
              this[preserveValue](this.$document.$createElement("hr", { class: "kQuery-option-separator" }));
              this[preserveValue](...options);
              const filter = /* @__PURE__ */ __name(function(options2) {
                return options2.filter((o) => {
                  if (o instanceof HTMLOptionElement && $values.includes(o.value)) {
                    o.remove();
                    return false;
                  }
                  if (o instanceof HTMLOptGroupElement) {
                    if (!filter([...o.$$("option")]).length) {
                      o.remove();
                      return false;
                    }
                  }
                  return true;
                });
              }, "filter");
              filter(options);
            } else {
              this.$replaceChildren(...options);
            }
            if (preserveValue) {
              this.$value = $value;
            }
            requestAnimationFrame(() => requestAnimationFrame(recover));
            return this;
          }
        }
      ),
      [[HTMLFormElement.name, $NodeList.name]]: (
        /** @lends HTMLFormElement.prototype */
        {
          /**
           * writeback value to attribute
           *
           * @return {this}
           */
          $resetAttribute() {
            this.elements.$resetAttribute();
            return this;
          }
        }
      )
    };
  }
  __name(forms, "forms");

  // src/plugins/manipulation.js
  function manipulation(kQuery) {
    return {
      [[Window.name]]: (
        /** @lends Window.prototype */
        {
          /**
           * jQuery like selector
           *
           * - Node/NodeList: return as it is
           * - tag string: create and return Node/NodeList
           * - selector string: select and return Node/NodeList
           *
           * returns if length is 1 then Node else NodeList (this case contains empty list)
           *
           * @param {String|Array|Node|NodeList|HTMLCollection} selectorFn
           * @param {?Document} [ownerDocument]
           * @return {Node|NodeList}
           */
          $query(selectorFn, ownerDocument = null) {
            ownerDocument ??= (this ?? globalThis).document;
            if (selectorFn instanceof Node || selectorFn instanceof NodeList) {
              return selectorFn;
            }
            if (selectorFn instanceof HTMLCollection) {
              return F.iterableToNodeList(selectorFn);
            }
            if (selectorFn instanceof Array) {
              const recursions = selectorFn.map((e) => ownerDocument.defaultView.$query(e, ownerDocument));
              const nodes2 = [...new Set(recursions.flatMap((e) => e instanceof Node ? [e] : [...e]))];
              return nodes2.length === 1 ? nodes2[0] : F.iterableToNodeList(nodes2);
            }
            if (typeof selectorFn === "string" && selectorFn.trim().charAt(0) === "<") {
              const nodes2 = ownerDocument.$createNodeListFromHTML(selectorFn.trim());
              return nodes2.length === 1 ? nodes2[0] : nodes2;
            }
            const nodes = ownerDocument.$$(selectorFn);
            return nodes.length === 1 ? nodes[0] : nodes;
          }
        }
      ),
      [[Document.name]]: (
        /** @lends Document.prototype */
        {
          /**
           * create Elements from html string
           *
           * @param {String} html
           * @return {NodeList}
           *
           * @example
           * document.$createNodeListFromHTML('<span>SPAN</span>Text<div>DIV</div>');
           * // NodeList(3)[<span>SPAN</span>, Text, <div>DIV</div>]
           */
          $createNodeListFromHTML(html) {
            kQuery.logger.assertInstanceOf(html, String)();
            const template = this.createElement("template");
            template.innerHTML = html;
            return F.iterableToNodeList([...template.content.childNodes]);
          },
          /**
           * create Element from tag, attributes, children
           *
           * - tag allows css selector like string
           *   - but this is experimental
           * - attributes allows bool for logical attribute
           * - attributes.data allows nest object, convert to "data-key=value"
           * - attributes.class allows array, convert to "a b c"
           * - attributes.style allows object, convert to "css:value"
           *
           * @param {String} tag
           * @param {Object<String, any|Object<String, String>>} [attributes={}]
           * @param {...String|Node|NodeList} [children=[]]
           * @return {Element}
           *
           * @example
           * document.$createElement('span', {
           *     logicalFalse: false,
           *     logicalTrue: true,
           *     data: {
           *         a: 'a',
           *         b: 'b',
           *     },
           *     class: ['a', 'b', 'c'],
           *     style: {
           *         color: 'red',
           *         backgroundColor: 'red',
           *     },
           * }, 'plain', 'a>b');
           * // <span logicaltrue="" data-a="a" data-b="b" class="a b c" style="color:red;background-color:red;">plaina&gt;b</span>
           *
           * document.$createElement('span#id.c1.c2[a=A][b=B]');
           * // <span id="id" class="c1 c2" a="A" b="B"></span>
           */
          $createElement(tag, attributes2 = {}, ...children) {
            kQuery.logger.assertInstanceOf(tag, String)();
            kQuery.logger.assertInstanceOf(attributes2, Object)();
            attributes2.class = F.objectToClasses(attributes2.class ?? []);
            tag = tag.replaceAll(/\#([-_0-9a-z]+)/ig, function(m0, m1) {
              attributes2.id = m1;
              return "";
            });
            tag = tag.replaceAll(/\.([-_0-9a-z]+)/ig, function(m0, m1) {
              attributes2.class[m1] = true;
              return "";
            });
            tag = tag.replaceAll(/\[([-_0-9a-z]+)(=(.+?))?\]/ig, function(m0, m1, m2, m3) {
              attributes2[m1] = m3 ?? "";
              return "";
            });
            const element = this.createElement(tag);
            for (const [name, value] of Object.entries(F.objectToAttributes(attributes2))) {
              if (typeof value === "boolean") {
                element.toggleAttribute(name, value);
              } else {
                element.setAttribute(name, value);
              }
            }
            element.$append(...children);
            return element;
          }
        }
      ),
      [[HTMLTemplateElement.name, $NodeList.name]]: function() {
        const renderedNodes = new WeakMap();
        class Value {
          static {
            __name(this, "Value");
          }
          constructor(value) {
            this.value = value;
          }
          toString() {
            return "" + this.value;
          }
        }
        return (
          /** @lends HTMLTemplateElement.prototype */
          {
            /**
             * render template content
             *
             * this is experimental, very magical,evil and slow.
             *
             * vars:
             * - Array: per below
             * - String: text node
             * - other Object: text node without escape
             * - plain Object: render recursive
             *
             * rendered nodes are auto inserted to after this
             * if specified insert:null, no inserted
             *
             * @param {Object|Object[]} vars
             * @param {{escape?: String|Function, logical?: String, insert?: String}} [options={}]
             * @return {NodeList}
             */
            $render(vars, options = {}) {
              options = Object.assign({
                escape: "html",
                logical: "---logical<false/>---",
                insert: "after"
              }, options);
              const tag = /* @__PURE__ */ __name(function(value) {
                if (options.logical) {
                  if (value === false) {
                    return options.logical;
                  }
                  if (value === true) {
                    return "";
                  }
                }
                if (typeof value === "object" && !(value instanceof Value)) {
                  return value;
                }
                if (typeof options.escape === "function") {
                  return options.escape(value);
                }
                return F.stringEscape(value, options.escape);
              }, "tag");
              const core = /* @__PURE__ */ __name(function(current, parent) {
                if (!current) {
                  return [];
                }
                if (!(current instanceof Array)) {
                  current = [current];
                }
                const elements2 = [];
                for (let [i, value] of current.entries()) {
                  const fragment = this.content.cloneNode(true);
                  if (F.anyIsPrimitive(value)) {
                    value = new Value(value);
                  }
                  Object.assign(value, {
                    $parent: parent,
                    $index: i,
                    $length: current.length,
                    $first: i === 0,
                    $last: i === current.length - 1
                  });
                  const children = fragment.$$("template[data-slot-name]");
                  for (const child of children) {
                    child.after(...core.call(child, value[child.dataset.slotName], value));
                    child.remove();
                  }
                  kQuery.logger.assert(() => fragment.$contains((e) => !e.$isMetadataContent))();
                  const template = [...fragment.childNodes].join("");
                  const html = F.stringRender(template, value, tag);
                  const nodes = this.$document.$createNodeListFromHTML(html);
                  if (options.logical) {
                    for (const node of nodes.$$$("*")) {
                      for (const attribute of Array.from(node.attributes)) {
                        if (attribute.value === options.logical) {
                          node.attributes.removeNamedItem(attribute.name);
                        }
                      }
                    }
                  }
                  elements2.push(...nodes);
                }
                return elements2;
              }, "core");
              const elements = core.call(this, vars, null);
              if (options.insert) {
                const olds = renderedNodes.reset(this, () => elements) ?? [];
                olds.forEach((old) => old.remove());
                this[options.insert](...elements);
              }
              return F.iterableToNodeList(elements);
            }
          }
        );
      }(),
      [[Node.name, $NodeList.name]]: /* @__PURE__ */ function() {
        const normalizeNodes = /* @__PURE__ */ __name(function(nodes) {
          return [...nodes].flatMap((node) => node instanceof NodeList ? [...node] : node);
        }, "normalizeNodes");
        return (
          /** @lends Node.prototype */
          {
            /**
             * clone Node
             *
             * withEvent:
             * - false: same as cloneNode(true)
             * - true: deep clone with event handler
             *
             * @param {Boolean} [withEvent = false]
             * @return {Node}
             */
            $clone(withEvent = false) {
              if (!withEvent) {
                return this.cloneNode(true);
              }
              const cloned = this.cloneNode(false);
              for (const ev of this.$events(null, false, false)) {
                cloned.$on(ev.type + ev.namespaces.map((ns) => `.${ns}`).join(), ev.selector, ev.listener, ev.options);
              }
              for (const child of this.childNodes) {
                if (child instanceof Element) {
                  cloned.appendChild(child.$clone(true));
                } else {
                  cloned.appendChild(child.cloneNode(true));
                }
              }
              return cloned;
            },
            /**
             * insert before this
             *
             * almost the same as before, however, accept NodeList
             *
             * @param {...String|Node|NodeList} [nodes=[]]
             * @return {this}
             *
             * @example
             * {!!!insert here!!!}
             * <this>
             *     child
             * </this>
             */
            $before(...nodes) {
              this.before(...normalizeNodes(nodes));
              return this;
            },
            /**
             * insert first child
             *
             * almost the same as prepend, however, accept NodeList
             *
             * @param {...String|Node|NodeList} [nodes=[]]
             * @return {this}
             *
             * @example
             * <this>
             *     {!!!insert here!!!}
             *     child
             * </this>
             */
            $prepend(...nodes) {
              this.prepend(...normalizeNodes(nodes));
              return this;
            },
            /**
             * insert specified child
             *
             * @param {Number|String|Node|Function} selectorFn
             * @param {...String|Node|NodeList} [nodes=[]]
             * @return {this}
             *
             * @example
             * <this>
             *     child
             *     {!!!insert here!!!}
             *     child
             * </this>
             */
            $insert(selectorFn, ...nodes) {
              this.$childElement(selectorFn)?.$before?.(...normalizeNodes(nodes));
              return this;
            },
            /**
             * insert last child
             *
             * almost the same as append, however, accept NodeList
             *
             * @param {...String|Node|NodeList} [nodes=[]]
             * @return {this}
             *
             * @example
             * <this>
             *     child
             *     {!!!insert here!!!}
             * </this>
             */
            $append(...nodes) {
              this.append(...normalizeNodes(nodes));
              return this;
            },
            /**
             * insert after this
             *
             * almost the same as after, however, accept NodeList
             *
             * @param {...String|Node|NodeList} [nodes=[]]
             * @return {this}
             *
             * @example
             * <this>
             *     child
             * </this>
             * {!!!insert here!!!}
             */
            $after(...nodes) {
              this.after(...normalizeNodes(nodes));
              return this;
            },
            /**
             * replace this
             *
             * almost the same as replaceWith, however, accept NodeList
             *
             * @param {...String|Node|NodeList} [nodes=[]]
             * @return {this}
             */
            $replace(...nodes) {
              this.replaceWith(...normalizeNodes(nodes));
              return this;
            },
            /**
             * replace children
             *
             * exhange parameter of replaceChild, and variadic
             * @see https://developer.mozilla.org/docs/Web/API/Node/replaceChild
             * > The parameter order, new before old, is unusual
             *
             * @param {Node} oldChild
             * @param {...String|Node|NodeList} [nodes=[]]
             * @return {this}
             */
            $replaceChild(oldChild, ...nodes) {
              this.$insert(oldChild, ...nodes);
              this.$childElement(oldChild)?.remove();
              return this;
            },
            /**
             * replace children
             *
             * almost the same as replaceChildren, however, accept NodeList
             *
             * @param {...String|Node|NodeList} [nodes=[]]
             * @return {this}
             */
            $replaceChildren(...nodes) {
              this.replaceChildren(...normalizeNodes(nodes));
              return this;
            },
            /**
             * wrap this element
             *
             * @param {Element} node
             * @return {this}
             *
             * @example
             * <div>
             *   text
             *   <span>span</span>
             * </div>
             *
             * $('div').$wrap($('<section></section>'));
             *
             * <section>
             *   <div>
             *     text
             *     <span>span</span>
             *   </div>
             * </section>
             */
            $wrap(node) {
              this.parentNode.insertBefore(node, this);
              node.appendChild(this);
              return this;
            },
            /**
             * unwrap parent
             *
             * @return {this}
             *
             * @example
             * <section>
             *   <div>
             *     text
             *     <span>span</span>
             *   </div>
             * </section>
             *
             * $('div').$unwrap();
             *
             * <div>
             *   text
             *   <span>span</span>
             * </div>
             */
            $unwrap() {
              this.parentNode.$unwrapChildren();
              return this;
            },
            /**
             * unwrap children
             *
             * @return {this}
             *
             * @example
             * <section>
             *   <div>
             *     text
             *     <span>span</span>
             *   </div>
             * </section>
             *
             * $('div').$unwrapChildren();
             *
             * <section>
             *   text
             *   <span>span</span>
             * </section>
             */
            $unwrapChildren() {
              this.replaceWith(...this.childNodes);
              return this;
            }
          }
        );
      }()
    };
  }
  __name(manipulation, "manipulation");

  // src/plugins/miscellaneous.js
  function miscellaneous(kQuery) {
    return {
      [[Window.name]]: (
        /** @lends Window.prototype */
        {
          /**
           * open by objective windowFeature
           *
           * @param {Object} options
           * @return {WindowProxy}
           *
           * @example
           * window.$open({
           *     url: 'http://example.jp',
           *     left: 'auto',   // 'auto' means parent's center
           *     top: 'auto',    // 'auto' means parent's center
           *     width: 'auto',  // 'auto' means parent's half
           *     height: 'auto', // 'auto' means parent's half
           * });
           */
          $open(options) {
            kQuery.logger.assertInstanceOf(options, Object)();
            options = Object.assign({
              // standard https://developer.mozilla.org/docs/Web/API/Window/open
              ...{
                // string
                url: void 0,
                // string
                target: void 0
              },
              // windowFeatures https://developer.mozilla.org/docs/Web/API/Window/open#windowfeatures
              ...{
                // bool
                window: true,
                // int|string
                left: "auto",
                // int|string
                top: "auto",
                // int|string
                width: "auto",
                // int|string
                height: "auto",
                // bool
                noopener: void 0,
                // bool
                noreferrer: void 0
              }
            }, options);
            if (options.width === "auto") {
              options.width = this.outerWidth / 2;
            }
            if (options.height === "auto") {
              options.height = this.outerHeight / 2;
            }
            if (options.left === "auto" && options.width) {
              options.left = (this.outerWidth - options.width) / 2;
            }
            if (options.top === "auto" && options.height) {
              options.top = (this.outerHeight - options.height) / 2;
            }
            if (options.window && options.left != null) {
              options.left += this.screenX;
            }
            if (options.window && options.top != null) {
              options.top += this.screenY;
            }
            const url = options.url;
            const target = options.target;
            F.objectWalkRecursive(options, function(v, k) {
              if (["url", "target", "window"].includes(k) || v === false) {
                return void 0;
              }
              return v;
            });
            const feature = F.objectJoin(options, ",");
            kQuery.logger.debug(`windowFeature`, feature);
            return this.open(url, target, feature);
          }
        }
      ),
      [[Element.name, $NodeList.name]]: /* @__PURE__ */ function() {
        let scrollIntoViewing = false;
        return (
          /** @lends Element.prototype */
          {
            /**
             * is metadata content
             *
             * @see https://html.spec.whatwg.org/multipage/dom.html#metadata-content
             *
             * @descriptor get
             *
             * @return {Boolean}
             */
            get $isMetadataContent() {
              return ["base", "link", "meta", "noscript", "script", "style", "template", "title"].includes(this.localName.toLowerCase());
            },
            /**
             * get no content outerHTML
             *
             * @param {Boolean} [withClose=true]
             * @return {String}
             *
             * @example
             * document.$createElement('div', {a: 'A', b: 'B'}, 'child').$outerTag();
             * // '<div a="A" b="B"></div>'
             */
            $outerTag(withClose = true) {
              const name = this.localName;
              const attrs = "" + this.$attrs;
              let result = `<${name}${attrs ? " " + attrs : ""}>`;
              if (withClose) {
                result += `</${name}>`;
              }
              return result;
            },
            /**
             * mark matched text nodes
             *
             * @param {String|RegExp} word
             * @param {String|Element} [wrapper]
             * @param {String|Node|Function} [notSelectorFn]
             * @return {this}
             *
             * @example
             * <hgroup>
             *   <h1>this is header</h1>
             *   <p>this is subheader</p>
             * </hgroup>
             *
             * $('hgroup').$markText('is');
             *
             * <hgroup>
             *   <h1>th<mark>is</mark> <mark>is</mark> header</h1>
             *   <p>th<mark>is</mark> <mark>is</mark> subheader</p>
             * </hgroup>
             */
            $markText(word, wrapper, notSelectorFn) {
              kQuery.logger.assertInstanceOf(word, String, RegExp)();
              kQuery.logger.assertInstanceOf(wrapper, Nullable, String, Element)();
              if (!(word instanceof RegExp)) {
                word = new RegExp(F.stringEscape(word, "regex"));
              }
              if (!(wrapper instanceof Element)) {
                wrapper = this.$document.$createElement(wrapper ?? "mark");
              }
              const core = /* @__PURE__ */ __name((node) => {
                for (const child of node.children) {
                  if (child.$isMetadataContent || notSelectorFn != null && child.$matches(notSelectorFn) || child.$outerTag(false) === wrapper.$outerTag(false)) {
                    continue;
                  }
                  core(child);
                }
                for (const child of node.childNodes) {
                  if (child instanceof CharacterData) {
                    const matches = child.nodeValue.match(word);
                    if (matches) {
                      const after = child.splitText(matches.index);
                      after.splitText(matches[0].length);
                      after.$wrap(wrapper.$clone(true));
                    }
                  }
                }
                return node;
              }, "core");
              this.normalize();
              return core(this);
            },
            /**
             * asynchronous scrollIntoView
             *
             * @param {ScrollIntoViewOptions|Object} [options={}]
             * @return {Promise<Boolean>}
             */
            async $scrollIntoView(options = {}) {
              kQuery.logger.assertInstanceOf(options, Object)();
              options = Object.assign({
                // standard https://developer.mozilla.org/docs/Web/API/Element/scrollIntoView
                ...{
                  // string: "smooth" | "instant" | "auto"
                  behavior: void 0,
                  // string: "start" | "center" | "end" | "nearest"
                  block: void 0,
                  // string: "start" | "center" | "end" | "nearest"
                  inline: void 0
                },
                // extends
                ...{
                  // bool
                  global: true,
                  // number
                  timeout: void 0,
                  // number https://developer.mozilla.org/docs/Web/API/IntersectionObserver/thresholds
                  threshold: void 0,
                  // bool emulate https://developer.mozilla.org/docs/Web/API/Element/scrollIntoViewIfNeeded
                  ifNeeded: false
                }
              }, options);
              if (options.global && scrollIntoViewing) {
                return Promise2.resolve(false);
              }
              return new Promise2((resolve, reject) => {
                const observer = new IntersectionObserver((entry, last) => {
                  if (!last && entry.isIntersecting && options.ifNeeded) {
                    resolve(false);
                    observer.unobserve(entry.target);
                    return;
                  }
                  entry.target.scrollIntoView(options);
                  scrollIntoViewing = true;
                  if (entry.isIntersecting) {
                    timeouter?.stop();
                    observer.unobserve(entry.target);
                    scrollIntoViewing = false;
                    resolve(true);
                  }
                }, {
                  threshold: options.threshold ?? 0
                });
                const timeouter = options.timeout ? new Timer() : null;
                timeouter?.addEventListener("alarm", (e) => {
                  observer.unobserve(this);
                  scrollIntoViewing = false;
                  reject(this);
                });
                timeouter?.start(options.timeout);
                observer.observe(this);
              });
            }
          }
        );
      }(),
      [[HTMLDialogElement.name, $NodeList.name]]: (
        /** @lends HTMLDialogElement.prototype */
        {
          /**
           * asynchronous showModal
           *
           * return returnValue
           *
           * @param {Object} [options={}]
           * @return {Promise<?String>}
           *
           * @example
           * setTimeout(() => $('dialog').close('this is return value'), 100);
           * await $('dialog').$showModal();
           * // 'this is return value'
           */
          $showModal(options = {}) {
            kQuery.logger.assertInstanceOf(options, Object)();
            options = Object.assign({
              outside: false,
              escape: true
            }, options);
            return new Promise2((resolve, reject) => {
              const close = /* @__PURE__ */ __name((e) => {
                e.target.removeEventListener("close", close);
                e.target.removeEventListener("cancel", cancel);
                e.target.removeEventListener("click", onOutside);
                e.target.removeEventListener("keydown", onEscape);
                resolve(e.target.returnValue);
              }, "close");
              const cancel = /* @__PURE__ */ __name((e) => {
                e.target.removeEventListener("close", close);
                e.target.removeEventListener("cancel", cancel);
                e.target.removeEventListener("click", onOutside);
                e.target.removeEventListener("keydown", onEscape);
                resolve(null);
              }, "cancel");
              const onOutside = /* @__PURE__ */ __name((e) => {
                if (!this.getBoundingClientRect().$contains(new DOMPointReadOnly(e.clientX, e.clientY))) {
                  this.close(null);
                  this.dispatchEvent(new Event("cancel", {
                    bubbles: false,
                    cancelable: true,
                    composed: false
                  }));
                }
              }, "onOutside");
              const onEscape = /* @__PURE__ */ __name((e) => {
                if (e.code === "Escape") {
                  e.preventDefault();
                }
              }, "onEscape");
              this.returnValue = "";
              this.showModal();
              this.addEventListener("close", close, { once: true });
              this.addEventListener("cancel", cancel, { once: true });
              if (options.outside) {
                this.addEventListener("click", onOutside);
              }
              if (!options.escape) {
                this.addEventListener("keydown", onEscape);
              }
            });
          }
        }
      ),
      [[
        HTMLCollection.name,
        NodeList.name,
        FileList.name,
        DataTransferItemList.name
        /* and more *List */
      ]]: (
        /** @lends List.prototype */
        {
          /**
           * return element of XList's index
           *
           * @param {Number} index
           * @return {any}
           *
           * @example
           * $$('span').$at(-1); // return last node
           */
          $at(index) {
            kQuery.logger.assertInstanceOf(index, Number)();
            return Array.prototype.at.call(this, index);
          },
          /**
           * map and Promise.all
           *
           * @param {Function} callback
           * @return {Promise<any>}
           */
          async $asyncMap(callback) {
            kQuery.logger.assertInstanceOf(callback, Function)();
            return Promise2.all(F.objectToEntries(this).map(([i, e]) => callback(e, i, this)));
          }
        }
      )
    };
  }
  __name(miscellaneous, "miscellaneous");

  // src/plugins/networks.js
  function networks(kQuery) {
    return {
      [[HTMLAnchorElement.name, $NodeList.name]]: (
        /** @lends HTMLAnchorElement.prototype */
        {
          /**
           * submit based on a href
           *
           * - specified form: submit that form, this behave submitter
           * - this has download: download response
           *
           * @param {Object} [options={}]
           * @return {this|Promise<Response>}
           */
          $submit(options = {}) {
            kQuery.logger.assertInstanceOf(options, Object)();
            options = Object.assign({
              // false: navigation, true: fetch
              async: false,
              // HTMLFormElement: connect form
              form: void 0,
              // string: method
              method: void 0,
              // string: enctype
              enctype: "application/x-www-form-urlencoded",
              // bool
              novalidate: false,
              // Object: additional data
              data: {}
            }, options);
            kQuery.logger.assertInstanceOf(options.data, Object, FormData)();
            const url = this.$URL;
            const data2 = new FormData();
            data2.$appendFromEntries(url.searchParams);
            data2.$appendFromEntries(options.data);
            url.search = "";
            const form = options.form ?? this.$document.$createElement("form", {
              action: url,
              method: options.method ?? "post",
              enctype: options.enctype,
              target: this.target,
              hidden: true
            });
            let submitter;
            if (options.form) {
              submitter = this.$document.$createElement("button", {
                type: "submit",
                formaction: url,
                formtarget: this.target,
                formmethod: options.method ?? form.getAttribute("method") ?? "post",
                formenctype: options.enctype,
                formnovalidate: options.novalidate
              });
              form.append(submitter);
            } else {
              for (const [name, value] of data2) {
                const hidden = this.$document.$createElement("input", { type: "hidden" });
                hidden.name = name;
                hidden.value = value;
                form.append(hidden);
              }
            }
            if (options.async || this.download) {
              const formoptions = {};
              if (submitter) {
                formoptions.data = data2;
                formoptions.submitter = submitter;
              }
              try {
                const response = form.$request(formoptions);
                submitter?.remove();
                if (!this.download) {
                  return response;
                }
                if (this.download && !options.raw) {
                  return response.then((response2) => {
                    if (!response2.ok) {
                      throw new response2();
                    }
                    response2.blob().then((blob) => {
                      const url2 = URL.createObjectURL(blob);
                      const newa = this.$document.$createElement("a", {
                        href: url2,
                        download: this.download,
                        hidden: true
                      });
                      try {
                        this.$document.body.appendChild(newa);
                        newa.click();
                      } finally {
                        this.$document.body.removeChild(newa);
                        setTimeout(() => URL.revokeObjectURL(url2), 1e3);
                      }
                    });
                  });
                }
                return response;
              } finally {
                submitter?.remove();
              }
            }
            if (submitter) {
              form.requestSubmit(submitter);
              submitter.remove();
            } else {
              this.$document.body.append(form);
              form.submit();
              form.remove();
            }
            return this;
          }
        }
      ),
      [[HTMLFormElement.name, $NodeList.name]]: (
        /** @lends HTMLFormElement.prototype */
        {
          /**
           * request based on form value
           *
           * @param {RequestInit|{data: Object<String, String>}} [options={}]
           * @return {Promise<Response>}
           */
          async $request(options = {}) {
            kQuery.logger.assertInstanceOf(options, Object)();
            options = Object.assign({
              // ...RequestInit
              ...{},
              // extends
              ...{
                // string
                url: void 0,
                // string
                method: void 0,
                // string
                enctype: void 0,
                // bool
                novalidate: void 0,
                // HTMLElement
                submitter: void 0,
                // Object: additional data
                data: {},
                // string | Function
                fileConverter: void 0,
                // bool
                ok: false,
                // number
                timeout: 0
              }
            }, options);
            if (!(options.headers instanceof Headers)) {
              options.headers = new Headers(options.headers ?? {});
            }
            kQuery.logger.assertInstanceOf(options.headers, Headers)();
            kQuery.logger.assertInstanceOf(options.data, Object, FormData)();
            const novalidate = options.novalidate ?? (options.submitter?.formNoValidate || this.noValidate || false);
            if (!novalidate && !this.reportValidity()) {
              throw new Error(`Invalid form`);
            }
            const action = options.url ?? options.submitter?.getAttribute("formaction") ?? this.getAttribute("action") ?? "";
            const method = options.method ?? options.submitter?.getAttribute("formmethod") ?? this.getAttribute("method") ?? "GET";
            const enctype = options.enctype ?? options.headers.get("content-type") ?? options.submitter?.getAttribute("formenctype") ?? this.getAttribute("enctype") ?? "application/x-www-form-urlencoded";
            options.method = method.toUpperCase();
            options.headers.set("content-type", enctype);
            const url = new URL(action, this.baseURI);
            const formData = new FormData(this, options.submitter);
            for (const [name, value] of F.objectToEntries(options.data)) {
              formData.append(name, value);
            }
            if (options.method === "GET") {
              for (const [name, value] of formData.$toSearchParams()) {
                url.searchParams.append(name, value);
              }
            } else {
              if (enctype.startsWith("application/x-www-form-urlencoded")) {
                options.headers.delete("content-type");
                options.body = formData.$toSearchParams();
              } else if (enctype.startsWith("multipart/form-data")) {
                options.headers.delete("content-type");
                options.body = formData;
              } else if (enctype.startsWith("application/json")) {
                options.body = await formData.$json(options.fileConverter);
              } else {
                throw new Error(`Unknown enctype(${enctype})`);
              }
            }
            return await F.fetch(url, options);
          }
        }
      ),
      [[Element.name, $NodeList.name]]: (
        /** @lends Element.prototype */
        {
          /**
           * load server html
           *
           * @param {String|RequestInit|{data:Object<String, String>}} urlOrOptions
           * @param {RequestInit|{data:Object<String, any>}} [options={}]
           * @return {Promise<NodeList>}
           */
          async $load(urlOrOptions, options = {}) {
            if (F.anyIsStringable(urlOrOptions)) {
              options.url = urlOrOptions;
            } else {
              options = urlOrOptions;
            }
            kQuery.logger.assertInstanceOf(options, Object)();
            options = Object.assign({
              // ...RequestInit
              ...{},
              // extends
              ...{
                // string
                url: void 0,
                // string
                method: void 0,
                // Object: additional data
                data: {},
                // bool
                ok: false,
                // number
                timeout: 0
              }
            }, options);
            if (!(options.headers instanceof Headers)) {
              options.headers = new Headers(options.headers ?? {});
            }
            kQuery.logger.assertInstanceOf(options.url, String)();
            kQuery.logger.assertInstanceOf(options.headers, Headers)();
            kQuery.logger.assertInstanceOf(options.data, Object, FormData)();
            const parts = options.url.split(" ");
            const url = new URL(parts.shift(), this.baseURI);
            const selector = parts.join(" ");
            const method = (options.method ?? "GET").toUpperCase();
            const dataEntries = F.objectToEntries(options.data).map(([k, v]) => [k, v instanceof Function ? v(this) : v]);
            if (method === "GET") {
              for (let [name, value] of dataEntries) {
                url.searchParams.append(name, value);
              }
            } else {
              options.headers.delete("content-type");
              options.body = new URLSearchParams(dataEntries);
            }
            const response = await F.fetch(url, options);
            let nodes = this.$document.$createNodeListFromHTML(await response.text());
            if (selector) {
              nodes = nodes.$$(selector);
            }
            this.$replaceChildren(nodes);
            return nodes;
          }
        }
      ),
      [[Blob.name, $FileList.name]]: (
        /** @lends Blob.prototype */
        {
          /**
           * upload file
           *
           * @param {URL|String|RequestInit} urlOrOptions
           * @param {RequestInit} [options={}]
           * @return {Promise<Response>}
           */
          async $upload(urlOrOptions, options = {}) {
            let url;
            if (F.anyIsStringable(urlOrOptions)) {
              url = urlOrOptions;
            } else {
              url = options.url;
            }
            kQuery.logger.assertInstanceOf(options, Object)();
            options = Object.assign({
              method: "PUT",
              timeout: 0,
              ok: false,
              headers: {},
              credentials: "same-origin",
              progress: /* @__PURE__ */ __name(() => null, "progress")
            }, options);
            const xhr = new XMLHttpRequest();
            xhr.open(options.method.toUpperCase(), url, true);
            xhr.timeout = options.timeout;
            xhr.withCredentials = options.credentials !== "omit";
            xhr.responseType = "arraybuffer";
            for (const [name, value] of F.objectToEntries(options.headers)) {
              xhr.setRequestHeader(name, value);
            }
            const promise = new Promise2((resolve, reject) => {
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
              xhr.addEventListener("load", function() {
                resolve(newResponse());
              });
              xhr.addEventListener("error", function(e) {
                reject(e);
              });
              xhr.addEventListener("abort", function(e) {
                reject(e);
              });
              xhr.addEventListener("timeout", function(e) {
                reject(e);
              });
              xhr.upload.addEventListener("progress", function(e) {
                options.progress(e);
              });
            });
            if (options.method.toUpperCase() === "POST") {
              const formData = new FormData();
              formData.append(options.name ?? "tmp", this);
              xhr.send(formData);
            } else {
              xhr.send(this);
            }
            return promise;
          }
        }
      )
    };
  }
  __name(networks, "networks");

  // src/plugins/traversing.js
  function traversing(kQuery) {
    return {
      [[Document.name, DocumentFragment.name, Element.name]]: (
        /** @lends DocumentLikeElement.prototype */
        {
          /**
           * functional querySelector
           *
           * @param {String|Function} selectorFn
           * @return {?Element}
           */
          $(selectorFn) {
            kQuery.logger.assertInstanceOf(selectorFn, String, Function)();
            if (typeof selectorFn === "function") {
              return Array.prototype.find.call(this.$$("*"), selectorFn) ?? null;
            }
            return this.querySelector(selectorFn);
          },
          /**
           * functional querySelectorAll
           *
           * @param {String|Function} selectorFn
           * @return {NodeList}
           */
          $$(selectorFn) {
            kQuery.logger.assertInstanceOf(selectorFn, String, Function)();
            if (typeof selectorFn === "function") {
              return F.iterableToNodeList([...this.$$("*")].filter(selectorFn));
            }
            return this.querySelectorAll(selectorFn);
          },
          /**
           * functional querySelectorAll with self
           *
           * @param {String|Function} selectorFn
           * @return {NodeList}
           */
          $$$(selectorFn) {
            kQuery.logger.assertInstanceOf(selectorFn, String, Function)();
            const self = this.$matches(selectorFn) ? [this] : [];
            if (typeof selectorFn === "function") {
              return F.iterableToNodeList([...self, ...[...this.$$("*")].filter(selectorFn)]);
            }
            return F.iterableToNodeList([...self, ...this.$$(selectorFn)]);
          },
          /**
           * functional/queryable contains
           *
           * @param {String|Node|Function} selectorFn
           * @return {Boolean}
           */
          $contains(selectorFn) {
            kQuery.logger.assertInstanceOf(selectorFn, String, Node, Function)();
            if (selectorFn instanceof Node) {
              return this.contains(selectorFn);
            }
            if (typeof selectorFn === "string") {
              return !!(this.matches(selectorFn) || this.querySelector(selectorFn));
            }
            return this.$$$(selectorFn).length > 0;
          },
          /**
           * functional matches
           *
           * @param {String|Node|Function} selectorFn
           * @return {Boolean}
           */
          $matches(selectorFn) {
            kQuery.logger.assertInstanceOf(selectorFn, String, Node, Function)();
            if (typeof selectorFn === "function") {
              return !!selectorFn.call(this, this);
            }
            if (selectorFn instanceof Node) {
              return this === selectorFn;
            }
            return this.matches(selectorFn);
          }
        }
      ),
      [[NodeList.name]]: (
        /** @lends NodeList.prototype */
        {
          /**
           * functional querySelector
           *
           * return first element from tree, not per NodeList
           *
           * @param {String|Function} selectorFn
           * @return {?Element}
           *
           * @example
           * <div>
           *     <span>1</span>
           *     <span>2</span>
           * </div>
           * <div>
           *     <span>3</span>
           *     <span>4</span>
           * </div>
           *
           * $$('div').$('span');
           * // <span>1</span>
           */
          $(selectorFn) {
            kQuery.logger.assertInstanceOf(selectorFn, String, Function)();
            for (const node of this) {
              const result = node.$?.(selectorFn);
              if (result) {
                return result;
              }
            }
            return null;
          },
          /**
           * functional querySelectorAll
           *
           * return matched elements from tree, not per NodeList
           *
           * @param {String|Function} selectorFn
           * @return {NodeList}
           *
           * @example
           * <div>
           *     <span>1</span>
           *     <span>2</span>
           * </div>
           * <div>
           *     <span>3</span>
           *     <span>4</span>
           * </div>
           *
           * $$('div').$$('span');
           * // [<span>1</span>, <span>2</span>, <span>3</span>, <span>4</span>]
           */
          $$(selectorFn) {
            kQuery.logger.assertInstanceOf(selectorFn, String, Function)();
            return F.iterableToNodeList(new Set([...this].flatMap((node) => [...node.$$?.(selectorFn) ?? []])));
          },
          /**
           * functional querySelectorAll with self
           *
           * return matched elements from self and tree, not per NodeList
           *
           * @param {String|Function} selectorFn
           * @return {NodeList}
           *
           * @example
           * <div>
           *     <span>1</span>
           *     <span>2</span>
           * </div>
           * <div>
           *     <span>3</span>
           *     <span>4</span>
           * </div>
           *
           * $$('div').$$$('div,span');
           * // [<div></div>, <span>1</span>, <span>2</span>, <div></div>, <span>3</span>, <span>4</span>]
           */
          $$$(selectorFn) {
            kQuery.logger.assertInstanceOf(selectorFn, String, Function)();
            return F.iterableToNodeList(new Set([...this].flatMap((node) => [...node.$$$?.(selectorFn) ?? []])));
          },
          /**
           * functional/queryable contains
           *
           * not per NodeList
           *
           * @param {String|Element|Function} selectorFn
           * @return {Boolean}
           */
          $contains(selectorFn) {
            kQuery.logger.assertInstanceOf(selectorFn, String, Element, Function)();
            return !!Array.prototype.find.call(this, (node) => node.$contains?.(selectorFn));
          },
          /**
           * return first matched element from list
           *
           * not per NodeList
           *
           * @param {String|Element|Function} selectorFn
           * @return {?Element}
           */
          $matches(selectorFn) {
            kQuery.logger.assertInstanceOf(selectorFn, String, Element, Function)();
            return Array.prototype.find.call(this, (node) => node.$matches?.(selectorFn));
          },
          /**
           * get element index
           *
           * @param {String|Node|Function} selectorFn
           * @return {?Number}
           */
          $index(selectorFn) {
            kQuery.logger.assertInstanceOf(selectorFn, String, Node, Function)();
            const index = Array.prototype.findIndex.call(this, (node) => node.$matches?.(selectorFn) ?? false);
            if (index === -1) {
              return null;
            }
            return index;
          },
          /**
           * filter matches elements
           *
           * @param {String|Function} selectorFn
           * @return {NodeList}
           */
          $filter(selectorFn) {
            kQuery.logger.assertInstanceOf(selectorFn, String, Function)();
            return F.iterableToNodeList([...this].filter((node) => node.$matches?.(selectorFn) ?? false));
          },
          /**
           * filter !matches elements
           *
           * @param {String|Function} selectorFn
           * @return {NodeList}
           */
          $except(selectorFn) {
            kQuery.logger.assertInstanceOf(selectorFn, String, Function)();
            return F.iterableToNodeList([...this].filter((node) => !(node.$matches?.(selectorFn) ?? true)));
          },
          /**
           * slice elements
           *
           * @param {Number|String|Node|Function} [start]
           * @param {Number|String|Node|Function} [end]
           * @return {NodeList}
           */
          $slice(start, end) {
            kQuery.logger.assertInstanceOf(start, Nullable, Number, String, Node, Function)();
            kQuery.logger.assertInstanceOf(end, Nullable, Number, String, Node, Function)();
            if (start != null && typeof start !== "number") {
              start = this.$index(start) ?? void 0;
            }
            if (end != null && typeof end !== "number") {
              end = this.$index(end) ?? void 0;
            }
            return F.iterableToNodeList(Array.prototype.slice.call(this, start, end));
          }
        }
      ),
      [[Node.name, $NodeList.name]]: /* @__PURE__ */ function() {
        const nodeGenerateSiblings = /* @__PURE__ */ __name(function* (node, selectorFn, flow) {
          kQuery.logger.assertInstanceOf(node, Node)();
          for (let sibling = node[flow]; sibling; sibling = sibling[flow]) {
            if (selectorFn == null || sibling.$matches(selectorFn)) {
              yield sibling;
            }
          }
        }, "nodeGenerateSiblings");
        return (
          /** @lends Node.prototype */
          {
            /**
             * alias to ownerDocument.defaultView or global Window
             *
             * @descriptor get
             *
             * @return {Window}
             */
            get $window() {
              return this.ownerDocument?.defaultView ?? window;
            },
            /**
             * alias to ownerDocument or global Document
             *
             * @descriptor get
             *
             * @return {Document}
             */
            get $document() {
              return this.ownerDocument ?? window.document;
            },
            /**
             * get all textnodes
             *
             * @param {(Number|String)[]} selector
             * @return {NodeList}
             */
            $textNodes(selector = [Node.TEXT_NODE, Node.COMMENT_NODE, Node.CDATA_SECTION_NODE]) {
              kQuery.logger.assertElementsOf(selector, [Node.TEXT_NODE, Node.COMMENT_NODE, Node.CDATA_SECTION_NODE, "metadata"])();
              const texts = [];
              for (const child of this.childNodes) {
                if (child instanceof CharacterData) {
                  if (selector.includes(child.nodeType)) {
                    texts.push(child);
                  }
                } else {
                  if (selector.includes("metadata") || !child.$isMetadataContent) {
                    texts.push(...child.$textNodes(selector));
                  }
                }
              }
              return F.iterableToNodeList(texts);
            },
            /**
             * functional closest
             *
             * @param {String|Node|Function} selectorFn
             * @return {?Element}
             */
            $closest(selectorFn) {
              kQuery.logger.assertInstanceOf(selectorFn, String, Element, Function)();
              if (typeof selectorFn === "string") {
                return this.closest(selectorFn);
              }
              for (let parent = this; parent != null; parent = parent.parentElement) {
                if (parent.$matches(selectorFn)) {
                  return parent;
                }
              }
              return null;
            },
            /**
             * get matched parent elements
             *
             * @param {String|Function} [selectorFn]
             * @return {NodeList}
             */
            $parents(selectorFn) {
              kQuery.logger.assertInstanceOf(selectorFn, Nullable, String, Function)();
              const parents = [];
              for (let parent = this.parentElement; parent != null; parent = parent.parentElement) {
                if (selectorFn == null || parent.$matches(selectorFn)) {
                  parents.push(parent);
                }
              }
              return F.iterableToNodeList(parents);
            },
            /**
             * get first matched child element
             *
             * @param {Number|String|Node|Function} [selectorFn]
             * @return {?Element}
             */
            $childElement(selectorFn) {
              kQuery.logger.assertInstanceOf(selectorFn, Nullable, Number, String, Element, Function)();
              if (typeof selectorFn === "number") {
                return this.children.$at(selectorFn);
              }
              for (const child of this.children) {
                if (selectorFn == null || child.$matches(selectorFn)) {
                  return child;
                }
              }
              return null;
            },
            /**
             * get matched child elements
             *
             * @param {String|Function} [selectorFn]
             * @return {NodeList}
             */
            $childElements(selectorFn) {
              kQuery.logger.assertInstanceOf(selectorFn, Nullable, String, Function)();
              const children = F.iterableToNodeList(this.children);
              if (selectorFn == null) {
                return children;
              }
              return children.$filter(selectorFn);
            },
            /**
             * get first matched previous element
             *
             * this isn't jQuery like, search all previous elements
             *
             * @param {String|Function} [selectorFn]
             * @return {Element}
             */
            $prevElement(selectorFn) {
              kQuery.logger.assertInstanceOf(selectorFn, Nullable, String, Function)();
              return nodeGenerateSiblings(this, selectorFn, "previousElementSibling").next().value ?? null;
            },
            /**
             * get matched previous elements
             *
             * @param {String|Function} [selectorFn]
             * @return {NodeList}
             */
            $prevElements(selectorFn) {
              kQuery.logger.assertInstanceOf(selectorFn, Nullable, String, Function)();
              return F.iterableToNodeList([...nodeGenerateSiblings(this, selectorFn, "previousElementSibling")].reverse());
            },
            /**
             * get first matched next element
             *
             * this isn't jQuery like, search all next elements
             *
             * @param {String|Function} [selectorFn]
             * @return {Element}
             */
            $nextElement(selectorFn) {
              kQuery.logger.assertInstanceOf(selectorFn, Nullable, String, Function)();
              return nodeGenerateSiblings(this, selectorFn, "nextElementSibling").next().value ?? null;
            },
            /**
             * get matched next elements
             *
             * @param {String|Function} [selectorFn]
             * @return {NodeList}
             */
            $nextElements(selectorFn) {
              kQuery.logger.assertInstanceOf(selectorFn, Nullable, String, Function)();
              return F.iterableToNodeList(nodeGenerateSiblings(this, selectorFn, "nextElementSibling"));
            },
            /**
             * get matched sibling elements
             *
             * @param {String|Node|Function} [selectorFn]
             * @return {NodeList}
             */
            $siblingElements(selectorFn) {
              kQuery.logger.assertInstanceOf(selectorFn, Nullable, String, Node, Function)();
              return F.iterableToNodeList([...this.parentNode.children].filter((child) => child !== this && (selectorFn == null || child.$matches?.(selectorFn))));
            }
          }
        );
      }(),
      [[HTMLInputElement.name, $NodeList.name]]: (
        /** @lends HTMLInputElement.prototype */
        {
          /**
           * get belonging RadioNodeList
           *
           * @return {?RadioNodeList}
           */
          get $radioNodeList() {
            if (this.type !== "radio") {
              return void 0;
            }
            if (!this.form) {
              return void 0;
            }
            const form = this.form;
            const name = this.name;
            const nodelist = form.elements[name];
            if (nodelist instanceof RadioNodeList) {
              return nodelist;
            }
            const pseudo = this.$document.$createElement("input", {
              type: "radio",
              name,
              hidden: true
            });
            this.insertAdjacentElement("afterend", pseudo);
            try {
              return form.elements[name];
            } finally {
              pseudo.remove();
            }
          }
        }
      )
    };
  }
  __name(traversing, "traversing");

  // index-full.js
  var instance = new KQuery(document.currentScript);
  instance.logger.time("register Plugins");
  instance.extends(autoproperties);
  instance.extends(events);
  instance.extends(attributes);
  instance.extends(data);
  instance.extends(forms);
  instance.extends(traversing);
  instance.extends(manipulation);
  instance.extends(dimensions);
  instance.extends(effects);
  instance.extends(networks);
  instance.extends(miscellaneous);
  instance.logger.timeEnd("register Plugins");
  Object.assign(instance.customEvents, { attribute: attribute_default, child: child_default, cookie: cookie_default, disable: disable_default, flick: flick_default, intersect: intersect_default, resize: resize_default, swipe: swipe_default, visible: visible_default });
  var index_full_default = instance;
})();
/**!
 * kQuery
 *
 * @file
 * @license MIT
 * @copyright ryunosuke
 * @ignore
 */
//# sourceMappingURL=kQuery-full.js.map
