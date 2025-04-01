import * as API from './API.js';

/**
 * KQuery
 *
 * @private
 */
export class KQuery {
    constructor(meta) {
        const kQuery = this;

        // for development script browser plugin
        this.API = API;

        // config
        this.config = new API.Configuration((function () {
            if (API.F.objectIsPlain(meta)) {
                return meta;
            }

            const result = {};
            if (meta.url || meta.src) {
                for (const [key, value] of new URL(meta.url || meta.src).searchParams.entries()) {
                    if (key.startsWith('kQuery-')) {
                        result[key.substring('kQuery-'.length)] = value;
                    }
                }
            }
            if (meta instanceof HTMLScriptElement) {
                for (const [key, value] of API.F.objectToEntries(meta.dataset)) {
                    if (key.startsWith('kquery')) {
                        const key2 = key.substring('kquery'.length);
                        result[key2.charAt(0).toLowerCase() + key2.substring(1)] = value;
                    }
                }
            }
            return result;
        })());

        // default configure
        this.config.configure({
            debug: false,
            logLevel: 0,
            global: 'kQuery',
        });
        globalThis[this.config.global] = this;

        this.logger = new API.Logger(this.config.debug, this.config.logLevel, '[kQuery]', globalThis.console);
    }

    extends(plugin) {
        const kQuery = this;
        const pluginName = plugin.name ? plugin.name : plugin;

        this.logger.time(pluginName);
        for (const [types, properties] of Object.entries(plugin(kQuery))) {
            const descriptors = Object.getOwnPropertyDescriptors(properties);

            // rewrite setter to functional setter
            for (const descriptor of Object.values(descriptors)) {
                if (descriptor.set) {
                    const original = descriptor.set;
                    if (kQuery.config.resetNative || !API.F.functionIsNative(original)) {
                        descriptor.set = function (...args) {
                            return API.F.functionToCallbackable(original.bind(this), this, this)(...args);
                        };
                    }
                }
            }

            for (const type of types.split(',')) {
                // define list type
                if (type.charAt(0) === '$') {
                    for (const listtype of API[type]()) {
                        for (const [name, descriptor] of Object.entries(descriptors)) {
                            // length causes an infinite loop
                            if (name === 'length') {
                                continue;
                            }
                            Object.defineProperty(globalThis[listtype].prototype, name, {
                                get() {
                                    const mapped = API.F.objectToEntries(this).map(([i, e]) => e?.[name]);
                                    if (mapped.length && mapped.every(e => API.F.anyIsPrimitive(e, Object, Array, FileList))) {
                                        return mapped;
                                    }
                                    return new API.Collection(mapped, name, this);
                                },
                                set(value) {
                                    return API.F.objectToEntries(this).forEach(([i, e]) => {
                                        if (name in e) {
                                            API.F.functionToCallbackable(v => e[name] = v, this, e, i)(value);
                                        }
                                    });
                                },
                                configurable: descriptor.configurable,
                                enumerable: descriptor.enumerable,
                            });
                        }
                    }
                }
                // define self type
                else {
                    Object.defineProperties(globalThis[type].prototype, descriptors);
                }
            }
        }
        this.logger.timeEnd(pluginName);
    }
}
