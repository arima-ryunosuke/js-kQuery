import {$NodeList, CheckBoxNodeList, Dictionary, F, Nullable} from '../API.js';

/**
 * @param {KQuery} kQuery
 *
 * @ignore
 */
export function forms(kQuery) {
    // 01234567890123456789012345678
    // 2000-01-23T12:34:56.789+09:00
    // 2000-W12-7
    const toLocalISOString = function (date, format) {
        const local = new Date(+date - date.getTimezoneOffset() * 6e4);

        if (format === 'notz') {
            return local.toISOString().slice(0, -1);
        }
        if (format === 'full') {
            const offset = date.getTimezoneOffset();
            const absOffset = Math.abs(offset);
            const offsetSign = offset > 0 ? '-' : '+';
            const offsetHour = Math.trunc(absOffset / 60);
            const offsetMinute = absOffset % 60;
            const timezone = `${offsetSign}${('' + offsetHour).padStart(2, '0')}:${('' + offsetMinute).padStart(2, '0')}`;
            return local.toISOString().slice(0, -1) + timezone;
        }
        if (format === 'week') {
            const day1 = 24 * 60 * 60 * 1000;
            const day3 = day1 * 3;
            const day7 = day1 * 7;

            const first = new Date(Math.trunc((+local + day3) / day7) * day7);
            const firstYear = first.getUTCFullYear();
            const weekNumber = Math.trunc((first - new Date(`${firstYear}-01-01T00:00:00Z`)) / day7) + 1;
            const dayNumber = (local.getUTCDay() + 6) % 7 + 1;
            return `${firstYear}-W${('' + weekNumber).padStart(2, '0')}-${dayNumber}`;
        }
    };

    return {
        [[FormData.name]]: /** @lends FormData.prototype */{
            /**
             * from Entries
             *
             * @param {Dictionary} values
             */
            $appendFromEntries(values) {
                for (const [name, value] of F.objectToArrayEntries(values)) {
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
        [[HTMLInputElement.name, $NodeList.name]]: /** @lends HTMLInputElement.prototype */{
            /**
             * get input value as date
             *
             * datetime-like's valueAsDate is UTC timezone, but this property is local timezone
             *
             * @descriptor get
             *
             * @return {Date}
             *
             * @example
             * <input id="time" type="time">
             *
             * $('#time').value = '12:34';
             * $('#time').valueAsDate;     // Thu Jan 01 1970 21:34:00 GMT+0900
             * $('#time').$valueAsDate;    // Thu Jan 01 1970 12:34:00 GMT+0900
             */
            get $valueAsDate() {
                // precdondition
                if (!this.value) {
                    return null;
                }

                // datetime-local doesn't have valueAsDate
                if (this.type === 'datetime-local') {
                    return new Date(this.value);
                }

                // other.valueAsDate is UTC
                if ('valueAsDate' in this) {
                    return new Date(this.valueAsDate.getTime() + this.valueAsDate.getTimezoneOffset() * 6e4);
                }
            },
            /**
             * set input value as date
             *
             * datetime-like's valueAsDate is UTC timezone, but this property is local timezone
             * and triming value the format(by step|value)
             *
             * @descriptor set
             *
             * @param {?Date} value
             *
             * @example
             * <input id="time0" type="time" step="">
             * <input id="time1" type="time" step="1">
             *
             * $('#time0').valueAsDate = new Date('2014-12-24T12:34:56.789');
             * $('#time1').valueAsDate = new Date('2014-12-24T12:34:56.789');
             * $('#time0').value; // '03:34:56.789'
             * $('#time1').value; // '03:34:56.789'
             *
             * $('#time0').$valueAsDate = new Date('2014-12-24T12:34:56.789');
             * $('#time1').$valueAsDate = new Date('2014-12-24T12:34:56.789');
             * $('#time0').value; // '12:34'
             * $('#time1').value; // '12:34:56'
             */
            set $valueAsDate(value) {
                // precdondition
                if (value == null) {
                    return;
                }
                if (!(value instanceof Date)) {
                    // emulate native error
                    this.valueAsDate = value;
                    return;
                }

                // datetime-local doesn't have valueAsDate
                if (this.type === 'datetime-local') {
                    const strtime = toLocalISOString(value, 'notz');
                    if (this.value !== '') {
                        this.$value = strtime.slice(0, this.value.length);
                    }
                    else if (!this.step) {
                        this.$value = strtime.slice(0, 16);
                    }
                    else if (this.step.includes('.')) {
                        this.$value = strtime.slice(0, 23);
                    }
                    else {
                        this.$value = strtime.slice(0, 19);
                    }
                    return;
                }

                // other.valueAsDate is UTC
                if (this.type === 'month') {
                    return this.$value = toLocalISOString(value, 'notz').slice(0, 7);
                }
                if (this.type === 'week') {
                    return this.$value = toLocalISOString(value, 'week').slice(0, 8);
                }
                if (this.type === 'date') {
                    return this.$value = toLocalISOString(value, 'notz').slice(0, 10);
                }
                if (this.type === 'time') {
                    const strtime = toLocalISOString(value, 'notz');
                    if (this.value !== '') {
                        this.$value = strtime.slice(11, 11 + this.value.length);
                    }
                    else if (!this.step) {
                        this.$value = strtime.slice(11, 16);
                    }
                    else if (this.step.includes('.')) {
                        this.$value = strtime.slice(11, 23);
                    }
                    else {
                        this.$value = strtime.slice(11, 19);
                    }
                }
            },
            /**
             * get input value as number
             *
             * datetime-like delegates to $valueAsDate, and other work the same as native
             *
             * @descriptor get
             *
             * @return {Number}
             */
            get $valueAsNumber() {
                // precdondition
                if (!this.value) {
                    return Number.NaN;
                }

                if (['datetime-local', 'month', 'week', 'date', 'time'].includes(this.type)) {
                    return this.$valueAsDate.getTime();
                }
                if ('valueAsNumber' in this) {
                    return this.valueAsNumber;
                }

                return Number.NaN;
            },
            /**
             * set input value as number
             *
             * datetime-like delegates to $valueAsDate, and other work the same as native
             *
             * @descriptor set
             *
             * @param {?Number} value
             */
            set $valueAsNumber(value) {
                // precdondition
                if (isNaN(value) || value == null) {
                    return;
                }

                if (['datetime-local', 'month', 'week', 'date', 'time'].includes(this.type)) {
                    return this.$valueAsDate = new Date(+value);
                }
                if ('valueAsNumber' in this) {
                    this.valueAsNumber = value;
                }
            },
        },
        [[HTMLInputElement.name, RadioNodeList.name, CheckBoxNodeList.name, $NodeList.name]]: /** @lends HTMLInputCheckableElement.prototype */{
            /**
             * get input indeterminate
             *
             * returns undefined if not checkbox and supports RadioNodeList/CheckBoxNodeList.
             *
             * - RadioNodeList
             *   - all unchecked: true
             *   - some checked: false
             * - CheckBoxNodeList
             *   - difference checked: true
             *   - all checked/unchecked: false
             *
             * @descriptor get
             *
             * @return {?Boolean}
             */
            get $indeterminate() {
                if (this instanceof RadioNodeList) {
                    return this.value === '';
                }
                if (this instanceof CheckBoxNodeList) {
                    if (this.length <= 1) {
                        return false;
                    }
                    const first = this[0].checked;
                    for (let i = 1; i < this.length; i++) {
                        if (first !== this[i].checked) {
                            return true;
                        }
                    }
                    return false;
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
                if (this instanceof CheckBoxNodeList) {
                    kQuery.logger.error(`CheckBoxNodeList's $indeterminate is readonly`);
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
                    this.$value = null;
                }
                // all true
                else if (value.every(v => v)) {
                    this.indeterminate = false;
                    this.$value = this.value;
                }
                // mixed
                else {
                    this.indeterminate = true;
                }
            },
        },
        [[HTMLInputElement.name, HTMLTextAreaElement.name, HTMLSelectElement.name, $NodeList.name]]: /** @lends HTMLInputLikeElement.prototype */{
            /**
             * get input default value
             *
             * Unify the individual implementations of input
             *
             * - simple input: defaultValue
             * - radiobox/checkbox: defaultChecked
             * - select: defaultSelected
             * - file: always null or []
             *
             * @descriptor get
             *
             * @return {null|String|Array}
             */
            get $defaultValue() {
                if (['select-one'].includes(this.type)) {
                    return Array.prototype.find.call(this.options, option => option.defaultSelected)?.value ?? null;
                }
                if (['select-multiple'].includes(this.type)) {
                    return [...this.options].filter(option => option.defaultSelected).map(option => option.value);
                }
                if (['radio', 'checkbox'].includes(this.type)) {
                    return this.defaultChecked ? this.value : null;
                }
                if (['file'].includes(this.type)) {
                    // HTML specifications is no default for file, so it always returns null to avoid unnecessary confusion
                    return this.multiple ? [] : null;
                }
                if (this.type) {
                    return this.defaultValue;
                }
            },
            /**
             * set input default value
             *
             * - simple input: defaultValue
             * - radiobox/checkbox: defaultChecked
             * - select: defaultSelected
             * - file: do nothing
             *
             * @descriptor set
             */
            set $defaultValue(value) {
                if (['select-one'].includes(this.type)) {
                    value = '' + value;
                    for (const option of this.options) {
                        option.defaultSelected = option.value === value;
                    }
                }
                else if (['select-multiple'].includes(this.type)) {
                    const values = (value instanceof Array ? value : [value]).map(v => '' + v);
                    for (const option of this.options) {
                        option.defaultSelected = values.includes(option.value);
                    }
                }
                else if (['radio', 'checkbox'].includes(this.type)) {
                    this.defaultChecked = this.value === value;
                }
                else if (['file'].includes(this.type)) {
                    // do nothing
                }
                else if (this.type) {
                    this.defaultValue = value;
                }
            },
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
             * this trigger $change event
             *
             * @descriptor set
             */
            set $value(value) {
                let changed = false;

                if (['select-one'].includes(this.type)) {
                    if (this.value !== value) {
                        this.value = value;
                        changed = true;
                    }
                }
                else if (['select-multiple'].includes(this.type)) {
                    const values = (value instanceof Array ? value : [value]).filter(v => v !== null).map(v => '' + v);
                    for (const option of this.options) {
                        const selected = values.includes(option.value);
                        if (option.selected !== selected) {
                            option.selected = selected;
                            changed = true;
                        }
                    }
                }
                else if (['radio', 'checkbox'].includes(this.type)) {
                    const checked = this.value === value;
                    if (this.checked !== checked) {
                        this.checked = checked;
                        changed = true;
                    }
                }
                else if (['file'].includes(this.type)) {
                    const files = Array.from(this.files, (f) => f.name).join('/');
                    if (value instanceof File) {
                        if (value.name !== files) {
                            const dataTransfer = new DataTransfer();
                            dataTransfer.items.add(value);
                            this.files = dataTransfer.files;
                            changed = true;
                        }
                    }
                    else if (value instanceof FileList) {
                        if (Array.from(value, (f) => f.name).join('/') !== files) {
                            this.files = value;
                            changed = true;
                        }
                    }
                }
                else if (this.type) {
                    if (this.value !== value) {
                        this.value = value;
                        changed = true;
                    }
                }

                if (changed) {
                    this.dispatchEvent(new Event('$change', {
                        bubbles: true,
                    }));
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
                    this.$value = null;
                }
                else if (['radio', 'checkbox'].includes(this.type)) {
                    this.$value = null;
                }
                else if (['file'].includes(this.type)) {
                    this.$value = new DataTransfer().files;
                }
                else if (this.type) {
                    this.$value = '';
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
            /**
             * get selected text
             *
             * - select-one: first selected option text
             * - select-multiple: selected options texts
             * - textable input/textarea: selected range text
             * - other: undefined
             *
             * @descriptor get
             *
             * @return {Nullable|String|String[]}
             */
            get $selectedText() {
                if ('select-one' === this.type) {
                    return this.selectedOptions[0]?.label ?? null;
                }
                else if ('select-multiple' === this.type) {
                    return Array.from(this.selectedOptions).map(option => option.label);
                }
                else if (this.selectionDirection) {
                    return this.value.substring(this.selectionStart, this.selectionEnd);
                }

                return undefined;
            },
            /**
             * set selected text
             *
             * - select: set value by matched option text
             * - textable input/textarea: set range text
             * - other: undefined
             *
             * @descriptor set
             */
            set $selectedText(value) {
                if ('select-one' === this.type) {
                    this.$value = Array.prototype.find.call(this.options, option => option.label === value)?.value ?? null;
                }
                else if ('select-multiple' === this.type) {
                    const values = (value instanceof Array ? value : [value]).filter(v => v !== null).map(v => '' + v);
                    this.$value = Array.prototype.filter.call(this.options, option => values.includes(option.label)).map(option => option.value);
                }
                else if (this.selectionDirection) {
                    if (value !== this.$selectedText) {
                        this.setRangeText(value, this.selectionStart, this.selectionEnd, 'select');
                        this.dispatchEvent(new Event('$change', {
                            bubbles: true,
                        }));
                    }
                }
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
             * @param {HTMLOptionElement[]|HTMLOptGroupElement[]|Dictionary} options
             * @param {Boolean|String} [preserveValue]
             * @return {this}
             *
             * @example
             * // object mode
             * $('select').$options({
             *     a1: 'A1',
             *     a2: {label: 'A1', 'data-custom': 'custom'},
             *     b1: {label: 'B1', optgroup: 'optgroup'},
             *     b2: {label: 'B2', optgroup: 'optgroup'},
             *     c1: document.$createElement('option', {label: 'C1'}),
             * });
             * // array mode
             * $('select').$options([
             *     'a1',
             *     {value: 'a1', label: 'A1', 'data-custom': 'custom'},
             *     {value: 'b1', label: 'B1', optgroup: 'optgroup'},
             *     {value: 'b2', label: 'B2', optgroup: 'optgroup'},
             *     document.$createElement('option', {value: 'c1', label: 'C1'}),
             * ]);
             */
            $options(options, preserveValue = undefined) {
                kQuery.logger.assertInstanceOf(options, Dictionary, Array)();
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
                    const optgroups = {};
                    const options = [];
                    for (let [value, label] of F.objectToEntries(data)) {
                        if (label instanceof Array) {
                            options.push(this.$document.$createElement('optgroup', {label: value}, ...build(label)));
                        }
                        else if (label instanceof Node) {
                            label.value ||= value;
                            options.push(label);
                        }
                        else if (F.objectIsPlain(label)) {
                            label = {...label};
                            label.value ??= value;
                            label.title ??= label.label;
                            if (label.optgroup) {
                                const optgroup = label.optgroup;
                                delete label.optgroup;
                                if (!optgroups[optgroup]) {
                                    optgroups[optgroup] = this.$document.$createElement('optgroup', {label: optgroup});
                                    options.push(optgroups[optgroup]);
                                }
                                optgroups[optgroup].append(this.$document.$createElement('option', label, label.label));
                            }
                            else {
                                options.push(this.$document.$createElement('option', label, label.label));
                            }
                        }
                        else {
                            options.push(this.$document.$createElement('option', {value: value, title: label}, label));
                        }
                    }
                    return options;
                };
                options = build(options);

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
        [[HTMLSelectElement.name, $NodeList.name]]: /** @lends HTMLSelectElement.prototype */{
            /**
             * get selected option
             *
             * return plain object that selected option's {value: label}
             *
             * @descriptor get
             *
             * @return {Object}
             */
            get $selectedOptions() {
                return Array.from(this.selectedOptions).reduce((object, option) => {
                    object[option.value] = option.label;
                    return object;
                }, Object.create(null));
            },
        },
        [[HTMLFormElement.name, $NodeList.name]]: /** @lends HTMLFormElement.prototype */{
            /**
             * get all input/select/textarea elements
             *
             * - radio is RadioNodeList
             * - checkbox is CheckBoxNodeList
             *
             * @return {NodeList}
             */
            get $inputs() {
                // necessary keep dom order

                const checkboxNodes = {};
                this.querySelectorAll('input[type="checkbox"][multiple]').forEach(e => {
                    checkboxNodes[e.name] ??= [];
                    checkboxNodes[e.name].push(e);
                });

                const appended = {};
                const inputs = Array.from(this.querySelectorAll('input,select,textarea')).flatMap(input => {
                    // no contain noname
                    if (input.name.length === 0) {
                        return [];
                    }

                    if (input.type === 'radio') {
                        if (appended[input.name]) {
                            return [];
                        }
                        appended[input.name] = true;
                        return [this.elements[input.name]];
                    }

                    if (input.type === 'checkbox' && checkboxNodes[input.name]) {
                        if (appended[input.name]) {
                            return [];
                        }
                        appended[input.name] = true;
                        return [F.iterableToNodeList(checkboxNodes[input.name], CheckBoxNodeList)];
                    }

                    return [input];
                });

                return F.iterableToNodeList(inputs);
            },
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
