import {$FileList, $NodeList, F, Promise, WeakMap} from '../API.js';

/**
 * @param {KQuery} kQuery
 *
 * @ignore
 */
export function networks(kQuery) {
    const eventSources = {};

    return {
        [[Node.name, $NodeList.name]]: /** @lends Node.prototype */{
            /**
             * listen SSE event
             *
             * - same url connection is shared
             *   - when all dom were deleted, close connection
             * - url's hash means eventName
             *
             * @param {URL|String} url
             * @param {Function} listener
             * @param {Object} [options={}]
             * @return {this}
             */
            $listen(url, listener, options = {}) {
                options = Object.assign({
                    credentials: false,
                }, options);

                url = new URL(url, this.baseURI);
                const eventName = url.hash.substring(1) || 'message';
                url.hash = '';

                const eventSource = eventSources[url] ??= new class extends EventSource {
                    #$nodeListeners;

                    constructor(url, options) {
                        super(url, options);

                        kQuery.logger.debug(`SSE open ${url}#`);
                        this.#$nodeListeners = new WeakMap();
                    }

                    $listen(node, name, listener) {
                        const names = [...this.#$nodeListeners.entries()].flatMap(([, namedListeners]) => Object.keys(namedListeners));
                        if (!names.includes(name)) {
                            kQuery.logger.debug(`SSE listen ${this.url}#${name}`);
                            this.addEventListener(name, e => {
                                if (this.#$nodeListeners.size === 0) {
                                    delete eventSources[this.url];
                                    this.close();
                                    kQuery.logger.debug(`SSE close ${this.url}`);
                                }
                                for (const [node, namedListeners] of this.#$nodeListeners.entries()) {
                                    for (const listener of namedListeners[name] ?? []) {
                                        listener.call(node, e);
                                    }
                                }
                            });
                        }

                        const namedListeners = this.#$nodeListeners.getOrSet(node, () => ({}));
                        namedListeners[name] ??= [];
                        namedListeners[name].push(listener);
                    }
                }(url, {
                    withCredentials: options.credentials,
                });
                if (eventSource.withCredentials !== !!options.credentials) {
                    kQuery.logger.error(`SSE url(credentials) is difference`);
                }

                eventSource.$listen(this, eventName, listener);

                return this;
            },
        },
        [[HTMLAnchorElement.name, $NodeList.name]]: /** @lends HTMLAnchorElement.prototype */{
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
                    form: undefined,
                    // string: method
                    method: undefined,
                    // string: enctype
                    enctype: 'application/x-www-form-urlencoded',
                    // bool
                    novalidate: false,
                    // Object: additional data
                    data: {},
                }, options);
                kQuery.logger.assertInstanceOf(options.data, Object, FormData)();

                // url & parameters
                const url = this.$URL;
                const data = new FormData();
                data.$appendFromEntries(url.searchParams);
                data.$appendFromEntries(options.data);
                url.search = '';

                // build form
                const form = options.form ?? this.$document.$createElement('form', {
                    action: url,
                    method: options.method ?? 'post',
                    enctype: options.enctype,
                    target: this.target,
                    hidden: true,
                });
                let submitter;
                if (options.form) {
                    submitter = this.$document.$createElement('button', {
                        type: 'submit',
                        formaction: url,
                        formtarget: this.target,
                        formmethod: options.method ?? form.getAttribute('method') ?? 'post',
                        formenctype: options.enctype,
                        formnovalidate: options.novalidate,
                    });
                    form.append(submitter);
                }
                else {
                    for (const [name, value] of data) {
                        const hidden = this.$document.$createElement('input', {type: 'hidden'});
                        hidden.name = name;
                        hidden.value = value;
                        form.append(hidden);
                    }
                }

                // async or download mode
                if (options.async || this.download) {
                    const formoptions = {};
                    if (submitter) {
                        formoptions.data = data;
                        formoptions.submitter = submitter;
                    }
                    try {
                        const response = form.$request(formoptions);
                        submitter?.remove(); // remove as soon as possible
                        if (!this.download) {
                            return response;
                        }
                        if (this.download && !options.raw) {
                            return response.then((response) => {
                                if (!response.ok) {
                                    throw new response;
                                }
                                response.blob().then((blob) => {
                                    const url = URL.createObjectURL(blob);
                                    const newa = this.$document.$createElement('a', {
                                        href: url,
                                        download: this.download,
                                        hidden: true,
                                    });
                                    try {
                                        this.$document.body.appendChild(newa);
                                        newa.click();
                                    }
                                    finally {
                                        this.$document.body.removeChild(newa);
                                        setTimeout(() => URL.revokeObjectURL(url), 1000);
                                    }
                                });
                            });
                        }
                        return response;
                    }
                    finally {
                        submitter?.remove();
                    }
                }

                // submit mode
                if (submitter) {
                    form.requestSubmit(submitter);
                    submitter.remove();
                }
                else {
                    this.$document.body.append(form);
                    form.submit();
                    form.remove();
                }
                return this;
            },
        },
        [[HTMLFormElement.name, $NodeList.name]]: /** @lends HTMLFormElement.prototype */{
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
                        url: undefined,
                        // string
                        method: undefined,
                        // string
                        enctype: undefined,
                        // bool
                        novalidate: undefined,
                        // HTMLElement
                        submitter: undefined,
                        // Object: additional data
                        data: {},
                        // string | Function
                        fileConverter: undefined,
                        // bool
                        ok: false,
                        // number
                        timeout: 0,
                    },
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

                // notice: form.enctype/action/method return normalized value, so use getAttribute
                // priority: options value -> submitter attr -> form attr
                const action = options.url ?? options.submitter?.getAttribute('formaction') ?? this.getAttribute('action') ?? '';
                const method = options.method ?? options.submitter?.getAttribute('formmethod') ?? this.getAttribute('method') ?? 'GET';
                const enctype = options.enctype ?? options.headers.get('content-type') ?? options.submitter?.getAttribute('formenctype') ?? this.getAttribute('enctype') ?? 'application/x-www-form-urlencoded';

                // normalize
                options.method = method.toUpperCase();
                options.headers.set('content-type', enctype);

                // url & parameters
                const url = new URL(action, this.baseURI);
                const formData = new FormData(this, options.submitter);
                for (const [name, value] of F.objectToEntries(options.data)) {
                    formData.append(name, value);
                }

                // GET application/x-www-form-urlencoded: merge URL+FormData
                // POST application/x-www-form-urlencoded: unset File
                // POST multipart/form-data: standard behavior
                if (options.method === 'GET') {
                    for (const [name, value] of formData.$toSearchParams()) {
                        url.searchParams.append(name, value);
                    }
                }
                else {
                    if (enctype.startsWith('application/x-www-form-urlencoded')) {
                        options.headers.delete('content-type'); // for encoding
                        options.body = formData.$toSearchParams();
                    }
                    else if (enctype.startsWith('multipart/form-data')) {
                        options.headers.delete('content-type'); // for boundary
                        options.body = formData;
                    }
                    else if (enctype.startsWith('application/json')) {
                        options.body = await formData.$json(options.fileConverter);
                    }
                    else {
                        throw new Error(`Unknown enctype(${enctype})`);
                    }
                }

                return await F.fetch(url, options);
            },
        },
        [[Element.name, $NodeList.name]]: /** @lends Element.prototype */{
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
                }
                else {
                    options = urlOrOptions;
                }
                kQuery.logger.assertInstanceOf(options, Object)();
                options = Object.assign({
                    // ...RequestInit
                    ...{},
                    // extends
                    ...{
                        // string
                        url: undefined,
                        // string
                        method: undefined,
                        // Object: additional data
                        data: {},
                        // bool
                        ok: false,
                        // number
                        timeout: 0,
                    },
                }, options);
                if (!(options.headers instanceof Headers)) {
                    options.headers = new Headers(options.headers ?? {});
                }
                kQuery.logger.assertInstanceOf(options.url, String)();
                kQuery.logger.assertInstanceOf(options.headers, Headers)();
                kQuery.logger.assertInstanceOf(options.data, Object, FormData)();

                // url & parameters
                const parts = options.url.split(' ');
                const url = new URL(parts.shift(), this.baseURI);
                const selector = parts.join(' ');
                const method = (options.method ?? 'GET').toUpperCase();
                const dataEntries = F.objectToEntries(options.data).map(([k, v]) => [k, v instanceof Function ? v(this) : v]);

                if (method === 'GET') {
                    for (let [name, value] of dataEntries) {
                        url.searchParams.append(name, value);
                    }
                }
                else {
                    options.headers.delete('content-type'); // for encoding
                    options.body = new URLSearchParams(dataEntries);
                }

                const response = await F.fetch(url, options);
                let nodes = this.$document.$createNodeListFromHTML(await response.text());
                if (selector) {
                    nodes = nodes.$$(selector);
                }
                this.$replaceChildren(nodes);
                return nodes;
            },
        },
        [[Blob.name, $FileList.name]]: /** @lends Blob.prototype */{
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
                }
                else {
                    url = options.url;
                }
                kQuery.logger.assertInstanceOf(options, Object)();
                options = Object.assign({
                    method: 'PUT',
                    timeout: 0,
                    ok: false,
                    headers: {},
                    credentials: 'same-origin',
                    progress: () => null,
                }, options);

                const xhr = new XMLHttpRequest();
                xhr.open(options.method.toUpperCase(), url, true);
                xhr.timeout = options.timeout;
                xhr.withCredentials = options.credentials !== 'omit';
                xhr.responseType = 'arraybuffer';

                for (const [name, value] of F.objectToEntries(options.headers)) {
                    xhr.setRequestHeader(name, value);
                }

                const promise = new Promise((resolve, reject) => {
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
                    xhr.addEventListener('load', function () {
                        resolve(newResponse());
                    });
                    xhr.addEventListener('error', function (e) {
                        reject(e);
                    });
                    xhr.addEventListener('abort', function (e) {
                        reject(e);
                    });
                    xhr.addEventListener('timeout', function (e) {
                        reject(e);
                    });
                    xhr.upload.addEventListener('progress', function (e) {
                        options.progress(e);
                    });
                });

                if (options.method.toUpperCase() === 'POST') {
                    const formData = new FormData();
                    formData.append(options.name ?? 'tmp', this);
                    xhr.send(formData);
                }
                else {
                    xhr.send(this);
                }

                return promise;
            },
        },
    };
}
