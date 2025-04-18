import {$NodeList, F, Nullable} from '../API.js';

/**
 * @param {KQuery} kQuery
 *
 * @ignore
 */
export function forms(kQuery) {
    return {
        [[FormData.name]]: /** @lends FormData.prototype */{
            /**
             * from Entries
             *
             * @param {Object} values
             */
            $appendFromEntries(values) {
                for (const [name, value] of F.objectToEntries(values)) {
                    this.append(name, value);
                }
                return this;
            },
            /**
             * to SearchParam(unset File entry)
             *
             * @return {URLSearchParams}
             */
            $toSearchParams() {
                const result = new URLSearchParams(this);
                for (const [name, value] of F.objectToEntries(this)) {
                    if (value instanceof Blob) {
                        kQuery.logger.info(`Unset ${name} because file`);
                        // browser behavior seems to be empty text, not deleted
                        // result.delete(name);
                        result.set(name, '');
                    }
                }
                return result;
            },
            /**
             * to Object
             *
             * @return {Object}
             */
            $toObject() {
                const indexes = {};
                const entries = F.objectToEntries(this).map(([name, value]) => {
                    let names = name.split(/\]\[|\[|\]/);
                    if (names.length > 1) {
                        names.pop();
                    }

                    const parents = [];
                    for (const [i, subname] of names.entries()) {
                        if (!subname.length) {
                            const key = parents.join('[@]');
                            indexes[key] ??= 0;
                            names[i] = indexes[key]++;
                        }
                        parents.push(subname);
                    }

                    return [names, value];
                });

                return F.entriesToObject(entries, false);
            },
            /**
             * to JSON
             *
             * @param {String|Function} [fileConverter='base64']
             * @return {Promise<String>}
             */
            async $json(fileConverter = 'base64') {
                const object = await F.objectWalkRecursive(this.$toObject(), async function (value) {
                    if (value instanceof Blob) {
                        value = (function () {
                            if (fileConverter === 'text') {
                                return value.$text();
                            }
                            if (fileConverter === 'base64') {
                                return value.$base64();
                            }
                            if (typeof (fileConverter) === 'function') {
                                return fileConverter(value);
                            }
                            throw new Error(`Unknown convert(${fileConverter})`);
                        })();
                    }
                    return value;
                });
                return JSON.stringify(object);
            },
        },
        [[HTMLInputElement.name, RadioNodeList.name, $NodeList.name]]: /** @lends HTMLInputCheckableElement.prototype */{
            /**
             * get input indeterminate
             *
             * returns undefined if not checkbox and supports RadioNodeList.
             *
             * @descriptor get
             *
             * @return {?Boolean}
             */
            get $indeterminate() {
                if (this instanceof RadioNodeList) {
                    return this.value === '';
                }
                if (this.type !== 'checkbox') {
                    return undefined;
                }
                return this.indeterminate;
            },
            /**
             * set input indeterminate
             *
             * accepts Array of Boolean
             * - empty(e.g.[null, undefined])
             *   - indeterminate=false
             *   - checked no touch
             * - all false(e.g.[false, ..., false])
             *   - indeterminate=false
             *   - checked=false
             * - all true(e.g.[true, ..., true])
             *   - indeterminate=false
             *   - checked=true
             * - mixed(e.g.[true, false, true])
             *   - indeterminate=true
             *   - checked no touch
             *
             * @descriptor set
             *
             * @param {Boolean|Boolean[]} value
             */
            set $indeterminate(value) {
                kQuery.logger.assertInstanceOf(value, Boolean, Array)();

                if (this instanceof RadioNodeList) {
                    if (!value) {
                        kQuery.logger.error(`RadioNodeList's $indeterminate is readonly`);
                    }
                    this.forEach(e => e.checked = false);
                    return;
                }

                if (this.type !== 'checkbox') {
                    return;
                }
                if (!(value instanceof Array)) {
                    this.indeterminate = value;
                    return;
                }

                value = value.filter(v => v != null);
                // empty
                if (value.length === 0) {
                    this.indeterminate = false;
                }
                // all false
                else if (value.every(v => !v)) {
                    this.indeterminate = false;
                    this.checked = false;
                }
                // all true
                else if (value.every(v => v)) {
                    this.indeterminate = false;
                    this.checked = true;
                }
                // mixed
                else {
                    this.indeterminate = true;
                }
            },
        },
        [[HTMLInputElement.name, HTMLTextAreaElement.name, HTMLSelectElement.name, $NodeList.name]]: /** @lends HTMLInputLikeElement.prototype */{
            /**
             * get input value
             *
             * - simple input: String
             * - radiobox: checked String or null
             * - checkbox: checked String or null
             * - select(single): selected String or null
             * - select(multiple): selected Array always
             * - file(single): File or null
             * - file(multiple): FileList always
             *
             * @descriptor get
             *
             * @return {null|String|Array|File|FileList}
             */
            get $value() {
                if (['select-one'].includes(this.type)) {
                    // https://developer.mozilla.org/docs/Web/API/HTMLSelectElement/value
                    // A string containing the value of the first selected <option> element in this <select> element,
                    // or the empty string if no options are selected.
                    return Array.prototype.find.call(this.options, option => option.selected)?.value ?? null;
                }
                if (['select-multiple'].includes(this.type)) {
                    return [...this.options].filter(option => option.selected).map(option => option.value);
                }
                if (['radio', 'checkbox'].includes(this.type)) {
                    return this.checked ? this.value : null;
                }
                if (['file'].includes(this.type)) {
                    return this.multiple ? this.files : this.files[0] ?? null;
                }
                if (this.type) {
                    return this.value;
                }
            },
            /**
             * set input value
             *
             * - simple input: must be String
             * - radiobox: must be String
             * - checkbox: must be String
             * - select(single): must be String
             * - select(multiple): must be Array
             * - file(single): must be File|FileList
             * - file(multiple): must be FileList
             *
             * @descriptor set
             */
            set $value(value) {
                if (['select-one'].includes(this.type)) {
                    this.value = value;
                }
                else if (['select-multiple'].includes(this.type)) {
                    const values = (value instanceof Array ? value : [value]).map(v => '' + v);
                    for (const option of this.options) {
                        option.selected = values.includes(option.value);
                    }
                }
                else if (['radio', 'checkbox'].includes(this.type)) {
                    this.checked = this.value === value;
                }
                else if (['file'].includes(this.type)) {
                    if (value instanceof File) {
                        const dataTransfer = new DataTransfer();
                        dataTransfer.items.add(value);
                        this.files = dataTransfer.files;
                    }
                    else if (value instanceof FileList) {
                        this.files = value;
                    }
                }
                else if (this.type) {
                    this.value = value;
                }
            },
            /**
             * clear input value
             *
             * clear doesn't mean reset. all input set blank, uncheck, unselect, empty file
             *
             * @return {this}
             */
            $clear() {
                if (['select-one', 'select-multiple'].includes(this.type)) {
                    this.value = null;
                }
                else if (['radio', 'checkbox'].includes(this.type)) {
                    this.checked = false;
                }
                else if (['file'].includes(this.type)) {
                    this.files = new DataTransfer().files;
                }
                else if (this.type) {
                    this.value = '';
                }

                return this;
            },
            /**
             * writeback value to attribute
             *
             * @return {this}
             */
            $resetAttribute() {
                if (['select-one', 'select-multiple'].includes(this.type)) {
                    Array.from(this.options).forEach(option => option.toggleAttribute('selected', option.selected));
                }
                else if (this.type === 'textarea') {
                    this.textContent = this.value;
                }
                else if (['radio', 'checkbox'].includes(this.type)) {
                    this.toggleAttribute('checked', this.checked);
                }
                else {
                    this.setAttribute('value', this.value);
                }

                return this;
            },
        },
        [[HTMLSelectElement.name, HTMLDataListElement.name, $NodeList.name]]: /** @lends HTMLOptionableElement.prototype */{
            /**
             * set option elements
             *
             * preserveValue
             * - false: fully replace all options, selection state is lost
             * - true: fully replace all options, selection state is kept
             * - String: keep selected options and insertion method
             *
             * @param {HTMLOptionElement[]|HTMLOptGroupElement[]|Object} options
             * @param {Boolean|String} [preserveValue]
             * @return {this}
             */
            $options(options, preserveValue = undefined) {
                preserveValue ??= this instanceof HTMLSelectElement ? 'append' : null;
                kQuery.logger.assertInstanceOf(preserveValue, Nullable, Boolean, String)();

                // browser behaves scroll when scrolling is enabled
                // - scroll to the last element
                // - but not every time, sometimes it scrolls to selected element
                this.$willChange('scroll-position');
                const scroll = {
                    top: this.scrollTop,
                    left: this.scrollLeft,
                };
                const recover = () => {
                    this.scrollTop = scroll.top;
                    this.scrollLeft = scroll.left;
                };

                const build = (data) => {
                    const options = [];
                    for (const [value, label] of F.objectToEntries(data)) {
                        if (label instanceof Array) {
                            options.push(this.$document.$createElement('optgroup', {label: value}, ...label));
                        }
                        else if (F.objectIsPlain(label)) {
                            options.push(this.$document.$createElement('optgroup', {label: value}, ...build(label)));
                        }
                        else {
                            options.push(this.$document.$createElement('option', {value: value, title: label}, label));
                        }
                    }
                    return options;
                };
                if (F.objectIsPlain(options)) {
                    options = build(options);
                }

                const $value = preserveValue ? this.$value : null;

                if (preserveValue && typeof (preserveValue) === 'string') {
                    const $values = ($value instanceof Array ? $value : [$value]).filter(v => v != null).map(v => '' + v);

                    // remove not preserve
                    this.$$('option').$except(o => $values.includes(o.value)).forEach(e => e.remove());
                    this.$$('optgroup').$except(o => o.$contains('option')).forEach(e => e.remove());
                    this.$$('hr.kQuery-option-separator').forEach(e => e.remove());

                    // merge optgroup
                    for (const optgroup of this.$$('optgroup')) {
                        const nexts = optgroup.$nextElements(`optgroup[label="${F.stringEscape(optgroup.label ?? '', 'selector')}"]`);
                        for (const next of [...nexts]) {
                            optgroup[preserveValue](...next.$$('option'));
                            if (!next.$contains('option')) {
                                next.remove();
                            }
                        }
                    }

                    // insert new options
                    this[preserveValue](this.$document.$createElement('hr', {class: 'kQuery-option-separator'}));
                    this[preserveValue](...options);

                    // remove current option from new options
                    const filter = function (options) {
                        return options.filter(o => {
                            if (o instanceof HTMLOptionElement && $values.includes(o.value)) {
                                o.remove();
                                return false;
                            }
                            if (o instanceof HTMLOptGroupElement) {
                                if (!filter([...o.$$('option')]).length) {
                                    o.remove();
                                    return false;
                                }
                            }
                            return true;
                        });
                    };
                    filter(options);
                }
                else {
                    this.$replaceChildren(...options);
                }

                if (preserveValue) {
                    this.$value = $value;
                }

                // first animation frame: browser scrolls to selected option
                // second animation frame: recover scroll position
                requestAnimationFrame(() => requestAnimationFrame(recover));

                return this;
            },
        },
        [[HTMLFormElement.name, $NodeList.name]]: /** @lends HTMLFormElement.prototype */{
            /**
             * writeback value to attribute
             *
             * @return {this}
             */
            $resetAttribute() {
                this.elements.$resetAttribute();
                return this;
            },
        },
    };
}
