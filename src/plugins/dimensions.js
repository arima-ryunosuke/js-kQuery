import {$NodeList, F} from '../API.js';

/**
 * @param {KQuery} kQuery
 *
 * @ignore
 */
export function dimensions(kQuery) {
    const boxsize = function (element) {
        const backup = element.getAttribute('style');

        try {
            const cstyle = element.$window.getComputedStyle(element);
            const marginWidth = parseFloat(cstyle.marginLeft) + parseFloat(cstyle.marginRight);
            const marginHeight = parseFloat(cstyle.marginTop) + parseFloat(cstyle.marginBottom);

            element.style.setProperty('box-sizing', 'content-box', 'important');
            element.style.setProperty('overflow', 'hidden', 'important');

            const box = element.getBoundingClientRect();
            let contentWidth = box.width;
            let contentHeight = box.height;

            element.style.setProperty('border', 'none', 'important');
            const borderWidth = contentWidth - element.offsetWidth;
            const borderHeight = contentHeight - element.offsetHeight;
            contentWidth -= borderWidth;
            contentHeight -= borderHeight;

            element.style.setProperty('padding', 0, 'important');
            const paddingWidth = contentWidth - element.offsetWidth;
            const paddingHeight = contentHeight - element.offsetHeight;
            const scrollWidth = element.scrollWidth;
            const scrollHeight = element.scrollHeight;
            contentWidth -= paddingWidth;
            contentHeight -= paddingHeight;

            // vertical scrollbar reduces width but horizontal scrollbar doesn't reduce height
            const clientWidth = element.clientWidth;
            const offsetHeight = element.offsetHeight;
            element.style.setProperty('overflow', 'scroll', 'important');
            const scrollbarWidth = clientWidth - element.clientWidth;
            const scrollbarHeight = element.offsetHeight - offsetHeight;
            contentWidth -= scrollbarWidth;
            //contentHeight -= result.scrollbarHeight;

            return {
                marginWidth, borderWidth, paddingWidth, scrollbarWidth, contentWidth,
                marginHeight, borderHeight, paddingHeight, scrollbarHeight, contentHeight,
            };
        }
        finally {
            if (backup == null) {
                element.removeAttribute('style');
            }
            else {
                element.setAttribute('style', backup);
            }
        }
    };

    return {
        [[Document.name]]: /** @lends Document.prototype */{
            /**
             * get top-layer element
             *
             * in the future, ":top-layer" pseudo-class may come, but not now
             *
             * @return {?Element}
             */
            get $topLayerElement() {
                const tops = this.$$(':modal, :popover-open, :fullscreen');
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
                // noinspection CssInvalidPseudoSelector
                const modals = this.querySelectorAll(':modal');
                const top = this.elementFromPoint(0, 0);

                // ':modal' is DOM order, but not necessarily modal in that order
                return Array.prototype.find.call(modals, e => e === top) ?? null;
            },
        },
        [[HTMLElement.name, $NodeList.name]]: /** @lends HTMLElement.prototype */{
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

                if (typeof (cssLength) === 'number') {
                    return cssLength;
                }

                // absolute
                const value = parseFloat(cssLength);
                const unit = cssLength.replace(/^-?[0-9.]+/, '');
                switch (unit) {
                    case '':
                        return value;
                    case 'px':
                        return value * 1;

                    case 'in':
                        return value * 96;
                    case 'pc':
                        return value * 96 / 6;
                    case 'pt':
                        return value * 96 / 6 / 12;

                    case 'cm':
                        return value * 96 / 2.54;
                    case 'mm':
                        return value * 96 / 2.54 / 10;
                    case 'Q':
                        return value * 96 / 2.54 / 10 / 4;
                }

                // relative(very very complex, use actual value)
                const backup = this.getAttribute('style');
                try {
                    this.style.marginBottom = cssLength;
                    return parseFloat(this.$window.getComputedStyle(this).marginBottom);
                }
                finally {
                    if (backup == null) {
                        this.removeAttribute('style');
                    }
                    else {
                        this.setAttribute('style', backup);
                    }
                }
            },
            /**
             * get left/top absolute/relative node
             *
             * @param {OffsetOptions} [options={}]
             * @return {{left: Number, top: Number}}
             */
            $offset(options = {}) {
                options = Object.assign({
                    relative: false,
                    margin: false,
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
                        top: this.offsetTop - marginTop,
                    };
                }

                const box = this.getBoundingClientRect();
                return {
                    left: box.left + window.scrollX - document.documentElement.clientLeft - marginLeft,
                    top: box.top + window.scrollY - document.documentElement.clientTop - marginTop,
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
             * @param {String|SizeOptions} [options={}]
             * @return {{width: Number, height: Number}}
             */
            $size(options = {}) {
                if (typeof (options) === 'string') {
                    const presets = {
                        '': {
                            scrollbar: true,
                        },
                        client: {
                            padding: true,
                        },
                        inner: {
                            padding: true,
                            scrollbar: true,
                        },
                        offset: {
                            padding: true,
                            border: true,
                        },
                        outer: {
                            padding: true,
                            border: true,
                            scrollbar: true,
                        },
                        margin: {
                            padding: true,
                            border: true,
                            margin: true,
                            scrollbar: true,
                        },
                    };
                    options = presets[options];
                }
                kQuery.logger.assertInstanceOf(options, Object)();
                options = Object.assign({
                    scroll: false,
                    margin: false,
                    border: false,
                    padding: false,
                    scrollbar: false,
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

                return {width, height};
            },
            /**
             * get/set width irrespective of css
             *
             * @param {Number|String|SizeOptions} [options={}]
             * @return {Number}
             */
            $width(options = {}) {
                if (typeof (options) === 'number' || typeof (options) === 'string') {
                    if (F.stringIsNaN(options)) {
                        kQuery.logger.error(`options(${options}) is NaN`);
                    }
                    let size = this.$cssPixel(options);
                    const cstyle = this.$window.getComputedStyle(this);
                    if (cstyle.boxSizing !== 'border-box') {
                        const box = boxsize(this);
                        size -= box.borderWidth + box.paddingWidth;
                    }
                    this.style.width = size + 'px';
                    return size;
                }

                return this.$size(options).width;
            },
            /**
             * get/set height irrespective of css
             *
             * @param {Number|String|SizeOptions} [options={}]
             * @return {Number}
             */
            $height(options = {}) {
                if (typeof (options) === 'number' || typeof (options) === 'string') {
                    if (F.stringIsNaN(options)) {
                        kQuery.logger.error(`options(${options}) is NaN`);
                    }
                    let size = this.$cssPixel(options);
                    const cstyle = this.$window.getComputedStyle(this);
                    if (cstyle.boxSizing !== 'border-box') {
                        const box = boxsize(this);
                        size -= box.borderHeight + box.paddingHeight;
                    }
                    this.style.height = size + 'px';
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
            $scrollParent(scrollableOptions = {height: true, width: true}) {
                kQuery.logger.assertInstanceOf(scrollableOptions, Object)();

                if (scrollableOptions.height && this.scrollHeight > this.clientHeight) {
                    return this;
                }
                if (scrollableOptions.width && this.scrollWidth > this.clientWidth) {
                    return this;
                }
                return this.parentElement?.$scrollParent(scrollableOptions) ?? null;
            },
            /**
             * get visibilityState
             *
             * alias to $checkVisibility(true)
             *
             * @descriptor get
             *
             * @return {Boolean}
             */
            get $visible() {
                return this.$checkVisibility(true);
            },
            /**
             * get visibilityState
             *
             * specification:
             * - explicit: see display: none|content
             * - document: see document.hidden
             * - contentVisibilityProperty: see contentVisibility: hidden
             * - visibilityProperty: see visibility: hidden
             * - opacityProperty: see opacity: 0
             * - size: see width/height: 0
             * - intersection: see overlap other node or out of viewport
             *
             * @param {VisibilityOptions|Boolean} options
             * @param {Boolean} allOthers
             * @return {Boolean}
             */
            $checkVisibility(options = {}, allOthers = false) {
                if (typeof (options) === 'boolean') {
                    allOthers = options;
                    options = {};
                }
                options = Object.assign({
                    document: allOthers,
                    contentVisibilityAuto: allOthers,
                    contentVisibilityProperty: allOthers,
                    opacityProperty: allOthers,
                    visibilityProperty: allOthers,
                    size: allOthers,
                    intersection: allOthers,
                }, options);

                // document
                if (options.document && this.$document.hidden) {
                    return false;
                }

                // fallback
                if (this.checkVisibility && !this.checkVisibility(options)) {
                    return false;
                }

                // precondition
                for (let e = this; e; e = e.parentElement) {
                    const cstyle = e.$window.getComputedStyle(e);
                    if (cstyle.display === 'none' || cstyle.display === 'content') {
                        return false;
                    }
                    if (options.contentVisibilityProperty && cstyle.contentVisibility === 'hidden') {
                        return false;
                    }
                    if (options.visibilityProperty && cstyle.visibility === 'hidden') {
                        return false;
                    }
                    if (options.opacityProperty && cstyle.opacity === '0') {
                        return false;
                    }
                }

                const rect = this.getBoundingClientRect();
                const size = rect.width * rect.height;

                if (options.size && !size) {
                    return false;
                }

                // intersection
                if (options.intersection && size) {
                    const backup = this.getAttribute('style');
                    try {
                        // elementFromPoint ignores pointer-event:none
                        this.style.setProperty('pointer-event', 'auto', 'important');
                        if (
                            !this.contains(this.$document.elementFromPoint(rect.left, rect.top)) &&
                            !this.contains(this.$document.elementFromPoint(rect.right, rect.top)) &&
                            !this.contains(this.$document.elementFromPoint(rect.left, rect.bottom)) &&
                            !this.contains(this.$document.elementFromPoint(rect.right, rect.bottom))
                        ) {
                            return false;
                        }
                    }
                    finally {
                        if (backup == null) {
                            this.removeAttribute('style');
                        }
                        else {
                            this.setAttribute('style', backup);
                        }
                    }
                }

                return true;
            },
        },
        [[DOMRectReadOnly.name]]: /** @lends DOMRectReadOnly.prototype */{
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
                    return (
                        this.left <= other.x && other.x <= this.right &&
                        this.top <= other.y && other.y <= this.bottom
                    );
                }
                if (other instanceof DOMRectReadOnly) {
                    return (
                        this.$contains(new DOMPoint(other.left, other.top)) &&
                        this.$contains(new DOMPoint(other.right, other.top)) &&
                        this.$contains(new DOMPoint(other.left, other.bottom)) &&
                        this.$contains(new DOMPoint(other.right, other.bottom))
                    );
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
                    return (
                        this.left <= other.x && other.x <= this.right &&
                        this.top <= other.y && other.y <= this.bottom
                    );
                }
                if (other instanceof DOMRectReadOnly) {
                    return (
                        this.$intersects(new DOMPoint(other.left, other.top)) ||
                        this.$intersects(new DOMPoint(other.right, other.top)) ||
                        this.$intersects(new DOMPoint(other.left, other.bottom)) ||
                        this.$intersects(new DOMPoint(other.right, other.bottom))
                    );
                }
                throw new Error(`Unknown type(${other.constructor.name})`);
            },
        },
    };
}
