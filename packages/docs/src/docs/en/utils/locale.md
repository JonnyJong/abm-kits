---
title: Locale
source: packages/abm-utils/src/locale.ts
---

```ts
import 'abm-utils/locale';
```

# Object `locale`

## Function `setup`
Used to initialize localization configuration.

## Function `t`
Used to get the translated string, returns the key name if no corresponding translation item exists.
```ts
locale.t('ui.ok'); // 'OK'
locale.t('unknown'); // 'unknown'
```

## Function `get`
Used to get the translated string, returns `null` if no corresponding translation item exists.
```ts
locale.get('ui.ok'); // 'OK'
locale.get('unknown'); // null
```

## Function `getRaw`
Used to get the raw translation result array, returns `null` if no corresponding translation item exists.

Can be used to implement rich text translation, example:
```tsx
element.append(...locale.getRaw('icon.pair', {
  icon: ico('icon'),
  name: 'Icon',
})!);
```

## Function `patch`
Used to patch the language list to enhance fallback effect.
```ts
locale.patch('zh-CN', ['zh-Han', 'en-US']);
// Patch result: ['zh-CN', 'zh', 'zh-Han', 'en-US', 'en']
```

## Function `reload`
Used to reload the localization dictionary.

## Functions `on`, `once`, `off`
Used to listen to and cancel listening to changes in the localization dictionary and loading results.

| Event Name | Parameter List                             | Description                                               |
| ---------- | ------------------------------------------ | --------------------------------------------------------- |
| `update`   | `[]`                                       | Localization dictionary loaded successfully               |
| `errors`   | `[errors: [locale: string, err: Error][]]` | Errors encountered during localization dictionary loading |

## Property `loader`
Localization dictionary loader.
```ts
locale.loader = (locale: string): Promise<LocaleDict | null> | LocaleDict | null => /* Load localization dictionary */
```

## Property `locales`
Language list, after modifying the language list, you must manually execute `locale.reload()` to refresh the language list.

## Read-only Property `loadedLocales`
Get the list of successfully loaded languages, this list will not change before loading is complete.

## Read-only Property `loaded`
Get the localization dictionary loading status.

# Type `LocaleDict`
Nested localization dictionary.

# Interface `LocaleRegistry`
[`LocaleDict`](#type-localedict) type, declares the global internationalization dictionary.
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

# Generic `LocalePackage`
Generic that satisfies [`LocaleDict`](#type-localedict), used to assist in declaring global internationalization dictionaries.
```ts
declare module 'abm-utils' {
  interface LocaleRegistry extends LocalePackage<typeof EN> {}
}
const EN = {} as const satisfies LocaleDict;
```

# Generic `LocaleVariant`
Generic that satisfies [`LocaleDict`](#type-localedict), used to define variant language dictionaries, requiring consistent structure but allowing missing translation items.
```ts
const ZH: LocaleVariant<typeof EN> = {};
```

# Type `LocaleKey`
String type, used to represent keys in the internationalization dictionary.

# Type `LocaleArgs`
Object type, used to pass parameters to internationalization functions.
