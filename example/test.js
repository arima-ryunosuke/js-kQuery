import * as API from '../src/API.js';

document.addEventListener('DOMContentLoaded', function () {
    const searchParams = new URLSearchParams(location.search);
    if (!searchParams.has('test') && !searchParams.has('bench')) {
        return;
    }

    const testTarget = searchParams.get('test');
    const benchTarget = searchParams.get('bench');
    document.body.dataset.testing = testTarget;
    document.body.dataset.benching = benchTarget;

    // for static
    new API.Configuration({debug: true});
    new API.Logger(true, 7, 'test', console);

    /** @type {KQuery} */
    const kQuery = window.kQuery;
    const sleep = (msec) => new Promise(resolve => setTimeout(resolve, msec));

    kQuery.config.configure({
        debug: false,
        loglevel: 0,
    }, true);

    const benchmark = async function (suite, during) {
        during ??= 1000;

        const results = [];
        for (const [name, func] of Object.entries(suite)) {
            const asynced = func instanceof API.AsyncFunction;

            // warmup
            const returnValue = asynced ? await func() : func();

            const until = performance.now() + during;
            let count = 0;
            for (count = 0; performance.now() < until; count++) {
                asynced ? await func() : func();
            }

            results.push({
                name: func.name ?? name,
                count: count,
                rate: null,
                onecall: null,
                return: returnValue,
            });
        }

        const maxCount = Math.max(...results.map(result => result.count));
        for (const value of results) {
            value.rate = maxCount / value.count;
            value.onecall = during / value.count;
        }

        const objects = {};
        for (const result of results.toSorted((a, b) => b.count - a.count)) {
            objects[result.name] = result;
            delete result.name;
        }

        console.table(objects);
    };

    (async function () {
        if (['all', 'object'].includes(benchTarget)) {
            await benchmark([
                function ObjectDirectAssign() {
                    const result = {};
                    result.a = 1;
                    result.b = 2;
                    result.c = 3;
                    result.d = 4;
                    result.e = 5;
                    result.f = 6;
                    result.g = 7;
                    result.h = 8;
                    result.i = 9;
                    return result.i;
                },
                function ObjectAssign() {
                    const result = Object.assign({}, {
                        a: 1,
                        b: 2,
                        c: 3,
                        d: 4,
                        e: 5,
                        f: 6,
                        g: 7,
                        h: 8,
                        i: 9,
                    });
                    return result.i;
                },
                function ObjectDefinePropertyValue() {
                    const result = Object.defineProperties({}, {
                        a: {value: 1},
                        b: {value: 2},
                        c: {value: 3},
                        d: {value: 4},
                        e: {value: 5},
                        f: {value: 6},
                        g: {value: 7},
                        h: {value: 8},
                        i: {value: 9},
                    });
                    return result.i;
                },
                function ObjectDefinePropertyGetter() {
                    const result = Object.defineProperties({}, {
                        a: {get() {return 1;}},
                        b: {get() {return 2;}},
                        c: {get() {return 3;}},
                        d: {get() {return 4;}},
                        e: {get() {return 5;}},
                        f: {get() {return 6;}},
                        g: {get() {return 7;}},
                        h: {get() {return 8;}},
                        i: {get() {return 9;}},
                    });
                    return result.i;
                },
            ]);
        }

        if (['all', 'prototype'].includes(benchTarget)) {
            for (const i of new Array(100)) {
                document.body.append(document.createElement('input'));
            }
            const inputs = document.body.$childElements('input');
            await benchmark([
                function ObjectSetPrototypeOf() {
                    const array = [...inputs];
                    return Object.setPrototypeOf(array, NodeList.prototype);
                },
                function ObjectCreateArray() {
                    const array = [...inputs];
                    return Object.create(NodeList.prototype, Object.getOwnPropertyDescriptors(array));
                },
                function ObjectCreateForOf() {
                    let i = 0;
                    const properties = {};
                    for (const property of inputs) {
                        properties[i++] = {
                            value: property,
                            configurable: false,
                            writable: false,
                            enumerable: true,
                        };
                    }
                    properties.length = {
                        value: i,
                        configurable: false,
                        writable: false,
                        enumerable: false,
                    };
                    return Object.create(NodeList.prototype, properties);
                },
            ]);
            await benchmark([
                function ArraySpreadFilter() {
                    return [...inputs].filter((input, i) => i === 99);
                },
                function ArrayPrototypeFilter() {
                    return Array.prototype.filter.call(inputs, (input, i) => i === 99);
                },
            ]);
            await benchmark([
                function ArraySpreadFind() {
                    return [...inputs].find((input, i) => i === 0);
                },
                function ArrayPrototypeFind() {
                    return Array.prototype.find.call(inputs, (input, i) => i === 0);
                },
            ]);
            await benchmark([
                function ArraySpreadSlice() {
                    return [...inputs].slice(80, 90);
                },
                function ArrayPrototypeSlice() {
                    return Array.prototype.slice.call(inputs, 80, 90);
                },
            ]);
        }

        if (['all', 'blob'].includes(benchTarget)) {
            const blob = new Blob(['abc'.repeat(256)], {type: 'text/plain'});
            await benchmark([
                async function FileReaderReadAsText() {
                    const reader = new FileReader();
                    reader.readAsText(blob);
                    return new Promise((resolve, reject) => {
                        reader.addEventListener('load', e => resolve(e.target.result));
                        reader.addEventListener('error', e => reject(e.target.error));
                    });
                },
                async function BlobText() {
                    return blob.text();
                },
                async function Decoder() {
                    const textDecoder = new TextDecoder();
                    return textDecoder.decode(await blob.arrayBuffer());
                },
            ]);
            await benchmark([
                async function RenewFile() {
                    return new File([blob], 'hoge', {type: blob.type});
                },
                async function SetPrototype() {
                    const file = Object.setPrototypeOf(blob.slice(), File.prototype);

                    Object.defineProperty(file, 'name', {
                        value: 'hoge',
                        writable: false,
                        configurable: true,
                        enumerable: true,
                    });

                    return file;
                },
            ]);
        }

        if (['all', 'property'].includes(benchTarget)) {
            for (const i of new Array(100)) {
                document.body.append(document.createElement('input'));
            }
            const inputs = document.body.$childElements('input');
            await benchmark([
                function SetDisabledSingle() {
                    for (const input of inputs) {
                        input.disabled = true;
                    }
                    return [...inputs].map(i => i.disabled);
                },
                function SetDisabledMultiple() {
                    inputs.disabled = true;
                    return inputs.disabled;
                },
            ]);
        }
    })();

    jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
    if (['all', 'unit'].includes(testTarget)) {
        describe('unittest', function () {
            describe('API', function () {
                it('Logger', async function () {
                    expect(API.Logger.anyIsInstanceOf(null, null)).toEqual(true);
                    expect(API.Logger.anyIsInstanceOf(undefined, undefined)).toEqual(true);

                    expect(API.Logger.anyIsInstanceOf(true, Boolean)).toEqual(true);
                    expect(API.Logger.anyIsInstanceOf(false, Boolean)).toEqual(true);
                    expect(API.Logger.anyIsInstanceOf(1, Boolean)).toEqual(true);
                    expect(API.Logger.anyIsInstanceOf({}, Boolean)).toEqual(false);
                    expect(API.Logger.anyIsInstanceOf([], Boolean)).toEqual(false);

                    expect(API.Logger.anyIsInstanceOf(123, Number)).toEqual(true);
                    expect(API.Logger.anyIsInstanceOf(Number(123), Number)).toEqual(true);
                    expect(API.Logger.anyIsInstanceOf('123', Number)).toEqual(true);
                    expect(API.Logger.anyIsInstanceOf('hoge', Number)).toEqual(false);

                    expect(API.Logger.anyIsInstanceOf('hoge', String)).toEqual(true);
                    expect(API.Logger.anyIsInstanceOf(String('hoge'), String)).toEqual(true);
                    expect(API.Logger.anyIsInstanceOf(123, String)).toEqual(true);
                    expect(API.Logger.anyIsInstanceOf({}, String)).toEqual(false);

                    expect(API.Logger.anyIsInstanceOf(new Date(), Date)).toEqual(true);
                    expect(API.Logger.anyIsInstanceOf(new Date(), Function)).toEqual(false);

                    expect(API.Logger.anyIsInstanceOf(() => {}, Function)).toEqual(true);
                    expect(API.Logger.anyIsInstanceOf(async () => {}, Function)).toEqual(true);

                    expect(API.Logger.anyIsInstanceOf([], Array)).toEqual(true);
                    expect(API.Logger.anyIsInstanceOf({}, Object)).toEqual(true);

                    expect(API.Logger.anyIsInstanceOf([], Object)).toEqual(false);
                    expect(API.Logger.anyIsInstanceOf(String('hoge'), Object)).toEqual(false);
                });
                it('F.anyIsPrimitive', async function () {
                    expect(API.F.anyIsPrimitive(undefined)).toEqual(true);
                    expect(API.F.anyIsPrimitive(null)).toEqual(true);
                    expect(API.F.anyIsPrimitive(true)).toEqual(true);
                    expect(API.F.anyIsPrimitive(1234)).toEqual(true);
                    expect(API.F.anyIsPrimitive('st')).toEqual(true);

                    expect(API.F.anyIsPrimitive([])).toEqual(false);
                    expect(API.F.anyIsPrimitive({})).toEqual(false);
                    expect(API.F.anyIsPrimitive(new Date())).toEqual(false);
                    expect(API.F.anyIsPrimitive(new String(''))).toEqual(false);

                    expect(API.F.anyIsPrimitive([], Array)).toEqual(true);
                    expect(API.F.anyIsPrimitive({}, Object)).toEqual(true);
                    expect(API.F.anyIsPrimitive(new Date(), Object)).toEqual(false);
                    expect(API.F.anyIsPrimitive(new String(''), Object)).toEqual(false);
                });
                it('F.anyIsStringable', async function () {
                    expect(API.F.anyIsStringable(undefined)).toEqual(true);
                    expect(API.F.anyIsStringable(null)).toEqual(true);
                    expect(API.F.anyIsStringable(true)).toEqual(true);
                    expect(API.F.anyIsStringable(1234)).toEqual(true);
                    expect(API.F.anyIsStringable('st')).toEqual(true);

                    expect(API.F.anyIsStringable([])).toEqual(true);
                    expect(API.F.anyIsStringable({})).toEqual(false);
                    expect(API.F.anyIsStringable(new Date())).toEqual(true);
                    expect(API.F.anyIsStringable(new URL('/', 'http://example.com'))).toEqual(true);
                    expect(API.F.anyIsStringable(new String(''))).toEqual(true);
                });
                it('F.stringToKebabCase', async function () {
                    expect(API.F.stringToKebabCase(`hogeFugaPiyo`)).toEqual(`hoge-fuga-piyo`);
                    expect(API.F.stringToKebabCase(`ABC`)).toEqual(`-a-b-c`);
                });
                it('F.stringToPascalCase', async function () {
                    expect(API.F.stringToPascalCase(`hoge-fuga-piyo`, '-')).toEqual(`hogeFugaPiyo`);
                    expect(API.F.stringToPascalCase(`_a_b_c`, '_')).toEqual(`ABC`);
                });
                it('F.stringEscape', async function () {
                    expect(API.F.stringEscape(`abcXYZ`, 'attr-name')).toEqual(`abcxyz`);
                    expect(API.F.stringEscape(`"<&>'`, 'attr-value')).toEqual(`&quot;<&amp;>'`);
                    expect(API.F.stringEscape(`"<&>'`, 'content')).toEqual(`"&lt;&amp;&gt;'`);
                    expect(API.F.stringEscape(`"<&>'`, 'html')).toEqual(`&quot;&lt;&amp;&gt;&#39;`);
                    expect(API.F.stringEscape(`/-^$*+?.()|[]{}`, 'regex')).toEqual(`\\/\\-\\^\\$\\*\\+\\?\\.\\(\\)\\|\\[\\]\\{\\}`);
                    expect(API.F.stringEscape(`"[<&>]'`, 'css')).toEqual(`\\"\\[\\<\\&\\>\\]\\'`);

                    const regexp = API.F.stringEscape(`/-^$*+?.()|[]{}`, 'regex');
                    expect((new RegExp(regexp)).test(`/-^$*+?.()|[]{}`)).toEqual(true);

                    expect(() => API.F.stringEscape(`abc XYZ`, 'attr-name')).toThrow();
                    expect(() => API.F.stringEscape(`hoge`, 'unknown')).toThrow();
                });
                it('F.stringQuote', async function () {
                    expect(API.F.stringQuote(`abcXYZ`, 'css-url')).toEqual(`"abcXYZ"`);
                    expect(API.F.stringQuote(`abc'XYZ`, 'css-url')).toEqual(`"abc'XYZ"`);
                    expect(API.F.stringQuote(`abc"XYZ`, 'css-url')).toEqual(`'abc"XYZ'`);
                    expect(API.F.stringQuote(`abc "'()XYZ`, 'css-url')).toEqual(`abc\\ \\"\\'\\(\\)XYZ`);
                });
                it('F.stringUnquote', async function () {
                    expect(API.F.stringUnquote(`"abc'XYZ"`, 'css-url')).toEqual(`abc'XYZ`);
                    expect(API.F.stringUnquote(`'abc"\'XYZ'`, 'css-url')).toEqual(`abc"'XYZ`);
                    expect(API.F.stringUnquote(`abc\"\'XYZ`, 'css-url')).toEqual(`abc"'XYZ`);
                    expect(API.F.stringUnquote(`abc\\ \\"\\'\\(\\)XYZ`, 'css-url')).toEqual(`abc "'()XYZ`);
                });
                it('F.stringIsNaN', async function () {
                    expect(API.F.stringIsNaN(null)).toEqual(true);
                    expect(API.F.stringIsNaN('abc')).toEqual(true);

                    expect(API.F.stringIsNaN('123')).toEqual(false);
                    expect(API.F.stringIsNaN('123.456')).toEqual(false);
                    expect(API.F.stringIsNaN('123abc')).toEqual(false);
                    expect(API.F.stringIsNaN(123)).toEqual(false);
                    expect(API.F.stringIsNaN(123.456)).toEqual(false);
                });
                it('F.stringRender', async function () {
                    expect(API.F.stringRender('${this.hoge}, ${this.fuga}, ${this.piyo ?? "default"}', {
                        hoge: 'hoge',
                        fuga: 'fuga',
                    })).toEqual('hoge, fuga, default');
                    expect(API.F.stringRender('${this.hoge}, ${new String(this.fuga)}, ${this.piyo ?? "default"}', {
                        hoge: 'hoge',
                        fuga: 'fuga',
                    }, (v) => v.toUpperCase())).toEqual('HOGE, fuga, DEFAULT');
                });
                it('F.objectId', async function () {
                    const sample = API.F.objectId({});
                    const obj1 = {};
                    const obj2 = {};
                    expect(API.F.objectId(obj1)).toEqual(sample + 1);
                    expect(API.F.objectId(obj1)).toEqual(sample + 1);
                    expect(API.F.objectId(obj2)).toEqual(sample + 2);
                    expect(API.F.objectId(123)).toEqual(null);
                    expect(API.F.objectId(null)).toEqual(null);
                    expect(API.F.objectId(undefined)).toEqual(null);
                });
                it('F.objectIsPlain', async function () {
                    expect(API.F.objectIsPlain(undefined)).toEqual(false);
                    expect(API.F.objectIsPlain(null)).toEqual(false);
                    expect(API.F.objectIsPlain(123)).toEqual(false);
                    expect(API.F.objectIsPlain('hoge')).toEqual(false);
                    expect(API.F.objectIsPlain([])).toEqual(false);
                    expect(API.F.objectIsPlain(new Date())).toEqual(false);

                    expect(API.F.objectIsPlain({})).toEqual(true);
                    expect(API.F.objectIsPlain(Object.create(null))).toEqual(true);
                });
                it('F.objectIsArrayLike', async function () {
                    expect(API.F.objectIsArrayLike(undefined)).toEqual(false);
                    expect(API.F.objectIsArrayLike(null)).toEqual(false);
                    expect(API.F.objectIsArrayLike(123)).toEqual(false);
                    expect(API.F.objectIsArrayLike('hoge')).toEqual(false);
                    expect(API.F.objectIsArrayLike({})).toEqual(false);
                    expect(API.F.objectIsArrayLike(Object.create(null))).toEqual(false);
                    expect(API.F.objectIsArrayLike(new Date())).toEqual(false);

                    expect(API.F.objectIsArrayLike(document.$$('not-found'))).toEqual(true);
                    expect(API.F.objectIsArrayLike(document.$$('*'))).toEqual(true);
                    expect(API.F.objectIsArrayLike(new String(''))).toEqual(true);
                    expect(API.F.objectIsArrayLike(new String('abc'))).toEqual(true);
                    expect(API.F.objectIsArrayLike({length: 0})).toEqual(true);
                    expect(API.F.objectIsArrayLike([])).toEqual(true);

                    expect(API.F.objectIsArrayLike({0: 'A', 1: 'B'}, false)).toEqual(true);
                    expect(API.F.objectIsArrayLike({0: 'A', 1: 'B', length: 2})).toEqual(true);
                    expect(API.F.objectIsArrayLike({0: 'A', 1: 'B', length: 1})).toEqual(false);
                    expect(API.F.objectIsArrayLike({0: 'A', 1: 'B', length: 3})).toEqual(false);
                    expect(API.F.objectIsArrayLike({0: 'A', 2: 'C', length: 2})).toEqual(false);
                });
                it('F.objectToEntries', async function () {
                    const indexValues = [
                        [0, 'A'],
                        [1, 'B'],
                        [2, 'C'],
                    ];
                    const keyValues = [
                        ['a', 'A'],
                        ['b', 'B'],
                        ['c', 'C'],
                    ];

                    const array = indexValues.map(([i, v]) => v);
                    expect(API.F.objectToEntries(array)).toEqual(indexValues);

                    const plain = Object.fromEntries(keyValues);
                    Object.defineProperties(plain, {
                        entries: {value: () => [], enumerable: false},
                        length: {value: 0, enumerable: false},
                    });
                    expect(API.F.objectToEntries(plain)).toEqual(keyValues);

                    const map = new Map(keyValues);
                    expect(API.F.objectToEntries(map)).toEqual(keyValues);

                    const weakmap = new API.WeakMap();
                    keyValues.forEach(([k, v]) => weakmap.set(new String(k), v));
                    expect(API.F.objectToEntries(map)).toEqual(keyValues);

                    const formdata = new FormData();
                    keyValues.forEach(([k, v]) => formdata.set(k, v));
                    expect(API.F.objectToEntries(map)).toEqual(keyValues);

                    const transfer = new DataTransfer();
                    keyValues.forEach(([k, v]) => transfer.items.add(new File([v], {type: 'text/plain'})));
                    //expect(API.F.objectToEntries(transfer.item)).toEqual(keyValues);
                    expect(await Promise.all(API.F.objectToEntries(transfer.files).map(async ([i, file]) => [i, await file.text()]))).toEqual(indexValues);

                    const keys = new class {
                        keys() {
                            return keyValues.map(e => e[0]);
                        }
                    }();
                    keyValues.forEach(([k, v]) => keys[k] = v);
                    expect(API.F.objectToEntries(keys)).toEqual(keyValues);

                    const values = new class {
                        values() {
                            return keyValues.map(e => e[1]);
                        }
                    }();
                    expect(API.F.objectToEntries(values)).toEqual(indexValues);

                    const span = document.createElement('span');

                    keyValues.forEach(([k, v]) => span.append(v));
                    expect(API.F.objectToEntries(span.childNodes).map(([i, node]) => [i, node.nodeValue])).toEqual(indexValues);

                    keyValues.forEach(([k, v]) => span.setAttribute(k, v));
                    expect(API.F.objectToEntries(span.attributes)).toEqual(keyValues);

                    keyValues.forEach(([k, v]) => span.dataset[k] = v);
                    expect(API.F.objectToEntries(span.dataset)).toEqual(keyValues);

                    keyValues.forEach(([k, v]) => span.classList.add(v));
                    expect(API.F.objectToEntries(span.classList)).toEqual(indexValues);
                });
                it('F.objectJoin', async function () {
                    expect(API.F.objectJoin({}, ';', ':')).toEqual('');
                    expect(API.F.objectJoin({undefined: undefined, null: null, false: false, true: true}, ',')).toEqual('null=null,false=false,true=true');
                    expect(API.F.objectJoin({a: 'A'}, ';', ':')).toEqual('a:A');
                    expect(API.F.objectJoin({a: 'A', o: {x: 'X'}}, ';', ':')).toEqual('a:A;o:x:X');
                    expect(API.F.objectJoin({a: 'A', o: {x: 'X'}}, ';', (v, k) => `${v}:${k}`)).toEqual('A:a;X:x:o');
                });
                it('F.objectWalkRecursive', async function () {
                    expect(API.F.objectWalkRecursive({
                        0: [1, 2, 3],
                        1: {a: 'A', b: 'B'},
                        2: {x: {0: 'Y', 1: 'Z', length: 2}},
                        3: Promise.resolve('promise'),
                        length: 4,
                    }, function (value, key) {
                        if (key === 'length') {
                            return value;
                        }
                        if (typeof (value) === 'number') {
                            return value * 2;
                        }
                        if (typeof (value) === 'string') {
                            return value + 'X';
                        }
                        if (value instanceof Promise) {
                            return 'P';
                        }
                        return value;
                    })).toEqual({
                        0: [2, 4, 6],
                        1: {a: 'AX', b: 'BX'},
                        2: {x: {0: 'YX', 1: 'ZX', length: 2}},
                        3: 'P',
                        length: 4,
                    });

                    expect(await API.F.objectWalkRecursive({
                        0: [1, 2, 3],
                        1: {a: 'A', b: 'B'},
                        2: {x: {0: 'Y', 1: 'Z', length: 2}},
                        3: Promise.resolve('promise'),
                        length: 4,
                    }, async function (value, key) {
                        if (key === 'length') {
                            return value;
                        }
                        if (typeof (value) === 'number') {
                            return value * 2;
                        }
                        if (typeof (value) === 'string') {
                            return value + 'X';
                        }
                        return value;
                    })).toEqual({
                        0: [2, 4, 6],
                        1: {a: 'AX', b: 'BX'},
                        2: {x: {0: 'YX', 1: 'ZX', length: 2}},
                        3: 'promise',
                        length: 4,
                    });

                    const now = performance.now();
                    await API.F.objectWalkRecursive([
                        100,
                        200,
                        300,
                    ], async (msec) => sleep(msec));
                    expect(performance.now() - now).toBeLessThan(350);
                });
                it('F.iterableToNodeList', async function () {
                    const builtin = document.querySelectorAll('div');
                    const created = API.F.iterableToNodeList(builtin);

                    // for
                    expect([...created]).toEqual([...builtin]);

                    // keys
                    expect([...created.keys()]).toEqual([...builtin.keys()]);

                    // values
                    expect([...created.values()]).toEqual([...builtin.values()]);

                    // entries
                    expect([...created.entries()]).toEqual([...builtin.entries()]);

                    // forEach
                    const forEach1 = [], forEach2 = [];
                    created.forEach((e, i) => forEach1.push([e, i]));
                    builtin.forEach((e, i) => forEach2.push([e, i]));
                    expect(forEach1).toEqual(forEach2);

                    // descriptor(writable)
                    expect(() => created[0] = null).toThrow();
                    expect(() => builtin[0] = null).toThrow();

                    // descriptor(configurable)
                    expect(() => delete created[0]).toThrow();
                    expect(() => delete builtin[0]).toThrow();

                    // descriptor(enumerable)
                    expect(Object.keys(created)).toEqual(Object.keys(builtin));
                });
                it('F.arrayLikeToArrayRecursive', async function () {
                    expect(API.F.arrayLikeToArrayRecursive({
                        0: [1, 2, 3],
                        1: {a: 'A', b: 'B'},
                        2: {x: {0: 'Y', 1: 'Z'}},
                    }, true)).toEqual({
                        0: [1, 2, 3],
                        1: {a: 'A', b: 'B'},
                        2: {x: {0: 'Y', 1: 'Z'}},
                    });

                    expect(API.F.arrayLikeToArrayRecursive({
                        0: [1, 2, 3],
                        1: {a: 'A', b: 'B'},
                        2: {x: {0: 'Y', 1: 'Z'}},
                    }, false)).toEqual([
                        [1, 2, 3],
                        {a: 'A', b: 'B'},
                        {x: ['Y', 'Z']},
                    ]);

                    expect(API.F.arrayLikeToArrayRecursive({
                        0: [1, 2, 3],
                        1: {a: 'A', b: 'B'},
                        2: {x: {0: 'Y', 1: 'Z', length: 2}},
                        length: 3,
                    }, true)).toEqual([
                        [1, 2, 3],
                        {a: 'A', b: 'B'},
                        {x: ['Y', 'Z']},
                    ]);
                });
                it('F.entriesToObject', async function () {
                    const entriesWithLength = [
                        [['a', 0], 'a0'],
                        [['a', 1], 'a1'],
                        [['a', 'length'], 2],
                        [['b', 0, 'c'], 'b0c'],
                        [['b', 0, 'd'], 'b0d'],
                        [['b', 1, 'c'], 'b1c'],
                        [['b', 1, 'd'], 'b1d'],
                        [['b', 'length'], 2],
                        [['x', 'y', 'z'], 'xyz'],
                    ];
                    const entriesWithoutLength = [
                        [['a', 0], 'a0'],
                        [['a', 1], 'a1'],
                        [['b', 0, 'c'], 'b0c'],
                        [['b', 0, 'd'], 'b0d'],
                        [['b', 1, 'c'], 'b1c'],
                        [['b', 1, 'd'], 'b1d'],
                        [['x', 'y', 'z'], 'xyz'],
                    ];

                    expect(API.F.entriesToObject(entriesWithLength)).toEqual({
                        a: {
                            0: 'a0',
                            1: 'a1',
                            length: 2,
                        },
                        b: {
                            0: {
                                c: 'b0c',
                                d: 'b0d',
                            },
                            1: {
                                c: 'b1c',
                                d: 'b1d',
                            },
                            length: 2,
                        },
                        x: {y: {z: 'xyz'}},
                    });

                    expect(API.F.entriesToObject(entriesWithLength, false)).toEqual({
                        a: ['a0', 'a1'],
                        b: [
                            {
                                c: 'b0c',
                                d: 'b0d',
                            },
                            {
                                c: 'b1c',
                                d: 'b1d',
                            },
                        ],
                        x: {y: {z: 'xyz'}},
                    });
                    expect(API.F.entriesToObject(entriesWithoutLength, false)).toEqual({
                        a: ['a0', 'a1'],
                        b: [
                            {
                                c: 'b0c',
                                d: 'b0d',
                            },
                            {
                                c: 'b1c',
                                d: 'b1d',
                            },
                        ],
                        x: {y: {z: 'xyz'}},
                    });

                    expect(API.F.entriesToObject(entriesWithLength, true)).toEqual({
                        a: ['a0', 'a1'],
                        b: [
                            {
                                c: 'b0c',
                                d: 'b0d',
                            },
                            {
                                c: 'b1c',
                                d: 'b1d',
                            },
                        ],
                        x: {y: {z: 'xyz'}},
                    });
                    expect(API.F.entriesToObject(entriesWithoutLength, true)).toEqual({
                        a: {
                            0: 'a0',
                            1: 'a1',
                        },
                        b: {
                            0: {
                                c: 'b0c',
                                d: 'b0d',
                            },
                            1: {
                                c: 'b1c',
                                d: 'b1d',
                            },
                        },
                        x: {y: {z: 'xyz'}},
                    });
                });
                it('F.functionIsNative', async function () {
                    expect(API.F.functionIsNative(Object.create)).toEqual(true);
                    expect(API.F.functionIsNative(function () {})).toEqual(false);
                    expect(API.F.functionIsNative(() => '[native code]')).toEqual(false);
                });
                it('Collection', async function () {
                    const elements = new API.Collection([
                        document.createElement('a'),
                        document.createElement('input'),
                    ]);

                    // has
                    expect('hoge' in elements).toEqual(false);
                    expect('disabled' in elements).toEqual(true);

                    // get
                    expect(elements.hoge).toEqual([undefined, undefined]);
                    expect(elements.disabled).toEqual([undefined, false]);

                    // set
                    elements.hoge = (node, i) => 'hoge' in node ? 'dummy' : undefined;
                    elements.disabled = (node, i) => 'disabled' in node ? true : undefined;
                    expect(elements.hoge).toEqual([undefined, undefined]);
                    expect(elements.disabled).toEqual([undefined, true]);

                    // delete
                    elements.hoge = 'dummy';
                    expect(elements.hoge).toEqual(['dummy', 'dummy']);
                    delete elements.hoge;
                    expect(elements.hoge).toEqual([undefined, undefined]);

                    // toString
                    expect(elements.disabled + '').toEqual(',true');
                    expect(elements.disabled.toString()).toEqual(',true');

                    // apply
                    expect(elements.checkValidity()).toEqual([undefined, true]);
                    expect(elements.remove()).toBe(elements);
                });
                it('WeakMap', async function () {
                    const weakmap = new API.WeakMap();
                    const key1 = {};
                    const key2 = {};
                    let key3 = {};

                    weakmap.set(key1, 1);
                    weakmap.set(key2, 2);
                    expect(weakmap.getOrSet(key3, () => 3)).toEqual(3);
                    expect(weakmap.getOrSet(key3, () => 33)).toEqual(3);
                    expect(weakmap.reset(key3, (v) => v * 2)).toEqual(3);

                    expect(weakmap.size).toEqual(3);
                    expect(API.F.objectToEntries(weakmap)).toEqual([
                        [key1, 1],
                        [key2, 2],
                        [key3, 6],
                    ]);

                    weakmap.delete(key1);
                    expect(weakmap.size).toEqual(2);
                    expect(API.F.objectToEntries(weakmap)).toEqual([
                        [key2, 2],
                        [key3, 6],
                    ]);

                    if (['all'].includes(testTarget) && performance.measureUserAgentSpecificMemory) {
                        key3 = null;
                        await performance.measureUserAgentSpecificMemory();
                        expect(weakmap.size).toEqual(1);
                        expect(API.F.objectToEntries(weakmap)).toEqual([
                            [key2, 2],
                        ]);
                    }
                });
                it('ObjectStorage', async function () {
                    const storage = new API.ObjectStorage();
                    const key1 = {a: 'A'};
                    const key2 = {b: 'B'};
                    const key3 = {c: 'C'};

                    storage.set(key1, 'k11', 'v11');
                    storage.set(key1, 'k12', 'v12');
                    storage.set(key2, 'k21', 'v21');
                    storage.getOrSet(key3, null, () => ({k31: 'v31'}));
                    storage.getOrSet(key3, null, () => ({k3x: 'v3x'}));

                    expect(storage.get(key1, 'k11')).toEqual('v11');
                    expect(storage.get(key1, 'k12')).toEqual('v12');
                    expect(storage.get(key2, 'k21')).toEqual('v21');
                    expect(storage.get(key3, null)).toEqual({
                        k31: 'v31',
                    });

                    storage.reset(key2, 'k21', (v) => 'X' + v);
                    storage.getOrSet(key2, 'k22', () => 'v22');
                    storage.getOrSet(key2, 'k22', () => 'XXX');
                    storage.reset(key3, null, (object) => Object.assign(object, {
                        k31: 'Xv31',
                        k32: 'v32',
                    }));

                    expect(storage.get(key1, 'k11')).toEqual('v11');
                    expect(storage.get(key1, 'k12')).toEqual('v12');
                    expect(storage.get(key1, 'unk')).toEqual(undefined);
                    expect(storage.get(key2, 'k21')).toEqual('Xv21');
                    expect(storage.get(key2, 'k22')).toEqual('v22');
                    expect(storage.get(key2, 'unk')).toEqual(undefined);
                    expect(storage.get(key3, 'k31')).toEqual('Xv31');
                    expect(storage.get(key3, 'k32')).toEqual('v32');
                    expect(storage.get(key3, 'unk')).toEqual(undefined);

                    expect(storage.size).toEqual(3);
                    expect(API.F.objectToEntries(storage)).toEqual([
                        [key1, {
                            k11: 'v11',
                            k12: 'v12',
                        }],
                        [key2, {
                            k21: 'Xv21',
                            k22: 'v22',
                        }],
                        [key3, {
                            k31: 'Xv31',
                            k32: 'v32',
                        }],
                    ]);

                    storage.delete(key1, 'k11');
                    expect(storage.size).toEqual(3);
                    expect(API.F.objectToEntries(storage)).toEqual([
                        [key1, {
                            k12: 'v12',
                        }],
                        [key2, {
                            k21: 'Xv21',
                            k22: 'v22',
                        }],
                        [key3, {
                            k31: 'Xv31',
                            k32: 'v32',
                        }],
                    ]);

                    storage.delete(key1, 'k12');
                    expect(storage.size).toEqual(2);
                    expect(API.F.objectToEntries(storage)).toEqual([
                        [key2, {
                            k21: 'Xv21',
                            k22: 'v22',
                        }],
                        [key3, {
                            k31: 'Xv31',
                            k32: 'v32',
                        }],
                    ]);

                    storage.clear();
                    expect(storage.size).toEqual(0);
                    expect(API.F.objectToEntries(storage)).toEqual([]);
                });
                it('Promise', async function () {
                    const concurrencyX = async function (tasks, expectedResult, expectedTime) {
                        var now = performance.now();
                        expect(await API.Promise.concurrencyAll(tasks, 5)).toEqual(expectedResult);
                        expect(performance.now() - now).toBeLessThan(expectedTime);

                        var now = performance.now();
                        expect(await API.Promise.concurrencyAllSettled(tasks, 5)).toEqual(expectedResult);
                        expect(performance.now() - now).toBeLessThan(expectedTime);
                    };

                    const task = async function (msec, result) {
                        await sleep(msec);
                        return result;
                    };
                    const fail = async function (error) {
                        throw error;
                    };

                    await concurrencyX([
                        // chunk1:max(500)
                        i => task(100, i),
                        i => task(200, i),
                        i => task(300, i),
                        i => task(400, i),
                        i => task(500, i),
                        // chunk2:max(500)
                        i => task(500, i),
                        i => task(400, i),
                        i => task(300, i),
                        i => task(200, i),
                        i => task(100, i),
                        // chunk3:max(999)
                        i => task(999, i),
                    ], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 1999);

                    await concurrencyX([
                        // chunk1:max(500)
                        i => task(100, i),
                        i => task(200, i),
                        i => task(300, i),
                        i => task(400, i),
                        i => task(500, i),
                        // chunk2:max(999)
                        i => task(500, i),
                        i => task(400, i),
                        i => task(300, i),
                        i => task(200, i),
                        i => task(999, i),
                        // chunk3:max(999)
                        i => task(999, i),
                    ], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 1999);

                    await concurrencyX([
                        i => task(100, i),
                        i => task(100, i),
                        i => task(100, i),
                        i => task(100, i),
                        i => task(100, i),
                        i => task(100, i),
                        i => task(100, i),
                        i => task(100, i),
                        i => task(100, i),
                        i => task(100, i),
                    ], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 299);

                    const tasks = {
                        a: i => task(100, `success${i.toUpperCase()}`),
                        b: i => fail(`error${i.toUpperCase()}`),
                        c: i => fail(`error${i.toUpperCase()}`),
                        d: i => task(100, `success${i.toUpperCase()}`),
                        e: i => fail(`error${i.toUpperCase()}`),
                        f: i => task(100, `success${i.toUpperCase()}`),
                        g: i => fail(`error${i.toUpperCase()}`),
                        h: i => task(100, `success${i.toUpperCase()}`),
                        i: i => task(100, `success${i.toUpperCase()}`),
                        j: i => fail(`error${i.toUpperCase()}`),
                    };
                    expect(await API.Promise.concurrencyAllSettled(tasks, 2)).toEqual({
                        a: 'successA',
                        b: 'errorB',
                        c: 'errorC',
                        d: 'successD',
                        e: 'errorE',
                        f: 'successF',
                        g: 'errorG',
                        h: 'successH',
                        i: 'successI',
                        j: 'errorJ',
                    });
                    await expectAsync(API.Promise.concurrencyAll(tasks, 2)).toBeRejected();
                });
                it('Proxy', async function () {
                    const object = new Date();
                    const proxy = new API.Proxy(object, {});

                    expect(object instanceof Date).toEqual(true);
                    expect(object instanceof API.Proxy).toEqual(false);

                    expect(proxy instanceof Date).toEqual(true);
                    expect(proxy instanceof API.Proxy).toEqual(true);
                });
                it('Timer', async function () {
                    const now = performance.now();
                    await API.Timer.wait(100);
                    expect(performance.now() - now).toBeGreaterThanOrEqual(100);

                    const t1 = API.Timer.wait(100);
                    t1.cancel('OK');
                    expect(await t1).toEqual('OK');

                    const t2 = API.Timer.wait(100);
                    t2.catch((e) => expect(e).toEqual('NG'));
                    t2.abort('NG');
                });
                it('Options', async function () {
                    const options = new API.Options({
                        v: 1,
                        n: 2,
                        u: 3,
                    });
                    expect(options.merge({v: 11, n: 12, u: 13})).toEqual({
                        v: 11,
                        n: 12,
                        u: 13,
                    });
                    expect(options.merge({v: 11, n: null, u: undefined})).toEqual({
                        v: 11,
                        n: 2,
                        u: 3,
                    });
                    const optionsA = options.extends({additional: 99});
                    expect(optionsA.merge({})).toEqual({
                        v: 1,
                        n: 2,
                        u: 3,
                        additional: 99,
                    });
                    expect(optionsA.merge({additional: 999})).toEqual({
                        v: 1,
                        n: 2,
                        u: 3,
                        additional: 999,
                    });

                    const optionsNU = new API.Options({
                        v: 1,
                        n: 2,
                        u: 3,
                    }, true, true);
                    expect(optionsNU.merge({v: 11, n: 12, u: 13})).toEqual({
                        v: 11,
                        n: 12,
                        u: 13,
                    });
                    expect(optionsNU.merge({v: 11, n: null, u: undefined})).toEqual({
                        v: 11,
                        n: null,
                        u: undefined,
                    });
                    const optionsNUA = optionsNU.extends({additional: 99});
                    expect(optionsNUA.merge({})).toEqual({
                        v: 1,
                        n: 2,
                        u: 3,
                        additional: 99,
                    });
                    expect(optionsNUA.merge({additional: null})).toEqual({
                        v: 1,
                        n: 2,
                        u: 3,
                        additional: null,
                    });
                });
                it('Vector2', async function () {
                    const v1 = new API.Vector2(10, 20, 5);
                    const v2 = new API.Vector2(20, 40, 10);

                    expect(v1.deltaX(v2)).toEqual(10);
                    expect(v1.deltaY(v2)).toEqual(20);
                    expect(v1.during(v2)).toEqual(5);
                    expect(v1.distance(v2)).toBeCloseTo(22.36);
                    expect(v1.degree(v2)).toBeCloseTo(153.43);
                    expect(v1.velocity(v2)).toBeCloseTo(4.47);

                    expect(v2.deltaX(v1)).toEqual(-10);
                    expect(v2.deltaY(v1)).toEqual(-20);
                    expect(v2.during(v1)).toEqual(-5);
                    expect(v2.distance(v1)).toBeCloseTo(22.36);
                    expect(v2.degree(v1)).toBeCloseTo(333.43);
                    expect(v2.velocity(v1)).toBeCloseTo(-4.47);
                });
            });

            describe('autoproperties', function () {
                beforeEach(function () {
                    this.elements = Object.setPrototypeOf([
                        $('<input/>'),
                        $('<select/>'),
                        $('<a/>'),
                    ], NodeList.prototype);
                });

                it('$get/$set', async function () {
                    expect(this.elements.disabled).toEqual([false, false, undefined]);
                    this.elements.disabled = true;
                    this.elements[0].disabled = false;
                    expect(this.elements.disabled).toEqual([false, true, undefined]);
                    expect(this.elements[0].disabled).toEqual(false);

                    this.elements.disabled = e => !e.disabled;
                    expect(this.elements.disabled).toEqual([true, false, undefined]);
                });
            });

            describe('EventTarget', function () {
                beforeEach(function () {
                    this.element = $('<section><div><span></span><span></span></div></section>');
                    document.body.append(this.element);
                });
                afterEach(function () {
                    this.element.remove();
                });

                it('$on.all', async function () {
                    const receiver = {};
                    const handler = function (e) {
                        receiver.count = (receiver.count ?? 0) + 1;
                        receiver.this = this;
                        receiver.target = e.target;
                        receiver.currentTarget = e.currentTarget;
                        receiver.$delegateTarget = e.$delegateTarget;
                    };
                    this.element.$on('click', 'div', handler);

                    const newDiv = $('<div><span></span></div>');
                    this.element.$append(newDiv);
                    newDiv.$('span').$trigger('click');

                    expect(receiver).toEqual({
                        count: 1,
                        this: this.element,
                        target: newDiv.$('span'),
                        currentTarget: this.element,
                        $delegateTarget: newDiv,
                    });

                    this.element.$off('click', 'div', handler);
                    newDiv.$('span').$trigger('click');
                    expect(receiver.count).toEqual(1);
                });
                it('$on.reduce', async function () {
                    let simpleThrottle = 0;
                    let leadingThrottle = 0;
                    let trailingThrottle = 0;
                    let bothThrottle = 0;
                    let simpleDebounce = 0;
                    let leadingDebounce = 0;
                    let trailingDebounce = 0;
                    let bothDebounce = 0;

                    this.element.$on('click', 'div', () => simpleThrottle++, {
                        throttle: 190,
                        leading: false,
                        trailing: false,
                    });
                    this.element.$on('click', 'div', () => leadingThrottle++, {
                        throttle: 190,
                        leading: true,
                        trailing: false,
                    });
                    this.element.$on('click', 'div', () => trailingThrottle++, {
                        throttle: 190,
                        leading: false,
                        trailing: true,
                    });
                    this.element.$on('click', 'div', () => bothThrottle++, {
                        throttle: 190,
                        leading: true,
                        trailing: true,
                    });
                    this.element.$on('click', 'div', () => simpleDebounce++, {
                        debounce: 190,
                        leading: false,
                        trailing: false,
                    });
                    this.element.$on('click', 'div', () => leadingDebounce++, {
                        debounce: 190,
                        leading: true,
                        trailing: false,
                    });
                    this.element.$on('click', 'div', () => trailingDebounce++, {
                        debounce: 190,
                        leading: false,
                        trailing: true,
                    });
                    this.element.$on('click', 'div', () => bothDebounce++, {
                        debounce: 190,
                        leading: true,
                        trailing: true,
                    });

                    /**
                     *          | T     | lT     | tT     | ltT     | D     | lD     | tD     | ltD     |
                     *  leading:|       | fire   |        | fire    |       | fire   |        | fire    |
                     *      100:|       |        |        |         |       |        |        |         |
                     *      200:| fire  | fire   | fire   | fire    |       |        |        |         |
                     *      300:|       |        |        |         |       |        |        |         |
                     *      400:| fire  | fire   | fire   | fire    |       |        |        |         |
                     *      500:|       |        |        |         |       |        |        |         |
                     *      600:| fire  | fire   | fire   | fire    |       |        |        |         |
                     * trailing:|       |        | fire   | fire    |       |        | fire   | fire    |
                     *    total:|     3 |      4 |      4 |       5 |     0 |      1 |      1 |       2 |
                     */

                    // leading
                    this.element.$('div').$trigger('click');
                    this.element.$('div').$trigger('click');
                    // 100
                    await sleep(100);
                    this.element.$('div').$trigger('click');
                    this.element.$('div').$trigger('click');
                    // 200
                    await sleep(100);
                    this.element.$('div').$trigger('click');
                    this.element.$('div').$trigger('click');
                    // 300
                    await sleep(100);
                    this.element.$('div').$trigger('click');
                    this.element.$('div').$trigger('click');
                    // 400
                    await sleep(100);
                    this.element.$('div').$trigger('click');
                    this.element.$('div').$trigger('click');
                    // 500
                    await sleep(100);
                    this.element.$('div').$trigger('click');
                    this.element.$('div').$trigger('click');
                    // 600
                    await sleep(100);
                    this.element.$('div').$trigger('click');
                    this.element.$('div').$trigger('click');
                    // trailing
                    await sleep(200);

                    expect(simpleThrottle).toEqual(3);
                    expect(leadingThrottle).toEqual(4);
                    expect(trailingThrottle).toEqual(4);
                    expect(bothThrottle).toEqual(5);
                    expect(simpleDebounce).toEqual(0);
                    expect(leadingDebounce).toEqual(1);
                    expect(trailingDebounce).toEqual(1);
                    expect(bothDebounce).toEqual(2);
                });
                it('$on.namespace', async function () {
                    let receiver = {};
                    const handler = function (e) {
                        receiver.count = (receiver.count ?? 0) + 1;
                        receiver.namespaces = e.$namespaces;
                    };
                    this.element.$on('click.ns1.ns2', 'div', handler);

                    this.element.$('span').$trigger('click.nsX');
                    expect(receiver).toEqual({});
                    this.element.$('span').$trigger('click.ns1.nsX');
                    expect(receiver).toEqual({});

                    this.element.$('span').$trigger('click.ns1');
                    expect(receiver).toEqual({
                        count: 1,
                        namespaces: ['ns1'],
                    });

                    this.element.$('span').$trigger('click.ns2');
                    expect(receiver).toEqual({
                        count: 2,
                        namespaces: ['ns2'],
                    });

                    this.element.$off('.ns1.nsX', 'div', handler);
                    this.element.$('span').$trigger('click');
                    expect(receiver).toEqual({
                        count: 3,
                        namespaces: [],
                    });

                    this.element.$off('change.ns1', 'div', handler);
                    this.element.$('span').$trigger('click');
                    expect(receiver).toEqual({
                        count: 4,
                        namespaces: [],
                    });

                    receiver = {};
                    this.element.$off('.ns1', 'div', handler);
                    this.element.$('span').$trigger('click');
                    expect(receiver).toEqual({});
                });
                it('$on.once', async function () {
                    let receiver = {};
                    const handler = function (e) {
                        receiver.count = (receiver.count ?? 0) + 1;
                    };
                    this.element.$on('click', handler, {
                        once: true,
                    });
                    this.element.$on('click', 'div', handler, {
                        once: true,
                    });

                    this.element.$trigger('click');
                    this.element.$trigger('click');
                    expect(receiver).toEqual({
                        count: 1,
                    });

                    this.element.$$('span')[0].$trigger('click');
                    this.element.$$('span')[0].$trigger('click');
                    expect(receiver).toEqual({
                        count: 2,
                    });

                    this.element.$$('span')[1].$trigger('click');
                    this.element.$$('span')[1].$trigger('click');
                    expect(receiver).toEqual({
                        count: 3,
                    });
                });
                it('$on.abort', async function () {
                    let receiver = {};
                    const handler = function (e) {
                        receiver.count = (receiver.count ?? 0) + 1;
                        if (receiver.count === 2) {
                            e.$abort();
                        }
                    };
                    this.element.$on('click', handler);

                    this.element.$trigger('click');
                    expect(receiver).toEqual({
                        count: 1,
                    });

                    this.element.$trigger('click');
                    expect(receiver).toEqual({
                        count: 2,
                    });

                    this.element.$trigger('click');
                    expect(receiver).toEqual({
                        count: 2,
                    });
                });
                it('$on.child', async function () {
                    const receiver = {};
                    this.element.$on('child', 'div', function (e) {
                        receiver.subtype = e.detail.subtype;
                        receiver.name = e.detail.name;
                        receiver.oldValue = e.detail.oldValue;
                        receiver.newValue = e.detail.newValue;
                        receiver.this = this;
                        receiver.target = e.target;
                        receiver.currentTarget = e.currentTarget;
                        receiver.$delegateTarget = e.$delegateTarget;
                    }, {
                        attributes: true,
                    });
                    const div = this.element.$('div');

                    const newSpan = $('<span></span>');
                    div.$append(newSpan);
                    await sleep(10);
                    expect(receiver).toEqual({
                        subtype: 'insert',
                        name: undefined,
                        oldValue: undefined,
                        newValue: undefined,
                        this: this.element,
                        target: div,
                        currentTarget: this.element,
                        $delegateTarget: div,
                    });

                    newSpan.setAttribute('a', 'A');
                    await sleep(10);
                    expect(receiver).toEqual({
                        subtype: 'change',
                        name: 'a',
                        oldValue: null,
                        newValue: 'A',
                        this: this.element,
                        target: div,
                        currentTarget: this.element,
                        $delegateTarget: div,
                    });

                    newSpan.setAttribute('a', 'X');
                    await sleep(10);
                    expect(receiver).toEqual({
                        subtype: 'change',
                        name: 'a',
                        oldValue: 'A',
                        newValue: 'X',
                        this: this.element,
                        target: div,
                        currentTarget: this.element,
                        $delegateTarget: div,
                    });

                    newSpan.remove();
                    await sleep(10);
                    expect(receiver).toEqual({
                        subtype: 'remove',
                        name: undefined,
                        oldValue: undefined,
                        newValue: undefined,
                        this: this.element,
                        target: div,
                        currentTarget: this.element,
                        $delegateTarget: div,
                    });
                });
                it('$on.attribute', async function () {
                    const receiver = {};
                    this.element.$on('attribute', 'div', function (e) {
                        receiver.subtype = e.detail.subtype;
                        receiver.oldValue = e.detail.oldValue;
                        receiver.newValue = e.detail.newValue;
                        receiver.this = this;
                        receiver.target = e.target;
                        receiver.currentTarget = e.currentTarget;
                        receiver.$delegateTarget = e.$delegateTarget;
                    });

                    const newDiv = $('<div><span></span></div>');
                    this.element.$append(newDiv);
                    await sleep(10);
                    newDiv.$attrs.hoge = 'HOGE';
                    await sleep(10);

                    expect(receiver).toEqual({
                        subtype: 'hoge',
                        oldValue: null,
                        newValue: 'HOGE',
                        this: this.element,
                        target: newDiv,
                        currentTarget: this.element,
                        $delegateTarget: newDiv,
                    });
                });
                it('$on.disable', async function () {
                    const receiver = {
                        called: 0,
                    };
                    this.element.$on('disable', 'input', function (e) {
                        receiver.called++;
                        receiver.subtype = e.detail.subtype;
                        receiver.oldValue = e.detail.oldValue;
                        receiver.newValue = e.detail.newValue;
                        receiver.target = e.target;
                    });

                    const newDiv = $('<div><fieldset><input></fieldset></div>');
                    this.element.$append(newDiv);
                    await sleep(50);

                    newDiv.$('input').disabled = true;
                    await sleep(50);
                    expect(receiver).toEqual({
                        called: 1,
                        subtype: 'disable',
                        oldValue: false,
                        newValue: true,
                        target: newDiv.$('input'),
                    });

                    newDiv.$('input').disabled = false;
                    await sleep(50);
                    expect(receiver).toEqual({
                        called: 2,
                        subtype: 'enable',
                        oldValue: true,
                        newValue: false,
                        target: newDiv.$('input'),
                    });

                    newDiv.$('fieldset').disabled = true;
                    await sleep(50);
                    expect(receiver).toEqual({
                        called: 3,
                        subtype: 'disable',
                        oldValue: false,
                        newValue: true,
                        target: newDiv.$('input'),
                    });

                    newDiv.$('input').disabled = true;
                    await sleep(50);
                    expect(receiver.called).toEqual(3);

                    newDiv.$('input').disabled = false;
                    await sleep(50);
                    expect(receiver.called).toEqual(3);

                    newDiv.$('fieldset').disabled = false;
                    await sleep(50);
                    expect(receiver).toEqual({
                        called: 4,
                        subtype: 'enable',
                        oldValue: true,
                        newValue: false,
                        target: newDiv.$('input'),
                    });
                });
                it('$on.resize', async function () {
                    const receiver = {};
                    this.element.$on('resize', 'div', function (e) {
                        receiver.subtype = e.detail.subtype;
                        receiver.this = this;
                        receiver.target = e.target;
                        receiver.currentTarget = e.currentTarget;
                        receiver.$delegateTarget = e.$delegateTarget;
                    });

                    const newDiv = $('<div><span></span></div>');
                    this.element.$append(newDiv);
                    await sleep(50);
                    newDiv.$style.width = '111px';
                    await sleep(50);

                    expect(receiver).toEqual({
                        subtype: 'content-box',
                        this: this.element,
                        target: newDiv,
                        currentTarget: this.element,
                        $delegateTarget: newDiv,
                    });
                });
                it('$on.visible', async function () {
                    const receiver = {};
                    this.element.$on('visible', 'div', function (e) {
                        receiver.subtype = e.detail.subtype;
                        receiver.oldValue = e.detail.oldValue;
                        receiver.newValue = e.detail.newValue;
                        receiver.this = this;
                        receiver.target = e.target;
                        receiver.currentTarget = e.currentTarget;
                        receiver.$delegateTarget = e.$delegateTarget;
                    });

                    const newDiv = $('<div><span></span></div>');
                    this.element.$append(newDiv);
                    await sleep(20);
                    newDiv.hidden = true;
                    await sleep(20);

                    expect(receiver).toEqual({
                        subtype: 'content-visibility',
                        oldValue: true,
                        newValue: false,
                        this: this.element,
                        target: newDiv,
                        currentTarget: this.element,
                        $delegateTarget: newDiv,
                    });
                });
                it('$events', async function () {
                    const handler = function () {};
                    const options = {
                        once: true,
                    };
                    this.element.$on('click.ns', 'div', handler, options);

                    expect(this.element.$events('click.nsX')).toEqual([]);

                    expect(this.element.$events()[0]).toEqual(jasmine.objectContaining({
                        type: 'click',
                        namespaces: ['ns'],
                        selector: 'div',
                        options: jasmine.objectContaining(options),
                    }));

                    const newDiv = $('<div><span></span></div>');
                    this.element.$append(newDiv);
                    newDiv.$('span').$trigger('click');

                    expect(newDiv.$('span').$events()).toEqual([]);
                });
            });

            describe('NodeList', function () {
                beforeEach(function () {
                    this.element = $('<div><label><input type="checkbox"></label><label><input type="checkbox"></label></div>');
                    this.checkboxes = this.element.$$('input');
                    this.ul = $('<ul><li class="a">a</li><li class="b">b</li><li class="c">c</li><li class="d">d</li></ul>');

                    document.body.append(this.element);
                    document.body.append(this.ul);
                });
                afterEach(function () {
                    this.element.remove();
                    this.ul.remove();
                });

                it('dispatchEvent', async function () {
                    let e, counter;
                    this.checkboxes.addEventListener('click', function (e) {
                        counter++;
                    });

                    // original
                    e = new MouseEvent('click');
                    counter = 0;
                    this.checkboxes.checked = false;
                    this.checkboxes.forEach((node) => node.dispatchEvent(e));
                    // expect(counter).toEqual(1); // fail. only events ignite?
                    expect(this.checkboxes.checked).toEqual([true, false]);

                    // custom
                    e = new MouseEvent('click');
                    counter = 0;
                    this.checkboxes.checked = false;
                    this.checkboxes.dispatchEvent(e);
                    expect(counter).toEqual(2);
                    expect(this.checkboxes.checked).toEqual([true, true]);
                });
                it('$index', async function () {
                    const lis = this.ul.$$('li');
                    expect(lis.$index('.b')).toEqual(1);
                    expect(lis.$index((node) => node.textContent === 'c')).toEqual(2);
                    expect(lis.$index(lis[3])).toEqual(3);
                    expect(lis.$index('.notfound')).toEqual(null);
                });
                it('$slice', async function () {
                    const lis = this.ul.$$('li');
                    expect(lis.$slice(1, 2) + '').toEqual('<li class="b">b</li>');
                    expect(lis.$slice('.b', '.d') + '').toEqual('<li class="b">b</li><li class="c">c</li>');
                    expect(lis.$slice('.c', '.notfound') + '').toEqual('<li class="c">c</li><li class="d">d</li>');
                    expect(lis.$slice('.notfound') + '').toEqual('<li class="a">a</li><li class="b">b</li><li class="c">c</li><li class="d">d</li>');
                    expect(lis.$slice('.notfound', '.notfound') + '').toEqual('<li class="a">a</li><li class="b">b</li><li class="c">c</li><li class="d">d</li>');
                    expect(lis.$slice() + '').toEqual('<li class="a">a</li><li class="b">b</li><li class="c">c</li><li class="d">d</li>');
                });
            });

            describe('Window', function () {
                it('$query', async function () {
                    const htmlstring = window.$query('<div></div><span>S</span>');
                    expect(htmlstring instanceof NodeList).toEqual(true);
                    expect(htmlstring.length).toEqual(2);
                    expect(htmlstring + '').toEqual('<div></div><span>S</span>');

                    const selector = window.$query('h1');
                    expect(selector instanceof Node).toEqual(true);

                    const node = window.$query(selector);
                    expect(node instanceof Node).toEqual(true);

                    const selectors = window.$query('section');
                    expect(selectors instanceof NodeList).toEqual(true);

                    const nodelist = window.$query(selectors);
                    expect(nodelist instanceof NodeList).toEqual(true);

                    const array = window.$query([
                        '<div></div><span>S</span>',
                        selector,
                        'h1',
                        nodelist,
                        'section',
                    ]);
                    expect(array instanceof NodeList).toEqual(true);
                });
            });

            describe('Document', function () {
                it('$createNodeListFromHTML', async function () {
                    const nodelist = document.$createNodeListFromHTML('A<div><span>S</span></div>Z');
                    expect(nodelist + '').toEqual('A<div><span>S</span></div>Z');
                });
                it('$createElement', async function () {
                    const element = document.$createElement('div', {hidden: true, title: 'value'}, 'child1', 'child2');
                    expect(element + '').toEqual('<div hidden="" title="value">child1child2</div>');

                    const selectoredElement1 = document.$createElement('div#id.c1.c2[a=A][b=B][c]');
                    expect(selectoredElement1 + '').toEqual('<div class="c1 c2" id="id" a="A" b="B" c=""></div>');

                    const selectoredElement2 = document.$createElement('div[a=A][b=B][c].c1.c2#id', {class: 'x', x: 'X'}, 'child1', 'child2');
                    expect(selectoredElement2 + '').toEqual('<div class="x c1 c2" x="X" id="id" a="A" b="B" c="">child1child2</div>');
                });
            });

            describe('DocumentLikeElement', function () {
                beforeEach(function () {
                    this.element = $('<section><div>A<span>a</span></div><div>B<span>b</span></div></section>');
                });

                it('$', async function () {
                    const element = this.element.$('section, span');
                    expect(element + '').toEqual('<span>a</span>');

                    expect(this.element.$('dummy')).toEqual(null);
                });
                it('$$', async function () {
                    const elements = this.element.$$('section, span');
                    expect(elements + '').toEqual('<span>a</span><span>b</span>');

                    expect(this.element.$$('dummy').length).toEqual(0);
                });
                it('$$$', async function () {
                    const elements = this.element.$$$('section, span');
                    expect(elements + '').toEqual('<section><div>A<span>a</span></div><div>B<span>b</span></div></section><span>a</span><span>b</span>');

                    expect(this.element.$$$('dummy').length).toEqual(0);
                });
                it('$matches', async function () {
                    const elements = this.element.$$('section, span');
                    const element1 = elements[0];
                    const element2 = elements[1];

                    expect(element1.$matches('div')).toEqual(false);
                    expect(element1.$matches('span')).toEqual(true);
                    expect(element1.$matches(element1)).toEqual(true);
                    expect(element1.$matches(e => e.textContent === 'a')).toEqual(true);
                    expect(element1.$matches('dummy')).toEqual(false);
                    expect(element1.$matches(element2)).toEqual(false);
                    expect(element1.$matches(e => e.textContent === 'b')).toEqual(false);

                    expect(element2.$matches('div')).toEqual(false);
                    expect(element2.$matches('span')).toEqual(true);
                    expect(element2.$matches(element2)).toEqual(true);
                    expect(element2.$matches(e => e.textContent === 'b')).toEqual(true);
                    expect(element2.$matches('dummy')).toEqual(false);
                    expect(element2.$matches(element1)).toEqual(false);
                    expect(element2.$matches(e => e.textContent === 'a')).toEqual(false);
                });
                it('$contains', async function () {
                    const elements = this.element.$$('section, div');
                    const element1 = elements[0];
                    const element2 = elements[1];

                    expect(element1.$contains('div')).toEqual(true);
                    expect(element1.$contains('span')).toEqual(true);
                    expect(element1.$contains(element1)).toEqual(true);
                    expect(element1.$contains(e => e.textContent === 'a')).toEqual(true);
                    expect(element1.$contains('dummy')).toEqual(false);
                    expect(element1.$contains(element2)).toEqual(false);
                    expect(element1.$contains(e => e.textContent === 'b')).toEqual(false);

                    expect(element2.$contains('div')).toEqual(true);
                    expect(element2.$contains('span')).toEqual(true);
                    expect(element2.$contains(element2)).toEqual(true);
                    expect(element2.$contains(e => e.textContent === 'b')).toEqual(true);
                    expect(element2.$contains('dummy')).toEqual(false);
                    expect(element2.$contains(element1)).toEqual(false);
                    expect(element2.$contains(e => e.textContent === 'a')).toEqual(false);
                });
            });

            describe('Node', function () {
                beforeEach(function () {
                    this.element = document.$createElement('section', {}, $('<div><span>1</span>div<span>2</span></div>'));
                    this.elements = Object.setPrototypeOf([
                        document.$createElement('section', {}, $('<div>initial1</div>')),
                        document.$createElement('section', {}, $('<div>initial2</div>')),
                    ], NodeList.prototype);

                    this.siblings = Object.setPrototypeOf([
                        document.$createElement('section', {}, $('<div class="hasclass">1</div><div>2</div><div class="target">3</div><div>4</div><div class="hasclass">5</div>')),
                        document.$createElement('section', {}, $('<div class="hasclass">1</div><div>2</div><div class="target">3</div><div>4</div><div class="hasclass">5</div>')),
                    ], NodeList.prototype);
                });
                it('$bag', async function () {
                    this.elements.$bag.hoge = 123;
                    this.elements[1].$bag.hoge = 456;
                    expect(this.elements[0].$bag.hoge).toEqual(123);
                    expect(this.elements[1].$bag.hoge).toEqual(456);

                    this.elements.$bag = {fuga: 234};
                    this.elements[1].$bag = {fuga: 567};
                    expect('hoge' in this.elements[0].$bag).toEqual(false);
                    expect('hoge' in this.elements[1].$bag).toEqual(false);
                    expect(this.elements[0].$bag.fuga).toEqual(234);
                    expect(this.elements[1].$bag.fuga).toEqual(567);

                    this.elements.$bag({piyo: 345});
                    this.elements[1].$bag({piyo: 678});
                    expect(this.elements[0].$bag()).toEqual({fuga: 234, piyo: 345});
                    expect(this.elements[1].$bag()).toEqual({fuga: 567, piyo: 678});

                    this.elements.$bag = (node, i) => i === 0 ? null : {i: i};
                    expect(this.elements.$bag + '').toEqual('{"fuga":234,"piyo":345},{"i":1}');
                });
                it('$textNodes', async function () {
                    const elements = Object.setPrototypeOf([
                        document.$createElement('section', {}, $('<div>1<div>1.1<!-- comment1 --></div></div>')),
                        document.$createElement('section', {}, $('<div>2<div>2.1<!-- comment2 --></div></div>')),
                        document.$createElement('section', {}, $('<style>.dummy{}</style>')),
                    ], NodeList.prototype);

                    expect([...elements.$textNodes()].map(texts => [...texts].map(text => text.nodeValue))).toEqual([['1', '1.1', ' comment1 '], ['2', '2.1', ' comment2 '], []]);
                    expect([...elements[0].$textNodes()].map(node => node.nodeValue)).toEqual(['1', '1.1', ' comment1 ']);
                    expect([...elements[1].$textNodes([Node.TEXT_NODE])].map(node => node.nodeValue)).toEqual(['2', '2.1']);
                    expect([...elements[2].$textNodes([Node.TEXT_NODE, 'metadata'])].map(node => node.nodeValue)).toEqual(['.dummy{}']);
                });
                it('$contains/$matches/$filter/$except/$child', async function () {
                    const elements = Object.setPrototypeOf([
                        document.$createElement('section', {class: "section1"}, $('<div class="klass1">a.1</div><div class="klass2">a.2</div><div class="klass3">a.3</div>')),
                        document.$createElement('section', {class: "section2"}, $('<div class="klass1">b.1</div><div class="klass2">b.2</div><div class="klass3">b.3</div>')),
                    ], NodeList.prototype);

                    expect(elements.$contains('.klass1')).toEqual(true);
                    expect(elements.$contains('.klass2')).toEqual(true);
                    expect(elements.$contains('.klassX')).toEqual(false);
                    expect(elements.$contains((node) => node.textContent.includes('b.3'))).toEqual(true);
                    expect(elements.$contains((node) => node.textContent.includes('b.X'))).toEqual(false);

                    expect(elements.$matches('.section1')).toEqual(elements[0]);
                    expect(elements.$matches('.section2')).toEqual(elements[1]);
                    expect(elements.$matches('.klass1')).toEqual(undefined);
                    expect(elements.$matches((node) => node.textContent.includes('b.3'))).toEqual(elements[1]);
                    expect(elements.$matches((node) => node.textContent.includes('b.X'))).toEqual(undefined);

                    const filtered = elements.$$('div').$filter('div.klass1');
                    expect(filtered.length).toEqual(2);
                    expect(filtered[0].outerHTML).toEqual('<div class="klass1">a.1</div>');
                    expect(filtered[1].outerHTML).toEqual('<div class="klass1">b.1</div>');

                    const excepted = elements.$$('div').$except('div.klass2');
                    expect(excepted.length).toEqual(4);
                    expect(excepted[0].outerHTML).toEqual('<div class="klass1">a.1</div>');
                    expect(excepted[1].outerHTML).toEqual('<div class="klass3">a.3</div>');
                    expect(excepted[2].outerHTML).toEqual('<div class="klass1">b.1</div>');
                    expect(excepted[3].outerHTML).toEqual('<div class="klass3">b.3</div>');

                    expect(elements.$$('div').$filter('div.notmatch').length).toEqual(0);

                    expect(elements[0].$childElement(1) + '').toEqual('<div class="klass2">a.2</div>');
                    expect(elements[0].$childElement('.klass2') + '').toEqual('<div class="klass2">a.2</div>');
                    expect(elements[0].$childElement('.klassX')).toEqual(null);
                    expect(elements[0].$childElement((node) => node.textContent.includes('a.2')) + '').toEqual('<div class="klass2">a.2</div>');

                    expect(elements[1].$childElements(':not(.klass2)') + '').toEqual('<div class="klass1">b.1</div><div class="klass3">b.3</div>');
                    expect(elements[1].$childElements((node) => false) + '').toEqual('');
                });
                it('$closest/$parents', async function () {
                    const elements = Object.setPrototypeOf([
                        document.$createElement('section', {}, $('<div class="level1">a.1<div class="level2">a.1.2<div class="level3">a.1.2.3</div></div></div>')),
                        document.$createElement('section', {}, $('<div class="level1">b.1<div class="level2">b.1.2<div class="level3">b.1.2.3</div></div></div>')),
                    ], NodeList.prototype);

                    const level1 = elements.$('.level1');
                    const level2 = elements.$('.level2');
                    const level3 = elements.$('.level3');
                    expect(level3.$closest('.level3')).toEqual(level3);
                    expect(level3.$closest('.level2')).toEqual(level2);
                    expect(level3.$closest('.level1')).toEqual(level1);
                    expect(level3.$closest('.levelX')).toEqual(null);
                    expect(level3.$closest((node) => node.firstChild.textContent === 'a.1')).toEqual(level1);

                    const parents = elements.$$('.level3').$parents();
                    expect(parents.length).toEqual(2);
                    expect(parents[0].length).toEqual(3);
                    expect(parents[0][0].outerHTML).toEqual('<div class="level2">a.1.2<div class="level3">a.1.2.3</div></div>');
                    expect(parents[0][1].outerHTML).toEqual('<div class="level1">a.1<div class="level2">a.1.2<div class="level3">a.1.2.3</div></div></div>');
                    expect(parents[0][2].outerHTML).toContain('<section><div class="level1">a.1');
                    expect(parents[1].length).toEqual(3);
                    expect(parents[1][0].outerHTML).toEqual('<div class="level2">b.1.2<div class="level3">b.1.2.3</div></div>');
                    expect(parents[1][1].outerHTML).toEqual('<div class="level1">b.1<div class="level2">b.1.2<div class="level3">b.1.2.3</div></div></div>');
                    expect(parents[1][2].outerHTML).toContain('<section><div class="level1">b.1');

                    const parents1 = elements.$$('.level3').$parents('.level1');
                    expect(parents1.length).toEqual(2);
                    expect(parents1[0].length).toEqual(1);
                    expect(parents1[0][0].outerHTML).toEqual('<div class="level1">a.1<div class="level2">a.1.2<div class="level3">a.1.2.3</div></div></div>');
                    expect(parents1[1].length).toEqual(1);
                    expect(parents1[1][0].outerHTML).toEqual('<div class="level1">b.1<div class="level2">b.1.2<div class="level3">b.1.2.3</div></div></div>');

                    const selfparent = elements.$('.level3').$parents('.level3');
                    expect(selfparent.length).toEqual(0);
                    const notparents = elements.$('.level3').$parents('.notmatch');
                    expect(notparents.length).toEqual(0);
                });
                it('$clone', async function () {
                    const section = document.$createElement('section', {}, $('<div>div<span>span</span></div>'));
                    expect(section.cloneNode() + '').toEqual('<section></section>');
                    expect(section.$clone() + '').toEqual('<section><div>div<span>span</span></div></section>');

                    const counters = {};
                    section.$on('click', () => counters.section = (counters.section ?? 0) + 1);
                    section.$on('click', 'span', () => counters.sectionSpan = (counters.sectionSpan ?? 0) + 1);
                    section.$('div').$on('click', () => counters.div = (counters.div ?? 0) + 1);
                    section.$('div').$on('click', 'span', () => counters.divSpan = (counters.divSpan ?? 0) + 1);
                    section.$('span').$on('click', () => counters.span = (counters.span ?? 0) + 1);

                    const cloned = section.$clone(true);
                    expect(cloned + '').toEqual('<section><div>div<span>span</span></div></section>');

                    cloned.$('span').$trigger('click');
                    expect(counters).toEqual({
                        span: 1,
                        div: 1,
                        divSpan: 1,
                        section: 1,
                        sectionSpan: 1,
                    });
                });
                it('$before/$after', async function () {
                    const div = this.elements.$$('div');

                    div.$before('a', '<a/>');
                    div.$after('b', '<b/>');
                    div[0].$before('c', '<c/>');
                    div[0].$after('d', '<d/>');
                    expect(this.elements[0].outerHTML).toEqual('<section>a&lt;a/&gt;c&lt;c/&gt;<div>initial1</div>d&lt;d/&gt;b&lt;b/&gt;</section>');
                    expect(this.elements[1].outerHTML).toEqual('<section>a&lt;a/&gt;<div>initial2</div>b&lt;b/&gt;</section>');
                });
                it('$prepend/$append/$insert', async function () {
                    const div = this.elements.$$('div');

                    div.$prepend('a', $('<a/>'));
                    div.$append('b', $('<b/>'));
                    div[0].$prepend('c', $('<c/>'));
                    div[0].$append('d', $('<d/>'));
                    div.$insert('b', $('<e/>'));
                    div[0].$insert('d', $('<f/>'));
                    expect(this.elements[0].outerHTML).toEqual('<section><div>c<c></c>ainitial1bd<f></f><d></d></div></section>');
                    expect(this.elements[1].outerHTML).toEqual('<section><div>a<a></a>initial2b<e></e><b></b></div></section>');
                });
                it('$replace', async function () {
                    const div = this.elements.$$('div');

                    div.$replace('a', '<a/>');
                    div[0].$replace('c', '<c/>');
                    expect(this.elements[0].outerHTML).toEqual('<section>a&lt;a/&gt;</section>');
                    expect(this.elements[1].outerHTML).toEqual('<section>a&lt;a/&gt;</section>');
                });
                it('$prev/$next/$sibling', async function () {
                    const div = this.siblings.$('.target');

                    expect(div.$prevElement('notfound')).toEqual(null);
                    const prev = div.$prevElement();
                    expect(prev.outerHTML).toEqual('<div>2</div>');
                    const prevHasclass = div.$prevElement('.hasclass');
                    expect(prevHasclass.outerHTML).toEqual('<div class="hasclass">1</div>');

                    expect(div.$prevElements('notfound').length).toEqual(0);
                    const prevs = div.$prevElements();
                    expect(prevs.length).toEqual(2);
                    expect(prevs[0].outerHTML).toEqual('<div class="hasclass">1</div>');
                    expect(prevs[1].outerHTML).toEqual('<div>2</div>');
                    const prevsHasclass = div.$prevElements('.hasclass');
                    expect(prevsHasclass.length).toEqual(1);
                    expect(prevsHasclass[0].outerHTML).toEqual('<div class="hasclass">1</div>');

                    expect(div.$nextElement('notfound')).toEqual(null);
                    const next = div.$nextElement();
                    expect(next.outerHTML).toEqual('<div>4</div>');
                    const nextHasclass = div.$nextElement('.hasclass');
                    expect(nextHasclass.outerHTML).toEqual('<div class="hasclass">5</div>');

                    expect(div.$nextElements('notfound').length).toEqual(0);
                    const nexts = div.$nextElements();
                    expect(nexts.length).toEqual(2);
                    expect(nexts[0].outerHTML).toEqual('<div>4</div>');
                    expect(nexts[1].outerHTML).toEqual('<div class="hasclass">5</div>');
                    const nextsHasclass = div.$nextElements('.hasclass');
                    expect(nextsHasclass.length).toEqual(1);
                    expect(nextsHasclass[0].outerHTML).toEqual('<div class="hasclass">5</div>');

                    const siblings = div.$siblingElements();
                    expect(siblings.length).toEqual(4);
                    expect(siblings[0].outerHTML).toEqual('<div class="hasclass">1</div>');
                    expect(siblings[1].outerHTML).toEqual('<div>2</div>');
                    expect(siblings[2].outerHTML).toEqual('<div>4</div>');
                    expect(siblings[3].outerHTML).toEqual('<div class="hasclass">5</div>');
                    const siblingsHasclass = div.$siblingElements('.hasclass');
                    expect(nextsHasclass.length).toEqual(1);
                    expect(nextsHasclass[0].outerHTML).toEqual('<div class="hasclass">5</div>');
                });
                it('$replaceChild', async function () {
                    const element = $('<section><div>child1</div><div>child2</div><div>child3</div></section>');

                    element.$replaceChild(0, 'a', 'b');
                    expect(element.innerHTML).toEqual('ab<div>child2</div><div>child3</div>');

                    element.$replaceChild(element.$$('div').$at(-1), 'y', 'z');
                    expect(element.innerHTML).toEqual('ab<div>child2</div>yz');

                    element.$replaceChild(element, 'x1');
                    element.$replaceChild(999, 'x2');
                    expect(element.innerHTML).toEqual('ab<div>child2</div>yz');
                });
                it('$replaceChildren', async function () {
                    this.elements[0].$replaceChildren('text', $('<span>span</span>'));
                    this.elements[1].$replaceChildren();
                    expect(this.elements[0].innerHTML).toEqual('text<span>span</span>');
                    expect(this.elements[1].innerHTML).toEqual('');
                });
                it('$wrap/$unwrap', async function () {
                    const div = this.element.$('div');

                    div.$wrap($('<div class="wrapper"></div>'));
                    expect(this.element.innerHTML).toEqual('<div class="wrapper"><div><span>1</span>div<span>2</span></div></div>');

                    div.$unwrap();
                    expect(this.element.innerHTML).toEqual('<div><span>1</span>div<span>2</span></div>');

                    div.$unwrapChildren();
                    expect(this.element.innerHTML).toEqual('<span>1</span>div<span>2</span>');
                });
                it('$radioNodeList', async function () {
                    const form = document.$createElement('form', {}, ...[
                        document.$createElement('input', {type: 'radio', name: 'hoge'}),
                        document.$createElement('input', {type: 'radio', name: 'hoge'}),
                        document.$createElement('input', {type: 'radio', name: 'fuga'}),
                        document.$createElement('input', {type: 'text', name: 'piyo'}),
                    ]);

                    const radioNodeList1 = form.$$('[type=radio]')[0].$radioNodeList;
                    const radioNodeList2 = form.$$('[type=radio]')[1].$radioNodeList;
                    const radioNodeList3 = form.$$('[type=radio]')[2].$radioNodeList;

                    expect(radioNodeList1.length).toEqual(2);
                    expect(radioNodeList2.length).toEqual(2);
                    expect(radioNodeList3.length).toEqual(1);

                    expect(radioNodeList1).toEqual(radioNodeList2);
                    expect(radioNodeList2).not.toEqual(radioNodeList3);

                    expect(form.$('[type=text]').$radioNodeList).toEqual(undefined);
                });
            });

            describe('Element', function () {
                beforeEach(function () {
                    this.elements = Object.setPrototypeOf([
                        $('<input/>'),
                        $('<select/>'),
                        $('<a/>'),
                    ], NodeList.prototype);
                    this.element = $('<span style="--css-var:123"></span>');
                    this.style = $('<style>div::after{font-size:10pt}</style>');
                    this.parent = $('<div style="font-size:12pt" inert><span></span></div>');
                    this.child = this.parent.$('span');

                    document.body.append(this.element);
                    document.body.append(this.style);
                    document.body.append(this.parent);
                });
                afterEach(function () {
                    this.element.remove();
                    this.style.remove();
                    this.parent.remove();
                });

                it('$attrs', async function () {
                    expect('hoge' in this.element.$attrs).toEqual(false);

                    this.element.$attrs.hoge = 'hoge';
                    expect('hoge' in this.element.$attrs).toEqual(true);
                    expect(this.element.$attrs.hoge).toEqual('hoge');

                    this.element.$attrs.hoge = () => undefined;
                    expect(this.element.$attrs.hoge).toEqual('hoge');

                    expect(this.element.$attrs({fuga: 'fuga'})).toBe(this.element.$attrs);
                    expect('hoge' in this.element.$attrs).toEqual(true);
                    expect(this.element.$attrs.hoge).toEqual('hoge');
                    expect(this.element.$attrs.fuga).toEqual('fuga');

                    delete this.element.$attrs.hoge;
                    expect('hoge' in this.element.$attrs).toEqual(false);
                    expect(this.element.$attrs.hoge).toEqual(undefined);

                    this.element.$attrs = {piyo: 'piyo'};
                    expect('hoge' in this.element.$attrs).toEqual(false);
                    expect(this.element.$attrs.hoge).toEqual(undefined);
                    expect('fuga' in this.element.$attrs).toEqual(false);
                    expect(this.element.$attrs.fuga).toEqual(undefined);
                    expect(this.element.$attrs.piyo).toEqual('piyo');

                    this.element.$attrs = function () {
                        return {foo: 'bar'};
                    };
                    expect('piyo' in this.element.$attrs).toEqual(false);
                    expect(this.element.$attrs.piyo).toEqual(undefined);
                    expect(this.element.$attrs.foo).toEqual('bar');

                    expect(this.element.$attrs()).toEqual({foo: 'bar'});
                    expect(this.element.$attrs + '').toEqual('foo="bar"');
                    expect(this.element.$attrs.toString()).toEqual('foo="bar"');
                });
                it('$attrs misc', async function () {
                    this.element.$attrs.hoge = false;
                    expect('hoge' in this.element.$attrs).toEqual(false);
                    expect(this.element.$attrs.hoge).toEqual(undefined);

                    this.element.$attrs.hoge = true;
                    expect('hoge' in this.element.$attrs).toEqual(true);
                    expect(this.element.$attrs.hoge).toEqual('');

                    this.element.$attrs = {
                        shown: false,
                        hidden: true,
                        data: {
                            a: 'a',
                            b: 'b',
                        },
                        class: ['a', 'b', 'c'],
                        style: {
                            color: 'red',
                            backgroundColor: 'red',
                        },
                    };
                    expect(this.element.outerHTML).toEqual('<span hidden="" data-a="a" data-b="b" class="a b c" style="color:red;background-color:red;"></span>');

                    expect(this.child.$attrs.inert).toEqual(undefined);
                    expect(this.child.$attrs.$inert).toEqual('');
                });
                it('$data', async function () {
                    expect('hoge' in this.element.$data).toEqual(false);

                    this.element.$data.hoge = 'hoge';
                    expect('hoge' in this.element.$data).toEqual(true);
                    expect(this.element.$data.hoge).toEqual('hoge');

                    this.element.$data.hoge = () => undefined;
                    expect(this.element.$data.hoge).toEqual('hoge');

                    expect(this.element.$data({fuga: 'fuga'})).toBe(this.element.$data);
                    expect('hoge' in this.element.$data).toEqual(true);
                    expect(this.element.$data.hoge).toEqual('hoge');
                    expect(this.element.$data.fuga).toEqual('fuga');

                    delete this.element.$data.hoge;
                    expect('hoge' in this.element.$data).toEqual(false);
                    expect(this.element.$data.hoge).toEqual(undefined);

                    this.element.$data = {piyo: 'piyo'};
                    expect('hoge' in this.element.$data).toEqual(false);
                    expect(this.element.$data.hoge).toEqual(undefined);
                    expect('fuga' in this.element.$data).toEqual(false);
                    expect(this.element.$data.fuga).toEqual(undefined);
                    expect(this.element.$data.piyo).toEqual('piyo');

                    this.element.$data = function () {
                        return {foo: 'bar'};
                    };
                    expect('piyo' in this.element.$data).toEqual(false);
                    expect(this.element.$data.piyo).toEqual(undefined);
                    expect(this.element.$data.foo).toEqual('bar');

                    expect(this.element.$data()).toEqual({foo: 'bar'});
                    expect(this.element.$data + '').toEqual('{"foo":"bar"}');
                    expect(this.element.$data.toString()).toEqual('{"foo":"bar"}');
                });
                it('$data misc', async function () {
                    this.element.$data = {
                        struct: {
                            scalar: '',
                            camelCase: 'a',
                            'kebab-case': 'b',
                            nesting: {
                                childA: 'a',
                                childB: 'a',
                            },
                            array: ['a', 'b', 'c'],
                        },
                        other: '',
                    };
                    expect(this.element.$data()).toEqual({
                        'structScalar': '',
                        'structCamelCase': 'a',
                        'structKebabCase': 'b',
                        'structNestingChildA': 'a',
                        'structNestingChildB': 'a',
                        'structArray-0': 'a',
                        'structArray-1': 'b',
                        'structArray-2': 'c',
                        'structArrayLength': '3',
                        'other': '',
                    });
                    expect(this.element.$data('')).toEqual({
                        'struct': {
                            'scalar': '',
                            'camel': {'case': 'a'},
                            'kebab': {'case': 'b'},
                            'nesting': {
                                'child': {
                                    'a': 'a',
                                    'b': 'a',
                                },
                            },
                            'array': ['a', 'b', 'c'],
                        },
                        'other': '',
                    });
                    expect(this.element.$data('struct')).toEqual({
                        'scalar': '',
                        'camel': {'case': 'a'},
                        'kebab': {'case': 'b'},
                        'nesting': {
                            'child': {
                                'a': 'a',
                                'b': 'a',
                            },
                        },
                        'array': ['a', 'b', 'c'],
                    });
                    expect(this.element.$data('structNesting')).toEqual({
                        'child': {
                            'a': 'a',
                            'b': 'a',
                        },
                    });
                    expect(this.element.$data('notfound')).toEqual({});
                    expect(this.element.$data('structNotFound')).toEqual({});

                    expect(this.element.$data.$).toEqual({
                        'struct': {
                            'scalar': '',
                            'camel': {'case': 'a'},
                            'kebab': {'case': 'b'},
                            'nesting': {
                                'child': {
                                    'a': 'a',
                                    'b': 'a',
                                },
                            },
                            'array': ['a', 'b', 'c'],
                        },
                        'other': '',
                    });
                    expect(this.element.$data.$struct).toEqual({
                        'scalar': '',
                        'camel': {'case': 'a'},
                        'kebab': {'case': 'b'},
                        'nesting': {
                            'child': {
                                'a': 'a',
                                'b': 'a',
                            },
                        },
                        'array': ['a', 'b', 'c'],
                    });
                    expect(this.element.$data.$structNesting).toEqual({
                        'child': {
                            'a': 'a',
                            'b': 'a',
                        },
                    });

                    this.element.$data.$json = {
                        'array': ['a', 'b', 'c'],
                    };
                    expect(this.element.getAttribute('data-json')).toEqual('{"array":["a","b","c"]}');
                    expect(this.element.$data.$json).toEqual({
                        'array': ['a', 'b', 'c'],
                    });
                });
                it('$style', async function () {
                    expect('hoge' in this.element.$style).toEqual(false);
                    expect('color' in this.element.$style).toEqual(false);

                    this.element.$style.hoge = 'hoge';
                    expect('hoge' in this.element.$style).toEqual(false);
                    expect(this.element.$style.hoge).toEqual(undefined);

                    this.element.$style.color = 'blue';
                    expect('color' in this.element.$style).toEqual(true);
                    expect(this.element.$style.color).toEqual('blue');

                    this.element.$style.color = () => undefined;
                    expect(this.element.$style.color).toEqual('blue');

                    expect(this.element.$style({display: 'block'})).toBe(this.element.$style);
                    expect('color' in this.element.$style).toEqual(true);
                    expect(this.element.$style.color).toEqual('blue');
                    expect(this.element.$style.display).toEqual('block');

                    delete this.element.$style.color;
                    expect('color' in this.element.$style).toEqual(false);
                    expect(this.element.$style.color).toEqual(null);

                    this.element.$style = {margin: '0px!important'};
                    expect('color' in this.element.$style).toEqual(false);
                    expect(this.element.$style.color).toEqual(null);
                    expect('display' in this.element.$style).toEqual(false);
                    expect(this.element.$style.display).toEqual(null);
                    expect(this.element.$style.margin).toEqual('0px');

                    expect(this.element.$style()).toEqual({
                        'margin-top': '0px',
                        'margin-right': '0px',
                        'margin-bottom': '0px',
                        'margin-left': '0px',
                    });
                    expect(this.element.$style(true)).toEqual({
                        'margin-top': '0px!important',
                        'margin-right': '0px!important',
                        'margin-bottom': '0px!important',
                        'margin-left': '0px!important',
                    });

                    expect(this.element.$style + '').toEqual('margin: 0px !important;');
                    expect(this.element.$style.toString()).toEqual('margin: 0px !important;');
                });
                it('$style misc', async function () {
                    expect(this.element.$style['--css-var']).toEqual('123');
                    expect(this.element.$style['--cssVar']).toEqual('123');

                    this.element.$style.backgroundColor = 'red';
                    expect(this.element.$style.backgroundColor).toEqual('red');

                    this.element.$style = {backgroundColor: 'red!important'};
                    expect(this.element.$style.backgroundColor).toEqual('red');
                    expect(this.element.$style.getPropertyPriority('background-color')).toEqual('important');

                    expect(this.child.$style.fontSize).toEqual(null);
                    expect(this.child.$style.$fontSize).toEqual('16px');
                    expect(['13.3333px', '14px'].includes(this.parent.$style['$fontSize::after'])).toBe(true);
                });
                it('$class', async function () {
                    expect('hoge' in this.element.$class).toEqual(false);

                    this.element.$class.hoge = true;
                    expect('hoge' in this.element.$class).toEqual(true);
                    expect(this.element.$class.hoge).toEqual(true);

                    this.element.$class.hoge = () => undefined;
                    expect(this.element.$class.hoge).toEqual(true);

                    expect(this.element.$class({fuga: true})).toBe(this.element.$class);
                    expect('hoge' in this.element.$class).toEqual(true);
                    expect(this.element.$class.hoge).toEqual(true);
                    expect(this.element.$class.fuga).toEqual(true);

                    delete this.element.$class.hoge;
                    expect('hoge' in this.element.$class).toEqual(false);
                    expect(this.element.$class.hoge).toEqual(false);

                    this.element.$class = {piyo: true};
                    expect('hoge' in this.element.$class).toEqual(false);
                    expect(this.element.$class.hoge).toEqual(false);
                    expect('fuga' in this.element.$class).toEqual(false);
                    expect(this.element.$class.fuga).toEqual(false);
                    expect(this.element.$class.piyo).toEqual(true);

                    this.element.$class = function () {
                        return {foo: 'bar'};
                    };
                    expect('piyo' in this.element.$class).toEqual(false);
                    expect(this.element.$class.piyo).toEqual(false);
                    expect(this.element.$class.foo).toEqual(true);

                    expect(this.element.$class()).toEqual(['foo']);
                    expect(this.element.$class + '').toEqual('foo');
                    expect(this.element.$class.toString()).toEqual('foo');
                });
                it('$class misc', async function () {
                    this.element.$class = [
                        'a b c',
                        ['d', {e: true, f: false}],
                        {
                            ok: true,
                            ng: false,
                        },
                    ];
                    expect(this.element.classList.value).toEqual('a b c d e ok');

                    this.element.$class.add = true;
                    this.element.$class.toggle = true;
                    this.element.$class.remove = true;
                    this.element.$class.add('x', 'y', 'z');
                    this.element.$class.toggle('x', false);
                    this.element.$class.toggle('y', true);
                    this.element.$class.toggle('z');
                    this.element.$class.remove('ok');
                    this.element.$class.toggle('conditional', function (node, i) {
                        return node.tagName === 'SPAN';
                    });
                    expect(this.element.classList.value).toEqual('a b c d e add toggle remove y conditional');

                    this.elements.$class.add(function (node, i) {
                        return node.tagName === 'SELECT' ? `c-${i}` : 'none';
                    });
                    this.elements.$class.toggle('conditional', function (node, i) {
                        return node.tagName === 'INPUT';
                    });
                    expect(this.elements[0].$class + '').toEqual('none conditional');
                    expect(this.elements[1].$class + '').toEqual('c-1');
                    expect(this.elements[2].$class + '').toEqual('none');
                });
                it('$isMetadataContent', async function () {
                    expect(d$('div').$isMetadataContent).toEqual(false);
                    expect(d$('template').$isMetadataContent).toEqual(true);
                    expect(d$('script').$isMetadataContent).toEqual(true);
                    expect(d$('style').$isMetadataContent).toEqual(true);
                });
                it('$outerTag', async function () {
                    expect($('<section>content<div>child</div></section>').$outerTag(true)).toEqual('<section></section>');
                    expect($('<section title="hoge">content<div>child</div></section>').$outerTag(false)).toEqual('<section title="hoge">');
                });
                it('$markText', async function () {
                    const target = $('<div>context1<span>context2<span>context3</span></span><template>context</template></div>');

                    target.$markText('context', $('<b class="marker"></b>'));
                    expect(target + '').toEqual('<div><b class="marker">context</b>1<span><b class="marker">context</b>2<span><b class="marker">context</b>3</span></span><template>context</template></div>');

                    target.$markText('text', $('<b class="marker"></b>'));
                    expect(target + '').toEqual('<div><b class="marker">context</b>1<span><b class="marker">context</b>2<span><b class="marker">context</b>3</span></span><template>context</template></div>');

                    target.$$('.marker').$unwrapChildren();
                    target.$markText('text', $('<b class="marker"></b>'), 'span');
                    expect(target + '').toEqual('<div>con<b class="marker">text</b>1<span>context2<span>context3</span></span><template>context</template></div>');
                });
            });

            describe('HTMLElement', function () {
                const margin = 3;
                const border = 5;
                const padding = 7;

                beforeEach(function () {
                    this.box = $(`<div style="position:absolute;top:2px;left:2px;">
                        <div class="box" style="margin:${margin}px; border:red ${border}px solid; padding:${padding}px; width:200px; overflow:scroll; scrollbar-width:thin; position:relative; top:1px; left:1px;">
                            <div style="font-family:Arial!important;">
                                <span style="margin:${margin}px; border:red ${border}px solid; padding:${padding}px;font-family:Arial!important;">a<br>bb<br>ccc</span>
                                <div style="box-sizing:border-box; width:500px;font-family:Arial!important;"> zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz</div>
                            </div>
                        </div>
                    </div>`);

                    document.body.append(this.box);
                });
                afterEach(function () {
                    this.box.remove();
                });

                it('$cssPixel', async function () {
                    expect(this.box.$cssPixel(10)).toBeCloseTo(10);
                    expect(this.box.$cssPixel('10px')).toBeCloseTo(10);

                    expect(this.box.$cssPixel('10in')).toBeCloseTo(960);
                    expect(this.box.$cssPixel('10pc')).toBeCloseTo(160);
                    expect(this.box.$cssPixel('10pt')).toBeCloseTo(13.33);

                    expect(this.box.$cssPixel('25.4cm')).toBeCloseTo(960.0);
                    expect(this.box.$cssPixel('25.4mm')).toBeCloseTo(96.0);
                    expect(this.box.$cssPixel('25.4Q')).toBeCloseTo(24.0);

                    this.box.style.fontSize = '24px';
                    expect(this.box.$cssPixel('10em')).toBeCloseTo(240);
                });
                it('$offset', async function () {
                    expect(this.box.$('div').$offset({})).toEqual({left: 3, top: 3});
                    expect(this.box.$('div').$offset({margin: true})).toEqual({left: 6, top: 6});
                    expect(this.box.$('div').$offset({relative: true})).toEqual({left: 1, top: 1});
                    expect(this.box.$('div').$offset({relative: true, margin: true})).toEqual({left: 4, top: 4});
                });
                const cit = window.navigator.userAgent.includes('Chrome') ? window.it : window.xit;
                cit('get $width/$height', async function () {
                    const wsb = Math.ceil((this.box.$('div').offsetWidth - this.box.$('div').clientWidth) / 2);
                    const hsb = Math.ceil((this.box.$('div').offsetHeight - this.box.$('div').clientHeight) / 2);

                    let width = 200;
                    expect(this.box.$('div').$width({})).toEqual(width - wsb);
                    expect(this.box.$('div').$width({scrollbar: true})).toEqual(width);
                    expect(this.box.$('div').$width({scrollbar: true, padding: true})).toEqual(width += padding * 2);
                    expect(this.box.$('div').$width({scrollbar: true, padding: true, border: true})).toEqual(width += border * 2);
                    expect(this.box.$('div').$width({scrollbar: true, padding: true, border: true, margin: true})).toEqual(width += margin * 2);

                    let height = 116;
                    expect(this.box.$('div').$height({})).toEqual(height);
                    expect(this.box.$('div').$height({scrollbar: true})).toEqual(height += hsb);
                    expect(this.box.$('div').$height({scrollbar: true, padding: true})).toEqual(height += padding * 2);
                    expect(this.box.$('div').$height({scrollbar: true, padding: true, border: true})).toBeCloseTo(height += border * 2, 0);
                    expect(this.box.$('div').$height({scrollbar: true, padding: true, border: true, margin: true})).toBeCloseTo(height += margin * 2, 0);

                    expect(this.box.$('span').$size({})).toEqual({width: 27, height: 78});
                    expect(this.box.$('span').$size({scrollbar: true})).toEqual({width: 27, height: 78});
                    expect(this.box.$('span').$size('')).toEqual({width: 27, height: 78});
                    expect(this.box.$('span').$size({scrollbar: true, padding: true})).toEqual({width: 34, height: 92});
                    expect(this.box.$('span').$size('inner')).toEqual({width: 34, height: 92});
                    expect(this.box.$('span').$size({scrollbar: true, padding: true, border: true})).toEqual({width: 39, height: 102.21875});
                    expect(this.box.$('span').$size('outer')).toEqual({width: 39, height: 102.21875});
                    expect(this.box.$('span').$size({scrollbar: true, padding: true, border: true, margin: true})).toEqual({width: 45, height: 108.21875});
                    expect(this.box.$('span').$size('margin')).toEqual({width: 45, height: 108.21875});
                });
                cit('set $width/$height', async function () {
                    this.box.$('div').style.boxSizing = 'content-box';
                    expect(this.box.$('div').$width(500)).toEqual(476);
                    expect(this.box.$('div').$width({scrollbar: true, padding: true, border: true})).toEqual(500);
                    expect(this.box.$('div').$height(500)).toEqual(475.5625);
                    expect(this.box.$('div').$height({padding: true, border: true})).toEqual(499.5625);

                    this.box.$('div').style.boxSizing = 'border-box';
                    expect(this.box.$('div').$width(500)).toEqual(500);
                    expect(this.box.$('div').$width({scrollbar: true})).toEqual(500);
                    expect(this.box.$('div').$height(500)).toEqual(500);
                    expect(this.box.$('div').$height({})).toEqual(500);
                });
                it('$willChange', async function () {
                    this.box.$willChange('transform');
                    this.box.$willChange('opacity', 100);
                    expect(this.box.$style.willChange).toEqual('opacity, transform');
                    await sleep(200);
                    expect(this.box.$style.willChange).toEqual(null);
                });
            });

            describe('HTMLTemplateElement', function () {
                beforeEach(function () {
                    this.container = $(`<div>
                        <table>
                            <template data-slot-name="tr">
                                <tr data-id="\${this.$index}" data-logical1="\${this.$first}" data-logical2="\${this.$last}">
                                    <template data-slot-name="td">
                                        <td>
                                            td [<template data-slot-name="texts">"\${this.$parent.$parent.$index}/\${this.$parent.$index}/\${this.$index} \${this}",</template>]
                                        </td>
                                    </template>
                                </tr>
                            </template>
                        </table>
                        <ul>
                            <template data-slot-name="li">
                                <li data-index="\${this.$index}">\${this}</li>
                            </template>
                        </ul>
                    </div>`);
                    this.templateTr = this.container.$('[data-slot-name="tr"]');
                    this.templateLi = this.container.$('[data-slot-name="li"]');
                    document.body.append(this.container);
                });
                afterEach(function () {
                    this.container.remove();
                });

                it('$render.tr', async function () {
                    this.templateTr.$render([
                        {
                            td: {
                                texts: ['simple', '<b>escaped</b>'],
                            },
                        },
                        {
                            td: [
                                {
                                    texts: [$('<b>no escaped</b>')],
                                },
                                {
                                    texts: new Error('<b>no escaped</b>'),
                                },
                                {/* empty */},
                            ],
                        },
                    ], {
                        escape: (v) => `a${v}z`,
                        insert: 'before',
                    });
                    expect(this.container.$('table').outerHTML).toContain(`<tr data-id="a0z" data-logical1="">`);
                    expect(this.container.$('table').outerHTML).toContain(`<tr data-id="a1z" data-logical2="">`);
                    expect(this.container.$('table').outerHTML).toContain(`td ["a0z/a0z/a0z asimplez","a0z/a0z/a1z a<b>escaped</b>z",]`);
                    expect(this.container.$('table').outerHTML).toContain(`td ["a1z/a0z/a0z <b>no escaped</b>",]`);
                    expect(this.container.$('table').outerHTML).toContain(`td ["a1z/a1z/a0z Error: <b>no escaped</b>",]`);
                    expect(this.container.$('table').outerHTML).toContain(`td []`);

                    this.templateTr.$render([
                        {
                            td: {
                                texts: ['simple', '<b>escaped</b>', $('<b>no escaped</b>')],
                            },
                        },
                    ]);
                    expect(this.container.$('table').outerHTML).toContain(`<tr data-id="0" data-logical1="" data-logical2="">`);
                    expect(this.container.$('table').outerHTML).toContain(`td ["0/0/0 simple","0/0/1 &lt;b&gt;escaped&lt;/b&gt;","0/0/2 <b>no escaped</b>",]`);
                });
                it('$render.li', async function () {
                    this.templateLi.$render(['hoge', 'fuga']);
                    expect(this.container.$('ul').outerHTML).toContain(`<li data-index="0">hoge</li>`);
                    expect(this.container.$('ul').outerHTML).toContain(`<li data-index="1">fuga</li>`);
                });
            });

            describe('HTMLAnchorElement', function () {
                beforeEach(function () {
                    this.anchor = $('<a href="response.php?a=A&b=B" download="response.json"></a>');
                    this.form = $('<form method="get"><input name="form" value="form"></form>');
                    this.iframe = $('<iframe name="form-target"></iframe>');
                    document.body.append(this.anchor);
                    document.body.append(this.form);
                    document.body.append(this.iframe);
                });
                afterEach(function () {
                    this.anchor.remove();
                    this.form.remove();
                    this.iframe.remove();
                });

                it('$URL', async function () {
                    const url = this.anchor.$URL;
                    url.searchParams.set('a', 'a2');
                    url.searchParams.delete('b');
                    url.searchParams.append('x', 'X');
                    url.pathname = 'path2';
                    url.port = '8080';
                    this.anchor.$URL = url;
                    expect(this.anchor.href).toContain(':8080/path2?a=a2&x=X');
                });
                it('$submit', async function () {
                    this.anchor.$attrs.download = false;
                    this.anchor.target = 'form-target';

                    this.anchor.$submit({raw: true});
                    await sleep(200);
                    expect(JSON.parse(this.iframe.contentWindow.document.body.innerText)).toEqual({
                        method: 'POST',
                        get: {},
                        post: {
                            a: 'A',
                            b: 'B',
                        },
                        files: {},
                        body: 'a=A&b=B',
                    });
                });
                it('$submit.download', async function () {
                    let response;

                    response = await (await this.anchor.$submit({raw: true})).json();
                    expect(response).toEqual({
                        method: 'POST',
                        get: {},
                        post: {
                            a: 'A',
                            b: 'B',
                        },
                        files: {},
                        body: 'a=A&b=B',
                    });

                    response = await (await this.anchor.$submit({raw: true, form: this.form})).json();
                    expect(response).toEqual({
                        method: 'GET',
                        get: {
                            form: 'form',
                            a: 'A',
                            b: 'B',
                        },
                        post: {},
                        files: {},
                        body: '',
                    });

                    response = await (await this.anchor.$submit({raw: true, form: this.form, method: 'post'})).json();
                    expect(response).toEqual({
                        method: 'POST',
                        get: {},
                        post: {
                            form: 'form',
                            a: 'A',
                            b: 'B',
                        },
                        files: {},
                        body: 'form=form&a=A&b=B',
                    });
                });
            });

            describe('HTMLInputElement', function () {
                beforeEach(function () {
                    this.checkboxes = $(`<input class="test-total-checkbox" type="checkbox">
                    <input class="test-parent1-checkbox" type="checkbox">
                      <input class="test-child1-checkbox" type="checkbox">
                      <input class="test-child1-checkbox" type="checkbox">
                    <input class="test-parent2-checkbox" type="checkbox">
                      <input class="test-child2-checkbox" type="checkbox">
                      <input class="test-child2-checkbox" type="checkbox">
                    `);
                    document.body.append(...this.checkboxes);
                });
                afterEach(function () {
                    this.checkboxes.remove();
                });

                it('$interlock', async function () {
                    const total = this.checkboxes.$matches('.test-total-checkbox');
                    const parent1 = this.checkboxes.$matches('.test-parent1-checkbox');
                    const parent2 = this.checkboxes.$matches('.test-parent2-checkbox');
                    const child1s = this.checkboxes.$filter('.test-child1-checkbox');
                    const child2s = this.checkboxes.$filter('.test-child2-checkbox');
                    
                    total.$interlock('.test-parent1-checkbox,.test-parent2-checkbox');
                    parent1.$interlock('.test-child1-checkbox');
                    parent2.$interlock('.test-child2-checkbox');

                    parent1.checked = true;
                    parent1.$trigger('change');

                    expect(total.checked).toEqual(false);
                    expect(total.indeterminate).toEqual(true);
                    expect(child1s.checked).toEqual([true, true]);

                    parent2.checked = true;
                    parent2.$trigger('change');

                    expect(total.checked).toEqual(true);
                    expect(total.indeterminate).toEqual(false);
                    expect(child2s.checked).toEqual([true, true]);

                    child1s[0].checked = false;
                    child1s[0].$trigger('change');

                    expect(total.indeterminate).toEqual(false);
                    expect(parent1.checked).toEqual(true);
                    expect(parent1.indeterminate).toEqual(true);

                    child2s.checked = false;
                    child2s.$trigger('change');

                    expect(total.indeterminate).toEqual(true);
                    expect(parent2.checked).toEqual(false);
                    expect(parent2.indeterminate).toEqual(false);
                });
            });

            describe('HTMLImageElement', function () {
                beforeEach(function () {
                    this.image = $('<img alt="" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAK0lEQVRYw+3OIQEAAAwEoetfeovxBoGnq1tKQEBAQEBAQEBAQEBAQEBgHXhUDfhqTClFmgAAAABJRU5ErkJggg==">');
                    document.body.append(this.image);
                });
                afterEach(function () {
                    this.image.remove();
                });

                it('$dataURL', async function () {
                    await sleep(100); // wait img load
                    const dataURL = await this.image.$dataURL();
                    expect(dataURL).toContain('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAA');
                });
                it('$blob', async function () {
                    await sleep(100); // wait img load
                    const blob = await this.image.$blob();
                    expect(blob instanceof Blob).toEqual(true);
                });
            });

            describe('HTMLDialogElement', function () {
                beforeEach(function () {
                    this.dialog = $('<dialog></dialog>');
                    document.body.append(this.dialog);
                });
                afterEach(function () {
                    this.dialog.remove();
                });

                it('$showModal/$modalElement', async function () {
                    expect(document.$modalElement).toEqual(null);
                    expect(document.$topLayerElement).toEqual(null);

                    setTimeout(() => {
                        this.dialog.close('answer');
                    }, 100);
                    const p1 = this.dialog.$showModal();
                    expect(document.$modalElement).toEqual(this.dialog);
                    expect(document.$topLayerElement).toEqual(this.dialog);
                    expect(await p1).toEqual('answer');

                    setTimeout(() => {
                        this.dialog.dispatchEvent(new MouseEvent('click', {clientX: 0, clientY: 0}));
                    }, 100);
                    const p2 = this.dialog.$showModal({outside: true});
                    expect(document.$modalElement).toEqual(this.dialog);
                    expect(document.$topLayerElement).toEqual(this.dialog);
                    expect(await p2).toEqual(null);

                    // not close on untrust event
                    // setTimeout(() => {
                    //     this.dialog.dispatchEvent(new KeyboardEvent('keydown', {code: 'Escape'}));
                    // }, 100);
                    // expect(await this.dialog.$showModalAsync({escape: true})).toEqual(null);
                });
            });

            describe('HTMLInputElement', function () {
                beforeEach(function () {
                    this.form = $(`<form>
                        <span>dummy</span>
                        <input type="checkbox">
                        <input name="checkbox" type="checkbox" value="ca">
                        <input name="checkbox" type="checkbox" value="cb">
                        <input name="radio" type="radio" value="ra">
                        <input name="radio" type="radio" value="rb">
                        
                        <input id="datetime-nostep"  type="datetime-local" step="">
                        <input id="datetime-step2"   type="datetime-local" step="2">
                        <input id="datetime-step0-1" type="datetime-local" step="0.1">
                        <input id="date" type="date" step="">
                        <input id="time-nostep"  type="time" step="">
                        <input id="time-step2"   type="time" step="2">
                        <input id="time-step0-1" type="time" step="0.1">
                        <input id="month" type="month" step="">
                        <input id="week" type="week" step="">
                    <form>`);
                });

                it('$valueAsDate', async function () {
                    const format = function (date) {
                        return date.toLocaleString('sv-SE') + '.' + ('' + date.getMilliseconds()).padStart(3, '0');
                    };
                    let target;

                    target = this.form.$('#datetime-nostep');
                    expect(target.$valueAsDate).toEqual(null);
                    expect(target.$valueAsNumber).toEqual(Number.NaN);
                    target.$valueAsDate = new Date('2014-12-24 12:34:56.789');
                    expect(target.value).toEqual('2014-12-24T12:34');
                    expect(format(target.$valueAsDate)).toEqual('2014-12-24 12:34:00.000');
                    target.$valueAsNumber = 1419392096789;
                    expect(target.value).toEqual('2014-12-24T12:34');
                    expect(target.$valueAsNumber).toEqual(1419392040000);

                    target = this.form.$('#datetime-step2');
                    expect(target.$valueAsDate).toEqual(null);
                    expect(target.$valueAsNumber).toEqual(Number.NaN);
                    target.$valueAsDate = new Date('2014-12-24 12:34:56.789');
                    expect(target.value).toEqual('2014-12-24T12:34:56');
                    expect(format(target.$valueAsDate)).toEqual('2014-12-24 12:34:56.000');
                    target.$valueAsNumber = 1419392096789;
                    expect(target.value).toEqual('2014-12-24T12:34:56');
                    expect(target.$valueAsNumber).toEqual(1419392096000);

                    target = this.form.$('#datetime-step0-1');
                    expect(target.$valueAsDate).toEqual(null);
                    expect(target.$valueAsNumber).toEqual(Number.NaN);
                    target.$valueAsDate = new Date('2014-12-24 12:34:56.789');
                    expect(target.value).toEqual('2014-12-24T12:34:56.789');
                    expect(format(target.$valueAsDate)).toEqual('2014-12-24 12:34:56.789');
                    target.$valueAsNumber = 1419392096789;
                    expect(target.value).toEqual('2014-12-24T12:34:56.789');
                    expect(target.$valueAsNumber).toEqual(1419392096789);

                    target = this.form.$('#date');
                    expect(target.$valueAsDate).toEqual(null);
                    expect(target.$valueAsNumber).toEqual(Number.NaN);
                    target.$valueAsDate = new Date('2014-12-24 12:34:56.789');
                    expect(target.value).toEqual('2014-12-24');
                    expect(format(target.$valueAsDate)).toEqual('2014-12-24 00:00:00.000');
                    target.$valueAsNumber = 1419392096789;
                    expect(target.value).toEqual('2014-12-24');
                    expect(target.$valueAsNumber).toEqual(1419346800000);

                    target = this.form.$('#time-nostep');
                    expect(target.$valueAsDate).toEqual(null);
                    expect(target.$valueAsNumber).toEqual(Number.NaN);
                    target.$valueAsDate = new Date('2014-12-24 12:34:56.789');
                    expect(target.value).toEqual('12:34');
                    expect(format(target.$valueAsDate)).toEqual('1970-01-01 12:34:00.000');
                    target.$valueAsNumber = 1419392096789;
                    expect(target.value).toEqual('12:34');
                    expect(target.$valueAsNumber).toEqual(12840000);

                    target = this.form.$('#time-step2');
                    expect(target.$valueAsDate).toEqual(null);
                    expect(target.$valueAsNumber).toEqual(Number.NaN);
                    target.$valueAsDate = new Date('2014-12-24 12:34:56.789');
                    expect(target.value).toEqual('12:34:56');
                    expect(format(target.$valueAsDate)).toEqual('1970-01-01 12:34:56.000');
                    target.$valueAsNumber = 1419392096789;
                    expect(target.value).toEqual('12:34:56');
                    expect(target.$valueAsNumber).toEqual(12896000);

                    target = this.form.$('#time-step0-1');
                    expect(target.$valueAsDate).toEqual(null);
                    expect(target.$valueAsNumber).toEqual(Number.NaN);
                    target.$valueAsDate = new Date('2014-12-24 12:34:56.789');
                    expect(target.value).toEqual('12:34:56.789');
                    expect(format(target.$valueAsDate)).toEqual('1970-01-01 12:34:56.789');
                    target.$valueAsNumber = 1419392096789;
                    expect(target.value).toEqual('12:34:56.789');
                    expect(target.$valueAsNumber).toEqual(12896789);

                    target = this.form.$('#month');
                    expect(target.$valueAsDate).toEqual(null);
                    expect(target.$valueAsNumber).toEqual(Number.NaN);
                    target.$valueAsDate = new Date('2014-12-24 12:34:56.789');
                    expect(target.value).toEqual('2014-12');
                    expect(format(target.$valueAsDate)).toEqual('2014-12-01 00:00:00.000');
                    target.$valueAsNumber = 1419392096789;
                    expect(target.value).toEqual('2014-12');
                    expect(target.$valueAsNumber).toEqual(1417359600000);

                    target = this.form.$('#week');
                    expect(target.$valueAsDate).toEqual(null);
                    expect(target.$valueAsNumber).toEqual(Number.NaN);
                    target.$valueAsDate = new Date('2014-12-24 12:34:56.789');
                    expect(target.value).toEqual('2014-W52');
                    expect(format(target.$valueAsDate)).toEqual('2014-12-22 00:00:00.000');
                    target.$valueAsNumber = 1419392096789;
                    expect(target.value).toEqual('2014-W52');
                    expect(target.$valueAsNumber).toEqual(1419174000000);
                });
                it('$indeterminate/checkbox', async function () {
                    const allCheckbox = this.form.$('[type="checkbox"]:not([name])');
                    const checkbox = this.form.$$('[name="checkbox"], span');

                    expect(allCheckbox.$indeterminate).toEqual(false);
                    expect(allCheckbox.checked).toEqual(false);
                    expect(checkbox.$indeterminate).toEqual([
                        undefined,
                        false,
                        false,
                    ]);

                    allCheckbox.$indeterminate = true;
                    expect(allCheckbox.$indeterminate).toEqual(true);
                    expect(allCheckbox.checked).toEqual(false);

                    allCheckbox.$indeterminate = [null, undefined];
                    expect(allCheckbox.$indeterminate).toEqual(false);
                    expect(allCheckbox.checked).toEqual(false);

                    allCheckbox.$indeterminate = [false, null, false];
                    expect(allCheckbox.$indeterminate).toEqual(false);
                    expect(allCheckbox.checked).toEqual(false);

                    allCheckbox.$indeterminate = [true, null, true];
                    expect(allCheckbox.$indeterminate).toEqual(false);
                    expect(allCheckbox.checked).toEqual(true);

                    allCheckbox.$indeterminate = [false, null, true];
                    expect(allCheckbox.$indeterminate).toEqual(true);
                    expect(allCheckbox.checked).toEqual(true);
                });
                it('$indeterminate/radio', async function () {
                    const radiolist = this.form.radio;
                    const radio = this.form.$$('[name="radio"], span');

                    expect(radiolist.$indeterminate).toEqual(true);
                    radio[1].checked = false;
                    expect(radiolist.$indeterminate).toEqual(true);
                    radio[1].checked = true;
                    expect(radiolist.$indeterminate).toEqual(false);
                });
            });

            describe('HTMLInputLikeElement', function () {
                beforeEach(function () {
                    this.form = $(`<form>
                        <input name="text" type="text" value="text">
                        <textarea name="textarea">textarea</textarea>
                        <input name="checkbox[]" type="checkbox" value="ca" checked>
                        <input name="checkbox[]" type="checkbox" value="cb">
                        <input name="radio" type="radio" value="ra" checked>
                        <input name="radio" type="radio" value="rb">
                        <select name="select">
                            <option value="sa" selected>A</option>
                            <option value="sb">B</option>
                        </select>
                        <select name="selects[]" multiple>
                            <option value="sa" selected>A</option>
                            <option value="sb">B</option>
                        </select>
                    <form>`);
                });

                it('$defaultValue', async function () {
                    const inputs = this.form.$$('input, textarea, select');

                    expect(inputs.$defaultValue).toEqual([
                        'text',
                        'textarea',
                        'ca',
                        null,
                        'ra',
                        null,
                        'sa',
                        ['sa'],
                    ]);

                    inputs.$defaultValue = '';
                    expect(inputs.$defaultValue).toEqual([
                        '',
                        '',
                        null,
                        null,
                        null,
                        null,
                        null,
                        [],
                    ]);

                    inputs.$defaultValue = 'tb';
                    expect(inputs.$defaultValue).toEqual([
                        'tb',
                        'tb',
                        null,
                        null,
                        null,
                        null,
                        null,
                        [],
                    ]);

                    inputs.$defaultValue = 'cb';
                    expect(inputs.$defaultValue).toEqual([
                        'cb',
                        'cb',
                        null,
                        'cb',
                        null,
                        null,
                        null,
                        [],
                    ]);

                    inputs.$defaultValue = 'rb';
                    expect(inputs.$defaultValue).toEqual([
                        'rb',
                        'rb',
                        null,
                        null,
                        null,
                        'rb',
                        null,
                        [],
                    ]);

                    inputs.$defaultValue = 'sb';
                    expect(inputs.$defaultValue).toEqual([
                        'sb',
                        'sb',
                        null,
                        null,
                        null,
                        null,
                        'sb',
                        ['sb'],
                    ]);
                });
                it('$value/$clear', async function () {
                    const inputs = this.form.$$('input, textarea, select');

                    expect(inputs.$value).toEqual([
                        'text',
                        'textarea',
                        'ca',
                        null,
                        'ra',
                        null,
                        'sa',
                        ['sa'],
                    ]);

                    inputs.$value = 'rb';
                    expect(inputs.$value).toEqual([
                        'rb',
                        'rb',
                        null,
                        null,
                        null,
                        'rb',
                        null,
                        [],
                    ]);

                    inputs.$value = 'sb';
                    expect(inputs.$value).toEqual([
                        'sb',
                        'sb',
                        null,
                        null,
                        null,
                        null,
                        'sb',
                        ['sb'],
                    ]);

                    inputs.$clear();
                    expect(inputs.$value).toEqual([
                        '',
                        '',
                        null,
                        null,
                        null,
                        null,
                        null,
                        [],
                    ]);
                });
                it('$resetAttribute', async function () {
                    const inputs = this.form.$$('input, textarea, select');

                    inputs[0].$value = 'X';
                    inputs[1].$value = 'Y';
                    inputs[2].$value = 'cb';
                    inputs[3].$value = 'cb';
                    inputs[4].$value = 'rb';
                    inputs[5].$value = 'rb';
                    inputs[6].$value = 'sb';
                    inputs[7].$value = 'sb';
                    expect(inputs.$value).toEqual([
                        'X',
                        'Y',
                        null,
                        'cb',
                        null,
                        'rb',
                        'sb',
                        ['sb'],
                    ]);
                    inputs.$resetAttribute();
                    expect(this.form.innerHTML.trim()).toEqual(`
                        <input name="text" type="text" value="X">
                        <textarea name="textarea">Y</textarea>
                        <input name="checkbox[]" type="checkbox" value="ca">
                        <input name="checkbox[]" type="checkbox" value="cb" checked="">
                        <input name="radio" type="radio" value="ra">
                        <input name="radio" type="radio" value="rb" checked="">
                        <select name="select">
                            <option value="sa">A</option>
                            <option value="sb" selected="">B</option>
                        </select>
                        <select name="selects[]" multiple="">
                            <option value="sa">A</option>
                            <option value="sb" selected="">B</option>
                        </select>
                    `.trim());
                });
            });

            describe('HTMLOptionalElement', function () {
                beforeEach(function () {
                    this.single = $(`<select>
                        <option value="a" selected>A</option>
                        <option value="b">B</option>
                        <option value="c">C</option>
                    </select>`);
                    this.multiple = $(`<select multiple>
                        <option value="a" selected>A</option>
                        <option value="b">B</option>
                        <option value="c" selected>C</option>
                    </select>`);
                    this.datalist = $(`<datalist>
                        <option value="a">A</option>
                        <option value="b">B</option>
                        <option value="c">C</option>
                    </datalist>`);
                });

                it('$options', async function () {
                    const strip = function (node) {
                        [...node.childNodes].filter(n => n.nodeType !== Node.ELEMENT_NODE).map(n => n.remove());
                        return node;
                    };

                    expect(strip(this.single.$options({
                        a: 'A',
                        x: 'X',
                    })).innerHTML).toEqual(`
                        <option value="a" selected="">A</option>
                        <hr class="kQuery-option-separator">
                        <option value="x" title="X">X</option>
                    `.replaceAll(/\n\s+/g, ''));

                    expect(strip(this.single.$options({
                        x: 'X',
                    })).innerHTML).toEqual(`
                        <option value="a" selected="">A</option>
                        <hr class="kQuery-option-separator">
                        <option value="x" title="X">X</option>
                    `.replaceAll(/\n\s+/g, ''));

                    expect(strip(this.single.$options({
                        y: 'Y',
                    }, true)).innerHTML).toEqual(`<option value="y" title="Y">Y</option>`);

                    expect(strip(this.multiple.$options({
                        a: 'A',
                        x: 'X',
                    })).innerHTML).toEqual(`
                        <option value="a" selected="">A</option>
                        <option value="c" selected="">C</option>
                        <hr class="kQuery-option-separator">
                        <option value="x" title="X">X</option>
                    `.replaceAll(/\n\s+/g, ''));

                    expect(strip(this.datalist.$options({
                        a: 'A',
                        x: 'X',
                    })).innerHTML).toEqual(`
                        <option value="a" title="A">A</option>
                        <option value="x" title="X">X</option>
                    `.replaceAll(/\n\s+/g, ''));

                    expect(strip(this.datalist.$options({
                        a: {label: 'A', title: 'AAA'},
                        x: {label: 'X', 'data-custom': 'custom'},
                    })).innerHTML).toEqual(`
                        <option label="A" title="AAA" value="a">A</option>
                        <option label="X" data-custom="custom" value="x" title="X">X</option>
                    `.replaceAll(/\n\s+/g, ''));

                    const options = {
                        y: 'Y',
                        g1: {label: 'G1', optgroup: 'group'},
                        g2: {label: 'G2', optgroup: 'group'},
                        array: [
                            document.$createElement('option', {value: 'a1', label: 'A1'}),
                            document.$createElement('hr'),
                            document.$createElement('option', {value: 'a2', label: 'A2'}),
                        ],
                    };

                    expect(strip(this.multiple.$options(options, false).$resetAttribute()).innerHTML).toEqual(`
                        <option value="y" title="Y">Y</option>
                        <optgroup label="group">
                            <option label="G1" value="g1" title="G1">G1</option>
                            <option label="G2" value="g2" title="G2">G2</option>
                        </optgroup>
                        <optgroup label="array">
                            <option value="a1" label="A1"></option>
                            <hr>
                            <option value="a2" label="A2"></option>
                        </optgroup>
                    `.replaceAll(/\n\s+/g, ''));

                    this.multiple.$value = 'g1';
                    expect(strip(this.multiple.$options(options).$resetAttribute()).innerHTML).toEqual(`
                        <optgroup label="group">
                            <option label="G1" value="g1" title="G1" selected="">G1</option>
                        </optgroup>
                        <hr class="kQuery-option-separator">
                        <option value="y" title="Y">Y</option>
                        <optgroup label="group">
                            <option label="G2" value="g2" title="G2">G2</option>
                        </optgroup>
                        <optgroup label="array">
                            <option value="a1" label="A1"></option>
                            <hr>
                            <option value="a2" label="A2"></option>
                        </optgroup>
                    `.replaceAll(/\n\s+/g, ''));

                    this.multiple.$value = ['g1', 'g2'];
                    expect(strip(this.multiple.$options(options).$resetAttribute()).innerHTML).toEqual(`
                        <optgroup label="group">
                            <option label="G1" value="g1" title="G1" selected="">G1</option>
                            <option label="G2" value="g2" title="G2" selected="">G2</option>
                        </optgroup>
                        <hr class="kQuery-option-separator">
                        <option value="y" title="Y">Y</option>
                        <optgroup label="array">
                            <option value="a1" label="A1"></option>
                            <hr>
                            <option value="a2" label="A2"></option>
                        </optgroup>
                    `.replaceAll(/\n\s+/g, ''));
                });
            });

            describe('HTMLFormElement', function () {
                beforeEach(function () {
                    this.form = $('<form action="response.php"><input name="test" value="test"><output></output></form>');
                    document.body.append(this.form);
                });
                afterEach(function () {
                    this.form.remove();
                });

                it('$URL', async function () {
                    const url = this.form.$URL;
                    url.searchParams.set('a', 'a2');
                    url.searchParams.delete('b');
                    url.searchParams.append('x', 'X');
                    url.pathname = 'path2';
                    url.port = '8080';
                    this.form.$URL = url;
                    expect(this.form.action).toContain(':8080/path2?a=a2&x=X');
                });
                it('$request', async function () {
                    let response;

                    // get
                    response = await (await (this.form.$request({
                        method: 'get',
                        enctype: 'application/x-www-form-urlencoded',
                        data: {
                            file: new File(['hoge'], 'textfile', {type: 'text/plain'}),
                        },
                    }))).json();
                    expect(response).toEqual({
                        method: 'GET',
                        get: {
                            test: 'test',
                            file: '',
                        },
                        post: {},
                        files: {},
                        body: '',
                    });

                    // post(application/x-www-form-urlencoded)
                    response = await (await (this.form.$request({
                        method: 'post',
                        enctype: 'application/x-www-form-urlencoded',
                        data: {
                            file: new File(['hoge'], 'textfile', {type: 'text/plain'}),
                        },
                    }))).json();
                    expect(response).toEqual({
                        method: 'POST',
                        get: {},
                        post: {
                            test: 'test',
                            file: '',
                        },
                        files: {},
                        body: 'test=test&file=',
                    });

                    // post(multipart/form-data)
                    response = await (await (this.form.$request({
                        method: 'post',
                        enctype: 'multipart/form-data',
                        data: {
                            file: new File(['hoge'], 'textfile', {type: 'text/plain'}),
                        },
                    }))).json();
                    expect(response).toEqual({
                        method: 'POST',
                        get: {},
                        post: {
                            test: 'test',
                        },
                        files: {
                            textfile: 'text/plain',
                        },
                        body: '',
                    });

                    // put(application/json)
                    response = await (await (this.form.$request({
                        method: 'put',
                        enctype: 'application/json',
                        data: {
                            file: new File(['hoge'], 'textfile', {type: 'text/plain'}),
                        },
                        fileConverter: 'text',
                    }))).json();
                    expect(response).toEqual({
                        method: 'PUT',
                        get: {},
                        post: {},
                        files: {},
                        body: JSON.stringify({test: 'test', file: 'hoge'}),
                    });
                });
                it('$resetAttribute', async function () {
                    this.form.$('input').value = 'changed';
                    this.form.$resetAttribute();
                    expect(this.form.$('input') + '').toEqual('<input name="test" value="changed">');
                });
            });

            describe('FormData', function () {
                beforeEach(function () {
                    this.textfile = new File(['hoge'], 'textfile', {type: 'text/plain'});
                    this.formdata = new FormData();
                    this.formdata.append('plain', 'plain');
                    this.formdata.append('file', this.textfile);
                    this.formdata.append('nest[]', 'nest1');
                    this.formdata.append('nest[]', 'nest2');
                    this.formdata.append('nestobject[0][a]', 'nestobject0a');
                    this.formdata.append('nestobject[0][b]', 'nestobject0b');
                    this.formdata.append('nestobject[1][a]', 'nestobject1a');
                    this.formdata.append('nestobject[1][b]', 'nestobject1b');
                });

                it('$appendFromEntries/$toSearchParams', async function () {
                    this.formdata.$appendFromEntries(new URLSearchParams([
                        ['addition', 'add-data'],
                        ['nest[]', 'nest3'],
                    ]));
                    const searchParams = this.formdata.$toSearchParams();
                    expect(searchParams + '').toEqual([
                        'plain=plain',
                        'file=',
                        'nest%5B%5D=nest1',
                        'nest%5B%5D=nest2',
                        'nestobject%5B0%5D%5Ba%5D=nestobject0a',
                        'nestobject%5B0%5D%5Bb%5D=nestobject0b',
                        'nestobject%5B1%5D%5Ba%5D=nestobject1a',
                        'nestobject%5B1%5D%5Bb%5D=nestobject1b',
                        'addition=add-data',
                        'nest%5B%5D=nest3',
                    ].join('&'));
                });
                it('$toObject', async function () {
                    const object = this.formdata.$toObject();
                    expect(object).toEqual({
                        plain: 'plain',
                        file: this.textfile,
                        nest: ['nest1', 'nest2'],
                        nestobject: [
                            {
                                a: 'nestobject0a',
                                b: 'nestobject0b',
                            },
                            {
                                a: 'nestobject1a',
                                b: 'nestobject1b',
                            },
                        ],
                    });
                });
                it('$json', async function () {
                    const text = await this.formdata.$json('text');
                    expect(JSON.parse(text)).toEqual({
                        plain: 'plain',
                        file: 'hoge',
                        nest: ['nest1', 'nest2'],
                        nestobject: [
                            {
                                a: 'nestobject0a',
                                b: 'nestobject0b',
                            },
                            {
                                a: 'nestobject1a',
                                b: 'nestobject1b',
                            },
                        ],
                    });

                    const custom = await this.formdata.$json(file => file.name);
                    expect(JSON.parse(custom)).toEqual({
                        plain: 'plain',
                        file: 'textfile',
                        nest: ['nest1', 'nest2'],
                        nestobject: [
                            {
                                a: 'nestobject0a',
                                b: 'nestobject0b',
                            },
                            {
                                a: 'nestobject1a',
                                b: 'nestobject1b',
                            },
                        ],
                    });

                    await expectAsync(this.formdata.$json('unknown')).toBeRejected();
                });
            });

            describe('Blob', function () {
                beforeEach(function () {
                    this.textfile = new File(['hoge'], 'textfile', {type: 'text/plain'});
                    this.htmlfile = new File(['<q id="a"><span id="b">hey!</span></q>'], 'htmlfile', {type: 'text/html'});
                });

                it('$text', async function () {
                    expect(await this.textfile.$text()).toEqual('hoge');
                    expect(await this.htmlfile.$text()).toEqual('<q id="a"><span id="b">hey!</span></q>');
                });
                it('$base64', async function () {
                    expect(await this.textfile.$base64()).toEqual(btoa('hoge'));
                    expect(await this.htmlfile.$base64()).toEqual(btoa('<q id="a"><span id="b">hey!</span></q>'));
                });
                it('$dataURL', async function () {
                    expect(await this.textfile.$dataURL()).toEqual('data:text/plain;base64,' + btoa('hoge'));
                    expect(await this.htmlfile.$dataURL()).toEqual('data:text/html;base64,' + btoa('<q id="a"><span id="b">hey!</span></q>'));
                });
                it('$upload', async function () {
                    const put = await this.textfile.$upload('./response.php', {
                        method: 'put',
                    });
                    expect(await put.json()).toEqual({
                        method: 'PUT',
                        get: {},
                        post: {},
                        files: {},
                        body: 'hoge',
                    });
                    const post = await this.textfile.$upload('./response.php', {
                        method: 'post',
                    });
                    expect(await post.json()).toEqual({
                        method: 'POST',
                        get: {},
                        post: {},
                        files: {
                            textfile: 'text/plain',
                        },
                        body: '',
                    });
                });
            });

            describe('DOMRectReadOnly', function () {
                it('$contains', async function () {
                    const rect = new DOMRect(10, 10, 10, 10);

                    expect(rect.$contains(new DOMPoint(9, 9))).toEqual(false);
                    expect(rect.$contains(new DOMPoint(9, 10))).toEqual(false);
                    expect(rect.$contains(new DOMPoint(10, 9))).toEqual(false);
                    expect(rect.$contains(new DOMPoint(10, 10))).toEqual(true);

                    expect(rect.$contains(new DOMPoint(21, 21))).toEqual(false);
                    expect(rect.$contains(new DOMPoint(21, 20))).toEqual(false);
                    expect(rect.$contains(new DOMPoint(20, 21))).toEqual(false);
                    expect(rect.$contains(new DOMPoint(20, 20))).toEqual(true);

                    expect(rect.$contains(new DOMPoint(15, 21))).toEqual(false);
                    expect(rect.$contains(new DOMPoint(15, 20))).toEqual(true);
                    expect(rect.$contains(new DOMPoint(21, 15))).toEqual(false);
                    expect(rect.$contains(new DOMPoint(20, 15))).toEqual(true);

                    expect(rect.$contains(new DOMRect(0, 0, 9, 9))).toEqual(false);
                    expect(rect.$contains(new DOMRect(9, 9, 10, 10))).toEqual(false);
                    expect(rect.$contains(new DOMRect(11, 11, 10, 10))).toEqual(false);
                    expect(rect.$intersects(new DOMRect(21, 21, 10, 10))).toEqual(false);

                    expect(rect.$contains(new DOMRect(10, 10, 10, 10))).toEqual(true);
                    expect(rect.$contains(new DOMRect(11, 11, 9, 9))).toEqual(true);
                });
                it('$intersects', async function () {
                    const rect = new DOMRect(10, 10, 10, 10);

                    expect(rect.$intersects(new DOMPoint(9, 9))).toEqual(false);
                    expect(rect.$intersects(new DOMPoint(9, 10))).toEqual(false);
                    expect(rect.$intersects(new DOMPoint(10, 9))).toEqual(false);
                    expect(rect.$intersects(new DOMPoint(10, 10))).toEqual(true);

                    expect(rect.$intersects(new DOMPoint(21, 21))).toEqual(false);
                    expect(rect.$intersects(new DOMPoint(21, 20))).toEqual(false);
                    expect(rect.$intersects(new DOMPoint(20, 21))).toEqual(false);
                    expect(rect.$intersects(new DOMPoint(20, 20))).toEqual(true);

                    expect(rect.$intersects(new DOMPoint(15, 21))).toEqual(false);
                    expect(rect.$intersects(new DOMPoint(15, 20))).toEqual(true);
                    expect(rect.$intersects(new DOMPoint(21, 15))).toEqual(false);
                    expect(rect.$intersects(new DOMPoint(20, 15))).toEqual(true);

                    expect(rect.$intersects(new DOMRect(0, 0, 9, 9))).toEqual(false);
                    expect(rect.$intersects(new DOMRect(9, 9, 10, 10))).toEqual(true);
                    expect(rect.$intersects(new DOMRect(11, 11, 10, 10))).toEqual(true);
                    expect(rect.$intersects(new DOMRect(21, 21, 10, 10))).toEqual(false);

                    expect(rect.$intersects(new DOMRect(10, 10, 10, 10))).toEqual(true);
                    expect(rect.$intersects(new DOMRect(11, 11, 9, 9))).toEqual(true);
                });
            });

            describe('List', function () {
                beforeEach(function () {
                    this.nodelist = $('<span>a</span><span>b</span>');
                    this.filelist = Object.setPrototypeOf([
                        new File(['hoge'], 'textfile1', {type: 'text/plain'}),
                        new File(['hogera'], 'textfile2', {type: 'text/html'}),
                    ], FileList.prototype);
                });

                it('File', async function () {
                    expect(this.filelist.name).toEqual(['textfile1', 'textfile2']);
                    expect(this.filelist.size).toEqual([4, 6]);
                    expect(this.filelist.type).toEqual(['text/plain', 'text/html']);
                });
                it('$at', async function () {
                    expect(this.nodelist.$at(0).textContent).toEqual('a');
                    expect(this.nodelist.$at(1).textContent).toEqual('b');
                    expect(this.nodelist.$at(-1).textContent).toEqual('b');

                    expect(this.filelist.$at(0).name).toEqual('textfile1');
                    expect(this.filelist.$at(1).name).toEqual('textfile2');
                    expect(this.filelist.$at(-1).name).toEqual('textfile2');
                });
                it('$asyncMap', async function () {
                    expect(await this.filelist.$asyncMap(e => e.$text())).toEqual(['hoge', 'hogera']);
                });
            });
        });
    }

    if (['all', 'example'].includes(testTarget)) {
        describe('exampletest', function () {
            describe('property', function () {
                beforeEach(function () {
                    this.container = document.$('.property');
                    this.output = this.container.$('.output');
                });

                it('$disable', async function () {
                    this.container.$('.disable').click();
                    expect(this.output.textContent).toContain('<input type="text" disabled="">');
                });
                it('$class', async function () {
                    this.container.$('.class').click();
                    expect(this.output.textContent).toContain('<input type="text" class="hoge">');
                });
                it('$class function', async function () {
                    this.container.$('.class-apply').click();
                    expect(this.output.textContent).toContain('<input type="text" class="hoge a1 b1 c1 d1 y1">');
                });
                it('$class assign', async function () {
                    this.container.$('.class-assign').click();
                    expect(this.output.textContent).toContain('<input type="text" class="a2 b2 c2 d2 y2">');
                });
                it('$data', async function () {
                    this.container.$('.data').click();
                    expect(this.output.textContent).toContain('<input type="text" class="a2 b2 c2 d2 y2" data-hoge="HOGE">');
                });
                it('$data function', async function () {
                    this.container.$('.data-apply').click();
                    expect(this.output.textContent).toContain('<input type="text" class="a2 b2 c2 d2 y2" data-hoge="HOGE" data-foo="foo" data-foo-bar="foo-bar">');
                });
                it('$data assign', async function () {
                    this.container.$('.data-assign').click();
                    expect(this.output.textContent).toContain('<input type="text" class="a2 b2 c2 d2 y2" data-bar="bar" data-bar-baz="bar-baz">');
                });
                it('$style', async function () {
                    this.container.$('.style').click();
                    expect(this.output.textContent).toContain('<input type="text" class="a2 b2 c2 d2 y2" data-bar="bar" data-bar-baz="bar-baz" style="background-color: pink;">');
                });
                it('$style function', async function () {
                    this.container.$('.style-apply').click();
                    expect(this.output.textContent).toContain('<input type="text" class="a2 b2 c2 d2 y2" data-bar="bar" data-bar-baz="bar-baz" style="background-color: green !important; opacity: 0.5; color: red;">');
                });
                it('$remove', async function () {
                    this.container.$('.remove').click();
                    expect(this.output.textContent.trim()).toEqual('');
                });
            });

            describe('dom', function () {
                beforeEach(function () {
                    this.container = document.$('.dom');
                    this.output = this.container.$('.output');
                });

                it('$before', async function () {
                    this.container.$('.before').click();
                    expect(this.output.textContent).toContain(`before-text
<strong>before-strong</strong>
<div class="dom-container">`);
                });
                it('$prepend', async function () {
                    this.container.$('.prepend').click();
                    expect(this.output.textContent).toContain(`<div class="dom-container">prepend-text
<strong>prepend-strong</strong>`);
                });
                it('$append', async function () {
                    this.container.$('.append').click();
                    expect(this.output.textContent).toContain(`append-text
<strong>append-strong</strong>
</div>`);
                });
                it('$insert', async function () {
                    this.container.$('.insert').click();
                    expect(this.output.textContent).toContain(`append-text
insert-text
<strong>insert-strong</strong>
<strong>append-strong</strong>`);
                });
                it('$after', async function () {
                    this.container.$('.after').click();
                    expect(this.output.textContent).toContain(`</div>after-text
<strong>after-strong</strong>`);
                });
                it('$replace', async function () {
                    this.container.$('.replace').click();
                    expect(this.output.textContent).toContain(`<strong>before-strong</strong>
replace-text
<strong>replace-strong</strong>
after-text`);
                });
            });

            describe('event', function () {
                beforeEach(function () {
                    this.container = document.$('.event');
                    this.output = this.container.$('.output');
                });

                it('$click', async function () {
                    this.container.$('.click').click();
                    expect(this.output.textContent).toContain('<span class="click">normal-click</span>');

                    this.container.$('.abort-3click').click();
                    expect(this.output.textContent).toContain('click-0');
                    this.container.$('.abort-3click').click();
                    expect(this.output.textContent).toContain('click-1');
                    this.container.$('.abort-3click').click();
                    expect(this.output.textContent).toContain('click-2');
                    this.container.$('.abort-3click').click();
                    expect(this.output.textContent).not.toContain('click-3');

                    this.container.$('.debounce').$trigger('input');
                    this.container.$('.debounce').$trigger('input');
                    this.container.$('.debounce').$trigger('input');
                    expect(this.output.textContent).not.toContain('<span class="debounce">debounce-input</span>');

                    await sleep(1200);
                    expect(this.output.textContent.match(/debounce-input/g).length).toEqual(2);
                });
                it('$resize', async function () {
                    this.container.$('.resize').$style.width = '120px';
                    await sleep(100);
                    expect(this.output.textContent).toContain('<div class="resize" style="width: 120px;">throttle-resize</div>');
                });
                it('$intersect', async function () {
                    this.container.$('.intersect').scrollIntoView({behavior: 'instant'});
                    await sleep(100);
                    expect(this.output.textContent).toContain('intersect-enter: 0 => ');
                });
                it('$attribute', async function () {
                    this.container.$('.attribute').disabled = true;
                    await sleep(100);
                    expect(this.output.textContent).toContain('attribute-disabled: null => ');

                    this.container.$('.attribute').hidden = true;
                    await sleep(100);
                    expect(this.output.textContent).toContain('attribute-hidden: null => ');
                });
                it('$disable', async function () {
                    this.container.$('.attribute').disabled = false;
                    await sleep(100);
                    expect(this.output.textContent).toContain('disable-disable: false => true');

                    this.container.$('.attribute').disabled = true;
                    await sleep(100);
                    expect(this.output.textContent).toContain('disable-enable: true => false');

                    this.output.textContent = '';
                    this.container.$('fieldset').disabled = true;
                    this.container.$('.attribute').disabled = false;
                    this.container.$('.attribute').disabled = true;
                    await sleep(100);
                    expect(this.output.textContent).not.toContain('disable-disable: false => true');
                    expect(this.output.textContent).not.toContain('disable-enable: true => false');
                });
                it('$cookie', async function () {
                    this.container.$('.change-cookie').click();
                    await sleep(500);
                    expect(this.output.textContent).toContain('cookie-test:');
                });
            });

            describe('element', function () {
                beforeEach(function () {
                    this.container = document.$('.element');
                    this.output = this.container.$('.output');
                });

                it('$get/$set value', async function () {
                    this.container.$('.set-value').click();
                    expect(this.container.$$('[name]:where(input,textarea,select)').$value).toEqual([
                        'b',
                        'b',
                        null,
                        'b',
                        null,
                        'b',
                        'b',
                        ['b'],
                        null,
                        new DataTransfer().files,
                        'b',
                        'b',
                        'b',
                        'b',
                        'b',
                        'b',
                        'b',
                        'b',
                    ]);

                    this.container.$('.set-invalid').click();
                    expect(this.container.$$('[name]:where(input,textarea,select)').$value).toEqual([
                        'invalid value',
                        'invalid value',
                        null,
                        null,
                        null,
                        null,
                        null,
                        [],
                        null,
                        new DataTransfer().files,
                        'invalid value',
                        'invalid value',
                        'invalid value',
                        'invalid value',
                        'invalid value',
                        'invalid value',
                        'invalid value',
                        'invalid value',
                    ]);

                    this.container.$('.clear-value').click();
                    expect(this.container.$$('[name]:where(input,textarea,select)').$value).toEqual([
                        '',
                        '',
                        null,
                        null,
                        null,
                        null,
                        null,
                        [],
                        null,
                        new DataTransfer().files,
                        '',
                        '',
                        '',
                        '',
                        '',
                        '',
                        '',
                        '',
                    ]);
                });
                it('$resetAttribute', async function () {
                    this.container.$('.set-value').click();
                    this.container.$('.resetAttribute').click();
                    expect(this.output.textContent).toContain('<input name="text" type="text" value="b" list="datalist">');
                    expect(this.output.textContent).toContain('<textarea name="textarea">b</textarea>');
                    expect(this.output.textContent).toContain('<input name="checkbox[]" type="checkbox" value="b" id="checkboxB" checked="">');
                    expect(this.output.textContent).toContain('<input name="radio" type="radio" value="b" id="radioB" checked="">');
                    expect(this.output.textContent).toContain('<option value="b" selected="">B</option>');
                });
                it('$options', async function () {
                    this.container.$('select[multiple]').$value = [];
                    this.container.$('.set-options[data-preserve="prepend"]').click();
                    this.container.$('select[multiple]').$value = ['ga'];
                    this.container.$('.set-options[data-preserve="prepend"]').click();
                    this.container.$('select[multiple]').$value = ['ga', 'gb'];
                    this.container.$('.set-options[data-preserve="prepend"]').click();

                    expect(this.container.$('select[multiple]').$value).toEqual(['ga', 'gb']);
                    expect(this.container.$('select[multiple]').innerHTML).toContain('<optgroup label="group"><option label="GroupA" value="ga" title="GroupA">GroupA</option><option label="GroupB" value="gb" title="GroupB">GroupB</option></optgroup>');
                });
                it('$request', async function () {
                    this.container.$('.request').click();
                    // impossible test
                });
                it('$submit', async function () {
                    this.container.$('.postable-async').click();
                    await sleep(1000);
                    expect(this.output.textContent).toContain('"method": "POST"');
                });
            });

            describe('dimension', function () {
                beforeEach(function () {
                    this.container = document.$('.dimension');
                    this.output = this.container.$('.output');
                });

                it('$scrollParent', async function () {
                    this.container.$('.scroll').click();
                    expect(this.output.textContent).toContain('$scrollParent({"width":true,"height":true}): BODY.');

                    this.container.$('.scroll-child').style.height = '150px';
                    this.container.$('.scroll').click();
                    expect(this.output.textContent).toContain('$scrollParent({"width":true,"height":true}): DIV.scroll-parent');

                    this.container.$('.scroll-child').value = '1\n2\n3\n4\n5\n6\n7\n8\n9\n0';
                    this.container.$('.scroll').click();
                    expect(this.output.textContent).toContain('$scrollParent({"width":true,"height":true}): TEXTAREA.scroll-child');
                });
            });

            describe('effect', function () {
                beforeEach(function () {
                    this.container = document.$('.effect');
                    this.output = this.container.$('.output');
                });

                it('$transition', async function () {
                    this.container.$('.parallel').click();
                    expect(this.output.textContent).toContain('parallel: start');
                    expect(this.output.textContent).not.toContain('parallel: end');
                    await sleep(1200);
                    expect(this.output.textContent).toContain('parallel: end');
                });
            });

            describe('network', function () {
                beforeEach(function () {
                    this.container = document.$('.network');
                    this.output = this.container.$('.output');
                });

                it('$load', async function () {
                    this.container.$('.load-gets').click();
                    await sleep(1000);
                    expect(this.output.textContent).toContain('$load: done');

                    const newhtml = this.container.$$('.input') + '';
                    expect(newhtml).toContain('"index":"1"');
                    expect(newhtml).toContain('"index":"2"');
                    expect(newhtml).toContain('"index":"3"');
                });
                it('$listen', async function () {
                    expect(this.container.$('#sse span').textContent).toContain('pong');
                });
            });

            describe('utility', function () {
                beforeEach(function () {
                    this.container = document.$('.utility');
                    this.output = this.container.$('.output');
                });

                it('$valueAs', async function () {
                    this.container.$$('.datetime-like').$valueAsDate = new Date('2014-12-24T12:34:56.789');
                    this.container.$$('.value-as-date[data-native="0"]').click();

                    expect(this.output.textContent).toContain('valueAsDate: 2014-12-24 12:34:00');
                    expect(this.output.textContent).toContain('valueAsDate: 2014-12-24 00:00:00');
                    expect(this.output.textContent).toContain('valueAsDate: 1970-01-01 12:34:00');
                    expect(this.output.textContent).toContain('valueAsDate: 2014-12-01 00:00:00');
                    expect(this.output.textContent).toContain('valueAsDate: 2014-12-22 00:00:00');
                });
                it('$scrollIntoView', async function () {
                    const result = await this.container.$('.scrollIntoView1').$scrollIntoView({
                        behavior: 'smooth',
                    });
                    expect(result).toEqual(true);

                    await expectAsync(this.container.$('.scrollIntoView2').$scrollIntoView({
                        behavior: 'smooth',
                        timeout: 100,
                    })).toBeRejected();
                });
                it('$dataURL', async function () {
                    this.container.$('.image-dataURL').click();
                    await sleep(100);
                    expect(this.output.textContent).toContain('dataurl: data:image/png;base64,iVBORw0KGgoAAAANSUhEUg');
                });
                it('$contents', async function () {
                    this.container.$('.link-contents').click();
                    await sleep(200);
                    expect(this.output.textContent).toContain('url(never-notfound.dummy)');
                    expect(this.output.textContent).toContain('url(http://example.jp/example.png)');

                    this.container.$('.script-contents').click();
                    await sleep(200);
                    expect(this.output.textContent).toContain('window.kQuery');
                    expect(this.output.textContent).toContain('kQuery.extends');
                });
                it('$search', async function () {
                    this.container.$('.search-text').click();
                    expect(this.container.$('.search') + '').toContain('<mark class="marker">text</mark>');
                });
            });
        });
    }
});
