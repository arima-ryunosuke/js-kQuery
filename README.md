kQuery
====

## Description

劣化軽量 jQuery のようなものです。
Node と NodeList を統一的に扱います。
思想としては [NodeList.js](https://github.com/eorroe/NodeList.js) と同じです。

主な目的は

- 一括操作（Node/NodeList の統一的な記述）
- カスタムイベント（XXXObserver の イベント化）

のみです。つまり・・・

```js
const inputs = document.querySelectorAll('input');

// bulk set
inputs.disabled = true;
console.log(inputs.disabled); // [true, true, true, true]

// callback set
inputs.disabled = (node, i) => i % 2 ===0;
console.log(inputs.disabled); // [true, false, true, false]

// resize event
inputs.$on('resize', function (e) {
  // resized
});
```

こういうことがやりたかっただけです。
他にもユーティリティ的な処理（$ から始まるもの）も大量にありますが基本的にオマケです。

## Usage

dist の core（ユーティリティなしの自動プロパティとイベントだけのもの）か full（全ユーティリティ込み）を使用してください。
module は開発のためなので、module としての直利用は原則として非推奨です。

読み込む際は `<script src="kQuery.js?kQuery-debug=true&amp;kQuery-logLevel=7">` のようにクエリストリングで設定の初期設定が行えます。
あるいは `<script src="kQuery.js" data-kQuery-debug="true" data-kQuery-log-level="7">` のように data 属性で指定します。
両方指定した場合は query -> data の優先度でマージされます。

ユーティリティのリファレンスは下記です。

- https://arima-ryunosuke.github.io/js-kQuery/

### 拡張

下記のプロトタイプの拡張・書き換えが行われます。

- Node
    - プロパティの setter が関数を受け付けるように書き換えられます
        - ので onclick のような元から関数を受け付けるプロパティは壊れます
            - ただし一応 on 系は対象外にしているので弊害はない…はずです
            - もし on 系以外に関数を受け付けるプロパティがあるとそれは完全に壊れます
        - プロパティリストは静的に保持しているため、ブラウザの進化により未知のプロパティが出現しても「急に壊れる」ことはありません
        - この書き換えは resetNative オプションで抑制可能です
- NodeList
    - HTML*Element が持つほぼすべてのプロパティが NodeList にも生えます
        - 例えば NodeList が本来持つ item プロパティはまったく別のプロパティになります（所属する HTMLSelectElement の item 等）
            - 唯一の例外は `length` だけです（List を List たらしめるのに必須）
        - このプロパティリストも静的に保持しているため、ブラウザの進化により未知のプロパティが出現しても「急に壊れる」ことはありません
- Node,NodeList
    - ユーティリティとして `$` で始まるプロパティが生えます
        - これは外部から制御できないため、ブラウザの進化により未知のプロパティが出現すると「急に壊れる」ことがあります
        - が、今後 `$` で始まるプロパティが Native に増える可能性は非常に低いと考えられるため、あまり気にしなくて良いと考えています
            - ありがちな文字なので他のライブラリなどとの競合は起こり得ます
- その他プロトタイプ
    - 下記は作者が必要だと感じた些細なプロトタイプ拡張です
    - これらは Native に寄せたいため、 $ が付きませんが appendNative オプションで抑制可能です
    - NodeList.dispatchEvent
        - 全要素で dispatchEvent します
        - 一度消費された Event オブジェクトだとイベントが発火しないことがあるため、作り直しながらループで発火するメソッドです
    - RadioNodeList.name
        - radio の name 属性の setter/getter です
        - RadioNodeList.value はあるのに（どうせ同じ name しか格納されないのに）name が無いのは不便だからです
    - Node(List).@toPrimitive
        - DOM の文字列を返します
        - Node や NodeList が `[object HTMLElement]` `[object NodeList]` 等に変換されてうれしい人間はまずいないと思うし将来的な Native の変更もないだろうので、利便性のために実装されています
- イベントシステム
    - resize, intersect 等ありがちな名前でイベントを独自登録しています
        - つまりブラウザの進化により未知のイベントが出現すると「急に壊れる」ことがあります
        - そのための対策として独自イベントの内部的なイベントの管理・発火すべてで $ が付与されるようになっていて、将来の進化に備えることができます
            - 内部的なので使い勝手はほぼ変わりませんが、CustomEvent の type に $ 付きで渡ってくることになります
        - この文字列は customEventPrefix オプションで変更可能です
            - '' などにすると本当に resize, intersect などで登録されます（この場合 CustomEvent の判定を入れた方が安全でしょう）

上記を認識して用法・用量を守って正しく使ってください。

### 一括操作

#### 前提

前提として Element に存在するほぼすべてのプロパティは NodeList にも同名のプロパティが生えており、保持要素すべてに対して横断的に操作を行います。
そして Element と NodeList は明確に区別されます。

下記の例において $ は document.$, $$ は document.$$ を表します。

#### 取得系

```js
console.log($('input').disabled);  // bool
console.log($$('input').disabled); // [bool, bool, ..., bool]
```

Node の場合は単一値、NodeList の場合はその要素分の配列が返ります。
jQuery のように単一/複数を一緒くたにしたりはしません。例え length:1 の NodeList だとしても配列です。
これに例外はありません。例えば・・・

```js
console.log($$('input, span').disabled); // [bool, undefined, ..., bool]
```

このような（disabled プロパティが存在しない）span も含まれた NodeList で `disabled` にアクセスすると存在しない分は undefined になります。
取得系操作で NodeList の length と返り値の length が一致しないということは原則的にありません。
（一緒くたに扱うと意図しない不具合の元になりやすい）。

さらに**非数値であれば**プロパティの各種プロパティも横断的に取得できます。
後述しますが、プロパティの各種メソッドも呼ぶことができます。

```js
// dataset の hoge を（$$ の場合は横断的に）返す
console.log($('input').dataset.hoge);  // 'a'
console.log($$('input').dataset.hoge); // ['a', 'b', ..., 'z']
// 数値はダメ（参照になってしまう）
console.log($$('input').dataset[0]); // DomStringMap{hoge: 'a'}
```

NodeList の各プロパティがプリミティブ的な値の場合は上記のように単純に配列で返します。
そう多くはないですが、オブジェクトの場合はそれがラップされた ArrayLike なコレクションを返します。
このとき、得られたコレクションを単純にコールすると本当の配列を返します。

```js
// dataset,classList などは専用のオブジェクトなので ArrayLike なコレクションを返す
console.log($$('input').dataset);   // ArrayLike[DomStringMap{hoge: 'a'}, ..., DomStringMap{hoge: 'z'}]
// 単純コールすると本当の配列を返す
console.log($$('input').dataset()); // [DomStringMap{hoge: 'a'}, ..., DomStringMap{hoge: 'z'}]
```

コレクションはそのまま for で回すことができます。

```js
// dataset コレクションを for で回す
for (const dataset of $$('input').dataset) {
    console.log(dataset); // DomStringMap{hoge: 'a'}, ..., DomStringMap{hoge: 'z'}
}
```

#### 設定系

上記は取得系ですが、設定系も横断的に操作できます。
下記のコードではすべて `$$` で NodeList が対象になっているのに着目してください。

```js
// すべての $('input').disabled = true; をしたと同じ
$$('input').disabled = true;
console.log($$('input').disabled); // [true, true, ..., true]
```

このとき、関数を代入するとその関数がそれぞれの要素でコールバックされます。
NodeList ではない Node でもこの関数代入は使えます。基本的に既存のプロトタイプは書き換えない思想ですが、これだけは例外です。
これは主に記述の統一のためです。「NodeList には関数代入が使えるが Node では使えない」は記述の一貫性を欠くため、デスクリプタを書き換えています。

```js
// $('input')[!1].disabled = false; $('input')[1].disabled = true; をしたと同じ
$$('input').disabled = (node, i) => i === 1;
console.log($$('input').disabled); // [false, true, ..., false]
// Node でも関数代入できる
$('input').disabled = (node) => !node.disabled;
```

さらに得られたプロパティがメソッド（関数）の場合でも、横断的に実行できます。
DOM 操作等で頻出します。

```js
// すべての $('input').remove(); を呼び出したと同じ
$$('input').remove();
console.log($$('input')); // []
```

この場合の返り値は原則としてメソッドの返り値です。
ただし、メソッドが undefined|this を返した場合、this(NodeList) に変換されます。
さらに、メソッドが Promise を返した場合、Promise.all を返します。

これは利便性のためです。例えば `addEventListener` はメソッドチェーンすることが多いですが addEventListener は undefined を返すので返り値が `[undefined, ..., undefined]` になります。
これは多くの場合嬉しくないでしょう。
言い換えれば返り値が `[undefined, ..., undefined]` や `[this, ..., this]` だった場合に元の this(NodeList) に変換されるようになっています。

```js
// すべての $('input').setAttribute('hoge', 'HOGE'); を呼び出したと同じ
const result = $$('input').setAttribute('hoge', 'HOGE');
console.log(result); // setAttribute の返り値は undefined なので [undefined, ..., undefined] …ではなく元の this($$('input')) が返る
// 要するにメソッドチェーンができる
result.setAttribute('hoge', 'HOGE').setAttribute('fuga', 'FUGA');

// 明らかに結果を返すようなメソッドの場合は当然その結果
result.getAttribute('type'); // ['text', 'tel', ..., 'url']
```

さらに得られたプロパティがオブジェクトの場合でも、横断的に設定操作できます。
dataset 等で頻出します。

```js
// すべての $('input').dataset.hoge = 'HOGE'; をしたと同じ
$$('input').dataset.hoge = 'HOGE';
console.log($$('input').dataset.hoge); // ['HOGE', 'HOGE', ..., 'HOGE']
```

さらに横断的にメソッドを呼ぶこともできます。
classList 等で頻出します。

```js
// すべての $('input').classList.add('hoge'); をしたと同じ
$$('input').classList.add('hoge');
console.log($$('input').classList.contains('hoge')); // [true, true, ..., true]
```

#### 独自実装プロパティ

下記のプロパティは独自拡張されており特殊属性をシンプルな key-value オブジェクトとして扱えるようになっています。

- $attrs
- $data
- $style
- $class

これらのプロパティは get メソッドが独自定義されておりオブジェクトの直接取得などが可能です。
$data 操作等で頻出します。

```js
// dataset 属性をプレーンな key-value Object で返す
$$('input').$data();
```

さらに set メソッドも独自定義されておりオブジェクトの直接代入が可能です。
$data 操作等で頻出します。

```js
// すべての $('input').dataset.a='A'; $('input').dataset.b='B'; を呼び出したと（ほぼ）同じ
$$('input').$data = {
    a: 'A',
    b: 'B',
};
console.log($$('input').dataset.a); // ['A', 'A', ..., 'A']
console.log($$('input').dataset.b); // ['B', 'B', ..., 'B']
```

さらに apply も独自定義されており直接実行が可能です。
$data 操作等で頻出します。

```js
// すべての $('input').dataset.a='A'; $('input').dataset.b='B'; を呼び出したとほぼ同じ
$$('input').$data({
    a: 'A',
    b: 'B',
});
console.log($$('input').dataset.a); // ['A', 'A', ..., 'A']
console.log($$('input').dataset.b); // ['B', 'B', ..., 'B']
```

メソッドコールの場合は引数に関数を与えると引数の値としてコールバックされます。
それらが一つでも undefined を返すと一切の変更が行われない動作となります。
$class 操作等で頻出します。

```js
// 下記は実質的にほぼ同じ（コールバックで hoge を add するのと toggle のフラグを利用する違い）
$$('input').$class.add((node, i) => i == 1 ? 'hoge': undefined);
$$('input').$class.toggle('hoge', (node, i) => i == 1);
```

上記の直接代入と直接実行はぱっと見は同じで、処理的な意味でも明確な区別はないです。
敢えて思想を挙げるなら、

- 直接代入: 他のものはクリアされる
- 直接実行: 追加・変更のみ

があります。
代入はゴリっと置き換えで、実行は既存を尊重しつつも変更するようなイメージです。

おそらく感覚的にもその方が近いでしょう。例えば
`$e.$data = {a: 'A', b: 'B'}` したら $e.dataset.c は消えて欲しい（だって代入なんだから）し、
`$e.$data({a: 'A', b: 'B'})` しても $e.dataset.c は消えないで欲しい。

組み込みの $data, $class 等にはすべて代入・実行が実装されていますが。この思想を採用しています。

さらにこれらの一部のオブジェクトは $ を付与すると下記の効果があります。

- $attrs.$hoge: DOM ツリーを辿って属性を返します
  - `<fieldset disabled><input></fieldset>`
  - 例えば上記の時に `$('input').$attrs.$disabled` とするとその要素の「本当の disabled（≒fieldset も見る）」を得ることができます
- $data.$hoge: data 属性をオブジェクトとみなして返します
  - `<span data-hoge-a="A" data-hoge-b="B"></span>`
  - 例えば上記の時に `$('span').$data.$hoge` とすると `{a: 'A', b: 'B'}` というオブジェクトを得ることができます
- $style.$hoge: 継承された CSS の実効値を返します
  - `<div style="color:red"><span></span></div>`
  - 例えば上記の時に `$('span').$style.$color` とするとその要素の「本当の color（≒getComputedStyle の値）」を得ることができます

余談ですが、本当はそれぞれ attributes, dataset, style, classList をそのまま使いたかったんです。
ただ、実装を進めていくにつれてあまりにも挙動が違ってきたため、$を付けて別プロパティということにしました。
（名前を変えているのは単純に作者の好みです。特に `classList` は `classlist` とタイポすることが多く、ストレスなのです。シンプルに属性名で名が体を表している方が分かりやすいと考えます）。

さらに余談ですが、data-*属性と無関係に DOM とデータを紐づける `$bag` というのも生えています。
「DOM に何かデータを持たせたい。でも（文字列じゃないので）data-* では無理」という状況は多々あり、そういう場合に使えます。

#### まとめ

まとめます。

```js
/// 取得系

// プロパティをまとめて取得できる
$$('input').disabled; // [false, false, ..., false]
// dataset のようなオブジェクトも横断的にまとめて取得できる
$$('input').dataset.hoge; // ['HOGE', 'HOGE', ..., 'HOGE']
// dataset のようなオブジェクトは単純コールでオブジェクトを取得できる
$$('input').dataset(); // ArrayLike[DomStringMap{hoge: 'hoge'}, DomStringMap{hoge: 'hoge'}, ..., DomStringMap{hoge: 'hoge'}]
// $attrs,$style は$を付与すると実効値（継承値）を取得できる
$$('input').$attrs.$disabled; // 自身を含めた親に disabled があればその値
$$('input').$style.$color;    // CSS 継承も含めた color の実効値

/// 設定系

// プロパティをまとめて設定できる
$$('input').disabled = true; // すべての disabled が true になる
// 関数を代入するとコールバックされる
$$('input').disabled = (node, i) => i === 1; // NodeList[1] が true, それ以外は false になる
// メソッドの場合は一括で呼ばれる
$$('input').remove(); // すべて remove される
// dataset のようなオブジェクトも横断的にまとめて設定できる
$$('input').dataset.hoge = 'HOGE'; // すべての data-hoge 属性が HOGE になる
// classList のようなオブジェクトのメソッドも横断的にまとめてコールできる
$$('input').classList.add('hoge'); // すべての class 属性に hoge が追加される
// $data のようなオブジェクトはオブジェクトをまとめて代入できる（いったん初期化してから設定）
$$('input').$data = {hoge: 'HOGE'}; // すべての data-hoge 属性が HOGE になる（既存は消え去る）
// $data のようなオブジェクトはオブジェクトでコールできる（初期化せずに追加・上書き）
$$('input').$data({hoge: 'HOGE'}); // すべての data-hoge 属性が HOGE になる（既存はそのまま）
```

### イベント

一部の observer で native 実装されているものをイベントとして listen 可能です。
また、イベントデリゲーションや名前空間, throttle, debounce も組み込みで実装されています。

前述の一括操作機能により、NodeList でも $on 可能です。
その場合単純に保持 Node のすべてで addEventListener されます。

要するにイベントに関してはほとんど jQuery ですが、微妙な差異もあります。

まず Event システムは独自のものではなく Native のものです。
`return false` の挙動や Event オブジェクトの拡張など、余計なことは一切しません。

なお組み込みのカスタムイベントは原則としてバブリングしません（特に Observer 系）。
これはパフォーマンス上の理由です。
元々 MutationEvent というものがありましたが、廃止された理由がまさにパフォーマンスとのことで、せっかくイベント型からオブザーバー型になったのに無理やりイベント化しているため、パフォーマンスの差が如実に出ます。
無駄な処理を抑えるために極力（通常時：全くなし、デリゲート時：親要素で強制停止）バブリングしないようにしています。
もっとも通常のユースケースでバブリングしないことで困ることはまずないでしょう。

デリゲートの際の発火は1回のみです（jQuery は複数回発火する）。
また、デリゲート時の once:true の挙動は要素単位になります（jQuery はハンドラ単位で once）。

さらに、Event の this の扱いは jQuery とは異なります。

- this: 常に $on した要素です（アロー関数は除く）
- e.target: イベントの発火元の要素です
- e.currentTarget: イベントを listen している要素です。ほぼすべてのケースで this と一致します
- e.$delegateTarget: selector で指定されたデリゲート要素です。デリゲーションの時のみ生えます

jQuery との比較です。

```
<div class="parent">
  <span class="child">child1
    <span class="child">child2
      <span class="child">child3</span>
    </span>
  </span>
</div>

<script>
jQuery('.parent').on('click', '.child', function (e) {
    console.log(this);
    // return false;
});
kQuery('.parent').$on('click', '.child', function (e) {
    console.log(this);
    // return false;
});
</script>
```

このような時、 `child3` をクリックすると jQuery は計3回発火します。
また this がその過程でマッチした要素になっています。
また `e` は jQuery が独自拡張した Event オブジェクトです。
さらに return false するとバブリングも止まります。

kQuery の場合は `child3` の1回のみです。
また this は常に `.parent` です。
また `e` は素の PointerEvent です。
さらに return false してもバブリングは止まらず、 preventDefault 相当だけです。

#### cookie イベント

クッキーの変化イベントです。
内部的には setInterval であり、リアルタイムではありません。
Event オブジェクトの detail にクッキーの変化前後の値が流れてきます。

デリゲート動作は効きません。
Document のみに $on することができます。

#### child イベント

子要素の追加・削除・変更イベントです。
内部的には MutationObserver であり、Event オブジェクトの detail に MutationRecord が流れてきます。

イベント subtype として "insert", "remove", "change" が渡ってきます。ただし "change" は options で attrbutes:true を渡したときのみです。
これは子要素に何らかの条件を付与したいときに使います（全うな使用法では "insert" "remove" だけで十分です）。

例えば tbody に `tr.something` が追加された時にイベントを発火したい場合に「tr 追加 → .something 付与」という処理の流れだと都合が悪いです。つまり属性を監視することで「`tr.something` という Node が**出現した**」を検知することができます。

デリゲート動作も効きますが、その場合は document で $on するのではなく、領域を絞ることを推奨します。
（MutationObserver で実装されているので document だと DOM すべてを監視してしまうため）。

#### attribute イベント

属性の変化イベントです。
内部的には MutationObserver であり、Event オブジェクトの detail に MutationRecord が流れてきます。

デリゲート動作も効きますが、その場合は document で $on するのではなく、領域を絞ることを推奨します。
（MutationObserver で実装されているので document だと DOM すべてを監視してしまうため）。

#### disable イベント

disabled の変化イベントです。
内部的には MutationObserver であり、Event オブジェクトの detail に MutationRecord が流れてきます。

単なる属性イベントではありません。
自身の属性はもちろん親 fieldset の disabled で変化した場合にも発火します。
端的に言えば css セレクタでいう `:disabled` が変化したときに発火します。

デリゲート動作も効きますが、その場合は document で $on するのではなく、領域を絞ることを推奨します。
（MutationObserver で実装されているので document だと DOM すべてを監視してしまうため）。

#### intersect(enter/leave) イベント

交差状態の変化イベントです。
内部的には IntersectionObserver であり、Event オブジェクトの detail に IntersectionObserverEntry が流れてきます。

デリゲート動作も効きますが、その場合は document で $on するのではなく、領域を絞ることを推奨します。
（デリゲートは MutationObserver で実装されているので document だと DOM すべてを監視してしまうため）。

#### resize イベント

境界ボックスの変化イベントです。
内部的には ResizeObserver であり、Event オブジェクトの detail に ResizeObserverEntry が流れてきます。

デリゲート動作も効きますが、その場合は document で $on するのではなく、領域を絞ることを推奨します。
（デリゲートは MutationObserver で実装されているので document だと DOM すべてを監視してしまうため）。

#### visible イベント

要素の可視状態の変化イベントです。
内部的には ResizeObserver であり、Event オブジェクトの detail に ResizeObserverEntry が流れてきます。

デリゲート動作も効きますが、その場合は document で $on するのではなく、領域を絞ることを推奨します。
（デリゲートは MutationObserver で実装されているので document だと DOM すべてを監視してしまうため）。

#### swipe イベント

いわゆる swipe イベントです。
内部的には pointerdown/move であり、Event オブジェクトの detail に移動量や角度が流れてきます。

角度は真上を0とした時計回りの弧度法です（真上が0度、右が90度、下が180度、左が270度）。

#### flick イベント

いわゆる flick イベントです。
swipe の亜種であり、単位時間当たりの移動量が閾値を超えた場合に発火されます。
内部的には pointerdown/move/up であり、Event オブジェクトの detail に速度や角度が流れてきます。

速度は概ね「弱めのフリック」で 0.5 前後、「普通のフリック」で 1.0 前後、「強めのフリック」で 2.0 以上、が目安となります。

### ユーティリティ

他にもいくつか jQuery Like なユーティリティ・ヘルパーメソッドが生えています。
細かな機能が多い上、基本的にはシンプルにまとめているので、機能自体はドキュメントやソースを参照してください。

原則として DOM 系がベースです。配列（Array）や日付（Date）等の Core 系のユーティリティはほぼありません。
これはそういった Core 系は他のライブラリに任せればいいし、作り出すと本当にキリがないので基本的に触れません。
DOM 系を実装していく上で必要そうなものは追加することがあります。いずれにせよプレフィックスとして $ がつきます

なお、いくつかのメソッドは意図的に jQuery に似せていますが、細かな差異が有るものがあります。
例えば `$prevElement` は「マッチする弟」を返します（jQuery は「直前の弟がマッチした場合」のみ返す）。
また Effects 系は Promise を返し、解決したタイミングですべてのスタイルが元に戻ります。さらに可視性も変更しません。

`kQuery-full.js` はすべて生えている版です。
`kQuery-core.js` は一括操作とイベントだけの最小構成版（≒ユーティリティなし）です。

### 拡張

大したコードベースでもないため、簡単に拡張できるようにしています。

```js
kQuery.extends(function (kQuery) {
    // do initialize

    return {
        [[Document.name]]: {
            get $hoge() {
                // do something
            },
        },
        [[Node.name, kQuery.API.$NodeList.name]]: {
            $fuga() {
                // do something
            },
        },
    };
});
```

このようにすると Document.prototype に `$hoge` が、 Node.prototype, NodeList.prototype に `$fuga` が生えます。
このとき、 Document.prototype.$hoge は getter で、Node.prototype.$fuga はメソッドであることに留意してください。

NodeList の kQuery.API.$ はあまり気にしなくてもいいです。
kQuery.API.$ を付けると「そのプロトタイプではなくその要素すべてでコールされる」ようになるんですが、その動作の方が望ましいことが大半のため、何も考えず付けておけばいいです。
（普通に `NodeList.name` とすれば NodeList 自体に生えます。が、そんな用途は稀でしょう。ソートとか？）。

引数として kQuery が渡ってくるのでこのタイミングで拡張ができます。
が、ほぼ内部の組み込みプラグインのためであり、拡張するときに意識することはありません。
単純に上記のような `return {prototype.name: {拡張メソッド() {}}}` 形式しかほぼ使いません。

## Concept

Native の js が強くなってきて jQuery はほぼ不要になりましたが、jQuery の「すべてを配列的に扱う」という思想は好きでした。
0 or 1 or many （※）を気にする必要はなく、単一/複数を意識せずメソッドコール出来たり取得できたりするのは大きな魅力でした。
あと Event Delegate が非常に優秀で、親要素で listen して子要素のイベントを拾えるのも便利でした。
※ Native だと 0 でエラーになるし、2 以上だとループしないといけないしで扱いづらい、という意味

一方、 jQuery は独自の機構が多すぎました。
Event システムは独自のものだし何が this なのかよく分からないし event はラップされてるし return false の意味は違うし capture フェーズもないしで、上記のメリットのためだけに jQuery を入れたくありません。
「便利だが標準と違う機構」ではなく「標準がちょっと便利になった」程度のライブラリが欲しくなったのです。

なので、「prototype に jQuery のいいところだけを拡張させればいいのでは？」と思い至り、それがそのままコンセプトです。

## License

MIT

## Release

バージョニングは romantic versioning に準拠します（semantic versioning ではありません）。

- メジャー: 大規模な互換性破壊の際にアップします（アーキテクチャ、クラス構造の変更など）
- マイナー: 小規模な互換性破壊の際にアップします（引数の変更、小規模破壊を伴う修正など）
- パッチ: 互換性破壊はありません（デフォルト引数の追加や、新たなクラスの追加、コードフォーマットなど）

### 0.2.2

- [feature] $defaultValue を追加
- [feature] $valueAsDate/Number を追加

### 0.2.1

- [feature] $on の signal 対応
- [fixbug] window で $on するとエラーが出る

### 0.2.0

- [feature] $topLayerElement を追加
- [*change] $modalElement を getter 化
- [fixbug] $on してない要素で $off すると undefined になる

### 0.1.0

- [feature] ポインタ系イベントのボタン縛り
- [feature] 不必要と考えていた単一メソッド系に $NodeList を追加
- [feature] fetch 系の URL 受け入れとタイムアウトと http エラー
- [feature] $upload を追加
- [feature] $options を追加
- [feature] $willChange を追加
- [feature] textnodes を使う処理で metadata content を除外
- [feature] metadata content の判定は有用そうなのでメソッド化
- [refactor] 効率の悪いコードを最適化
- [refactor] webkit/moz 等の自動除外設定
- [refactor] WeakMap の実装を変更
- [fixbug] 一部のアサーションが間違っていたのと Boolean を緩めにした
- [fixbug] import.meta が PlainObject 判定されている

### 0.0.0

- 公開
