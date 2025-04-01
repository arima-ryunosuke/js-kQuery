import {MutationObserver} from '../API.js';

export default class {
    static observers = {};

    constructor(target, selector, options, trigger) {
        options = Object.assign(options, {
            attributes: true,
            attributeOldValue: true,
            attributeFilter: ['disabled'],
        });
        this.eventId = MutationObserver.getOptionsKey(options);
        this.selector = selector ? `${selector}, fieldset` : null;
        this.observer = this.constructor.observers[selector + this.eventId] ??= new MutationObserver((entry, last) => {
            const trigger2 = (target) => {
                const valuer = function (target, withSelf) {
                    for (let node = target; node != null; node = node.parentElement) {
                        if (withSelf && node === entry.target) {
                            if (entry.oldValue != null) {
                                return true;
                            }
                        }
                        else if (node.disabled) {
                            return true;
                        }
                    }
                    return false;
                };

                const oldValue = valuer(target, true);
                const newValue = valuer(target, false);
                if (oldValue !== newValue) {
                    trigger(target, {
                        subtype: oldValue ? 'enable' : 'disable',
                        oldValue: oldValue,
                        newValue: newValue,
                    }, {
                        $original: {
                            observer: this.observer,
                            entry: entry,
                        },
                    });
                }
            };

            if (!selector || entry.target.matches(selector)) {
                trigger2(entry.target);
            }
            if (selector) {
                entry.target.querySelectorAll(selector).forEach(node => trigger2(node));
            }
        }, options);
        this.handlers = {
            insert: (node) => this.observer.observe(node),
            delete: (node) => this.observer.unobserve(node),
        };
    }
}
