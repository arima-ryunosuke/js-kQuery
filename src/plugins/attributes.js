import {$CSSRuleList, $NodeList, F, Nullable, ObjectStorage, Proxy} from '../API.js';

/**
 * @param {KQuery} kQuery
 *
 * @ignore
 */
export function attributes(kQuery) {
    const nodeStorage = new ObjectStorage();

    class ProxyProperty {
        static NotImplemented = Symbol('NotImplemented');

        constructor(node, name) {
            this.node = node;
            this.name = name;
            this.object = node[name];
        }

        has(target, property) {
            return this._hasValue(property);
        }

        _hasValue(property) {
            return Reflect.has(this.object, property);
        }

        get(target, property) {
            if (property === Symbol.toPrimitive || property === 'toString') {
                return () => this._getString();
            }
            if (property.charAt(0) === '$') {
                const $value = this._get$Value(property.substring(1));
                if ($value !== ProxyProperty.NotImplemented) {
                    return $value;
                }
            }
            const base = Reflect.get(this.object, property);
            if (typeof (base) === 'function') {
                return this._getFunction(property, base);
            }
            return this._getValue(property, base);
        }

        _getString() {}

        _get$Value(property) {
            return ProxyProperty.NotImplemented;
        }

        _getFunction(property, value) {
            const method = (...args) => {
                const result = F.functionToCallbackable(value, this.node, this.node, method.i).call(this.object, ...args);
                return result === undefined ? nodeStorage.get(this.node, this.name) : result;
            };
            return method;
        }

        _getValue(property, value) {
            return value;
        }

        set(target, property, value) {
            if (typeof (value) === 'function') {
                value = this._setFunction(property, value);
            }
            if (property.charAt(0) === '$') {
                const $value = this._set$Value(property.substring(1), value);
                if ($value !== ProxyProperty.NotImplemented) {
                    return true;
                }
            }
            this._setValue(property, value);
            return true;
        }

        _set$Value(property, value) {
            return ProxyProperty.NotImplemented;
        }

        _setFunction(property, value) {
            return value.call(this.object, this.node);
        }

        _setValue(property, value) {
            if (value === undefined) {
                return;
            }
            this.apply(null, null, [{[property]: value}]);
        }

        deleteProperty(target, property) {
            const value = Reflect.get(this.object, property);
            this._deleteValue(property, value);
            return true;
        }

        _deleteValue(property, value) {
            Reflect.deleteProperty(this.object, property);
        }

        apply(target, thisArg, argArray) {
            if (argArray[0] instanceof Array || F.objectIsPlain(argArray[0])) {
                this._applySet(...argArray);
                return nodeStorage.get(this.node, this.name);
            }
            else {
                return this._applyGet(...argArray);
            }
        }

        _applyGet(...args) {}

        _applySet(...args) {}
    }

    return {
        [[Element.name, $NodeList.name]]: /** @lends Element.prototype */{
            /**
             * simple accessor to NamedNodeMap(attribute)
             *
             * @descriptor get
             *
             * @return {Object|Function}
             *
             * @example
             * $$('input').$attrs.name;             // getter
             * $$('input').$attrs.name = 'value';   // setter
             * $$('input').$attrs({name: 'value'}); // mass setting(keep other)
             * $$('input').$attrs();                // get all key-value object
             *
             * @example
             * // false is delete that attribute
             * $$('input').$attrs.name = false;
             * $$('input').$attrs({name: false});
             *
             * @example
             * // $prefix means inherited attribute
             * $$('input').$attrs.$disabled; // returns true if the parent is disabled even if itself none
             */
            get $attrs() {
                return nodeStorage.getOrSet(this, 'attributes', (node, name) => new Proxy(function $Attrs() {}, new class extends ProxyProperty {
                    _getString() {
                        return Object.values(node.attributes).map((attr) => `${F.stringEscape(attr.name, 'attr-name')}="${F.stringEscape(attr.value, 'attr-value')}"`).join(' ');
                    }

                    _get$Value(property) {
                        return node.closest(`[${F.stringEscape(property, 'css')}]`)?.getAttribute(property) ?? null;
                    }

                    _getValue(property, value) {
                        return value?.value;
                    }

                    _deleteValue(property, value) {
                        node.removeAttribute(property);
                    }

                    _applyGet() {
                        return Object.fromEntries(Array.from(node.attributes, attr => [attr.name, attr.value]));
                    }

                    _applySet(object) {
                        const normalizedAttributes = F.objectToAttributes(object);
                        for (const [name, value] of Object.entries(normalizedAttributes)) {
                            if (typeof (value) === 'boolean') {
                                node.toggleAttribute(name, value);
                            }
                            else {
                                node.setAttribute(name, value);
                            }
                        }
                    }
                }(node, name)));
            },
            /**
             * mass assign NamedNodeMap(attribute)
             *
             * @descriptor set
             *
             * @param {Object} value
             *
             * @example
             * $$('input').$attrs = {name: 'value'};                // mass assign(delete other)
             * $$('input').$attrs = (node, i) => ({name: 'value'}); // mass assign by callback(delete other)
             */
            set $attrs(value) {
                kQuery.logger.assertInstanceOf(value, Nullable, Object)();

                // null guard for function return (void). keep current values
                if (value == null) {
                    return;
                }

                // carefully node.attributes is "live" collection
                for (const attr of Object.values(this.attributes)) {
                    this.attributes.removeNamedItem(attr.name);
                }

                // noinspection JSValidateTypes
                this.$attrs(value);
            },
            /**
             * simple accessor to DOMStringMap(dataset)
             *
             * @descriptor get
             *
             * @return {Object|Function}
             *
             * @example
             * $$('input').$data.name;             // getter
             * $$('input').$data.name = 'value';   // setter
             * $$('input').$data({name: 'value'}); // mass setting(keep other)
             * $$('input').$data();                // get all key-value object
             * $$('input').$data('prefix');        // get structured object
             *
             * @example
             * // $prefix means objective data
             * $$('input').$data.$hoge; // returns Object starting with hoge
             */
            get $data() {
                return nodeStorage.getOrSet(this, 'dataset', (node, name) => new Proxy(function $Data() {}, new class extends ProxyProperty {
                    _getString() {
                        return JSON.stringify(this.apply(null, null, ['']));
                    }

                    _get$Value(property) {
                        return this._applyGet(property);
                    }

                    _applyGet(property) {
                        const result = {};
                        for (const [name, data] of Object.entries(node.dataset)) {
                            result[name] = data;
                        }
                        if (typeof (property) !== 'string') {
                            return result;
                        }

                        // filter and to kebab
                        const targetPrefix = F.stringToKebabCase(property);
                        const regex = new RegExp(targetPrefix ? `^${property}[A-Z]` : `.*`);
                        const member = {};
                        for (const [name, data] of Object.entries(result)) {
                            if (regex.test(name)) {
                                member[F.stringToKebabCase(name)] = data;
                            }
                        }

                        if (Object.keys(member).length === 0 && property in node.dataset) {
                            try {
                                return JSON.parse(node.dataset[property]);
                            }
                            catch (e) {
                            }
                        }

                        const entries = Object.entries(member).map(([name, value]) => [name.split('-'), value]);
                        const object = F.entriesToObject(entries, true);

                        return targetPrefix ? targetPrefix.split('-').reduce((target, key) => target?.[key], object) ?? {} : object;
                    }

                    _set$Value(property, value) {
                        node.dataset[property] = JSON.stringify(value);
                    }

                    _applySet(object) {
                        for (const [name, data] of Object.entries(F.objectToDataset(object))) {
                            node.dataset[F.stringToPascalCase(name)] = data;
                        }
                    }
                }(node, name)));
            },
            /**
             * mass assign DOMStringMap(dataset)
             *
             * @descriptor set
             *
             * @param {Object} value
             *
             * @example
             * $$('input').$data = {name: 'value'};                // mass assign(delete other)
             * $$('input').$data = (node, i) => ({name: 'value'}); // mass assign by callback(delete other)
             */
            set $data(value) {
                kQuery.logger.assertInstanceOf(value, Nullable, Object)();

                // null guard for function return (void). keep current values
                if (value == null) {
                    return;
                }

                for (const name of Object.keys(this.dataset)) {
                    delete this.dataset[name];
                }

                // noinspection JSValidateTypes
                this.$data(value);
            },
            /**
             * simple accessor to DOMTokenList(classList)
             *
             * @descriptor get
             *
             * @return {Object|Function}
             *
             * @example
             * $$('input').$class.name;             // getter(always boolean)
             * $$('input').$class.name = 'flag';    // setter(cast to boolean)
             * $$('input').$class({name: 'flag'});  // mass setting(keep other)
             * $$('input').$class();                // get all keys array
             *
             * @example
             * // object|array is treated like vue.js
             * $$('input').$class({name: false});
             * $$('input').$class([{name: false}, 'other']);
             */
            get $class() {
                return nodeStorage.getOrSet(this, 'classList', (node, name) => new Proxy(function $Class() {}, new class extends ProxyProperty {
                    _hasValue(property) {
                        return node.classList.contains(property);
                    }

                    _getString() {
                        return node.classList.value;
                    }

                    _getValue(property, value) {
                        return node.classList.contains(property);
                    }

                    _deleteValue(property, value) {
                        node.classList.remove(property);
                    }

                    _applyGet() {
                        return [...node.classList.values()];
                    }

                    _applySet(object) {
                        for (const [token, flag] of F.objectToEntries(F.objectToClasses(object))) {
                            node.classList.toggle(token, flag);
                        }
                    }
                }(node, name)));
            },
            /**
             * mass assign DOMTokenList(classList)
             *
             * @descriptor set
             *
             * @param {Object|Array} value
             *
             * @example
             * $$('input').$class = {name: 'flag'};                // mass assign(delete other)
             * $$('input').$class = (node, i) => ({name: 'flag'}); // mass assign by callback(delete other)
             */
            set $class(value) {
                kQuery.logger.assertInstanceOf(value, Nullable, String, Object, Array)();

                // null guard for function return (void). keep current values
                if (value == null) {
                    return;
                }

                this.classList.value = '';

                // noinspection JSValidateTypes
                this.$class(value);
            },
        },
        [[Element.name, CSSStyleRule.name, $NodeList.name, $CSSRuleList.name]]: /**
         @lends CSSStyleRule.prototype
         @lends Element.prototype*/ {
            /**
             * simple accessor to CSSStyleDeclaration(style)
             *
             * @descriptor get
             *
             * @return {Object|Function}
             *
             * @example
             * $$('input').$style.color;             // getter
             * $$('input').$style.color = 'value';   // setter
             * $$('input').$style({color: 'value'}); // mass setting(keep other)
             * $$('input').$style();                 // get all key-value object
             * $$('input').$style(true);             // get all key-value object with important
             *
             * @example
             * // $prefix means computed style
             * $$('input').$style.$;                // returns computed style
             * $$('input').$style.$color;           // returns computed style's color
             * $$('input').$style['$color::after']; // returns computed style's pseudo color
             */
            get $style() {
                return nodeStorage.getOrSet(this, 'style', (node, name) => new Proxy(function $Style() {}, new class extends ProxyProperty {
                    _hasValue(property) {
                        return !!Reflect.get(node.style, property);
                    }

                    _getString() {
                        return node.style.cssText;
                    }

                    _get$Value(property) {
                        let [name, pseudo] = property.split('::');
                        pseudo = pseudo ? `::${pseudo}` : null;

                        const cstyle = node.$window.getComputedStyle(node, pseudo);
                        if (!name.length) {
                            return cstyle;
                        }
                        return cstyle.getPropertyValue(F.stringToKebabCase(name));
                    }

                    _getValue(property, value) {
                        if (property.startsWith('--')) {
                            return node.style.getPropertyValue(F.stringToKebabCase(property));
                        }
                        return value || value === undefined ? value : null;
                    }

                    _deleteValue(property, value) {
                        node.style.removeProperty(F.stringToKebabCase(property));
                    }

                    _applyGet(priority) {
                        const result = {};
                        for (let i = 0; true; i++) {
                            const name = node.style[i];
                            if (!name) {
                                break;
                            }
                            if (priority === true) {
                                const priority = node.style.getPropertyPriority(name);
                                result[name] = node.style.getPropertyValue(name) + (priority ? `!${priority}` : '');
                            }
                            else {
                                result[name] = node.style.getPropertyValue(name);
                            }
                        }
                        return result;
                    }

                    _applySet(object) {
                        for (const [name, style] of F.objectToEntries(object)) {
                            const strstyle = '' + style;
                            const rawstyle = strstyle.replace(/!important$/, '');
                            node.style.setProperty(F.stringToKebabCase(name), rawstyle, strstyle === rawstyle ? '' : 'important');
                        }
                    }
                }(node, name)));
            },
            /**
             * mass assign CSSStyleDeclaration(style)
             *
             * @descriptor set
             *
             * @param {Object} value
             *
             * @example
             * $$('input').$style = {color: 'value'};                // mass assign(delete other)
             * $$('input').$style = (node, i) => ({color: 'value'}); // mass assign by callback(delete other)
             */
            set $style(value) {
                kQuery.logger.assertInstanceOf(value, Nullable, Object)();

                // null guard for function return (void). keep current values
                if (value == null) {
                    return;
                }

                this.style.cssText = '';

                // noinspection JSValidateTypes
                this.$style(value);
            },
        },
    };
}
