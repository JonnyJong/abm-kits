---
title: ABM Kits 文档
layout: index
---

<img src="/abm-kits/social-preview.svg" style="display: block; width: 100%; border-radius: var(--border-radius); max-height: 300px; object-fit: cover; margin: 16px 0">

<div class="grid">
  <div class="grid-item" style="--w: 2; --h: 2">
    <div class="grid-preview" style="flex-direction: column">
      <abm-btn style="width: 100%">按钮</abm-btn>
      <abm-text-box style="width: 100%">文本输入框</abm-text-box>
      <abm-progress></abm-progress>
      <abm-slider></abm-slider>
      <abm-nav>
        <abm-nav-item>ABM</abm-nav-item>
        <abm-nav-item>工具包</abm-nav-item>
        <abm-nav-item>文档</abm-nav-item>
      </abm-nav>
    </div>
    <a class="grid-link" href="./zh/component">组件</a>
  </div>
  <div class="grid-item" style="--w: 2; --h: 2">
    <div class="grid-preview" style="flex-direction: column">
      <div class="surface-glass ui-dialog" style="width: 100%; margin: 0">
        <abm-btn class="ui-dialog-close" flat><abm-icon key="ui.dialogClose"></abm-icon></abm-btn>
        <div class="ui-dialog-icon"><abm-icon key="settings"></abm-icon></div>
        <div class="ui-dialog-title">对话框</div>
        <div class="ui-dialog-content">对话框内容</div>
        <div class="ui-dialog-actions">
          <abm-btn variant="primary"><abm-i18n key="ui.confirm"></abm-i18n></abm-btn>
          <abm-btn><abm-i18n key="ui.cancel"></abm-i18n></abm-btn>
        </div>
      </div>
      <div class="surface-glass ui-toast" style="position: relative">
        <div class="ui-toast-icon"><abm-spinner></abm-spinner></div>
        <div class="ui-toast-title">吐司通知</div>
        <div class="ui-toast-actions"></div>
        <div class="ui-toast-details"></div>
      </div>
    </div>
    <a class="grid-link" href="./zh/widget">微件</a>
  </div>
  <div class="grid-item">
    <a class="grid-link grid-preview" href="./zh/prefab">预制 UI</a>
  </div>
  <div class="grid-item" style="--w: 2">
    <a class="grid-link grid-preview" href="./zh/infra">基础设施</a>
  </div>
  <div class="grid-item">
    <a class="grid-link grid-preview" href="./zh/input">输入</a>
  </div>
  <div class="grid-item" style="--w: 2">
    <a class="grid-link grid-preview" href="./zh/utils">ABM Utils</a>
  </div>
  <div class="grid-item">
    <a class="grid-link grid-preview" href="./zh/cheat-sheet">速查表</a>
  </div>
  <div class="grid-item">
    <a class="grid-link grid-preview" href="./zh/other">其他</a>
  </div>
</div>
