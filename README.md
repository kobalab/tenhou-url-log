# tenhou-url-log

電脳麻将の牌譜を天鳳JSON形式に変換

[電脳麻将](https://github.com/kobalab/Majiang) の [牌譜](https://github.com/kobalab/majiang-core/wiki/%E7%89%8C%E8%AD%9C) を [天鳳](https://tenhou.net) のJSON形式(https://tenhou.net/6/ 形式)の牌譜に変換します。

## インストール
コマンドラインから使用する場合
```sh
$ npm i -g @kobalab/tenhou-url-log
```
ライブラリとして使用する場合
```sh
$ npm i @kobalab/tenhou-url-log
```
## 使用例
コマンドラインから
```sh
$ tenhou-url-log 電脳麻将牌譜.json
```
ライブラリとして
``` javascript
const logconv = require('@kobalab/tenhou-url-log');

let url = 'https://tenhou.net/6/#json'
                    + encodeURI(JSON.stringify(logconv(paipu, 0)));
```
## コマンドライン仕様
### tenhou-url-log *paipu.json* [ *log-idx* ]
**paipu.json** を入力の電脳麻将牌譜とし、標準出力に変換した天鳳のJSON形式の牌譜を出力する。
**log-idx** を指定した場合は指定された局(東一局0本場を0と数える)のみ ``http://tenhou.net/6/#json=`` を付加した形式で出力する。
**log-idx** を省略した場合は全局をJSON形式で出力する。

## API仕様
### logconv()
  - **paipu** - [牌譜](https://github.com/kobalab/majiang-core/wiki/%E7%89%8C%E8%AD%9C)
  - **log_idx** - number (省略可)
  - **rule** - object (省略可)
  - *返り値* - object

**paipu** で指定された牌譜を天鳳のJSON形式の牌譜に変換し、Objectとして返す。
**log_idx** を指定した場合は指定された局(東一局0本場を0と数える)のみ、**log_idx** を省略した場合は全局を変換する。
**rule** には牌譜の ```rule``` プロパティに埋め込む値を指定できる。
省略時は ```{ disp: '電脳麻将', aka: 1 }``` とする。

## ライセンス
[MIT](https://github.com/kobalab/tenhou-url-log/blob/master/LICENSE)

## 作者
[Satoshi Kobayashi](https://github.com/kobalab)

## 謝辞
本パッケージは [kobalab/Majiang#118](https://github.com/kobalab/Majiang/issues/118) をきっかけに開発しました。
きっかけを与えていただいた [Apricot S.](https://github.com/Apricot-S) さんに感謝します。
また、本パッケージの開発に際し、同氏の [majiang-log](https://github.com/Apricot-S/majiang-log) を参考にさせていただきました。
