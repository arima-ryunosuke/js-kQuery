import {MutationObserver} from '../API.js';

export default class {
    static observers = {};

    constructor(target, selector, options, trigger) {
        const withAttributes = options.attributes;
        options = Object.assign(options, {
            childList: true,
            attributes: false,
        });
        this.eventId = MutationObserver.getOptionsKey(options);
        this.observer = this.constructor.observers[this.eventId] ??= new MutationObserver((entry, last) => {
            for (const child of entry.addedNodes) {
                if (!(child instanceof Element)) {
                    continue;
                }
                trigger(entry.target, {
                    subtype: 'insert',
                    node: child,
                }, {
                    $original: {
                        observer: this.observer,
                        entry: entry,
                    },
                });
                this.constructor.observers['attribute' + this.eventId]?.observe?.(child);
            }
            for (const child of entry.removedNodes) {
                if (!(child instanceof Element)) {
                    continue;
                }
                trigger(entry.target, {
                    subtype: 'remove',
                    node: child,
                }, {
                    $original: {
                        observer: this.observer,
                        entry: entry,
                    },
                });
                this.constructor.observers['attribute' + this.eventId]?.unobserve?.(child);
            }
        }, options);
        if (withAttributes) {
            this.attributer = this.constructor.observers['attribute' + this.eventId] ??= new MutationObserver((entry, last) => {
                trigger(entry.target.parentElement, {
                    subtype: 'change',
                    node: entry.target,
                    name: entry.attributeName,
                    oldValue: entry.oldValue,
                    newValue: entry.target.getAttribute(entry.attributeName),
                }, {
                    $original: {
                        observer: this.attributer,
                        entry: entry,
                    },
                });
            }, {
                subtree: options.subtree,
                childList: false,
                attributes: true,
                attributeOldValue: true,
            });
        }
        this.handlers = {
            insert: (node) => this.observer.observe(node),
            delete: (node) => this.observer.unobserve(node),
        };
    }
}
