import {$NodeList, CustomEvent, F, MutationObserver, Nullable, ObjectStorage, Timer, WeakMap} from '../API.js';

/**
 * @param {KQuery} kQuery
 *
 * @ignore
 *
 * this is core, must not depend on other plugins.
 */
export function events(kQuery) {
    kQuery.config.configure({
        customEventPrefix: '$',
    });

    Object.assign(kQuery, /** @lends KQuery.prototype */{
        wellknownEvents: {
            click: PointerEvent,
        },
        customEvents: {},
    });

    const eventDataMap = new WeakMap();

    const eachType = function (allowEmpty, type) {
        if (type == null) {
            if (!allowEmpty) {
                throw new Error(`Empty EventType is only allowed this context`);
            }
            return [[null, []]];
        }

        return ('' + type).trim()
            .split(/\s+/)
            .map(e => e.trim().split('.'))
            .map(([t, ...n]) => {
                if (!allowEmpty && !t.length) {
                    throw new Error(`Empty EventType is only allowed this context`);
                }
                return [t, n.filter(e => e.length)];
            });
    };

    const internalEventName = function (type) {
        if (type in kQuery.customEvents) {
            type = kQuery.config.customEventPrefix + type;
        }
        return type;
    };

    const emulateDelegationWatcher = new class {
        constructor() {
            const querySelectorThisAndAll = function (nodelist, selector) {
                const result = new Set();
                for (const node of nodelist) {
                    if (node instanceof Element) {
                        if (node.matches(selector)) {
                            result.add(node);
                        }
                        for (const child of node.querySelectorAll(selector)) {
                            result.add(child);
                        }
                    }
                }
                return result;
            };
            this.nodeSelectorCallback = new WeakMap();
            this.observer = new MutationObserver((entry) => {
                for (const [node, selectorCallbacks] of this.nodeSelectorCallback.entries()) {
                    for (const {selector, callbacks} of selectorCallbacks) {
                        for (const child of querySelectorThisAndAll(entry.addedNodes, selector)) {
                            kQuery.logger.debug(`Insert node to delegation emulation of `, node);
                            callbacks.insert(child);
                        }
                        for (const child of querySelectorThisAndAll(entry.removedNodes, selector)) {
                            kQuery.logger.debug(`Delete node to delegation emulation of `, node);
                            callbacks.delete(child);
                        }
                    }
                }
            }, {
                attributes: false,
                attributeOldValue: false,
                characterData: false,
                characterDataOldValue: false,
                childList: true,
                subtree: true,
            });
        }

        watch(node, selector, callbacks) {
            if (selector == null) {
                callbacks.insert(node);
            }
            else {
                this.nodeSelectorCallback.getOrSet(node, () => []).push({selector, callbacks});

                // use querySelectorAll because parent node is not watched
                for (const child of node.querySelectorAll(selector)) {
                    kQuery.logger.debug(`Initial node to delegation emulation of `, child);
                    callbacks.insert(child);
                }

                return this.observer.observe(node);
            }
        }

        unwatch(node, selector, callbacks) {
            if (selector == null) {
                callbacks.delete(node);
            }
            else {
                this.nodeSelectorCallback.reset(node, (selectorCallbacks) => selectorCallbacks.filter(selectorCallback => {
                    if (selectorCallback.selector === selector && selectorCallback.callbacks === callbacks) {
                        kQuery.logger.debug(`Unwatch node to delegation emulation of `, node);
                        return false;
                    }
                    return true;
                }));
            }
        }
    };

    return {
        [[EventTarget.name, $NodeList.name]]: /** @lends EventTarget.prototype */{
            /**
             * addEventListener
             *
             * type format:
             * - click: single event
             * - click change: multiple event
             * - click.ns: single namespace event
             *
             * delegation:
             * - specify selector argument, enable delegation(like jQuery)
             * - specify options ownself:true, trigger only matched element
             *   - default ownself:false, trigger until closest
             * - specify options once:true, trigger event per element only once
             *
             * listener(e):
             * - this: bound target
             * - e.target: triggered element always
             * - e.currentTarget: listened element always(=this)
             * - e.$delegateTarget: selector element delegation only
             *
             * misc:
             * - options is not allowed bool(useCapture). must be Object
             * - throttle: continual events dispatch interval
             * - debounce: continual events dispatch after last
             * - leading: fire at first time
             * - trailing: fire after last time
             *
             * ```
             *          | throttle | (l)throttle | (t)throttle | (lt)throttle | debounce | (l)debounce | (t)debounce | (lt)debounce |
             *  leading:|          | fire        |             | fire         |          | fire        |             | fire         |
             *      100:|          |             |             |              |          |             |             |              |
             *      200:| fire     | fire        | fire        | fire         |          |             |             |              |
             *      300:|          |             |             |              |          |             |             |              |
             *      400:| fire     | fire        | fire        | fire         |          |             |             |              |
             *      500:|          |             |             |              |          |             |             |              |
             *      600:| fire     | fire        | fire        | fire         |          |             |             |              |
             * trailing:|          |             | fire        | fire         |          |             | fire        | fire         |
             * ```
             *
             * @param {String} types
             * @param {String|Function} selector
             * @param {Function|ListenerOptions} [listener]
             * @param {ListenerOptions} [options={}]
             * @return {this}
             */
            $on(types, selector, listener, options) {
                if (typeof (selector) === 'function') {
                    options = listener;
                    listener = selector;
                    selector = null;
                }
                options = Object.assign({
                    // standard: https://developer.mozilla.org/docs/Web/API/EventTarget/addEventListener
                    ...{
                        // bool
                        once: undefined,
                        // bool
                        capture: undefined,
                        // bool
                        passive: undefined,
                        // https://developer.mozilla.org/docs/Web/API/AbortSignal
                        signal: undefined,
                    },
                    // commons
                    ...{
                        // bool
                        ownself: false,
                        // int
                        interval: undefined,
                        // int
                        throttle: undefined,
                        // int
                        debounce: undefined,
                        // bool
                        leading: undefined,
                        // bool
                        trailing: undefined,
                    },
                    // other events...
                }, options);
                kQuery.logger.assertInstanceOf(types, String)();
                kQuery.logger.assertInstanceOf(selector, Nullable, String)();
                kQuery.logger.assertInstanceOf(listener, Function)();
                kQuery.logger.assertInstanceOf(options, Object)();

                if (selector != null && options.capture) {
                    kQuery.logger.warn(`Delegation of capture phase isn't tested, so might not work well`);
                }

                if (options.throttle && !options.debounce) {
                    options.leading ??= true;
                    options.trailing ??= false;
                }
                if (options.debounce && !options.throttle) {
                    options.leading ??= false;
                    options.trailing ??= true;
                }

                for (const [type, namespaces] of eachType(false, types)) {
                    const eventData = {type, namespaces, selector, listener, options, counter: new WeakMap(), collectors: []};

                    let customEvent;
                    if (!(this instanceof Window) && type in kQuery.customEvents) {
                        customEvent = new kQuery.customEvents[type](this, selector, options, function (target, detail = {}, options = {}) {
                            customEvent.bubbles = 'bubbles' in options;
                            options.$original ??= {};
                            options.$original.$eventId ??= customEvent.eventId;
                            options.bubbles ??= (customEvent.selector ?? selector) != null;
                            options.detail ??= detail;
                            target.$trigger(type, options);
                        });
                        customEvent.handlers ??= {};
                        customEvent.handlers.insert ??= (node) => {};
                        customEvent.handlers.delete ??= (node) => {};
                        emulateDelegationWatcher.watch(this, customEvent.selector ?? selector, customEvent.handlers);
                        eventData.collectors.push(() => {
                            emulateDelegationWatcher.unwatch(this, customEvent.selector ?? selector, customEvent.handlers);
                            customEvent.destructor?.(this);
                        });
                    }

                    const waitStorage = new ObjectStorage();
                    const handler = async (e) => {
                        // only matched namespace
                        if (e.$namespaces?.length && e.$namespaces.some(ns => !eventData.namespaces.includes(ns))) {
                            return;
                        }
                        // only same custom event's options
                        if (customEvent?.eventId !== e.$original?.$eventId) {
                            return;
                        }

                        // e.target is volatile?
                        const target = e.target;
                        const debounce = async (msec, leading) => {
                            const timer = Timer.wait(msec);
                            const current = waitStorage.reset(target, 'timer', () => timer);
                            if (!leading || (current?.status === 'pending')) {
                                current?.cancel(null);
                                if ((await timer) === null) {
                                    return false;
                                }
                                if (!options.trailing) {
                                    return false;
                                }
                            }
                            return true;
                        };

                        if (options.debounce != null) {
                            if (!await debounce(options.debounce, options.leading)) {
                                return;
                            }
                        }
                        if (options.throttle != null) {
                            const start = waitStorage.getOrSet(target, 'start', () => Date.now() - (options.leading ? options.throttle : 0));
                            if ((start + options.throttle) > Date.now()) {
                                if (!await debounce(options.throttle, false)) {
                                    return;
                                }
                            }
                            waitStorage.set(target, 'start', Date.now());
                        }

                        e.$abort = (reason) => eventData.abortController.abort(reason);

                        if (eventData.selector == null) {
                            return eventData.listener.call(this, e);
                        }

                        for (let parent = target; parent && parent !== this; parent = parent.parentElement) {
                            if (parent.matches(eventData.selector) && !(options.once && eventData.counter.get(target))) {
                                if (!eventData.counter.reset(target, (count) => (count ?? 0) + 1) && options.once) {
                                    customEvent?.handlers?.delete?.(target);
                                }
                                // stop bubbling unless explicitly specified
                                if (customEvent && !customEvent.bubbles) {
                                    e.stopPropagation();
                                }
                                e.$delegateTarget = parent;
                                return eventData.listener.call(this, e);
                            }

                            if (options.ownself) {
                                break;
                            }
                        }
                    };

                    // handler is needed by $off, but should not have a strong reference if once:true
                    eventData.handler = new WeakRef(handler);
                    eventDataMap.getOrSet(this, () => []).push(eventData);

                    // if selector and once, apply once per node
                    const internalOptions = eventData.selector == null ? options : Object.assign({}, options, {once: false});

                    eventData.abortController = new AbortController();
                    eventData.abortController.signal.addEventListener('abort', eventData.destructor);
                    if (internalOptions.signal) {
                        internalOptions.signal = AbortSignal.any([internalOptions.signal, eventData.abortController.signal]);
                    }
                    else {
                        internalOptions.signal = eventData.abortController.signal;
                    }
                    this.addEventListener(internalEventName(type), handler, internalOptions);

                    // if once:true, the handler can be retrieved by the GC
                    // at that time, $off is not called so have to call by finalizer
                    eventData.destructor = function () {
                        kQuery.logger.debug(`Release of `, type, selector, options);

                        eventData.collectors.forEach(collector => collector());
                        eventData.collectors = [];
                    };
                    F.objectFinalize(handler, eventData.destructor);
                }

                return this;
            },
            /**
             * removeEventListener
             *
             * all arguments are optional
             * - $off(): remove all event
             * - $off('click'): remove all click event
             * - $off('click', 'selector'): remove all click event of selector
             * - $off('click', 'selector', listener): remove same listener event of selector
             *
             * @param {String} [types]
             * @param {String|Function} [selector]
             * @param {Function|Object} [listener]
             * @param {Object} [options={}]
             * @return {this}
             */
            $off(types, selector, listener, options) {
                if (typeof (selector) === 'function') {
                    options = listener;
                    listener = selector;
                    selector = null;
                }
                kQuery.logger.assertInstanceOf(types, Nullable, String)();
                kQuery.logger.assertInstanceOf(selector, Nullable, String)();
                kQuery.logger.assertInstanceOf(listener, Nullable, Function)();
                kQuery.logger.assertInstanceOf(options, Nullable, Object)();

                for (const [type, namespaces] of eachType(true, types)) {
                    eventDataMap.reset(this, (eventDatas) => (eventDatas ?? []).filter(eventData => {
                        if (type && type !== eventData.type) {
                            return true;
                        }
                        if (namespaces.length && namespaces.some(ns => !eventData.namespaces.includes(ns))) {
                            return true;
                        }
                        if (selector && selector !== eventData.selector) {
                            return true;
                        }
                        if (listener && listener !== eventData.listener) {
                            return true;
                        }
                        if (options?.capture !== eventData.options.capture) {
                            return true;
                        }

                        this.removeEventListener(internalEventName(eventData.type), eventData.handler.deref(), eventData.options);
                        eventData.destructor();
                        return false;
                    }));
                }

                return this;
            },
            /**
             * dispatch Event
             *
             * types allows multiple event
             *
             * some event are special treated, e.g. click is PointerEvent
             *
             * @param {String} types
             * @param {EventOptions} options={}
             * @return {Boolean}
             */
            $trigger(types, options = {}) {
                kQuery.logger.assertInstanceOf(types, String)();
                kQuery.logger.assertInstanceOf(options, Object)();

                let result = true;
                for (const [type, namespaces] of eachType(false, types)) {
                    const event = kQuery.wellknownEvents[type] ?? CustomEvent;
                    const eventObject = new event(internalEventName(type), Object.assign({
                        bubbles: true,
                        cancelable: true,
                        composed: true,
                    }, options));
                    eventObject.$namespaces = namespaces;

                    const completed = this.dispatchEvent(eventObject);
                    kQuery.logger.debug(`Event ${type} is ${completed ? 'completed' : 'canceled'}`, this, eventObject);
                    result = result && completed;
                }
                return result;
            },
            /**
             * get Event data
             *
             * this method is very unsafe and changed without any notice
             * eventdata is live, changing it changes the handler itself
             *
             * @param {String} [types]
             * @param {Boolean} [ancestor]
             * @param {Boolean} [capture=false]
             * @return {{type: String, namespaces: Array, selector: String, listener: Function, options: Object}[]}
             */
            $events(types, ancestor, capture = false) {
                kQuery.logger.assertInstanceOf(types, Nullable, String)();
                kQuery.logger.assertInstanceOf(ancestor, Nullable, Boolean)();
                kQuery.logger.assertInstanceOf(capture, Boolean)();

                const result = eventDataMap.get(this) ?? [];

                if (ancestor) {
                    for (let parent = this.parentNode; parent; parent = parent.parentNode) {
                        for (const ev of eventDataMap.get(parent) ?? []) {
                            // delegation mode
                            if (ev.selector != null && this.matches(ev.selector)) {
                                if (!(ev.options.once && ev.counter.get(this))) {
                                    result.push(ev);
                                }
                            }
                        }
                    }
                }

                return result.filter(ev => {
                    // if once:true, handler is collected by GC
                    if (!ev.handler.deref()) {
                        return false;
                    }

                    for (const [type, namespaces] of eachType(true, types)) {
                        if (type && type !== ev.type) {
                            return false;
                        }
                        if (namespaces.length && namespaces.some(ns => !ev.namespaces.includes(ns))) {
                            return false;
                        }
                    }

                    if (capture !== (ev.options.capture ?? false)) {
                        return false;
                    }

                    return true;
                });
            },
        },
    };
}
