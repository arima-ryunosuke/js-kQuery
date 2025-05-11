import {$FileList, $NodeList, F, FileReader, Nullable, Promise, Proxy, WeakMap} from '../API.js';

/**
 * @param {KQuery} kQuery
 *
 * @ignore
 */
export function data(kQuery) {
    const nodeBag = new WeakMap();

    return {
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
    };
}
