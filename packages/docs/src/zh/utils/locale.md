---
title: 本地化
source:
	- packages/abm-utils/src/locale.ts
---

# 类型 `PluralFormatOptions`
复数格式化选项。

# 类型 `EnumFormatOptions`
枚举格式化选项。

# 类型 `LocaleDict`
本地化词典。

# `defineTranslation()`
定义翻译项。

# 类型 `LocaleDictDefine`
从 [`LocaleDict`](#类型-localedict) 提取本地化词典定义。

# 类型 `FlatLocaleParams`
从 [`LocaleDict`](#类型-localedict) 提取本地化词典扁平化键值。

---

# 类 `LocaleLoadError`
词典加载错误类，继承自 `Error` 类。

## `errors`
所有错误，只读。

---

# 接口 `LocaleInit`

## `loader`
翻译源加载函数。

## `locales`
语言列表。

# 接口 `LocaleEvents`
[`Locale`](#类-locale) 类事件列表。

- `update`：翻译更新事件
- `error`：翻译加载错误事件

# 类 `Locale`
该类实现 [`IEventSource`](/@/utils/events#接口-ieventsource) 接口。

## 静态属性与方法

### `patchFallbacks`
修补语言列表。

```ts
import { Locale } from 'abm-utils';

const locales = Locale.patchFallbacks(['zh-CN'], ['en-US']);

console.log(locales); // ['zh-CN', 'zh', 'en-US', 'en'];
```

## 实例属性与方法

### `constructor()`
参数：
- `init`：[`LocaleInit`](#接口-localeinit) 类型

### `loader`
可读取或修改翻译源加载函数。

### `locales`
可读取或修改语言列表。

### `loadedLocales`
已加载的语言列表，只读。

### `loaded`
是否完成加载，只读。

### `reload`
重新加载，返回 `Promise<LocaleLoadError | undefined>`。

### `getStringOrNull`
获取原始翻译，若无对应翻译项，返回 `null`。

### `getString`
获取翻译，若无对应翻译项，返回键名。

---

# 接口 `LocaleManagerEvents`
[`LocaleManager`](#类-localemanager) 类事件列表。

- `update`：翻译更新事件

# 类 `LocaleManager`
该类实现 [`IEventSource`](/@/utils/events#接口-ieventsource) 接口。

## `registerLocale()`
注册命名空间，若返回 `false`，表示该命名空间已被占用。

## `getLocale()`
获取命名空间对应 [`Locale`](#类-locale) 对象。

## `removeLocale()`
移除命名空间。

## `getString()`
根据命名空间及翻译键名获取翻译。

## `updateLocales()`
更新所有命名空间语言列表并重新加载翻译。
