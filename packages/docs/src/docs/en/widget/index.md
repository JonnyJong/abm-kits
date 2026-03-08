---
title: Widgets
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
    <a class="grid-link" href="./widget/dialog">Dialog</a>
  </div>
  <div class="grid-item">
    <div class="grid-preview">
      <div class="surface-glass ui-flyout">Flyout</div>
    </div>
    <a class="grid-link" href="./widget/flyout">Flyout</a>
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
    <a class="grid-link" href="./widget/toast">Toast Notification</a>
  </div>
  <div class="grid-item">
    <div class="grid-preview">
      <abm-btn id="grid-open-menu">Open Menu</abm-btn>
    </div>
    <a class="grid-link" href="./widget/menu">Menu</a>
  </div>
  <div class="grid-item">
    <div class="grid-preview" tooltip="Ta-da!" style="user-select: none">Hover/Press here</div>
    <a class="grid-link" href="./widget/tooltip">Tooltip</a>
  </div>
</div>

<script>
(() => {
	const { $, Menu, ico } = __ABM_UI;
	const menu = new Menu([
		{ icon: ico('ui.increase'), label: 'New...' },
		{ label: 'Save' },
		{ label: 'Save as...' },
		{ type: 'separator' },
		{
			label: 'Edit',
			submenu: [
				{ label: 'Copy' },
				{ label: 'Cut' },
				{ label: 'Paste' },
				{ label: 'Delete' },
			],
		},
    {
      label: 'Select',
      submenu: [{ label: 'nothing...'}],
      disabled: true,
    },
	]);
	const btn = $('#grid-open-menu');
	btn.on('active', () => menu.open(btn));
})();
</script>