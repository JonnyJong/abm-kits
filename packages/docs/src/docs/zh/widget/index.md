---
title: 微件
layout: index
order: 1
---

<div class="grid">
  <div class="grid-item" style="--w: 2; --h: 2">
    <div class="grid-preview">
      <div class="surface-glass ui-dialog">
        <abm-btn class="ui-dialog-close" flat><abm-icon key="ui.dialogClose"></abm-icon></abm-btn>
        <div class="ui-dialog-icon"><abm-icon key="settings"></abm-icon></div>
        <div class="ui-dialog-title">Hello world</div>
        <div class="ui-dialog-content">
          Lorem ipsum dolor sit dolores esse sea
        </div>
        <div class="ui-dialog-actions">
          <abm-btn variant="primary"><abm-i18n key="ui.confirm"></abm-i18n></abm-btn>
          <abm-btn><abm-i18n key="ui.cancel"></abm-i18n></abm-btn>
        </div>
      </div>
    </div>
    <a class="grid-link" href="./widget/dialog">对话框</a>
  </div>
  <div class="grid-item">
    <div class="grid-preview">
      <div class="surface-glass ui-flyout">Flyout</div>
    </div>
    <a class="grid-link" href="./widget/flyout">浮出面板</a>
  </div>
  <div class="grid-item" style="--w: 2">
    <div class="grid-preview">
      <div class="surface-glass ui-toast" style="position: relative">
        <div class="ui-toast-icon"><abm-spinner></abm-spinner></div>
        <div class="ui-toast-title">Loading something...</div>
        <div class="ui-toast-actions"></div>
        <div class="ui-toast-details"></div>
      </div>
    </div>
    <a class="grid-link" href="./widget/toast">吐司通知</a>
  </div>
  <div class="grid-item">
    <div class="grid-preview">
      <abm-btn id="grid-open-menu">打开菜单</abm-btn>
    </div>
    <a class="grid-link" href="./widget/menu">菜单</a>
  </div>
  <div class="grid-item">
    <div class="grid-preview" tooltip="哒哒！" style="user-select: none">悬停/按住这里</div>
    <a class="grid-link" href="./widget/tooltip">工具提示</a>
  </div>
</div>

<script>
(() => {
	const { $, Menu, ico } = __ABM_UI;
	const menu = new Menu([
		{ icon: ico('ui.increase'), label: '新建...' },
		{ label: '保存' },
		{ label: '另存为...' },
		{ type: 'separator' },
		{
			label: '编辑',
			submenu: [
				{ label: '复制' },
				{ label: '剪切' },
				{ label: '粘贴' },
				{ label: '删除' },
			],
		},
    {
      label: '选择',
      submenu: [{ label: 'nothing...'}],
      disabled: true,
    },
	]);
	const btn = $('#grid-open-menu');
	btn.on('active', () => menu.open(btn));
})();
</script>
