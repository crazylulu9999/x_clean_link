# X Clean Link

[![English](https://img.shields.io/badge/English-lightgrey?style=flat-square)](README.md)
[![한국어](https://img.shields.io/badge/%ED%95%9C%EA%B5%AD%EC%96%B4-blue?style=flat-square)](README.ko.md)
[![日本語](https://img.shields.io/badge/%E6%97%A5%E6%9C%AC%E8%AA%9E-lightgrey?style=flat-square)](README.ja.md)

X(Twitter)에서 복사한 게시물 및 프로필 링크의 추적 변수를 제거하는 Chrome 확장 프로그램입니다.

비공식 프로젝트이며 X Corp.와 관련이 없고 X Corp.의 보증을 받지 않았습니다. "X"와 "Twitter"는 X Corp.의 상표입니다.

```
https://x.com/example_handle/status/1234567890123456789?a=AbCdEfGhIjKlMnOpQrS&s=20
→ https://x.com/example_handle/status/1234567890123456789
```

## 설치

1. `chrome://extensions`를 열고 **개발자 모드**를 켭니다.
2. **압축해제된 확장 프로그램을 로드합니다**를 눌러 이 폴더를 선택합니다.
3. 이미 열려 있는 X 탭을 새로고침합니다.

## 정리 대상

클립보드 텍스트 전체가 `x.com` 또는 `twitter.com`(`www.`, `mobile.` 포함)의 `https` URL 하나여야 합니다. 다음 경로에서 쿼리와 프래그먼트를 제거합니다.

| 유형 | 경로 |
|---|---|
| 게시물 | `/<handle>/status/<id>`, `/i/status/<id>`, `/i/web/status/<id>` (`/photo/N`, `/video/N`은 있어도 됨) |
| 프로필 | `/<handle>` |

그 밖의 텍스트는 그대로 둡니다. 검색, 리스트, Spaces, intent, compose 링크, `/<handle>/media` 같은 프로필 탭, `t.co` 링크, 다른 문구와 함께 있는 URL이 여기에 해당합니다. 호스트는 바꾸지 않으므로 `twitter.com` 링크는 `twitter.com`으로 유지됩니다.

해당하는 URL을 Ctrl+C로 직접 복사해도 정리됩니다. 단, 선택 영역에 이미지 등의 미디어가 포함되어 있으면 정리하지 않습니다.

## 제한 사항

다음은 페이지의 클립보드 호출을 거치지 않아 정리할 수 없습니다.

- 브라우저의 **링크 주소 복사** 메뉴
- 주소창에서 복사
- 시스템 공유 시트(`navigator.share`)
- X 모바일 앱

## 테스트

```bash
node --test
```

## 링크가 정리되지 않을 때

X가 링크 복사 방식을 바꿨을 수 있습니다. x.com에서 개발자 도구를 열고 콘솔에 아래 코드를 붙여넣은 뒤, **공유하기 > 링크 복사하기**를 실행합니다.

```js
// 페이지 로드 후 실행합니다. 확장 프로그램이 정리하기 전에 X가 보내는 값을 기록합니다.
for (const name of ['writeText', 'write']) {
  const original = Clipboard.prototype[name];
  Clipboard.prototype[name] = function (...args) {
    console.log('clipboard.' + name, args);
    return original.apply(this, args);
  };
}
window.addEventListener('copy', () => console.log('copy event', String(getSelection())), true);
```

결과를 보는 방법:

| 콘솔 출력 | 의미 |
|---|---|
| 쿼리가 붙은 `clipboard.writeText` | 정상입니다. 이 로그는 정리 전에 기록됩니다. 붙여넣은 링크에 쿼리가 남아 있다면 확장 프로그램이 켜져 있는지와 탭을 새로고침했는지 확인하고, `src/clean.js`가 해당 URL 경로를 지원하는지 확인합니다. |
| `clipboard.write` 또는 `copy event` | X가 복사 방식을 바꿨습니다. `src/hook.js`가 새 경로를 처리하도록 수정해야 합니다. |
| 출력 없음 | X가 이 코드로 볼 수 없는 경로를 사용합니다. 페이지 로드 시 저장해 둔 함수 참조를 쓰는 경우일 수 있습니다. |
