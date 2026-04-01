---
title: ABM Kits Documentation
layout: index
---

<img src="/abm-kits/social-preview.svg" style="display: block; width: 100%; border-radius: var(--border-radius); max-height: 300px; object-fit: cover; margin: 16px 0">

<div class="grid">
  <div class="grid-item" style="--w: 2; --h: 2">
    <div class="grid-preview" style="flex-direction: column">
      <abm-btn style="width: 100%">Button</abm-btn>
      <abm-text-box style="width: 100%">Text Input</abm-text-box>
      <abm-progress></abm-progress>
      <abm-slider></abm-slider>
      <abm-nav>
        <abm-nav-item>ABM</abm-nav-item>
        <abm-nav-item>Kits</abm-nav-item>
        <abm-nav-item>Documentation</abm-nav-item>
      </abm-nav>
    </div>
    <a class="grid-link" href="./component">Components</a>
  </div>
  <div class="grid-item" style="--w: 2; --h: 2">
    <div class="grid-preview" style="flex-direction: column">
      <div class="surface-glass ui-dialog" style="width: 100%; margin: 0">
        <abm-btn class="ui-dialog-close" flat><abm-icon key="ui.dialogClose"></abm-icon></abm-btn>
        <div class="ui-dialog-icon"><abm-icon key="settings"></abm-icon></div>
        <div class="ui-dialog-title">Dialog</div>
        <div class="ui-dialog-content">Dialog content</div>
        <div class="ui-dialog-actions">
          <abm-btn variant="primary"><abm-i18n key="ui.confirm"></abm-i18n></abm-btn>
          <abm-btn><abm-i18n key="ui.cancel"></abm-i18n></abm-btn>
        </div>
      </div>
      <div class="surface-glass ui-toast" style="position: relative">
        <div class="ui-toast-icon"><abm-spinner></abm-spinner></div>
        <div class="ui-toast-title">Toast Notification</div>
        <div class="ui-toast-actions"></div>
        <div class="ui-toast-details"></div>
      </div>
    </div>
    <a class="grid-link" href="./widget">Widgets</a>
  </div>
  <div class="grid-item">
    <a class="grid-link grid-preview" href="./prefab">Prefab UI</a>
  </div>
  <div class="grid-item" style="--w: 2">
    <a class="grid-link grid-preview" href="./infra">Infrastructure</a>
  </div>
  <div class="grid-item">
    <a class="grid-link grid-preview" href="./input">Input</a>
  </div>
  <div class="grid-item" style="--w: 2">
    <a class="grid-link grid-preview" href="./utils">ABM Utils</a>
  </div>
  <div class="grid-item">
    <a class="grid-link grid-preview" href="./cheat-sheet">Cheat Sheet</a>
  </div>
  <div class="grid-item">
    <a class="grid-link grid-preview" href="./other">Other</a>
  </div>
</div>
