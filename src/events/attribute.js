import {F, MutationObserver} from '../API.js';

export default class {
    static observers = {};

    constructor(target, selector, options, trigger) {
        // attribute: https://developer.mozilla.org/docs/Web/API/MutationObserver
        if (options.attributeName) {
            options.attributeFilter = F.objectIsArrayLike(options.attributeName) ? options.attributeName : [options.attributeName];
        }
        options = Object.assign(options, {
            attributes: true,
            attributeOldValue: true,
        });
        this.eventId = MutationObserver.getOptionsKey(options);
        this.observer = this.constructor.observers[this.eventId] ??= new MutationObserver((entry, last) => {
            trigger(entry.target, {
                subtype: entry.attributeName,
                oldValue: entry.oldValue,
                newValue: entry.target.getAttribute(entry.attributeName),
            }, {
                $original: {
                    observer: this.observer,
                    entry: entry,
                },
            });
        }, options);
        this.handlers = {
            insert: (node) => this.observer.observe(node),
            delete: (node) => this.observer.unobserve(node),
        };
    }
}
