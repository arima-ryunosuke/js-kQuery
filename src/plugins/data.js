import {$FileList, $NodeList, F, FileReader, Nullable, Promise, Proxy, WeakMap} from '../API.js';

/**
 * @param {KQuery} kQuery
 *
 * @ignore
 */
export function data(kQuery) {
    const nodeBag = new WeakMap();
    const documentCookie = new WeakMap();

    return {
        [[URL.name]]: /** @lends URL.prototype */{
            /**
             * assign URL parts
             *
             * @param {Object} parts
             * @return {this}
             */
            $assign(parts) {
                kQuery.logger.assertInstanceOf(parts, Object)();

                for (const [key, value] of F.objectToEntries(parts)) {
                    if (key === 'searchParams') {
                        this[key].$assign(value);
                    }
                    else if (key in this) {
                        this[key] = value;
                    }
                }
                return this;
            },
            /**
             * assign URL parts and new URL
             *
             * @param {Object} parts
             * @return {this}
             */
            $replace(parts) {
                kQuery.logger.assertInstanceOf(parts, Object)();

                return new URL(this).$assign(parts);
            },
            /**
             * shortcut to this.$assign({searchParams})
             *
             * @param {Object} params
             * @return {this}
             */
            $params(params) {
                kQuery.logger.assertInstanceOf(params, Object)();

                return this.$assign({searchParams: params});
            },
        },
        [[URLSearchParams.name]]: /** @lends URLSearchParams.prototype */{
            /**
             * assign params
             *
             * - null/undefined: delete parameter
             * - array: append per element
             * - other: simple set
             *
             * @param {Object} params
             * @return {this}
             */
            $assign(params) {
                kQuery.logger.assertInstanceOf(params, Object)();

                for (const [name, value] of F.objectToEntries(params)) {
                    if (value == null) {
                        this.delete(name);
                    }
                    else if (value instanceof Array) {
                        this.delete(name);
                        for (const e of value) {
                            this.append(name, e);
                        }
                    }
                    else {
                        this.set(name, value);
                    }
                }
                return this;
            },
            $clear() {
                for (const key of [...this.keys()]) {
                    this.delete(key);
                }
                return this;
            },
        },
        [[Document.name]]: /** @lends Document.prototype */{
            /**
             * create URL based on this URL
             *
             * @descriptor get
             *
             * @return {URL}
             */
            get $URL() {
                return new URL(this.URL, this.baseURI);
            },
            /**
             * get Cookie accessor
             *
             * @descriptor get
             *
             * @example
             * document.$cookie.hoge;           // getter
             * document.$cookie.hoge = 'value'; // setter
             * document.$cookie.hoge = {        // setter with attributes
             *     value: 'value',
             *     path: "/path/to/cookie",
             *     maxAge: 3600,
             * };
             * document.$cookie.hoge = null;    // delete
             * document.$cookie();              // get all key-value object
             * document.$cookie({               // mass assign(keep other, no attributes use default attributes)
             *     hoge: 'HOGE',
             *     fuga: {
             *         value: 'FUGA',
             *         path: '/',
             *     },
             * });
             * document.$cookie.$defaultAttributes({path: '/'});  // mass setting default attributes(keep other)
             * document.$cookie.$defaultAttributes = {path: '/'}; // mass assign default attributes(delete other)
             */
            get $cookie() {
                return documentCookie.getOrSet(this, (document) => new Proxy(function $Cookie() {}, {
                    has(target, property) {
                        return this.get(target, property) != null;
                    },
                    get(target, property) {
                        if (property === Symbol.toPrimitive || property === 'toString') {
                            return () => document.cookie;
                        }
                        // special: mass setting default attributes
                        if (property === '$defaultAttributes') {
                            return (defaultAttributes) => {
                                // this is for internal(test)
                                if (!defaultAttributes) {
                                    return target.$defaultAttributes ?? {};
                                }
                                this.set(target, property, Object.assign(target.$defaultAttributes, defaultAttributes));
                                return documentCookie.get(document);
                            };
                        }

                        const cookies = document.cookie.split(/; ?/);
                        for (const cookie of cookies) {
                            const [name, value] = cookie.split(/=(.*)/s).map(decodeURIComponent);
                            if (name === property) {
                                return value;
                            }
                        }
                        return undefined;
                    },
                    set(target, property, value) {
                        // special: mass setting default attributes
                        if (property === '$defaultAttributes') {
                            kQuery.logger.assertInstanceOf(value, Object)();
                            if (value.expires) {
                                kQuery.logger.warn(`Should not specify expire as the default value, because Absolute time and may be an unintended value at the time of actual use`);
                            }

                            target.$defaultAttributes = value;
                            return true;
                        }

                        // null is deletion
                        if (value == null) {
                            value = {
                                value: '',
                                maxAge: -1,
                            };
                        }

                        const attributes = Object.assign({
                            domain: '',
                            path: '/',
                            secure: document.defaultView.isSecureContext,
                            sameSite: 'lax',
                        }, target.$defaultAttributes);

                        if (F.objectIsPlain(value)) {
                            Object.assign(attributes, value);
                            value = value.value ?? value[''];
                        }
                        delete attributes.value;
                        delete attributes[''];

                        kQuery.logger.assertInstanceOf(attributes.maxAge, Nullable, Number)();
                        kQuery.logger.assertInstanceOf(attributes.expires, Nullable, Date)();

                        let cookie = `${encodeURIComponent(property)}=${encodeURIComponent(value)}`;
                        if (attributes.domain) {
                            cookie += `; domain=${attributes.domain}`;
                        }
                        if (attributes.path) {
                            cookie += `; path=${attributes.path}`;
                        }
                        if (attributes.secure) {
                            cookie += `; secure`;
                        }
                        if (attributes.sameSite) {
                            cookie += `; samesite=${attributes.sameSite}`;
                        }
                        if (attributes.maxAge) {
                            cookie += `; max-age=${+attributes.maxAge}`;
                        }
                        // RFC 6265-4.1.2.2
                        // > If a cookie has both the Max-Age and the Expires attribute, the Max-Age attribute has precedence and controls the expiration date of the cookie.
                        if (attributes.expires) {
                            cookie += `; expires=${attributes.expires.toUTCString()}`;
                        }

                        document.cookie = cookie;
                        return true;
                    },
                    deleteProperty(target, property) {
                        this.set(target, property, null);
                        return true;
                    },
                    apply(target, thisArg, argArray) {
                        if (F.objectIsPlain(argArray[0])) {
                            for (const [name, value] of F.objectToEntries(argArray[0])) {
                                this.set(target, name, value);
                            }
                        }
                        return Object.fromEntries(document.cookie.split(/; ?/).map(v => v.split(/=(.*)/s).map(decodeURIComponent)));
                    },
                }));
            },
            /**
             * set Cookie value
             *
             * @descriptor set
             *
             * @param {Object} value
             *
             * @example
             * document.$cookie = { // mass assign(delete other, no attributes use default attributes)
             *     hoge: 'HOGE',
             *     fuga: {
             *         value: 'FUGA',
             *         path: '/',
             *     },
             * };
             */
            set $cookie(value) {
                kQuery.logger.assertInstanceOf(value, Nullable, Object)();

                // null guard for function return (void). keep current values
                if (value == null) {
                    return;
                }

                for (const [name] of F.objectToEntries(this.$cookie())) {
                    this.$cookie[name] = null;
                }

                this.$cookie(value);
            },
        },
        [[Node.name, $NodeList.name]]: /** @lends Node.prototype */{
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
                return nodeBag.getOrSet(this, () => new Proxy(function $Bag() {}, {
                    has(target, property) {
                        return Reflect.has(bag, property);
                    },
                    get(target, property) {
                        if (property === Symbol.toPrimitive || property === 'toString') {
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
                    },
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

                // null guard for function return (void). keep current values
                if (value == null) {
                    return;
                }

                const $bag = this.$bag;
                for (const key of Object.keys($bag())) {
                    delete $bag[key];
                }

                $bag(value);
            },
        },
        [[HTMLStyleElement.name, HTMLLinkElement.name, $NodeList.name]]: /** @lends HTMLStylableElement.prototype */{
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
                }
                else {
                    contents = this.textContent;
                }

                if (resolveUrl) {
                    const regex = /url\(((['"])?.+?\2?)\)/g;
                    const normalize = (url) => {
                        url = F.stringUnquote(url, 'css-url');
                        // https://developer.mozilla.org/ja/docs/Web/CSS/url_function
                        // url allows svg#id in page
                        if (url.charAt(0) === '#') {
                            return null;
                        }
                        return new URL(url, this.href);
                    };

                    const requests = {};
                    for (const [, url] of contents.matchAll(regex)) {
                        const fullurl = normalize(url);
                        if (fullurl) {
                            requests[fullurl] ??= async (fullurl) => {
                                const response = await F.fetch(fullurl).catch(v => ({ok: false}));
                                if (!response.ok) {
                                    return null;
                                }
                                return (await response.blob()).$dataURL();
                            };
                        }
                    }

                    const responses = await Promise.concurrencyAll(requests, 6);
                    contents = contents.replace(regex, (m0, url) => {
                        const fullurl = normalize(url);
                        if (fullurl && responses[fullurl]) {
                            return 'url(' + F.stringQuote(responses[fullurl] + fullurl.hash, 'css-url') + ')';
                        }
                        return m0;
                    });
                }

                return contents;
            },
        },
        [[HTMLScriptElement.name, $NodeList.name]]: /** @lends HTMLScriptElement.prototype */{
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
                }
                else {
                    contents = this.textContent;
                }

                // do something. e.g. url rewrite
                return contents;
            },
        },
        [[HTMLImageElement.name, $NodeList.name]]: /** @lends HTMLImageElement.prototype */{
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
                return new File([blob], url.pathname.split('/').at(-1) ?? this.currentSrc, {
                    type: blob.type,
                    ...(response.headers.has('last-modified') ? {
                        lastModified: new Date(response.headers.get('last-modified')).getTime(),
                    } : {}),
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

                return new Promise((resolve) => {
                    const canvas = this.$document.createElement('canvas');
                    canvas.width = this.width;
                    canvas.height = this.height;
                    canvas.getContext('2d').drawImage(this, 0, 0);
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

                return new Promise((resolve) => {
                    const canvas = this.$document.createElement('canvas');
                    canvas.width = this.width;
                    canvas.height = this.height;
                    canvas.getContext('2d').drawImage(this, 0, 0);
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
                return new File([await this.$blob(mimetype, quality)], url.pathname.split('/').at(-1) ?? this.currentSrc, {
                    type: mimetype,
                });
            },
        },
        [[HTMLAnchorElement.name, $NodeList.name]]: /** @lends HTMLAnchorElement.prototype */{
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
            },
        },
        [[HTMLFormElement.name, $NodeList.name]]: /** @lends HTMLFormElement.prototype */{
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
            },
        },
        [[Blob.name, $FileList.name]]: /** @lends Blob.prototype */{
            /**
             * download as file
             *
             * @param {?String} [filename]
             */
            $download(filename) {
                kQuery.logger.assertInstanceOf(filename, Nullable, String)();

                // for File
                filename ??= this.name ?? '';

                const url = URL.createObjectURL(this);
                const a = document.$createElement('a', {
                    href: url,
                    download: filename,
                });

                a.click();
                setTimeout(function () {
                    URL.revokeObjectURL(url);
                }, 1000);
            },
            /**
             * read as text
             *
             * @param {?String} [encoding]
             * @return {Promise<String>}
             */
            async $text(encoding) {
                kQuery.logger.assertInstanceOf(encoding, Nullable, String)();

                // return this.text(); // no encoding
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
                return dataURL.substring(dataURL.indexOf(',') + 1);
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
            },
        },
        [[Storage.name]]: /** @lends Storage.prototype */{
            /**
             * get item as JSON
             *
             * @param {String} keyName
             * @return {any}
             */
            $getJson(keyName) {
                const item = this.getItem(keyName);
                return item === null ? undefined : JSON.parse(item);
            },
            /**
             * set item as JSON
             *
             * @param {String} keyName
             * @param {any} keyValue
             * @return {this}
             */
            $setJson(keyName, keyValue) {
                this.setItem(keyName, JSON.stringify(keyValue));
                return this;
            },
            /**
             * entries all storage items
             *
             * @return {Generator<string[], void, *>}
             */
            * $entries() {
                for (let i = 0; i < this.length; i++) {
                    const key = this.key(i);
                    const item = this.getItem(key);
                    yield [key, item];
                }
            },
        },
    };
}
