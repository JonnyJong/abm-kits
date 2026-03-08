---
title: 国际化
source: packages/abm-utils/src/locale.ts
---

```ts
import 'abm-utils/locale';
```

# 对象 `locale`

## 函数 `setup`
用于初始化本地化配置。

## 函数 `t`
用于获取翻译后的字符串，若无对应翻译项则返回键名。
```ts
locale.t('ui.ok'); // '确定'
locale.t('unknown'); // 'unknown'
```

## 函数 `get`
用于获取翻译后的字符串，若无对应翻译项则返回 `null`。
```ts
locale.get('ui.ok'); // '确定'
locale.get('unknown'); // null
```

## 函数 `getRaw`
用于获取原始的翻译结果数组，若无对应翻译项则返回 `null`。

可用于实现富文本翻译，例：
```tsx
element.append(...locale.getRaw('icon.pair', {
  icon: ico('icon'),
  name: 'Icon',
})!);
```

## 函数 `patch`
用于修补语言列表以增强回退效果。
```ts
locale.patch('zh-CN', ['zh-Han', 'en-US']);
// 修补结果：['zh-CN', 'zh', 'zh-Han', 'en-US', 'en']
```

## 函数 `reload`
用于重新加载本地化词典。

## 函数 `on`、`once`、`off`
用于监听和取消监听本地化词典的变化和加载结果。

| 事件名   | 参数列表                                   | 描述                           |
| -------- | ------------------------------------------ | ------------------------------ |
| `update` | `[]`                                       | 本地化词典加载完成             |
| `errors` | `[errors: [locale: string, err: Error][]]` | 本地化词典加载过程中遇到的错误 |

## 属性 `loader`
本地化词典加载器。
```ts
locale.loader = (locale: string): Promise<LocaleDict | null> | LocaleDict | null => /* 加载本地化词典 */
```

## 属性 `locales`
语言列表，修改语言列表后必须手动执行 `locale.reload()` 才能刷新语言列表。

## 只读属性 `loadedLocales`
获取已成功加载的语言列表，加载完成前该列表不会发生变化。

## 只读属性 `loaded`
获取本地化词典加载状态。

# 类型 `LocaleDict`
支持嵌套的本地化词典。

# 接口 `LocaleRegistry`
[`LocaleDict`](#类型-localedict) 类型，声明全局的国际化字典。
```ts
declare module 'abm-utils' {
  interface LocaleRegistry {
    xxx: string;
    yyy: string;
    zzz: [string, {
      enum: { a: string, b: string, c: string },
    }];
  }
}
```

# 泛型 `LocalePackage`
满足 [`LocaleDict`](#类型-localedict) 的泛型，用于辅助声明全局国际化字典。
```ts
declare module 'abm-utils' {
  interface LocaleRegistry extends LocalePackage<typeof ZH> {}
}
const ZH = {} as const satisfies LocaleDict;
```

# 泛型 `LocaleVariant`
满足 [`LocaleDict`](#类型-localedict) 的泛型，用于定义变体语言的字典，要求结构一致但允许缺失翻译项。
```ts
const EN: LocaleVariant<typeof ZH> = {};
```

# 类型 `LocaleKey`
字符串类型，用于表示国际化字典中的键名。

# 类型 `LocaleArgs`
对象类型，用于传递国际化函数的参数。
