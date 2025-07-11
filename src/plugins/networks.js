import {$NodeList, F, Promise, Proxy, WeakMap} from '../API.js';

/**
 * @param {KQuery} kQuery
 *
 * @ignore
 */
export function networks(kQuery) {
    class EventSource extends globalThis.EventSource {
        static selfSources = {};

        #eventListeners;

        constructor(url, options) {
            super(url, options);

            kQuery.logger.debug(`SSE open ${this.url}`);
            this.#eventListeners = {};

            const closeTimer = setInterval(() => {
                if (!Object.values(this.#eventListeners).find(nodeListeners => nodeListeners.size > 0)) {
                    delete EventSource.selfSources[this.url];
                    this.close();
                    clearInterval(closeTimer);
                    kQuery.logger.debug(`SSE close ${this.url}`);
                }
            }, 10000);
        }

        $listen(node, name, listener) {
            const nodeListeners = this.#eventListeners[name] ??= new WeakMap();
            kQuery.logger.assert((node) => !nodeListeners.get(node)?.length, node)(`Multiple listening on SSE is not recommended.`);

            if (nodeListeners.size === 0) {
                kQuery.logger.debug(`SSE listen ${this.url}#${name}`);
                const controller = new AbortController();
                this.addEventListener(name, e => {
                    for (const [node, listeners] of nodeListeners.entries()) {
                        for (const listener of listeners) {
                            listener.call(node, e);
                        }
                    }
                    if (nodeListeners.size === 0) {
                        kQuery.logger.debug(`SSE unlisten ${this.url}#${name}`);
                        controller.abort();
                    }
                }, {
                    signal: controller.signal,
                });
            }

            this.#eventListeners[name].getOrSet(node, () => []).push(listener);
        }

        $unlisten(node, name) {
            this.#eventListeners[name]?.delete(node);
        }
    }

    const ajaxs = new WeakMap();
    const pollings = new WeakMap();

    return {
        [[Window.name]]: /** @lends Window.prototype */{
            /**
             * @typedef {(url:String, options?:RequestInit) => Promise<Response>} HttpRequest
             * @typedef {{head:HttpRequest, get:HttpRequest, post:HttpRequest, put:HttpRequest, patch:HttpRequest, delete:HttpRequest}} HttpMethods
             */
            /**
             * asynchronous JavaScript And XML
             *
             * request by fetch || XMLHttpRequest
             * default is fetch, but options has progress or async:false faillback to XMLHttpRequest
             *
             * - setup: $ajax(RequestInitOptions)
             * - get: $ajax.get(url, RequestInitOptions)
             * - post: $ajax.post(url, RequestInitOptions)
             * - {other}: $ajax.{other}(url, RequestInitOptions)
             *
             * $ajax(setup) returns new Object
             * - e.g. one-time: $ajax(setup).get(url, otheropts); // this isn't mean much
             * - e.g. local-context: const $ajax = $ajax(setup); $ajax.get(url, otheropts);
             * - e.g. globalize: window.$ajax = $ajax(setup);
             *
             * @descriptor get
             *
             * @return {((url:String, options:RequestInit) => HttpMethods)|HttpMethods}
             */
            get $ajax() {
                const mergeWithHeaders = function (target, ...optionses) {
                    for (const options of optionses) {
                        if (options.headers) {
                            target.headers ??= {};
                            for (const [name, value] of F.objectToArrayEntries(options.headers)) {
                                target.headers[name] = value;
                            }
                        }
                        const headers = target.headers;
                        Object.assign(target, options);
                        target.headers = headers;
                    }
                    return target;
                };
                const $Ajax = function (options) {
                    const $Ajax = function () {};
                    $Ajax.defaultOptions = options;
                    return $Ajax;
                };
                return ajaxs.getOrSet(this, () => new Proxy($Ajax(Object.create(null)), {
                    get(target, property) {
                        return function (url, options) {
                            options = mergeWithHeaders({method: property}, target.defaultOptions, options);
                            const isXHR = options.progress || options.async === false;
                            return isXHR ? F.xhr(url, options) : F.fetch(url, options);
                        };
                    },
                    apply(target, thisArg, argArray) {
                        return new Proxy($Ajax(mergeWithHeaders({}, target.defaultOptions, ...argArray)), this);
                    },
                }));
            },
            /**
             * set asynchronous JavaScript And XML
             *
             * @see get $ajax
             *
             * @descriptor set
             */
            set $ajax(ajax) {
            },
        },
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

                const eventSource = EventSource.selfSources[url] ??= new EventSource(url, {
                    withCredentials: options.credentials,
                });
                if (eventSource.withCredentials !== !!options.credentials) {
                    kQuery.logger.error(`SSE url(credentials) is difference`);
                }

                eventSource.$listen(this, eventName, listener);

                return this;
            },
            /**
             * unlisten SSE event
             *
             * @param {URL|String} url
             * @return {this}
             */
            $unlisten(url) {
                url = new URL(url, this.baseURI);
                const eventName = url.hash.substring(1) || 'message';
                url.hash = '';

                EventSource.selfSources[url]?.$unlisten(this, eventName);

                return this;
            },
            /**
             * polling request
             *
             * options:
             * - interval: polling interval ms
             * - invisible: stop invisible element
             * - retry: retry on fail
             *   - always: retry infinity
             *   - network: retry if network level error
             *   - response: retry if http level error
             * - status: http status code to call listener
             * and other fetch options(RequestInit)
             *
             * @param {URL|String} url
             * @param {Function} listener
             * @param {RequestInit|Object} [options={}]
             * @return {this}
             */
            $polling(url, listener, options = {}) {
                kQuery.logger.assert((node) => !pollings.get(node)?.[url]?.length, this)(`Multiple polling is not recommended.`);

                const {interval, invisible, status, retry} = F.objectDeleteProperties(options, {
                    interval: 10 * 1000,
                    invisible: false,
                    retry: ['network', 'response'],
                    status: [200],
                });

                const noderef = new WeakRef(this);
                const request = async () => {
                    const node = noderef.deref();
                    if (!node) {
                        return;
                    }
                    if (node.isConnected && (invisible || node.$checkVisibility({size: false}, true))) {
                        try {
                            const response = await F.fetch(url, options);
                            if (status.includes(response.status)) {
                                listener.call(this, response);
                            }
                        }
                        catch (e) {
                            if (!(
                                retry.includes('always') ||
                                (retry.includes('network') && !(e.cause instanceof Response)) ||
                                (retry.includes('response') && e.cause instanceof Response && ![e.cause.status].includes(503, 504))
                            )) {
                                throw e;
                            }
                            kQuery.logger.warn(`failed poll request ${url} but will continue polling`);
                        }
                    }
                    else {
                        kQuery.logger.info(`skipped poll request ${url} by invisible`);
                    }

                    const timer = setTimeout(request, interval);
                    const timers = pollings.getOrSet(node, () => ({}));
                    timers[url] ??= [];
                    timers[url].push(timer);
                };
                request().catch((e) => kQuery.logger.error(e));

                return this;
            },
            /**
             * stop polling
             *
             * @param {URL|String} url
             * @return {this}
             */
            $unpolling(url) {
                const timers = pollings.get(this);
                if (timers?.[url]) {
                    for (const timer of timers[url] ?? []) {
                        clearTimeout(timer);
                    }
                    delete timers[url];
                    pollings.set(this, timers);
                }

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
                                    throw new Error(`${response.status}: ${response.statusText}`, {
                                        cause: response,
                                    });
                                }
                                response.blob().then((blob) => {
                                    blob.$download(this.download);
                                    return this;
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
        [[Blob.name]]: /** @lends Blob.prototype */{
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
                    headers: {},
                }, options);
                if (!(options.headers instanceof Headers)) {
                    options.headers = new Headers(options.headers);
                }

                if (options.method.toUpperCase() === 'POST') {
                    const formData = new FormData();
                    formData.append(options.name ?? 'tmp', this);

                    options.body = formData;
                }
                else {
                    options.headers.set('x-file-path', encodeURIComponent(this.webkitRelativePath));
                    options.headers.set('x-file-name', encodeURIComponent(this.name));
                    options.headers.set('x-file-size', this.size);
                    options.headers.set('x-file-type', this.type);

                    options.body = this;
                }

                return F.xhr(url, options);
            },
        },
        [[FileList.name]]: /** @lends FileList.prototype */{
            /**
             * upload files
             *
             * @param {URL|String|RequestInit} urlOrOptions
             * @param {RequestInit} [options={}]
             * @return {Promise<Response[]>}
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
                    method: 'POST',
                    timeout: 0,
                    ok: false,
                    headers: {},
                    credentials: 'same-origin',
                    progress: () => null,
                    concurrency: 6,
                }, options);

                if (options.method.toUpperCase() === 'POST') {
                    const formData = new FormData();
                    for (const file of this) {
                        formData.append((options.name ?? 'tmp') + '[]', file);
                    }
                    options.body = formData;

                    return [await F.xhr(url, options)];
                }

                return Promise.concurrencyAll(Array.from(this).map(file => () => file.$upload(url, options)), options.concurrency);
            },
        },
    };
}
