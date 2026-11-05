# X Clean Link

[![English](https://img.shields.io/badge/English-lightgrey?style=flat-square)](README.md)
[![한국어](https://img.shields.io/badge/%ED%95%9C%EA%B5%AD%EC%96%B4-lightgrey?style=flat-square)](README.ko.md)
[![日本語](https://img.shields.io/badge/%E6%97%A5%E6%9C%AC%E8%AA%9E-blue?style=flat-square)](README.ja.md)

X(Twitter)でコピーした投稿リンクとプロフィールリンクから、トラッキングパラメータを取り除く Chrome 拡張機能です。

これは非公式プロジェクトであり、X Corp. とは関係がなく、同社の承認も受けていません。「X」と「Twitter」は X Corp. の商標です。

```
https://x.com/example_handle/status/1234567890123456789?a=AbCdEfGhIjKlMnOpQrS&s=20
→ https://x.com/example_handle/status/1234567890123456789
```

## インストール

1. `chrome://extensions` を開き、**デベロッパー モード**をオンにします。
2. **パッケージ化されていない拡張機能を読み込む**をクリックし、このフォルダを選択します。
3. すでに開いている X のタブを再読み込みします。

## 処理の対象

クリップボードのテキスト全体が、`x.com` または `twitter.com`(`www.`、`mobile.` を含む)の `https` URL 1 つである必要があります。次のパスからクエリとフラグメントを取り除きます。

| 種類 | パス |
|---|---|
| 投稿 | `/<handle>/status/<id>`、`/i/status/<id>`、`/i/web/status/<id>`(`/photo/N`、`/video/N` が続いていても可) |
| プロフィール | `/<handle>` |

それ以外のテキストは変更しません。検索、リスト、スペース、intent、compose のリンク、`/<handle>/media` などのプロフィールタブ、`t.co` のリンク、他の文章と一緒に含まれる URL が該当します。ホストは変更しないため、`twitter.com` のリンクは `twitter.com` のままです。

対象の URL を Ctrl+C で手動コピーした場合も処理されます。ただし、選択範囲に画像などのメディアが含まれる場合は処理しません。

## 制限事項

次の操作はページのクリップボード呼び出しを経由しないため、処理できません。

- ブラウザの**リンクのアドレスをコピー**メニュー
- アドレスバーからのコピー
- システムの共有シート(`navigator.share`)
- X のモバイルアプリ

## テスト

```bash
node --test
```

## リンクが処理されなくなったとき

X がリンクのコピー方法を変更した可能性があります。x.com でデベロッパーツールを開き、コンソールに次のコードを貼り付けてから、**共有 > リンクをコピー**を実行します。

```js
// ページの読み込み後に実行します。拡張機能が処理する前に X が送る値を記録します。
for (const name of ['writeText', 'write']) {
  const original = Clipboard.prototype[name];
  Clipboard.prototype[name] = function (...args) {
    console.log('clipboard.' + name, args);
    return original.apply(this, args);
  };
}
window.addEventListener('copy', () => console.log('copy event', String(getSelection())), true);
```

結果の見方:

| コンソールの出力 | 意味 |
|---|---|
| クエリ付きの `clipboard.writeText` | 正常です。このログは処理の前に記録されます。貼り付けたリンクにクエリが残っている場合は、拡張機能がオンになっているか、タブを再読み込みしたかを確認し、`src/clean.js` がその URL のパスに対応しているかを確認します。 |
| `clipboard.write` または `copy event` | X がコピー方法を変更しました。新しい経路に対応するよう `src/hook.js` を修正する必要があります。 |
| 出力なし | X がこのコードでは検出できない経路を使っています。ページ読み込み時に保存された関数参照を使っている可能性があります。 |
