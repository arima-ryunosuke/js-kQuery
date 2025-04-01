import {IntersectionObserver} from '../API.js';

export default class {
    static observers = {};

    constructor(target, selector, options, trigger) {
        // intersect: https://developer.mozilla.org/docs/Web/API/Intersection_Observer_API
        options.first ??= true;
        this.eventId = IntersectionObserver.getOptionsKey(options);
        this.observer = this.constructor.observers[this.eventId] ??= new IntersectionObserver((entry, last) => {
            if (options.first || last) {
                const subtype = last ? !last.isIntersecting && entry.isIntersecting ? 'enter' : last.isIntersecting && !entry.isIntersecting ? 'leave' : 'hover' : null;
                trigger(entry.target, {
                    subtype: subtype, oldValue: last?.realIntersectionRatio ?? null, newValue: entry.realIntersectionRatio,
                }, {
                    $original: {
                        observer: this.observer, entry: entry,
                    },
                });
            }
        }, options);
        this.handlers = {
            insert: (node) => this.observer.observe(node), delete: (node) => this.observer.unobserve(node),
        };
    }
}
