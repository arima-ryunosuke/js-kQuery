import {$NodeList, F, Nullable} from '../API.js';

/**
 * @param {KQuery} kQuery
 *
 * @ignore
 */
export function traversing(kQuery) {
    const nodeGenerateSiblings = function* (node, selectorFn, flow) {
        kQuery.logger.assertInstanceOf(node, Node)();

        for (let sibling = node[flow]; sibling; sibling = sibling[flow]) {
            if (selectorFn == null || sibling.$matches(selectorFn)) {
                yield sibling;
            }
        }
    };

    return {
        [[Document.name, DocumentFragment.name, Element.name]]: /** @lends DocumentLikeElement.prototype */{
            /**
             * functional querySelector
             *
             * @param {String|Function} selectorFn
             * @return {?Element}
             */
            $(selectorFn) {
                kQuery.logger.assertInstanceOf(selectorFn, String, Function)();

                if (typeof (selectorFn) === 'function') {
                    return Array.prototype.find.call(this.$$('*'), selectorFn) ?? null;
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

                if (typeof (selectorFn) === 'function') {
                    return F.iterableToNodeList([...this.$$('*')].filter(selectorFn));
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

                // avoid setPrototypeOf NodeList -> Array -> NodeList -> Array -> NodeList
                // return F.iterableToNodeList([...self, ...this.$$(selectorFn)]);
                if (typeof (selectorFn) === 'function') {
                    return F.iterableToNodeList([...self, ...[...this.$$('*')].filter(selectorFn)]);
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
                // for performance(length > 0 look for it until the end)
                if (typeof (selectorFn) === 'string') {
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

                if (typeof (selectorFn) === 'function') {
                    return !!selectorFn.call(this, this);
                }
                if (selectorFn instanceof Node) {
                    return this === selectorFn;
                }
                return this.matches(selectorFn);
            },
        },
        [[NodeList.name]]: /** @lends NodeList.prototype */{
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

                return F.iterableToNodeList(new Set([...this].flatMap(node => [...node.$$?.(selectorFn) ?? []])));
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

                return F.iterableToNodeList(new Set([...this].flatMap(node => [...node.$$$?.(selectorFn) ?? []])));
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

                return !!Array.prototype.find.call(this, node => node.$contains?.(selectorFn));
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

                return Array.prototype.find.call(this, node => node.$matches?.(selectorFn));
            },
            /**
             * get element index
             *
             * @param {String|Node|Function} selectorFn
             * @return {?Number}
             */
            $index(selectorFn) {
                kQuery.logger.assertInstanceOf(selectorFn, String, Node, Function)();

                const index = Array.prototype.findIndex.call(this, node => (node.$matches?.(selectorFn) ?? false));
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

                return F.iterableToNodeList([...this].filter(node => (node.$matches?.(selectorFn) ?? false)));
            },
            /**
             * filter !matches elements
             *
             * @param {String|Function} selectorFn
             * @return {NodeList}
             */
            $except(selectorFn) {
                kQuery.logger.assertInstanceOf(selectorFn, String, Function)();

                return F.iterableToNodeList([...this].filter(node => !(node.$matches?.(selectorFn) ?? true)));
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

                if (start != null && typeof (start) !== 'number') {
                    start = this.$index(start) ?? undefined;
                }
                if (end != null && typeof (end) !== 'number') {
                    end = this.$index(end) ?? undefined;
                }
                return F.iterableToNodeList(Array.prototype.slice.call(this, start, end));
            },
        },
        [[Node.name, $NodeList.name]]: /** @lends Node.prototype */{
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
                kQuery.logger.assertElementsOf(selector, [Node.TEXT_NODE, Node.COMMENT_NODE, Node.CDATA_SECTION_NODE, 'metadata'])();

                const texts = [];
                for (const child of this.childNodes) {
                    if (child instanceof CharacterData) {
                        if (selector.includes(child.nodeType)) {
                            texts.push(child);
                        }
                    }
                    else {
                        if (selector.includes('metadata') || !child.$isMetadataContent) {
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

                if (typeof (selectorFn) === 'string') {
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

                if (typeof (selectorFn) === 'number') {
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

                return nodeGenerateSiblings(this, selectorFn, 'previousElementSibling').next().value ?? null;
            },
            /**
             * get matched previous elements
             *
             * @param {String|Function} [selectorFn]
             * @return {NodeList}
             */
            $prevElements(selectorFn) {
                kQuery.logger.assertInstanceOf(selectorFn, Nullable, String, Function)();

                return F.iterableToNodeList([...nodeGenerateSiblings(this, selectorFn, 'previousElementSibling')].reverse());
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

                return nodeGenerateSiblings(this, selectorFn, 'nextElementSibling').next().value ?? null;
            },
            /**
             * get matched next elements
             *
             * @param {String|Function} [selectorFn]
             * @return {NodeList}
             */
            $nextElements(selectorFn) {
                kQuery.logger.assertInstanceOf(selectorFn, Nullable, String, Function)();

                return F.iterableToNodeList(nodeGenerateSiblings(this, selectorFn, 'nextElementSibling'));
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
            },
        },
        [[HTMLInputElement.name, $NodeList.name]]: /** @lends HTMLInputElement.prototype */{
            /**
             * get belonging RadioNodeList
             *
             * @return {?RadioNodeList}
             */
            get $radioNodeList() {
                if (this.type !== 'radio') {
                    return undefined;
                }
                if (!this.form) {
                    return undefined;
                }

                // When there is only one radio in the form, form.elements does not return RadioNodeList

                const form = this.form;
                const name = this.name;

                const nodelist = form.elements[name];
                if (nodelist instanceof RadioNodeList) {
                    return nodelist;
                }

                const pseudo = this.$document.$createElement('input', {
                    type: 'radio',
                    name: name,
                    hidden: true,
                });

                this.insertAdjacentElement('afterend', pseudo);
                try {
                    return form.elements[name];
                }
                finally {
                    pseudo.remove();
                }
            },
        },
        [[HTMLTableElement.name, HTMLTableSectionElement.name, $NodeList.name]]: /** @lends HTMLTableSectionLikeElement.prototype */{
            /**
             * get grid(th/td's array of array)
             *
             * @param {Boolean} padSpannedCell
             * @return {HTMLTableCellElement[][]}
             */
            $grid(padSpannedCell = false) {
                if (this.rows.length === 0) {
                    return [];
                }

                const grid = [];
                let maxCols = 0;

                for (let rIndex = 0; rIndex < this.rows.length; rIndex++) {
                    const row = this.rows[rIndex];

                    grid[rIndex] ??= [];
                    let cIndex = 0;

                    for (let x = 0; x < row.cells.length; x++) {
                        const cell = row.cells[x];

                        while (cIndex in grid[rIndex]) {
                            cIndex++;
                        }

                        const colspan = cell.colSpan; // colspan is not allowed 0
                        const rowspan = cell.rowSpan || this.rows.length - rIndex; // rowspan is allowed 0(means max rowsize)

                        for (let y = 0; y < rowspan; y++) {
                            const targetRow = rIndex + y;
                            if (targetRow >= this.rows.length) {
                                break;
                            }

                            grid[targetRow] ??= [];

                            for (let c = 0; c < colspan; c++) {
                                grid[targetRow][cIndex + c] = padSpannedCell || (y === 0 && c === 0) ? cell : null;
                            }
                        }

                        cIndex += colspan;
                        maxCols = Math.max(maxCols, cIndex);
                    }
                }

                for (let y = 0; y < this.rows.length; y++) {
                    for (let c = 0; c < maxCols; c++) {
                        if (!(c in grid[y])) {
                            grid[y][c] = undefined;
                        }
                    }
                }

                return grid;
            },
            /**
             * get horizontal cells in light of row/colspan
             *
             * @return {NodeList<?HTMLTableCellElement>[]}
             */
            get $rows() {
                return this.$grid().map(cells => F.iterableToNodeList(cells));
            },
            /**
             * get vertical cells in light of row/colspan
             *
             * @return {NodeList<?HTMLTableCellElement>}
             */
            get $cols() {
                return F.arrayTranspose(this.$grid()).map(cells => F.iterableToNodeList(cells));
            },
        },
    };
}
