import {CookieObserver} from '../API.js';

export default class {
    static observers = {};

    constructor(target, selector, options, trigger) {
        this.eventId = CookieObserver.getOptionsKey(options);
        this.observer = this.constructor.observers[this.eventId] ??= new CookieObserver((entry, last) => {
            trigger(entry.target, {
                subtype: entry.cookieName,
                oldValue: entry.oldValue,
                newValue: entry.newValue,
            }, {
                $original: {
                    observer: this.observer,
                    entry: entry,
                },

                bubbles: false,
                cancelable: false,
                composed: false,
            });
        }, options);
        this.observer.observe(target);
    }

    destructor(target) {
        this.observer.unobserve(target);
    }
}
