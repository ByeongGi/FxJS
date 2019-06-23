[EN](https://github.com/marpple/FxJS) | [KR](https://github.com/marpple/FxJS/blob/master/README_kr.md)

# FxJS - Functional Extensions for Javascript

FxJS는 ECMAScript 6 기반의 함수형 프로그래밍 라이브러리입니다. Iterable, Iterator, Generator, Promise를 다룹니다.

- [Getting Started](#Getting-Started)
  - [Installation](#Installation)
  - [Iteration protocols](#Iteration-protocols)
  - [Iterable programming](#Iterable-programming)
  - [Lazy evaluation](#Lazy-evaluation)
  - [RFP style](#RFP-style)
  - [Promise/async/await](#promiseasyncawait)
  - [Concurrency](#Concurrency)
  - [Error handling](#Error-handling)
- [API](#API)
  - [Function](#Function)
  - [Strict](#Strict)
  - [Lazy](#Lazy)
  - [Concurrency](#Concurrency)
  - [Stoppable](#Stoppable)
  - [String](#String)
- [Change Log](#Change-Log)

# Getting Started

## Installation

### In Modern Browsers Supporting ES6
- [fx.js](https://github.com/marpple/FxJS/blob/master/dist/fx.js)
- [fx.js.map](https://github.com/marpple/FxJS/blob/master/dist/fx.js.map)
- [fx.min.js](https://github.com/marpple/FxJS/blob/master/dist/fx.min.js)

```html
<script src="path/fx.min.js"></script>
```

```javascript
const { map, filter, reduce, L, C } = _;

map(a => a + 1, [1, 2, 3]);
// [2, 3, 4];
```

### In Legacy ES5 Browsers
- [fx.es5.js](https://github.com/marpple/FxJS/blob/master/dist/fx.es5.js)
- [fx.es5.js.map](https://github.com/marpple/FxJS/blob/master/dist/fx.es5.js.map)
- [fx.es5.min.js](https://github.com/marpple/FxJS/blob/master/dist/fx.es5.min.js)

```html
<script src="path/fx.es5.min.js"></script>
```

```javascript
_.reduce((a, b) => a + b, L.map(a => a + 1, [1, 2, 3]));
// 9;
```

### Node and npm

Webpack으로 번들링 할 수 있도록 설정되어 있습니다.

```
npm install fxjs2
```

```javascript
const { map, filter, reduce, L, C } = require("fxjs2");
```

```javascript
import { map, filter, reduce, L, C } from "fxjs2";
```

## Iteration protocols

제너레이터를 통해 만든 이터레이터를 FxJS의 함수들로 평가할 수 있습니다.

```javascript
function *fibonacci() {
  let a = 0, b = 1;
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

const f = pipe(
  fibonacci,
  L.filter(n => n % 2 == 0),
  L.takeWhile(n => n < 10));

const iterator = f();
console.log(iterator.next()); // { value: 0, done: false }
console.log(iterator.next()); // { value: 2, done: false }
console.log(iterator.next()); // { value: 8, done: false }
console.log(iterator.next()); // { value: undefined, done: true }

reduce((a, b) => a + b, f());
// 10
```

## Iterable programming

어떤 값이든 `[Symbol.iterator]()` 메서드를 가진 이터러블이라면 FxJS와 사용할 수 있습니다.

```javascript
const res = go(
  [1, 2, 3, 4, 5],
  filter(a => a % 2),
  reduce(add));

log(res); // 9
```

## Lazy evaluation

`L` 네임스페이스의 함수를 통해 지연 평가를 할 수 있습니다.

```javascript
const res = go(
  L.range(Infinity),
  L.filter(a => a % 2),
  L.take(3),
  reduce(add));

log(res); // 9
```

## RFP style

Reactive functional programming 스타일을 작성할 수 있습니다.

```javascript
go(
  L.range(Infinity),
  L.map(delay(1000)),
  L.map(a => a + 10),
  L.take(3),
  each(log));
// 1초 후 10
// 2초 후 11
// 3초 후 12
```

## Promise/async/await

FxJS의 함수들은 비동기를 잘 다룹니다. Promise의 프로토콜을 잘 따르고 있어 async/await과도 함께 사용할 수 있습니다.

```javascript
// L.interval = time => L.map(delay(time), L.range(Infinity));

await go(
  L.interval(1000),
  L.map(a => a + 30),
  L.takeUntil(a => a == 33),
  each(log));
// 1초 후 30
// 2초 후 31
// 3초 후 32
// 4초 후 33

const res = await go(
  L.interval(1000),
  L.map(a => a + 20),
  L.takeWhile(a => a < 23),
  L.map(tap(log)),
  reduce(add));
// 5초 후 20
// 6초 후 21
// 7초 후 22

log(res);
// 63
```

## Concurrency

`C` 네임스페이스의 함수를 통해 동시/병렬적인 평가가 가능합니다.

```javascript
await map(getPage, range(1, 5));
// 4초 후
// [page1, page2, page3, page4]

const pages = await C.map(getPage, range(1, 5));
// 1초 후
// [page1, page2, page3, page4]
```

`L` 함수들로 지연해둔 함수열을 `C` 함수로 동시에 평가할 수도 있습니다. 이런 방식은 [Clojure Reducers](#https://clojure.org/reference/reducers)와 비슷합니다.

```javascript
go(
  range(1, 5),
  map(getPage),
  filter(page => page.line > 50),
  map(getWords),
  flat,
  countBy(identity),
  log);
// 4초 후
// { html: 78, css: 36, is: 192 ... }

go(
  L.range(1, 5),
  L.map(getPage),
  L.filter(page => page.line > 50),
  L.map(getWords),
  C.takeAll, // 4개 페이지 동시 요청
  flat,
  countBy(identity),
  log);
// 1초 후
// { html: 78, css: 36, is: 192 ... }

go(
  L.range(1, 5),
  L.map(getPage),
  L.filter(page => page.line > 50),
  L.map(getWords),
  C.takeAll(2), // 2개 페이지씩 나눠서 동시 요청
  flat,
  countBy(identity),
  log);
// 2초 후
// { html: 78, css: 36, is: 192 ... }
```

## Error handling

FxJS는 자바스크립트의 기본 프로토콜을 지키고 있기 때문에 자바스크립트 표준 에러 핸들링을 사용할 수 있습니다.

```javascript
const b = go(
  0,
  a => a + 1,
  a => a + 10,
  a => a + 100);

console.log(b);
// 111

try {
  const b = go(
    0,
    a => { throw { hi: 'ho' } },
    a => a + 10,
    a => a + 100);

  console.log(b);
} catch (c) {
  console.log(c);
}
// { hi: 'ho' }
```

async/await와 try/catch를 사용하여 비동기 에러 핸들링을 할 수 있습니다. 표준적인 에러 핸들링을 사용하기 때문에 여러 라이브러리들과 함께 사용하기 좋습니다.

```javascript
const b = await go(
  0,
  a => Promise.resolve(a + 1),
  a => a + 10,
  a => a + 100);

console.log(b);
// 111

try {
  const b = await go(
    0,
    a => Promise.resolve(a + 1),
    a => Promise.reject({ hi: 'ho' }),
    a => a + 100);

  console.log(b);
} catch (c) {
  console.log(c);
}
// { hi: 'ho' }
```

# API

- [Function](#Function)
  - [go](#go)
  - [pipe](#pipe)
  - [curry](#curry)
  - [tap](#tap)
  - [constant](#constant)
  - [negate](#negate)
  - [call](#call)
  - [apply](#apply)
  - [calls](#calls)
- [Strict](#strict)
  - [range](#range)
  - [map](#map)
  - [mapEntries](#mapEntries)
  - [mapObject](#mapObject)
  - [pluck](#pluck)
  - [flat](#flat)
  - [deepFlat](#deepFlat)
  - [flatMap](#flatMap)
  - [filter](#filter)
  - [reject](#reject)
  - [compact](#compact)
  - [unique](#unique)
  - [difference](#difference)
  - [differenceBy](#differenceBy)
  - [intersection](#intersection)
  - [intersectionBy](#intersectionBy)
  - [union](#union)
  - [unionBy](#unionBy)
  - [reduce](#reduce)
  - [each](#each)
  - [partition](#partition)
  - [countBy](#countBy)
  - [groupBy](#groupBy)
  - [indexBy](#indexBy)
  - [max](#max)
  - [maxBy](#maxBy)
  - [min](#min)
  - [minBy](#minBy)
  - [sort](#sort)
  - [sortBy](#sortBy)
  - [sortDesc](#sortDesc)
  - [sortByDesc](#sortByDesc)
  - [object](#object)
  - [pick](#pick)
  - [omit](#omit)
  - [values](#values)
  - [keys](#keys)
  - [entries](#entries)
  - [extend](#extend)
  - [defaults](#defaults)
  - [baseSel](#baseSel)
  - [sel](#sel)
  - [take](#take)
  - [takeWhile](#takeWhile)
  - [takeUntil](#takeUntil)
  - [takeAll](#takeAll)
  - [drop](#drop)
  - [dropWhile](#dropWhile)
  - [dropUntil](#dropUntil)
  - [dropRight](#dropRight)
  - [head](#head)
  - [tail](#tail)
  - [last](#last)
  - [initial](#initial)
  - [find](#find)
  - [findWhere](#findWhere)
  - [zip](#zip)
  - [unzip](#unzip)
  - [zipObj](#zipObj)
  - [zipWith](#zipWith)
  - [delay](#delay)
  - [promiseAllObject](#promiseAllObject)
  - [promiseAllEntries](#promiseAllEntries)
  - [noop](#noop)
  - [identity](#identity)
- [Predicates](#Predicates)
  - [some](#some)
  - [every](#every)
  - [match](#match)
  - [isMatch](#isMatch)
  - [isIterable](#isIterable)
  - [isFunction](#isFunction)
  - [isArray](#isArray)
  - [isString](#isString)
  - [isUndefined](#isUndefined)
- [Lazy](#lazy)
  - [L.range](#lrange)
  - [L.map](#lmap)
  - [L.filter](#lfilter)
  - [L.reject](#lreject)
  - [L.compact](#lcompact)
  - [L.mapEntries](#lmapEntries)
  - [L.entries](#lentries)
  - [L.values](#lvalues)
  - [L.keys](#lkeys)
  - [L.indexValues](#lindexValues)
  - [L.flat](#lflat)
  - [L.flatMap](#lflatMap)
  - [L.deepFlat](#ldeepFlat)
  - [L.reverse](#lreverse)
  - [L.take](#ltake)
  - [L.takeWhile](#ltakeWhile)
  - [L.takeUntil](#ltakeUntil)
  - [L.drop](#ldrop)
  - [L.dropWhile](#ldropWhile)
  - [L.dropUntil](#ldropUntil)
  - [L.difference](#ldifference)
  - [L.differenceBy](#ldifferenceBy)
  - [L.intersection](#lintersection)
  - [L.intersectionBy](#lintersectionBy)
  - [L.union](#lunion)
  - [L.unionBy](#lunionBy)
  - [L.interval](#linterval)
- [Concurrency](#concurrency)
  - [C.calls](#ccalls)
  - [C.takeAll](#ctakeAll)
  - [C.takeRace](#ctakeRace)
  - [C.race](#crace)
  - [C.map](#cmap)
  - [C.mapEntries](#cmapEntries)
  - [C.filter](#cfilter)
  - [C.compact](#ccompact)
  - [C.reduce](#creduce)
  - [C.take](#ctake)
  - [C.drop](#cdrop)
  - [C.take1](#ctake1)
  - [C.head](#chead)
  - [C.tail](#ctail)
  - [C.find](#cfind)
  - [C.every](#cevery)
  - [C.some](#csome)
- [Stoppable](#stoppable)
  - [reduceS, stop](#reduces-stop)
  - [goS, pipeS, stop, stopIf](#gos-pipes-stop-stopif)
- [String](#String)
  - [string](#string)
  - [strMap](#strMap)
  - [join](#join)
  - [html](#html)

## Function

### go
- `(a, a => b, b => c, ..., y => z) => z`
- `(Promise a, a => b, b => c, ..., y => z) => Promise z`
- `(a, a => Promise b, b => Promise c, ..., y => z) => Promise z`
- [source](#https://github.com/marpple/FxJS/blob/master/go.js)

```javascript
go(0, a => a + 1, a => a + 10, log); // 11
go(0, a => Promise.resolve(a + 1), a => a + 10, log); // 11

const b = go(0, a => a + 1, a => a + 10);
log(b); // 11

const pb = go(0, a => Promise.resolve(a + 1), a => a + 10);
pb.then(log); // 11
```

### pipe

- `((a, b, ...) => e, e => f, f => g, ..., y => z) => (a, b, ...) => z`
- `((a, b, ...) => Promise e, e => f, f => Promise g, ..., y => z) => Promise z`
- [source](#https://github.com/marpple/FxJS/blob/master/pipe.js)

```javascript
const f1 = pipe(a => a.toUpperCase(), a => a == 'A');
const b = f1('a');
log(b); // true

const total = f => pipe(
  map(f),
  reduce((a, b) => a + b));

const totalAge = total(({age}) => age);

go(
  fetchUsers(),
  totalAge,
  log);

go(
  fetchProducts(),
  total(({price}) => price),
  log);
```

### curry

- `(a, b, ...) => e => a => (b, ...) => e`
- `(a, b, ...) => e => (a, b, ...) => e`
- [source](#https://github.com/marpple/FxJS/blob/master/curry.js)

```javascript
const add = curry((a, b) => a + b);

const add10 = add(10);
add10(5); // 15
add10(6); // 16

add(10, 5); // 15
```

### tap

- `(g, f) => a => (f(g(a), a)`
- [source](#https://github.com/marpple/FxJS/blob/master/tap.js)

```javascript
go(
  10,
  a => a + 5,
  tap(
    a => a + 5,
    log), // 20
  a => a + 10,
  log); // 25
```

### constant

- `a => _ => a`
- [source](#https://github.com/marpple/FxJS/blob/master/constant.js)

```javascript
const a = constant('A');
a(); // A
a(); // A
```

### negate

- `f => a => !f(a)`
- [source](#https://github.com/marpple/FxJS/blob/master/negate.js)

```javascript
const a = negate(a => a);
log(a(true)); // false
log(a(false)); // true
```

### call

- `(f, ...args) => f(...args)`
- [source](#https://github.com/marpple/FxJS/blob/master/call.js)

### apply

- `(f, iterable) => f(...iterable)`
- [source](#https://github.com/marpple/FxJS/blob/master/apply.js)

### calls

- `([(a, b) => c, (a, b) => d, ...], a, b) => [c, d, ...]`
- `([(a, b) => Promise c, (a, b) => Promise d, ...], a, b) => Promise [c, d]`
- `({ k: (a, b) => c, k2: (a, b) => d }, a, b) => { k: c, k2: d }`
- `({ k: (a, b) => Promise c, k2: (a, b) => Promise d }, a, b) => Promise { k: c, k2: d }`
- [source](#https://github.com/marpple/FxJS/blob/master/calls.js)

```javascript
log(calls([
  a => a + 1,
  a => a + 2
], 10));
// [11, 12]

log(calls({
  a: a => a + 1,
  b: a => a + 2
}, 10));
// {a: 11, b: 12}

calls([
  _ => Promise.resolve(1),
  _ => Promise.resolve(2),
  _ => Promise.resolve(3)
]).then(log);
// [1, 2, 3]

calls({
  a: _ => Promise.resolve(1),
  b: _ => Promise.resolve(2),
  c: _ => Promise.resolve(3)
}).then(log);
// {a: 1, b: 2, c: 3}
```

## Strict

### range

### map

```javascript
map(a => a + 10, [1, 2, 3]);
// [11, 12, 13]
```

### mapEntries
### mapObject
### pluck

### flat
### deepFlat
### flatMap

### filter

```javascript
filter(a => a % 2, [1, 2, 3]);
// [1, 3]
```

### reject
### compact
### unique
### difference
### differenceBy
### intersection
### intersectionBy
### union
### unionBy

### reduce

```javascript
const add = (a, b) => a + b

reduce(add, [1, 2, 3]);
// 6

reduce(add, 10, [1, 2, 3]);
// 16

reduce(add, {a: 1, b: 2, c: 3});
// 6

await reduce(add, [Promise.resolve(1), 2, 3])
// 6
```

### each

### partition
### countBy
### groupBy
### indexBy
### max
### maxBy
### min
### minBy

### sort
### sortBy
### sortDesc
### sortByDesc

### object
### pick
### omit
### values
### keys
### entries
### extend
### defaults
### baseSel
### sel

### take

```javascript
take(1, [1, 2, 3]);
// [1]

take(2, [1, 2, 3])
// [1, 2]
```

### takeWhile
### takeUntil
### takeAll
### drop
### dropWhile
### dropUntil
### dropRight
### head
### tail, rest
### last
### initial

### find
### findWhere

### zip
### unzip
### zipObj
### zipWith

### delay
### promiseAllObject
### promiseAllEntries

### noop
### identity

## Predicates

### some
### every
### match
### isMatch
### isIterable
### isFunction
### isArray
### isString
### isUndefined

## Lazy

### L.range
### L.map
### L.filter
### L.reject
### L.compact
### L.mapEntries
### L.entries
### L.values
### L.keys
### L.indexValues
### L.flat
### L.flatMap
### L.deepFlat
### L.reverse
### L.take
### L.takeWhile
### L.takeUntil
### L.drop
### L.dropWhile
### L.dropUntil
### L.difference
### L.differenceBy
### L.intersection
### L.intersectionBy
### L.union
### L.unionBy
### L.interval


## Concurrency

### C.calls
### C.takeAll
### C.takeRace
### C.race
### C.map
### C.mapEntries
### C.filter
### C.compact
### C.reduce
### C.take
### C.drop
### C.take1
### C.head
### C.tail
### C.find
### C.every
### C.some

## Stoppable

### reduceS, stop

```javascript
reduceS((a, b) => {
 const res = a + b;
 return res > 5 ? stop(res) : res;
}, [1, 2, 3, 4]);
// 6
```

### goS, pipeS, stop, stopIf

```javascript
const f1 = pipeS(
  a => a % 2 ? stop(a) : a,
  a => a + 10);
f1(1); // 1
f1(2); // 12

goS({a: 1, b: 2},
  stopIf({a: 1}),
  ({a, b}) => ({a: a + 10, b})); // {a: 1, b: 2}

goS({a: 2, b: 2},
  stopIf({a: 1}),
  ({a, b}) => ({a: a + 10, b})); // {a: 12, b: 2}

goS({a: 1, b: 2},
  stopIf({a: 1}, null),
  ({a, b}) => ({a: a + 10, b}));
// null
```

## String

### string
### strMap
### join
### html

# Change Log