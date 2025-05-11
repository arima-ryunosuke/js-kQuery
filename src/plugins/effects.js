import {$NodeList, Nullable, Promise, Timer, WeakMap} from '../API.js';

/**
 * @param {KQuery} kQuery
 *
 * @ignore
 */
export function effects(kQuery) {
    const handleArguments = function (args) {
        if (typeof (args[0]) === 'number') {
            args[1] ??= {};
            args[1].duration = args[0];
            args[0] = args[1];
        }
        return Object.assign({
            initial: {},
            reset: true,
        }, args[0]);
    };

    const nodeStyleBackup = new WeakMap();
    const nodeWillChangeBackup = new WeakMap();

    const willChangeTimer = new Timer();
    willChangeTimer.addEventListener('alarm', function () {
        for (const [e, backup] of nodeWillChangeBackup.entries()) {
            e.style.setProperty('will-change', backup);
        }
        nodeWillChangeBackup.clear();
    });

    return {
        [[Element.name, $NodeList.name]]: /** @lends Element.prototype */{
            /**
             * change css will-change property
             *
             * changes are undone after a certain amount of time
             *
             * @param {String|Array} value
             * @param {Number} [timeout=1000]
             * @return {this}
             */
            $willChange(value, timeout = 1000) {
                kQuery.logger.assertInstanceOf(value, String, Array)();
                kQuery.logger.assertInstanceOf(timeout, Number)();

                value = value instanceof Array ? value : [value];

                const current = this.style.getPropertyValue('will-change');
                nodeWillChangeBackup.getOrSet(this, () => current);
                if (current) {
                    value.push(current);
                }

                this.style.setProperty('will-change', [...new Set(value)].join(','));

                // will-change should be set collectively
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
                    timing: 'ease',
                }, options);

                const current = nodeStyleBackup.getOrSet(this, () => ({
                    count: 0,
                    style: this.getAttribute('style'),
                    transitionValue: this.style.getPropertyValue('transition') ?? '',
                    transitionPriority: this.style.getPropertyPriority('transition') ?? '',
                }));
                current.count++;

                for (const [css, value] of Object.entries(options.initial)) {
                    this.style.setProperty(css, value, 'important');
                }
                this.getClientRects(); // force reflow/repaint

                const currentTransitions = (this.style.getPropertyValue('transition') ?? '').split(',').filter((v) => v);
                for (const [css, value] of Object.entries(properties)) {
                    this.style.setProperty(css, value, 'important');
                    currentTransitions.push(`${css} ${options.duration}ms ${options.timing}`);
                }
                this.style.setProperty('transition', currentTransitions.join(','), 'important');

                let resolve, reject;
                const promise = new Promise((res, rej) => {
                    resolve = res;
                    reject = rej;
                });
                const complete = () => {
                    this.removeEventListener('transitionend', listener);

                    const current = nodeStyleBackup.get(this);
                    if (--current.count === 0) {
                        nodeStyleBackup.delete(this);

                        if (options.reset) {
                            this.setAttribute('style', current.style);
                        }
                        else {
                            this.style.setProperty('transition', current.transitionValue, current.transitionPriority);
                            for (const [css, value] of Object.entries(properties)) {
                                this.style.setProperty(css, value, '');
                            }
                        }
                    }
                };
                const queue = new Set(Object.keys(properties));
                const listener = (e) => {
                    queue.delete(e.propertyName);
                    if (queue.size === 0) {
                        clearTimeout(timer);
                        complete();
                        resolve(true);
                    }
                };
                const timer = setTimeout(function () {
                    complete();
                    resolve(false);
                    //reject(this);
                }, options.duration + 32);
                this.addEventListener('transitionend', listener);
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
                    opacity: 0,
                });
                return this.$transition({
                    opacity: cstyle.opacity,
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
                    opacity: cstyle.opacity,
                });
                return this.$transition({
                    opacity: 0,
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
                    overflow: 'hidden',
                    height: 0,
                    "margin-top": 0,
                    "margin-bottom": 0,
                    "padding-top": 0,
                    "padding-bottom": 0,
                });
                return this.$transition({
                    height: parseFloat(cstyle.height),
                    "margin-top": parseFloat(cstyle.marginTop),
                    "margin-bottom": parseFloat(cstyle.marginBottom),
                    "padding-top": parseFloat(cstyle.paddingTop),
                    "padding-bottom": parseFloat(cstyle.paddingBottom),
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
                    overflow: 'hidden',
                    height: parseFloat(cstyle.height),
                    "margin-top": parseFloat(cstyle.marginTop),
                    "margin-bottom": parseFloat(cstyle.marginBottom),
                    "padding-top": parseFloat(cstyle.paddingTop),
                    "padding-bottom": parseFloat(cstyle.paddingBottom),
                });
                return this.$transition({
                    height: 0,
                    "margin-top": 0,
                    "margin-bottom": 0,
                    "padding-top": 0,
                    "padding-bottom": 0,
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
                    overflow: 'hidden',
                    width: 0,
                    "margin-left": 0,
                    "margin-right": 0,
                    "padding-left": 0,
                    "padding-right": 0,
                    "max-height": parseFloat(cstyle.height),
                });
                return this.$transition({
                    width: parseFloat(cstyle.width),
                    "margin-left": parseFloat(cstyle.marginLeft),
                    "margin-right": parseFloat(cstyle.marginRight),
                    "padding-left": parseFloat(cstyle.paddingLeft),
                    "padding-right": parseFloat(cstyle.paddingRight),
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
                    overflow: 'hidden',
                    width: parseFloat(cstyle.width),
                    "margin-left": parseFloat(cstyle.marginLeft),
                    "margin-right": parseFloat(cstyle.marginRight),
                    "padding-left": parseFloat(cstyle.paddingLeft),
                    "padding-right": parseFloat(cstyle.paddingRight),
                    "max-height": parseFloat(cstyle.height),
                });
                return this.$transition({
                    width: 0,
                    "margin-left": 0,
                    "margin-right": 0,
                    "padding-left": 0,
                    "padding-right": 0,
                }, opts);
            },
        },
    };
}
