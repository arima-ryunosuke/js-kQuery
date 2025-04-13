import {$NodeList, F, WeakMap} from '../API.js';

/**
 * @param {KQuery} kQuery
 *
 * @ignore
 */
export function manipulation(kQuery) {
    return {
        [[Window.name]]: /** @lends Window.prototype */{
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
                    const recursions = selectorFn.map(e => ownerDocument.defaultView.$query(e, ownerDocument));
                    const nodes = [...new Set(recursions.flatMap(e => e instanceof Node ? [e] : [...e]))];
                    return nodes.length === 1 ? nodes[0] : F.iterableToNodeList(nodes);
                }

                if (typeof (selectorFn) === 'string' && selectorFn.trim().charAt(0) === '<') {
                    const nodes = ownerDocument.$createNodeListFromHTML(selectorFn.trim());
                    return nodes.length === 1 ? nodes[0] : nodes;
                }

                const nodes = ownerDocument.$$(selectorFn);
                return nodes.length === 1 ? nodes[0] : nodes;
            },
        },
        [[Document.name]]: /** @lends Document.prototype */{
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

                const template = this.createElement('template');
                template.innerHTML = html;
                // childNodes is living NodeList
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
            $createElement(tag, attributes = {}, ...children) {
                kQuery.logger.assertInstanceOf(tag, String)();
                kQuery.logger.assertInstanceOf(attributes, Object)();

                attributes.class = F.objectToClasses(attributes.class ?? []);

                // tag#id.klass[attr=value] -> tag, attributes{id: "id", class: ["klass"], attr: "value"}
                tag = tag.replaceAll(/\#([-_0-9a-z]+)/ig, function (m0, m1) {
                    attributes.id = m1;
                    return '';
                });
                tag = tag.replaceAll(/\.([-_0-9a-z]+)/ig, function (m0, m1) {
                    attributes.class[m1] = true;
                    return '';
                });
                tag = tag.replaceAll(/\[([-_0-9a-z]+)(=(.+?))?\]/ig, function (m0, m1, m2, m3) {
                    attributes[m1] = m3 ?? '';
                    return '';
                });

                const element = this.createElement(tag);

                for (const [name, value] of Object.entries(F.objectToAttributes(attributes))) {
                    if (typeof (value) === 'boolean') {
                        element.toggleAttribute(name, value);
                    }
                    else {
                        element.setAttribute(name, value);
                    }
                }

                element.$append(...children);

                return element;
            },
        },
        [[HTMLTemplateElement.name, $NodeList.name]]: function () {
            const renderedNodes = new WeakMap();

            class Value {
                constructor(value) {
                    this.value = value;
                }

                toString() {
                    return '' + this.value;
                }
            }

            return /** @lends HTMLTemplateElement.prototype */{
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
                        escape: 'html',
                        logical: '---logical<false/>---',
                        insert: 'after',
                    }, options);

                    const tag = function (value) {
                        if (options.logical) {
                            if (value === false) {
                                return options.logical;
                            }
                            if (value === true) {
                                return '';
                            }
                        }
                        if (typeof (value) === 'object' && !(value instanceof Value)) {
                            return value;
                        }
                        if (typeof (options.escape) === 'function') {
                            return options.escape(value);
                        }
                        return F.stringEscape(value, options.escape);
                    };

                    const core = function (current, parent) {
                        if (!current) {
                            return [];
                        }
                        if (!(current instanceof Array)) {
                            current = [current];
                        }

                        const elements = [];
                        for (let [i, value] of current.entries()) {
                            const fragment = this.content.cloneNode(true);

                            if (F.anyIsPrimitive(value)) {
                                value = new Value(value);
                            }

                            // magic values
                            Object.assign(value, {
                                $parent: parent,
                                $index: i,
                                $length: current.length,
                                $first: i === 0,
                                $last: i === current.length - 1,
                            });

                            // child first and remove
                            const children = fragment.$$('template[data-slot-name]');
                            for (const child of children) {
                                child.after(...core.call(child, value[child.dataset.slotName], value));
                                child.remove();
                            }

                            // render
                            kQuery.logger.assert(() => fragment.$contains(e => !e.$isMetadataContent))();
                            const template = [...fragment.childNodes].join('');
                            const html = F.stringRender(template, value, tag);
                            const nodes = this.$document.$createNodeListFromHTML(html);

                            if (options.logical) {
                                for (const node of nodes.$$$('*')) {
                                    for (const attribute of Array.from(node.attributes)) {
                                        if (attribute.value === options.logical) {
                                            node.attributes.removeNamedItem(attribute.name);
                                        }
                                    }
                                }
                            }
                            elements.push(...nodes);
                        }

                        return elements;
                    };

                    const elements = core.call(this, vars, null);

                    if (options.insert) {
                        const olds = renderedNodes.reset(this, () => elements) ?? [];
                        olds.forEach(old => old.remove());
                        this[options.insert](...elements);
                    }

                    return F.iterableToNodeList(elements);
                },
            };
        }(),
        [[Node.name, $NodeList.name]]: function () {
            const normalizeNodes = function (nodes) {
                return [...nodes].flatMap(node => node instanceof NodeList ? [...node] : node);
            };

            return /** @lends Node.prototype */{
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

                    // clone self
                    const cloned = this.cloneNode(false);
                    for (const ev of this.$events(null, false, false)) {
                        cloned.$on(ev.type + ev.namespaces.map(ns => `.${ns}`).join(), ev.selector, ev.listener, ev.options);
                    }

                    // recursion
                    for (const child of this.childNodes) {
                        // @todo: What should we do with the $bag...?
                        if (child instanceof Element) {
                            cloned.appendChild(child.$clone(true));
                        }
                        else {
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
                },
            };
        }(),
    };
}
