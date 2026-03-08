# Project Context

## Purpose
ABM Kits 是一个前端工具库集合，提供 UI 组件和实用工具函数，旨在为前端开发提供一致、高效的基础组件和工具。项目包含多个包：
- abm-ui：提供丰富的 UI 组件，如按钮、表单、导航等
- abm-utils：提供常用工具函数，如颜色处理、事件管理、类型工具等
- docs：项目文档站点
- docs-theme：文档站点主题

## Tech Stack
- TypeScript：类型安全的 JavaScript 超集
- Stylus：CSS 预处理器
- rolldown：JavaScript/TypeScript 打包工具
- pnpm：高性能包管理器
- Node.js：运行环境

## Project Conventions

### Code Style
- 使用 TypeScript 进行类型定义
- 采用模块化设计，每个组件和工具函数独立封装
- 遵循命名规范：组件使用 PascalCase，工具函数使用 camelCase
- 使用 Stylus 进行样式管理，采用缩进式语法
- 代码组织清晰，按功能模块划分目录

### Architecture Patterns
- Monorepo 结构：使用 pnpm workspace 管理多个包
- 组件化架构：UI 组件独立封装，可单独使用
- 工具库与 UI 库分离：abm-utils 作为独立工具库，可被 abm-ui 依赖
- 模块化设计：每个功能模块独立封装，便于维护和测试

### Testing Strategy
- 项目目前未配置明确的测试框架
- 建议添加单元测试和集成测试，确保组件和工具函数的稳定性
- 可考虑使用 Jest 或 Vitest 作为测试框架

### Git Workflow
- 项目使用 Git 进行版本控制
- 建议采用 Git Flow 工作流，包含主分支、开发分支和功能分支
- 提交信息应清晰明了，描述具体更改内容

## Domain Context
- 前端 UI 组件库：提供可复用的 UI 组件，支持各种交互场景
- 工具函数库：提供常用工具函数，简化前端开发工作
- 文档站点：提供组件和工具的使用说明和示例

## Important Constraints
- Node.js >= 24
- pnpm >= 10
- 现代浏览器环境支持

## External Dependencies
- reflect-metadata：用于 abm-ui 中的装饰器支持
- 项目内部依赖：abm-ui 依赖 abm-utils（workspace:~）
