const GT = globalThis;

/// shortcut
export const Nullable = function Nullable() {};
export const AsyncFunction = (async () => {}).constructor;
export const GeneratorFunction = (function* () {}).constructor;
export const AsyncGeneratorFunction = (async function* () {}).constructor;

/// listtype
export const $NodeList = function () {
    return [NodeList.name, HTMLCollection.name];
};
export const $CSSRuleList = function () {
    return [CSSRuleList.name];
};
export const $FileList = function () {
    return [FileList.name];
};

/**
 * functions
 *
 * @ignore
 */
export const F = {
    anyIsPrimitive(value, ...specials) {
        if (value == null) {
            return true;
        }
        for (const special of specials) {
            // Object means PlainObject
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
        return !['object', 'function'].includes(typeof (value));
    },
    anyIsStringable(value) {
        if (F.anyIsPrimitive(value)) {
            return true;
        }
        return (value?.toString && value.toString !== Object.prototype.toString);
    },
    stringToKebabCase(string) {
        return ('' + string).replaceAll(/([A-Z])/g, (...m) => '-' + m[1].toLowerCase());
    },
    stringToPascalCase(string, delimiter) {
        delimiter ??= '-';
        const regex = new RegExp(`(\\${delimiter}([a-z]))`, 'ig');
        return ('' + string).replaceAll(regex, (...m) => m[2].toUpperCase());
    },
    stringEscape(string, mode) {
        const htmlTargets = {
            '&': '&amp;',
            '"': '&quot;',
            "'": '&#39;',
            '<': '&lt;',
            '>': '&gt;',
        };
        string += '';
        switch (mode) {
            default:
                throw new Error(`${mode} is undefied`);
            case 'attr-name': {
                const div = document.createElement('div');
                div.setAttribute(string, '');
                return div.attributes[0].name;
            }
            case 'attr-value': {
                return string.replace(/[&"]/g, e => htmlTargets[e]);
            }
            case 'content': {
                return string.replace(/[&<>]/g, e => htmlTargets[e]);
            }
            case 'html': {
                return string.replace(/[&"'<>]/g, e => htmlTargets[e]);
            }
            case 'regex': {
                return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
            }
            case 'css':
            case 'selector': {
                return CSS.escape(string);
            }
        }
    },
    stringQuote(string, mode) {
        string += '';
        switch (mode) {
            default:
                throw new Error(`${mode} is undefied`);
            // https://developer.mozilla.org/docs/Web/CSS/url_function#syntax
            case 'css-url': {
                // simplified version to save trouble(no handleing \\)
                if (!string.includes('"')) {
                    return '"' + string + '"';
                }
                if (!string.includes("'")) {
                    return "'" + string + "'";
                }
                return string.replaceAll(/([ '"()])/g, '\\$1');
            }
        }
    },
    stringUnquote(string, mode) {
        string += '';
        switch (mode) {
            default:
                throw new Error(`${mode} is undefied`);
            // https://developer.mozilla.org/docs/Web/CSS/url_function#syntax
            case 'css-url': {
                // simplified version to save trouble(no handleing \\)
                if (string.at(0) === '"' && string.at(-1) === '"') {
                    return string.slice(1, -1);
                }
                if (string.at(0) === "'" && string.at(-1) === "'") {
                    return string.slice(1, -1).replaceAll(/\\'/g, "'");
                }
                return string.replaceAll(/\\([ '"()])/g, '$1');
            }
        }
    },
    stringIsNaN(string) {
        return Number.isNaN(parseFloat(string));
    },
    stringRender: function () {
        const cache = {};
        return function (template, values, tag = null) {
            const tagFunction = (hashes, ...values) => {
                return values
                    .map((value) => {
                        if (tag == null || value instanceof String) {
                            return value;
                        }
                        // noinspection JSValidateTypes
                        return tag(value);
                    })
                    .map((value, index) => hashes[index] + value)
                    .concat(hashes.slice(values.length))
                    .join('');
            };

            const cachekey = `${tag}\`${template}\``;
            const f = cache[cachekey] ??= new Function('', `return globalThis.$__internalTagFunctions.at(-1)\`${template}\`;`);

            GT.$__internalTagFunctions ??= [];
            GT.$__internalTagFunctions.push(tagFunction);
            try {
                return f.call(values);
            }
            finally {
                GT.$__internalTagFunctions.pop();
            }
        };
    }(),
    objectId: function () {
        const objectMap = new GT.WeakMap();
        let objectCounter = 0;

        return function (object) {
            if (object === null || typeof (object) !== 'object') {
                return null;
            }
            if (!objectMap.has(object)) {
                objectMap.set(object, ++objectCounter);
            }
            return objectMap.get(object);
        };
    }(),
    objectFinalize: function () {
        const finalizer = new FinalizationRegistry(heldValue => heldValue());

        return function (object, destructor) {
            finalizer.register(object, destructor, object);
        };
    }(),
    objectIsPlain(object) {
        if (object == null || typeof (object) !== 'object') {
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
        // check type
        if (object instanceof Array) {
            return true;
        }
        if (object == null || typeof (object) !== 'object') {
            return false;
        }

        // check empty
        const keys = Object.keys(object);
        if (!('length' in object) && keys.length === 0) {
            return false;
        }

        // check length
        const length = object.length ?? (requireLength ? null : keys.length);
        if (length == null) {
            return false;
        }

        // check key length
        const lengthIndex = keys.indexOf('length');
        if (lengthIndex !== -1) {
            keys.splice(lengthIndex, 1);
        }
        if (keys.length !== +length) {
            return false;
        }

        // check index
        const indexKeys = keys.map(v => +v);
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
    objectToAttributes(object, prefix = '') {
        const result = {};

        for (const [name, value] of F.objectToEntries(object)) {
            let fullname = prefix ? `${prefix}-${name}` : name;
            if (fullname.startsWith('data-')) {
                fullname = F.stringToKebabCase(fullname);
            }

            if (fullname === 'style' && F.objectIsPlain(value)) {
                const styles = [];
                for (const [css, style] of F.objectToEntries(value)) {
                    styles.push(F.stringToKebabCase(css) + ':' + style);
                }
                if (styles.length) {
                    result[fullname] = styles.join(';') + ';';
                }
            }
            else if (fullname === 'class') {
                const classes = [];
                for (const [token, flag] of F.objectToEntries(F.objectToClasses(value))) {
                    if (flag) {
                        classes.push(token);
                    }
                }
                if (classes.length) {
                    result[fullname] = classes.join(' ');
                }
            }
            else if (F.objectIsPlain(value)) {
                Object.assign(result, F.objectToAttributes(value, name));
            }
            else {
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
        // native can't accept blank characters or spaces, but very inconvenient
        const normalizeToken = function (token) {
            return ('' + token).split(' ').filter(t => t.length);
        };

        const result = {};

        if (object instanceof Array) {
            for (const token of object) {
                Object.assign(result, F.objectToClasses(token));
            }
        }
        else if (F.objectIsPlain(object)) {
            for (const [key, flag] of F.objectToEntries(object)) {
                for (const token of normalizeToken(key)) {
                    result[normalizeToken(token)] = !!flag;
                }
            }
        }
        else {
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
    objectToDataset(object, prefix = '') {
        const result = {};

        for (const [name, data] of F.objectToEntries(object)) {
            const fullname = F.stringToKebabCase(prefix ? `${prefix}-${name}` : name);

            if (F.objectIsPlain(data) || data instanceof Array) {
                for (const [name2, data2] of F.objectToEntries(F.objectToDataset(data, fullname))) {
                    result[name2] = data2;
                }
                if (data instanceof Array) {
                    result[fullname + '-length'] = data.length;
                }
            }
            else {
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
        // special treats1
        if (object instanceof NamedNodeMap) {
            return Array.from(object).map(attr => [attr.name, attr.value]);
        }
        // special treats2
        if (object instanceof CSSStyleDeclaration) {
            return Array.from(object).map(name => [name, object[name]]);
        }

        if (!Object.hasOwn(object, 'entries') && typeof (object.entries) === 'function') {
            return [...object.entries()];
        }

        if (!Object.hasOwn(object, 'keys') && typeof (object.keys) === 'function') {
            return [...Array.from(object.keys()).flatMap(e => [[e, object[e]]])];
        }

        if (!Object.hasOwn(object, 'values') && typeof (object.values) === 'function') {
            return [...Array.from(object.values()).entries()];
        }

        if (!Object.hasOwn(object, 'length') && 'length' in object) {
            return [...Array.from(object).entries()];
        }

        if (Symbol.iterator in object) {
            // Symbol.iterator will return key, value or entries, so can't auto detect
            // e.g. Array is values https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/Symbol.iterator
            // e.g. Map is [key, value] https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map/Symbol.iterator
        }

        return Object.entries(object);
    },
    /**
     * @param {Object} object
     * @param {Object} properties
     * @returns {Object}
     */
    objectDeleteProperties(object, properties) {
        const result = Object.create(null);

        for (const [propertyName, defaultValue] of F.objectToEntries(properties)) {
            let propertyValue = object[propertyName] ?? defaultValue;
            delete object[propertyName];

            if (defaultValue != null) {
                propertyValue = (() => {
                    switch (typeof (defaultValue)) {
                        case 'boolean':
                            return !!propertyValue;
                        case 'number':
                            return +propertyValue;
                        case 'bigint':
                            return 0n + propertyValue;
                        case 'string':
                            return '' + propertyValue;
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
    objectJoin(object, separator, delimiter = '=') {
        const result = [];
        for (let [key, value] of F.objectToEntries(object)) {
            if (value === undefined) {
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
            }
            else {
                result.push(`${key}${delimiter}${value}`);
            }
        }
        return result.join(separator);
    },
    objectWalkRecursive(object, callback) {
        const isAsync = callback instanceof AsyncFunction;
        const promises = [];
        for (const [key, value] of F.objectToEntries(object)) {
            const assign = (v) => object[key] = v;
            const v = value instanceof Array || F.objectIsPlain(value)
                ? F.objectWalkRecursive(value, callback)
                : callback(value, key, object);

            if (isAsync) {
                promises.push(v.then(assign));
            }
            else {
                assign(v);
            }
        }
        if (isAsync) {
            return Promise.all(promises).then((dummy) => object);
        }
        return object;
    },
    iterableToNodeList(iterable) {
        // https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
        // > Changing the Prototype of an object is, by the nature of how modern JavaScript engines optimize property accesses, currently a very slow operation in every browser and JavaScript engine.
        // > In addition, the effects of altering inheritance are subtle and far-flung, and are not limited to the time spent in the Object.setPrototypeOf(...) statement, but may extend to any code that has access to any object whose Prototype has been altered.
        // > You can read more in JavaScript engine fundamentals: optimizing prototypes.
        // > Because this feature is a part of the language, it is still the burden on engine developers to implement that feature performantly (ideally).
        // > Until engine developers address this issue, if you are concerned about performance, you should avoid setting the Prototype of an object.
        // > Instead, create a new object with the desired Prototype using Object.create().
        // https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/create
        // > Note that there are caveats to watch out for using create(), such as re-adding the constructor property to ensure proper semantics.
        // > Although Object.create() is believed to have better performance than mutating the prototype with Object.setPrototypeOf(), the difference is in fact negligible if no instances have been created and property accesses haven't been optimized yet.
        // return Object.setPrototypeOf([...iterable], NodeList.prototype);

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
                enumerable: true,
            };
        }
        properties.length = {
            value: i,
            configurable: false,
            writable: false,
            enumerable: false,
        };
        return Object.create(NodeList.prototype, properties);
    },
    arrayLikeToArrayRecursive(object, requireLength = true) {
        for (const [key, value] of F.objectToEntries(object)) {
            if (typeof (value) === 'object') {
                object[key] = F.arrayLikeToArrayRecursive(value, requireLength);
            }
        }
        if (F.objectIsArrayLike(object, requireLength)) {
            if (requireLength || 'length' in object) {
                object = Array.from(object);
            }
            else {
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
        return Function.prototype.toString.call(func).slice(-15, -2) === '[native code]';
    },
    functionToCallbackable(func, callbackThis, ...callbackArgs) {
        return function (...args) {
            for (const [i, arg] of args.entries()) {
                const callback = typeof (arg) === 'function' ? arg : null;
                if (callback) {
                    args[i] = callback.call(callbackThis, ...callbackArgs);
                    if (args[i] === undefined) {
                        return;
                    }
                }
            }
            return func.call(this, ...args);
        };
    },
    async fetch(url, options = {}) {
        const {ok, timeout, retryer} = F.objectDeleteProperties(options, {
            ok: false,
            timeout: undefined,
            retryer: function (response, retryCount) {
                const MAX_COUNT = 3;
                const MAX_BACKOFF = 30;
                const JITTER = Math.floor(Math.random() * 1000);

                if (retryCount < MAX_COUNT) {
                    if (response instanceof Response && response.headers.has('retry-after')) {
                        const retryAfter = response.headers.get('retry-after');
                        if (isNaN(retryAfter)) {
                            return Math.max(1000, new Date(retryAfter).getTime() - Date.now()) + JITTER;
                        }
                        else {
                            return retryAfter * 1000 + JITTER;
                        }
                    }

                    if (response instanceof Error || [503, 504].includes(response.status)) {
                        return Math.min(MAX_BACKOFF * 1000, (2 ** retryCount) * 1000) + JITTER;
                    }
                }

                return 0;
            },
        });

        if (timeout) {
            const ctrl = new AbortController();
            setTimeout(() => ctrl.abort(), timeout);

            if (options.signal) {
                options.signal = AbortSignal.any([options.signal, ctrl.signal]);
            }
            else {
                options.signal = ctrl.signal;
            }
        }

        options.headers ??= {};
        if (!(options.headers instanceof Headers)) {
            options.headers = new Headers(options.headers);
        }
        if (window.location.origin === new URL(url, window.location.href).origin) {
            options.headers.append('X-Requested-With', 'XMLHttpRequest');
        }

        let retryCount = 0;
        while (true) {
            let response;
            try {
                response = await GT.fetch(url, options);
            }
            catch (e) {
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
                    cause: response,
                });
            }
            return response;
        }
    },
    async xhr(url, options) {
        const sameorigin = window.location.origin === new URL(url, window.location.href).origin;
        options = Object.assign({
            method: 'GET',
            headers: {},
            body: null,
            credentials: 'same-origin', // 'omit' | 'same-origin' | 'include'
            timeout: 0,
            ok: false,
            signal: null,
            progress: () => null,
        }, options);

        const xhr = new XMLHttpRequest();
        xhr.open(options.method.toUpperCase(), url, true);
        xhr.timeout = options.timeout;
        xhr.withCredentials = (credentials => {
            switch (credentials) {
                case 'omit':
                    return false;
                case 'same-origin':
                    return sameorigin;
                case 'include':
                    return true;
            }
        })(options.credentials);
        xhr.responseType = 'arraybuffer';

        if (!(options.headers instanceof Headers)) {
            options.headers = new Headers(options.headers);
        }
        if (sameorigin) {
            options.headers.append('X-Requested-With', 'XMLHttpRequest');
        }

        if (options.signal) {
            options.signal.addEventListener('abort', () => {
                xhr.abort();
            });
        }

        for (const [name, value] of F.objectToEntries(options.headers)) {
            xhr.setRequestHeader(name, value);
        }

        xhr.send(options.body);

        return new Promise((resolve, reject) => {
            const newResponse = function () {
                const response = new Response(xhr.response, {
                    status: xhr.status,
                    statusText: xhr.statusText,
                    headers: xhr.getAllResponseHeaders().split(/\r\n?/).reduce(function (headers, line) {
                        if (line.trim()) {
                            const [name, value] = line.split(':');
                            headers.append(name.trim(), value.trim());
                        }
                        return headers;
                    }, new Headers()),
                });
                return Object.defineProperties(response, {
                    url: {
                        get() {return xhr.responseURL;},
                    },
                });
            };
            xhr.addEventListener('readystatechange', function () {
                if (xhr.readyState === XMLHttpRequest.HEADERS_RECEIVED) {
                    if (!options.ok && !(200 <= xhr.status && xhr.status < 300)) {
                        reject(new Error(`${xhr.status}: ${xhr.statusText}`, {
                            cause: newResponse(),
                        }));
                    }
                    // if emulate fetch, should return Response at this timing
                    // but ReadableByteStream is limited availability yet
                }
            });
            xhr.addEventListener('load', () => {
                resolve(newResponse());
            });
            xhr.addEventListener('error', (e) => {
                reject(e);
            });
            xhr.addEventListener('abort', (e) => {
                reject(e);
            });
            xhr.addEventListener('timeout', (e) => {
                reject(e);
            });
            xhr.upload.addEventListener('progress', (e) => {
                options.progress(e, options.body);
            });
        });
    },
};

/**
 * Configuration
 *
 * @private
 */
export class Configuration {
    static TRUES = Object.freeze(['true', 'yes', '1']);
    static instance;

    #source;

    constructor(source) {
        Configuration.instance = this;

        this.#source = source;
    }

    configure(defaults, force = false) {
        for (const [name, value] of Object.entries(defaults)) {
            if (force || this.#source[name] === undefined) {
                this[name] = value;
                continue;
            }

            if (typeof (value) === 'boolean') {
                this[name] = Configuration.TRUES.includes(this.#source[name]);
            }
            else if (typeof (value) === 'number') {
                this[name] = +this.#source[name];
            }
            else if (typeof (value) === 'string') {
                this[name] = '' + this.#source[name];
            }
            else if (typeof (value) === 'function') {
                this[name] = value(this.#source[name], name, this.#source);
            }
            else {
                this[name] = JSON.parse(this.#source[name]);
            }
        }

        return this;
    }
}

/**
 * Logger
 *
 * @private
 */
export class Logger {
    static instance;

    static anyIsInstanceOf(value, prototype) {
        // same
        if (value === prototype) {
            return true;
        }
        // nullable
        if (Nullable === prototype && value == null) {
            return true;
        }
        // Object means PlainObject
        if (prototype === Object && F.objectIsPlain(value)) {
            return true;
        }
        // standard type(except Object)
        if (prototype !== Object && typeof (prototype) === 'function' && Object(value) instanceof prototype) {
            return true;
        }
        // Boolean is loosey(allow all scalar)
        if (prototype === Boolean && F.anyIsPrimitive(value)) {
            return true;
        }
        // Number is loosey(allow numeric string)
        if (prototype === Number && (Object(value) instanceof prototype || !isNaN(value))) {
            return true;
        }
        // String is loosey(allow contains toString)
        if (prototype === String && (Object(value) instanceof prototype || (value?.toString && value.toString !== Object.prototype.toString))) {
            return true;
        }

        return false;
    }

    static anyToDisplayName(value) {
        if (value == null) {
            return '' + value;
        }
        if (typeof (value) === 'function') {
            return value.name ?? '' + value;
        }
        return '' + value;
    }

    constructor(debug, level, prefix, console) {
        Logger.instance = this;

        const noop = () => null;
        const noop2 = () => noop;

        this.error = level < 3 ? noop : console.error.bind(this, prefix);
        this.warn = level < 4 ? noop : console.warn.bind(this, prefix);
        this.info = level < 6 ? noop : console.info.bind(this, prefix);
        this.debug = level < 7 ? noop : console.debug.bind(this, prefix);

        // notice doesn't exist in native, so it is treated as info in debug, warn in no debug
        this.notice = level < 5 ? noop : debug ? console.warn.bind(this, prefix) : console.info.bind(this, prefix);

        this.time = level < 7 ? noop : label => console.time.call(this, `${prefix} ${label}`);
        this.timeEnd = level < 7 ? noop : label => console.timeEnd.call(this, `${prefix} ${label}`);

        this.assert = !debug ? noop2 : (actual, ...args) => {
            let others = args;
            if (actual instanceof Function) {
                others = ['' + actual];
                actual = actual(...args);
            }
            return console.assert.bind(this, actual, prefix, ...others);
        };
        this.assertInstanceOf = !debug ? noop2 : (actual, ...expecteds) => {
            for (const expected of expecteds) {
                if (Logger.anyIsInstanceOf(actual, expected)) {
                    return noop;
                }
            }
            return console.assert.bind(this, false, prefix, `${Logger.anyToDisplayName(actual)} type must be ${expecteds.map(Logger.anyToDisplayName).join('|')}`);
        };
        this.assertElementsInstanceOf = !debug ? noop2 : (actual, ...expecteds) => {
            for (const expected of expecteds) {
                if (Object.values(actual).every(v => Logger.anyIsInstanceOf(v, expected))) {
                    return noop;
                }
            }
            return console.assert.bind(this, false, prefix, `${Logger.anyToDisplayName(actual)} type must be ${expecteds.map(Logger.anyToDisplayName).join('|')}`);
        };
        this.assertElementOf = !debug ? noop2 : (actual, ...expecteds) => {
            for (const expected of expecteds) {
                if (expected.includes(actual)) {
                    return noop;
                }
            }
            return console.assert.bind(this, false, prefix, `${Logger.anyToDisplayName(actual)} must be one of ${expecteds.map(Logger.anyToDisplayName).join('|')}`);
        };
        this.assertElementsOf = !debug ? noop2 : (actual, ...expecteds) => {
            for (const expected of expecteds) {
                if (Object.values(actual).every(v => expected.includes(v))) {
                    return noop;
                }
            }
            return console.assert.bind(this, false, prefix, `${Logger.anyToDisplayName(actual)} must be one of ${expecteds.map(Logger.anyToDisplayName).join('|')}`);
        };
    }
}

/**
 * Node Collection
 *
 * @private
 */
export class Collection extends null {
    constructor(array, name, ancestor) {
        ancestor ??= array;
        const collection = Object.defineProperties(() => {}, {
            name: {value: `Collection of ${name}`},
            length: {value: array.length},
        });
        if (Configuration.instance.debug) {
            // for devtools console
            array.forEach((e, i) => collection[i] = e);
        }

        return new Proxy(collection, {
            has(target, property) {
                if (property in array) {
                    return Reflect.has(array, property);
                }
                if (array.length === 0) {
                    Logger.instance.notice(`Tried to manipulate empty list, but mostly a bug. Please check selectors etc. if not intended`);
                }

                return array.some(e => Reflect.has(e, property));
            },
            get(target, property) {
                if (property in array) {
                    return Reflect.get(array, property);
                }
                if (array.length === 0) {
                    Logger.instance.notice(`Tried to manipulate empty list, but mostly a bug. Please check selectors etc. if not intended`);
                }

                // emulate toString
                if (property === Symbol.toPrimitive) {
                    return (hint) => array.map(e => F.anyIsPrimitive(e, Array) ? e : Reflect.get(e, property)?.call(e, hint)).join();
                }

                const mapped = array.map(e => F.anyIsPrimitive(e, Array) ? e : Reflect.get(e, property));
                if (mapped.every(e => F.anyIsPrimitive(e, Object, Array))) {
                    return mapped;
                }
                return new Collection(mapped, `${name}.${property}`, ancestor);
            },
            set(target, property, value) {
                if (property in array) {
                    return Reflect.set(array, property, value);
                }
                if (array.length === 0) {
                    Logger.instance.notice(`Tried to manipulate empty list, but mostly a bug. Please check selectors etc. if not intended`);
                }

                array.forEach((e, i) => F.functionToCallbackable(v => Reflect.set(e, property, v), e, ancestor?.[i], i)(value));
                return true;
            },
            deleteProperty(target, property) {
                if (property in array) {
                    return Reflect.deleteProperty(array, property);
                }
                if (array.length === 0) {
                    Logger.instance.notice(`Tried to manipulate empty list, but mostly a bug. Please check selectors etc. if not intended`);
                }

                array.forEach(e => Reflect.deleteProperty(e, property));
                return true;
            },
            apply(target, thisArg, argArray) {
                if (array.length === 0) {
                    Logger.instance.notice(`Tried to manipulate empty list, but mostly a bug. Please check selectors etc. if not intended`);
                    return [];
                }

                // method mode
                if (array.some(e => typeof (e) === 'function')) {
                    let emptyFlag = false;
                    let undefinedFlag = true;
                    let primitiveFlag = true;
                    let sameFlag = true;
                    let promiseFlag = false;

                    const results = array.map((e, i) => {
                        if (typeof (e) === 'function') {
                            if (e instanceof Proxy && argArray.length === 0) {
                                emptyFlag = true;
                                return;
                            }

                            if (!(e instanceof Proxy)) {
                                e.i = i;
                            }
                            const result = Reflect.apply(e, thisArg?.[i], argArray);

                            undefinedFlag = undefinedFlag && result === undefined;
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

                    return new Collection(results, `${name}()`, ancestor);
                }

                // getter mode
                if (argArray.length === 0) {
                    return array;
                }

                // setter mode
                if (argArray.length === 1) {
                    // reserved
                }

                Logger.instance.error(`apply called, but not a single case was executed`, target);
            },
        });
    }
}

/**
 * WeakMap
 *
 * - iterable and size
 * - utility(e.g. getOrSet)
 *
 * @private
 */
export class WeakMap {
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
            value: value,
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

    * entries() {
        for (const obj of this.map.values()) {
            const object = obj.ref.deref();
            if (object === undefined) {
                this.map.delete(object);
                continue;
            }
            yield [object, obj.value];
        }
    }

    get size() {
        return [...this.entries()].length;
    }
}

/**
 * ObjectStorage
 *
 * - multivalue map based on key-value object
 *
 * @private
 */
export class ObjectStorage {
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

    * entries() {
        yield* this.weakmap.entries();
    }

    get size() {
        return this.weakmap.size;
    }
}

/**
 * Promise
 *
 * - cancelable from external
 *
 * @private
 */
export class Promise extends GT.Promise {
    static resolvedReasonSymbol = Symbol('resolved');

    static async #concurrency(asyncs, throwable, concurrency = null) {
        Logger.instance.assertElementsInstanceOf(asyncs, Function, AsyncFunction)();

        concurrency ??= window.navigator.hardwareConcurrency;

        const keys = F.objectToEntries(asyncs).map(([k]) => k);
        const result = asyncs instanceof Array ? new Array(asyncs.length) : {};

        let index = 0;
        await Promise.all(Array.from({length: concurrency}).map(async () => {
            while (true) {
                const key = keys[index++];
                if (!asyncs[key]) {
                    return;
                }
                try {
                    result[key] = await asyncs[key](key);
                }
                catch (e) {
                    if (throwable) {
                        throw e;
                    }
                    else {
                        result[key] = e;
                    }
                }
            }
        }));
        return result;
    }

    static async concurrencyAll(asyncs, concurrency = null) {
        return Promise.#concurrency(asyncs, true, concurrency);
    }

    static async concurrencyAllSettled(asyncs, concurrency = null) {
        return Promise.#concurrency(asyncs, false, concurrency);
    }

    constructor(callback) {
        let resolve, reject;
        super((resolve2, reject2) => {
            resolve = resolve2;
            reject = reject2;
        });

        const resolve2 = (v) => {
            this.status = 'fulfilled';
            resolve(v);
        };
        const reject2 = (v) => {
            this.status = 'rejected';
            reject(v);
        };
        const controller = new AbortController();
        controller.signal.addEventListener('abort', (e) => {
            if (e.target.reason === Promise.resolvedReasonSymbol) {
                resolve2(this.resolved);
            }
            else {
                reject2(e.target.reason);
            }
        });
        callback(resolve2, reject2);

        this.controller = controller;
        this.resolved = null;
        this.status = 'pending';
    }

    cancel(resolved) {
        this.resolved = resolved;
        this.controller.abort(Promise.resolvedReasonSymbol);
    }

    abort(reason) {
        this.controller.abort(reason);
    }
}

/**
 * FileReader
 *
 * - promisable
 *
 * @private
 */
export class FileReader extends GT.FileReader {
    promise() {
        return new Promise((resolve, reject) => {
            this.addEventListener('load', e => resolve(e.target.result));
            this.addEventListener('error', e => reject(e.target.error));
        });
    }
}

/**
 * Proxy
 *
 * - enable instanceof
 *
 * @private
 */
export class Proxy extends null {
    static instances = new WeakSet();

    static [Symbol.hasInstance](instance) {
        return Proxy.instances.has(instance);
    }

    constructor(object, handlers) {
        const instance = new GT.Proxy(object, handlers);
        Proxy.instances.add(instance);
        return instance;
    }
}

/**
 * Timer
 *
 * - eventable
 * - resolvable/rejectable wait
 *
 * @private
 */
export class Timer extends EventTarget {
    constructor() {
        super();

        this.id = null;
        this.millisecond = null;
    }

    static wait(millisecond) {
        const timer = new this();
        return new Promise((resolve, reject) => {
            timer.addEventListener('alarm', e => resolve(Date.now() - e.detail.time));
            timer.start(millisecond);
        }).finally(() => timer.stop());
    }

    start(millisecond, repeat = 1) {
        Logger.instance.assert(this.id === null)(`Timer is started, please use restart`);

        this.millisecond = millisecond;

        const start = (tick, time) => {
            this.id = setTimeout(() => {
                this.dispatchEvent(new CustomEvent('alarm', {
                    detail: {
                        id: this.id,
                        tick: tick,
                        time: time,
                    },
                }));
                if (tick < repeat) {
                    start(tick + 1, Date.now());
                }
            }, this.millisecond);
        };
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
}

/**
 * Options
 *
 * - fixed key
 * - defaultable
 *
 * @private
 */
export class Options {
    constructor(defaultOptions, handleNull = false, handleUndefined = false) {
        this.options = defaultOptions;
        this.handleNull = handleNull;
        this.handleUndefined = handleUndefined;
    }

    extends(otherOptions) {
        return new Options(Object.assign({}, this.options, otherOptions), this.handleNull, this.handleUndefined);
    }

    merge(otherOptions) {
        const options = {};
        for (const key of Object.keys(this.options)) {
            if (this.handleNull && key in otherOptions && otherOptions[key] === null) {
                options[key] = otherOptions[key];
            }
            else if (this.handleUndefined && key in otherOptions && otherOptions[key] === undefined) {
                options[key] = otherOptions[key];
            }
            else {
                options[key] = otherOptions[key] ?? this.options[key];
            }
        }
        return options;
    }
}

/**
 * Timer base Observer
 *
 * @private
 */
export class TimerObserver {
    static observers = new GT.Set();
    static timer = new Timer();

    static defaultOptions = new Options({
        interval: 1000,
    });

    constructor(callback, options = {}) {
        this.options = TimerObserver.defaultOptions.merge(options);
        this.observedNodes = new ObjectStorage();
        this.callback = (e) => {
            const entries = [];
            for (const [target, value] of this.observedNodes.entries()) {
                const news = this._data(target);
                const diffs = this._compare(value.data, news);
                this.observedNodes.set(target, 'data', news);
                for (const diff of diffs) {
                    entries.push(Object.assign(diff, {
                        target: target,
                        time: e.timeStamp,
                    }));
                }
            }

            for (const entry of entries) {
                callback(entry, this.observedNodes.reset(entry.target, 'last', () => entry));
            }
        };

        TimerObserver.timer.addEventListener('alarm', this.callback);
    }

    _data(target) {}

    _compare(data1, data2) {}

    observe(target) {
        this.observedNodes.set(target, 'data', this._data(target));

        TimerObserver.timer.restart(Math.min(TimerObserver.timer.millisecond ?? this.options.interval, this.options.interval), Infinity);
        TimerObserver.observers.add(this);
    }

    unobserve(target) {
        this.observedNodes.delete(target);
        if (this.observedNodes.size === 0) {
            this.disconnect();
        }
    }

    disconnect() {
        this.observedNodes.clear();

        TimerObserver.timer.removeEventListener('alarm', this.callback);
        TimerObserver.observers.delete(this);
        if (TimerObserver.observers.size === 0) {
            TimerObserver.timer.stop();
        }
    }

    entries() {
        return this.observedNodes.entries();
    }
}

/**
 * Cookie Observer
 *
 * @private
 */
export class CookieObserver extends TimerObserver {
    static defaultOptions = TimerObserver.defaultOptions.extends({
        cookieName: undefined,
    });

    static getOptionsKey(options) {
        return JSON.stringify(this.defaultOptions.merge(options));
    }

    constructor(callback, options = {}) {
        super(callback, options);

        this.options = CookieObserver.defaultOptions.merge(options);
    }

    _data(target) {
        return {
            cookie: target.cookie,
            cookies: Object.fromEntries(target.cookie.split('; ').map(v => v.split(/=(.*)/s).map(decodeURIComponent))),
        };
    }

    _compare(data1, data2) {
        if (data1.cookie === data2.cookie) {
            return [];
        }

        const names = new Set();
        Object.keys(data1.cookies).forEach(name => names.add(name));
        Object.keys(data2.cookies).forEach(name => names.add(name));

        const diffs = [];
        for (const name of names.values()) {
            if (this.options.cookieName == null || this.options.cookieName.includes(name)) {
                const oldValue = data1.cookies[name];
                const newValue = data2.cookies[name];
                if (oldValue !== newValue) {
                    diffs.push({
                        cookieName: name,
                        oldValue: oldValue,
                        newValue: newValue,
                    });
                }
            }
        }
        return diffs;
    }
}

/**
 * MutationObserver
 *
 * - common options
 * - provide last entry
 * - unobservable
 * - iterable
 *
 * @private
 */
export class MutationObserver extends GT.MutationObserver {
    static defaultOptions = new Options({
        attributes: undefined,
        attributeFilter: undefined,
        attributeOldValue: undefined,
        characterData: undefined,
        characterDataOldValue: undefined,
        childList: undefined,
        subtree: undefined,
    });

    static getOptionsKey(options) {
        return JSON.stringify(this.defaultOptions.merge(options));
    }

    constructor(callback, options = {}) {
        super(function (entries) {
            for (const entry of entries) {
                callback(entry, this.observedNodes.reset(entry.target, () => entry));
            }
        });

        this.options = MutationObserver.defaultOptions.merge(options);
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
            }
            else {
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
}

/**
 * ResizeObserver
 *
 * - common options
 * - provide last entry
 * - iterable
 *
 * @private
 */
export class ResizeObserver extends GT.ResizeObserver {
    static defaultOptions = new Options({
        box: undefined,
    });

    static getOptionsKey(options) {
        return JSON.stringify(this.defaultOptions.merge(options));
    }

    constructor(callback, options = {}) {
        super(function (entries) {
            for (const entry of entries) {
                callback(entry, this.observedNodes.reset(entry.target, () => entry));
            }
        }, options);

        this.options = ResizeObserver.defaultOptions.merge(options);
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
}

/**
 * IntersectionObserver
 *
 * - provide last entry
 * - iterable
 *
 * @private
 */
export class IntersectionObserver extends GT.IntersectionObserver {
    static defaultOptions = new Options({
        root: undefined,
        rootMargin: undefined,
        threshold: undefined,
    });

    static getOptionsKey(options) {
        // new, because need for normalizing property
        const observer = new GT.IntersectionObserver(() => {}, options);
        const keyObject = {
            root: observer.root,
            rootMargin: observer.rootMargin,
            threshold: observer.thresholds,
        };
        keyObject.root = F.objectId(keyObject.root);
        return JSON.stringify(keyObject);
    }

    constructor(callback, options = {}) {
        options = IntersectionObserver.defaultOptions.merge(options);
        super(function (entries) {
            for (const entry of entries) {
                // occasionally {intersectionRatio:0, isIntersecting:true}, What does that mean?
                // probably truncation due to error, but perfect zero is not convenient and will be rectified
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
}

/**
 * CustomEvent
 *
 * @private
 */
export class CustomEvent extends GT.CustomEvent {
    constructor(type, options) {
        super(type, options);

        this.$original = options.$original;
    }
}

/**
 * DOMPoint with timestamp
 *
 * @private
 */
export class Vector2 extends DOMPoint {
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
}
