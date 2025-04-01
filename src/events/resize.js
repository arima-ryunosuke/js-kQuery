import {F, ResizeObserver} from '../API.js';

export default class {
    static observers = {};

    constructor(target, selector, options, trigger) {
        // https://developer.mozilla.org/docs/Web/API/Resize_Observer_API
        options.first ??= true;
        this.eventId = ResizeObserver.getOptionsKey(options);
        this.observer = this.constructor.observers[this.eventId] ??= new ResizeObserver((entry, last) => {
            if (options.first || last) {
                const optionsBoxPascalCaseSize = F.stringToPascalCase(options.box ?? 'content-box', '-') + 'Size';
                trigger(entry.target, {
                    subtype: options.box ?? 'content-box',
                    // in most use cases, what is needed is [0]
                    oldValue: last == null ? null : last[optionsBoxPascalCaseSize][0],
                    newValue: entry[optionsBoxPascalCaseSize][0],
                }, {
                    $original: {
                        observer: this.observer,
                        entry: entry,
                    },
                });
            }
        }, options);
        this.handlers = {
            insert: (node) => this.observer.observe(node),
            delete: (node) => this.observer.unobserve(node),
        };
    }
}
