---
title: 日志
source:
	- packages/abm-utils/src/log.ts
---

# 类型 `LogLevel`
日志级别：
- `debug`：调试
- `info`：信息
- `warn`：警告
- `error`：错误
- `fatal`：致命错误

# 接口 `Log`

## `mod`
`string` 类型，日志对应模块。

## `level`
[`LogLevel`](#类型-loglevel) 类型，日志等级。

## `time`
`number` 类型，日志记录时间。

## `message`
`string` 类型，日志消息。

## `errObj`
`Error | undefined` 类型，日志相关错误信息。

# `logging`

## `consoleOutputLevel`
[`LogLevel`](#类型-loglevel) 类型参数，表示日志输出等级，默认 `warn`。

## `push()`
推送日志，一个 [`Log`](#接口-log) 类型参数。

## `on()`
监听高于特定等级的日志。

参数：
- `handler`：`(log: Log) => any` 类型
- `level`：[`LogLevel`](#类型-loglevel) 类型

## `off()`
取消监听日志，参考：[`on()`](#on)

# 类 `Logger`

## `constructor()`
参数：
- `mod`：`string` 类型，模块名称

## `debug()`
发出 `debug` 级别日志。

## `info()`
发出 `info` 级别日志。

## `warn()`
发出 `warn` 级别日志。

## `error()`
发出 `error` 级别日志。

## `fatal()`
发出 `fatal` 级别日志。
