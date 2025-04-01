import {ResizeObserver} from '../API.js';

export default class {
    static observers = {};

    constructor(target, selector, options, trigger) {
        // https://developer.mozilla.org/docs/Web/API/Resize_Observer_API
        options.first ??= true;
        this.eventId = ResizeObserver.getOptionsKey(options);
        this.observer = this.constructor.observers[this.eventId] ??= new ResizeObserver((entry, last) => {
            // not triggered on style changed
            // const visible = entry.target.checkVisibility(options);
            const visible = entry.contentRect.x > 0 || entry.contentRect.y > 0 || entry.contentRect.width > 0 || entry.contentRect.height > 0;

            if (options.first || last) {
                if (visible !== last?.visible) {
                    trigger(entry.target, {
                        subtype: 'content-visibility', // if found better way, support also opacity, visibility, etc
                        oldValue: last == null ? null : !visible,
                        newValue: visible,
                    }, {
                        $original: {
                            observer: this.observer,
                            entry: entry,
                        },
                    });
                }
            }
        }, options);
        this.handlers = {
            insert: (node) => this.observer.observe(node),
            delete: (node) => this.observer.unobserve(node),
        };
    }
}
