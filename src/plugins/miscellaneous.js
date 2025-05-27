import {$NodeList, F, IntersectionObserver, Nullable, Promise, Timer, WeakMap} from '../API.js';

/**
 * @param {KQuery} kQuery
 *
 * @ignore
 */
export function miscellaneous(kQuery) {
    const interlockings = new WeakMap();
    const documentChange = function (e) {
        for (const [parent, selector] of interlockings.entries()) {
            if (e.target.$matches(selector)) {
                parent.$indeterminate = window.$query(selector).$filter('[type=checkbox]').checked;
            }
        }
    };

    let scrollIntoViewing = false;

    return {
        [[Window.name]]: /** @lends Window.prototype */{
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
                        url: undefined,
                        // string
                        target: undefined,
                    },
                    // windowFeatures https://developer.mozilla.org/docs/Web/API/Window/open#windowfeatures
                    ...{
                        // bool
                        window: true,
                        // int|string
                        left: 'auto',
                        // int|string
                        top: 'auto',
                        // int|string
                        width: 'auto',
                        // int|string
                        height: 'auto',
                        // bool
                        noopener: undefined,
                        // bool
                        noreferrer: undefined,
                    },
                }, options);

                if (options.width === 'auto') {
                    options.width = this.outerWidth / 2;
                }
                if (options.height === 'auto') {
                    options.height = this.outerHeight / 2;
                }

                if (options.left === 'auto' && options.width) {
                    options.left = (this.outerWidth - options.width) / 2;
                }
                if (options.top === 'auto' && options.height) {
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

                F.objectWalkRecursive(options, function (v, k) {
                    if (['url', 'target', 'window'].includes(k) || v === false) {
                        return undefined;
                    }
                    return v;
                });
                const feature = F.objectJoin(options, ',');
                kQuery.logger.debug(`windowFeature`, feature);

                return this.open(url, target, feature);
            },
        },
        [[Element.name, $NodeList.name]]: /** @lends Element.prototype */{
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
                return ['base', 'link', 'meta', 'noscript', 'script', 'style', 'template', 'title'].includes(this.localName.toLowerCase());
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
                const attrs = '' + this.$attrs;

                let result = `<${name}${attrs ? ' ' + attrs : ''}>`;
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
                    word = new RegExp(F.stringEscape(word, 'regex'));
                }
                if (!(wrapper instanceof Element)) {
                    wrapper = this.$document.$createElement(wrapper ?? 'mark');
                }

                const core = (node) => {
                    for (const child of node.children) {
                        if (child.$isMetadataContent || (notSelectorFn != null && child.$matches(notSelectorFn)) || child.$outerTag(false) === wrapper.$outerTag(false)) {
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
                };

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
                        behavior: undefined,
                        // string: "start" | "center" | "end" | "nearest"
                        block: undefined,
                        // string: "start" | "center" | "end" | "nearest"
                        inline: undefined,
                    },
                    // extends
                    ...{
                        // bool
                        global: true,
                        // number
                        timeout: undefined,
                        // number https://developer.mozilla.org/docs/Web/API/IntersectionObserver/thresholds
                        threshold: undefined,
                        // bool emulate https://developer.mozilla.org/docs/Web/API/Element/scrollIntoViewIfNeeded
                        ifNeeded: false,
                    },
                }, options);

                if (options.global && scrollIntoViewing) {
                    return Promise.resolve(false);
                }

                return new Promise((resolve, reject) => {
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
                        threshold: options.threshold ?? 0.0,
                    });
                    const timeouter = options.timeout ? new Timer() : null;
                    timeouter?.addEventListener('alarm', (e) => {
                        observer.unobserve(this);
                        scrollIntoViewing = false;
                        reject(this);
                    });
                    timeouter?.start(options.timeout);
                    observer.observe(this);
                });
            },
        },
        [[HTMLInputElement.name, $NodeList.name]]: /** @lends HTMLInputElement.prototype */{
            /**
             * synchronous checked
             *
             * parent checked -> sync all children checked
             * child checked -> sync parent checked/indeterminate
             *
             * @param {Object} [selector]
             * @return {this}
             */
            $interlock(selector) {
                kQuery.logger.assertInstanceOf(selector, Nullable, String)();

                if (this.type !== 'checkbox') {
                    return this;
                }

                // trigger mode
                if (selector == null) {
                    const selector = interlockings.get(this);
                    if (selector == null) {
                        throw new Error(this + ' is not have child selector');
                    }

                    this.$indeterminate = window.$query(selector).$filter('[type=checkbox]').checked;
                }
                // initialize mode
                else {
                    interlockings.set(this, selector);
                    this.$indeterminate = window.$query(selector).$filter('[type=checkbox]').checked;

                    ['change', '$change'].forEach(e => {
                        this.$document.addEventListener(e, documentChange);
                        this.addEventListener(e, (e) => {
                            const parent = e.target;
                            const children = window.$query(selector).$filter('[type=checkbox]');
                            for (const child of children) {
                                child.$value = parent.checked ? child.value : null;
                            }
                        });
                    });
                }
                return this;
            },
        },
        [[HTMLDialogElement.name, $NodeList.name]]: /** @lends HTMLDialogElement.prototype */{
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
                    escape: true,
                }, options);

                return new Promise((resolve, reject) => {
                    const close = (e) => {
                        e.target.removeEventListener('close', close);
                        e.target.removeEventListener('cancel', cancel);
                        e.target.removeEventListener('click', onOutside);
                        e.target.removeEventListener('keydown', onEscape);
                        resolve(e.target.returnValue);
                    };
                    const cancel = (e) => {
                        e.target.removeEventListener('close', close);
                        e.target.removeEventListener('cancel', cancel);
                        e.target.removeEventListener('click', onOutside);
                        e.target.removeEventListener('keydown', onEscape);
                        resolve(null);
                    };
                    const onOutside = (e) => {
                        if (!this.getBoundingClientRect().$contains(new DOMPointReadOnly(e.clientX, e.clientY))) {
                            this.close(null);
                            this.dispatchEvent(new Event('cancel', {
                                bubbles: false,
                                cancelable: true,
                                composed: false,
                            }));
                        }
                    };
                    const onEscape = (e) => {
                        if (e.code === 'Escape') {
                            e.preventDefault();
                        }
                    };

                    // returnValue is not reset
                    this.returnValue = '';

                    // showModal and close once event
                    this.showModal();
                    this.addEventListener('close', close, {once: true});
                    this.addEventListener('cancel', cancel, {once: true});

                    if (options.outside) {
                        this.addEventListener('click', onOutside);
                    }
                    if (!options.escape) {
                        this.addEventListener('keydown', onEscape);
                    }
                });
            },
        },
        [[HTMLCollection.name, NodeList.name, FileList.name, DataTransferItemList.name/* and more *List */]]: /** @lends List.prototype */{
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

                return Promise.all(F.objectToEntries(this).map(([i, e]) => callback(e, i, this)));
            },
        },
    };
}
