---
title: 预制 UI
layout: index
order: 2
---

<div class="grid">
  <div class="grid-item" style="--w: 2">
    <div class="grid-preview">
      <div class="group">
        <abm-text-box>编写消息</abm-text-box>
        <abm-btn variant="primary" disabled style="white-space: nowrap">发送</abm-btn>
      </div>
    </div>
    <a class="grid-link" href="./css"><code>.group</code></a>
  </div>
  <div class="grid-item" style="--h: 2">
    <div class="grid-preview">
      <div class="grid-preview-container">
        <div class="grid-preview-h" style="opacity: .2"></div>
        <div class="grid-preview-h" style="opacity: .4"></div>
        <div class="grid-preview-h" style="opacity: .6"></div>
        <div class="grid-preview-h" style="opacity: .8"></div>
        <div class="grid-preview-h"></div>
        <div class="grid-preview-h" style="opacity: .8"></div>
        <div class="grid-preview-h" style="opacity: .6"></div>
        <div class="grid-preview-h" style="opacity: .4"></div>
        <div class="grid-preview-h" style="opacity: .2"></div>
      </div>
    </div>
    <a class="grid-link" href="./list">列表</a>
  </div>
  <div class="grid-item">
    <div class="grid-preview">
      <div class="grid-preview-container">
        <div class="grid-preview-h" style="opacity: .5"></div>
        <div class="grid-preview-h"></div>
        <div class="grid-preview-h" style="opacity: .5"></div>
      </div>
      <div class="grid-preview-container">
        <div class="grid-preview-v" style="opacity: .3"></div>
        <div class="grid-preview-v" style="opacity: .7"></div>
        <div class="grid-preview-v"></div>
        <div class="grid-preview-v" style="opacity: .7"></div>
        <div class="grid-preview-v" style="opacity: .3"></div>
      </div>
    </div>
    <a class="grid-link" href="./grid">网格</a>
  </div>
  <div class="grid-item">
    <a class="grid-link grid-preview" href="./number">数字输入<wbr>预制件</a>
  </div>
  <div class="grid-item">
    <a class="grid-link grid-preview" href="./tabs">多标签页<wbr>预制件</a>
  </div>
</div>

<style>
.grid-preview { position: relative }
.grid-preview-container { position: absolute; width: 80%; height: 80% }
.grid-preview-h { height: 1px; background: var(--fg); margin: 16px 0 }
.grid-preview-container:has(.grid-preview-v) {
  display: flex;
  gap: 16px;
  justify-content: center;
}
.grid-preview-v { width: 1px; background: var(--fg) }
</style>
