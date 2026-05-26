import { autoResizeTextarea } from './textareaResize';
import { DesignStudioPanel, type DesignStudioActionItem } from './DesignStudioPanel';

export type BusinessLineDockVariant = 'zao' | 'dev';

export interface BusinessLineDockOptions {
  variant: BusinessLineDockVariant;
  inputEl: HTMLTextAreaElement;
  onSend?: () => void;
  inline?: boolean;
}

class DevStudioPanel {
  private rootEl: HTMLElement;
  private onClose: () => void;

  constructor(parentEl: HTMLElement, onClose: () => void) {
    this.onClose = onClose;
    this.rootEl = parentEl.createDiv({ cls: 'claudian-design-studio-panel' });
    this.render();
  }

  private render(): void {
    this.rootEl.empty();
    const headerEl = this.rootEl.createDiv({ cls: 'claudian-design-studio-panel-header' });
    headerEl.createSpan({ cls: 'claudian-design-studio-panel-brand', text: 'DEV' });
    headerEl.createSpan({ cls: 'claudian-design-studio-panel-title', text: 'Dev Studio' });

    const closeBtn = headerEl.createEl('button', {
      cls: 'claudian-design-studio-panel-close',
      text: 'x',
    });
    closeBtn.addEventListener('click', () => this.onClose());

    const contentEl = this.rootEl.createDiv({ cls: 'claudian-design-studio-panel-content' });
    contentEl.createDiv({
      cls: 'claudian-design-studio-group-title',
      text: 'Developer Line',
    });
    contentEl.createDiv({
      cls: 'claudian-design-studio-item',
      text: 'Dev Studio 占位面板，后续可接具体业务内容。',
    });
  }

  getElement(): HTMLElement {
    return this.rootEl;
  }

  setViewportPosition(left: number, top: number): void {
    this.rootEl.style.left = `${left}px`;
    this.rootEl.style.top = `${top}px`;
  }

  destroy(): void {
    this.rootEl.remove();
  }
}

type DockPanel = DesignStudioPanel | DevStudioPanel;

function addWindowListener(
  ownerWindow: Window | null,
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions,
): void {
  if (typeof ownerWindow?.addEventListener !== 'function') {
    return;
  }
  ownerWindow.addEventListener(type, listener, options);
}

function removeWindowListener(
  ownerWindow: Window | null,
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | EventListenerOptions,
): void {
  if (typeof ownerWindow?.removeEventListener !== 'function') {
    return;
  }
  ownerWindow.removeEventListener(type, listener, options);
}

export class BusinessLineDock {
  private rootEl: HTMLElement;
  private buttonEl: HTMLButtonElement;
  private panel: DockPanel | null = null;
  private inputEl: HTMLTextAreaElement;
  private onSend?: () => void;
  private variant: BusinessLineDockVariant;
  private inline: boolean;
  private onDocumentClick: (event: MouseEvent) => void;
  private onWindowResize: () => void;
  private onWindowScroll: () => void;
  private isOpen = false;
  private isPointerDown = false;
  private isDragging = false;
  private dragPointerId: number | null = null;
  private dragOffsetX = 0;
  private dragOffsetY = 0;
  private startPointerX = 0;
  private startPointerY = 0;
  private readonly dragThreshold = 6;
  private onPointerMove: (event: PointerEvent) => void;
  private onPointerUp: (event: PointerEvent) => void;

  constructor(parentEl: HTMLElement, options: BusinessLineDockOptions) {
    this.inputEl = options.inputEl;
    this.onSend = options.onSend;
    this.variant = options.variant;
    this.inline = options.inline === true;

    this.rootEl = parentEl.createDiv({
      cls: `claudian-business-dock claudian-business-dock--${this.variant}${this.inline ? ' claudian-business-dock--inline' : ''}`,
    });
    this.buttonEl = this.rootEl.createEl('button', {
      cls: 'claudian-business-line-btn',
      text: this.variant === 'zao' ? 'ZAO' : 'DEV',
    });
    this.buttonEl.type = 'button';
    this.buttonEl.setAttribute(
      'aria-label',
      this.variant === 'zao' ? 'Open design studio' : 'Open dev studio',
    );

    if (!this.inline) {
      this.buttonEl.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.isPointerDown = true;
        this.isDragging = false;
        this.dragPointerId = event.pointerId;
        this.startPointerX = event.clientX;
        this.startPointerY = event.clientY;
        const rect = this.rootEl.getBoundingClientRect();
        this.dragOffsetX = event.clientX - rect.left;
        this.dragOffsetY = event.clientY - rect.top;
        this.buttonEl.setPointerCapture(event.pointerId);
      });
    } else {
      this.buttonEl.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.toggle();
      });
    }

    this.onDocumentClick = (event: MouseEvent) => {
      if (!this.isOpen) return;
      const target = event.target as Node | null;
      if (target && this.rootEl.contains(target)) return;
      if (target && this.panel?.getElement().contains(target)) return;
      this.close();
    };

    this.onWindowResize = () => {
      if (this.isOpen) {
        this.positionPanel();
      }
    };

    this.onWindowScroll = () => {
      if (this.isOpen) {
        this.positionPanel();
      }
    };

    this.onPointerMove = (event: PointerEvent) => {
      if (this.inline) return;
      if (!this.isPointerDown || this.dragPointerId !== event.pointerId) {
        return;
      }

      const deltaX = event.clientX - this.startPointerX;
      const deltaY = event.clientY - this.startPointerY;
      if (!this.isDragging) {
        const movedEnough = Math.hypot(deltaX, deltaY) >= this.dragThreshold;
        if (!movedEnough) {
          return;
        }
        this.isDragging = true;
        this.rootEl.addClass('is-dragging');
        this.close();
      }

      this.updateDockPosition(event.clientX - this.dragOffsetX, event.clientY - this.dragOffsetY);
    };

    this.onPointerUp = (event: PointerEvent) => {
      if (this.inline) return;
      if (!this.isPointerDown || this.dragPointerId !== event.pointerId) {
        return;
      }

      this.buttonEl.releasePointerCapture(event.pointerId);
      const shouldToggle = !this.isDragging;
      this.isPointerDown = false;
      this.isDragging = false;
      this.dragPointerId = null;
      this.rootEl.removeClass('is-dragging');

      if (shouldToggle) {
        this.toggle();
      }
    };

    const ownerWindow = this.rootEl.ownerDocument.defaultView;
    this.rootEl.ownerDocument.addEventListener('click', this.onDocumentClick);
    addWindowListener(ownerWindow, 'resize', this.onWindowResize);
    addWindowListener(ownerWindow, 'scroll', this.onWindowScroll, true);
    if (!this.inline) {
      addWindowListener(ownerWindow, 'pointermove', this.onPointerMove as EventListener);
      addWindowListener(ownerWindow, 'pointerup', this.onPointerUp as EventListener);
      addWindowListener(ownerWindow, 'pointercancel', this.onPointerUp as EventListener);
    }
  }

  setVisible(visible: boolean): void {
    this.rootEl.toggleClass('claudian-hidden', !visible);
    if (!visible) {
      this.close();
    }
  }

  private toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  private open(): void {
    if (this.isOpen) return;
    this.isOpen = true;
    this.buttonEl.addClass('is-active');

    if (this.variant === 'zao') {
      this.panel = new DesignStudioPanel(this.rootEl.ownerDocument.body, {
        onAction: (item: DesignStudioActionItem) => this.handleAction(item),
        onClose: () => this.close(),
      });
    } else {
      this.panel = new DevStudioPanel(this.rootEl.ownerDocument.body, () => this.close());
    }

    this.positionPanel();
  }

  close(): void {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.buttonEl.removeClass('is-active');
    this.panel?.destroy();
    this.panel = null;
  }

  private handleAction(item: DesignStudioActionItem): void {
    this.inputEl.value = item.command;
    this.inputEl.focus();
    autoResizeTextarea(this.inputEl);

    if (item.behavior === 'send') {
      this.onSend?.();
      return;
    }

    this.close();
  }

  private positionPanel(): void {
    if (!this.panel) return;

    const ownerWindow = this.rootEl.ownerDocument.defaultView;
    if (!ownerWindow) return;

    const buttonRect = this.buttonEl.getBoundingClientRect();
    const panelEl = this.panel.getElement();
    const margin = 12;
    const panelWidth = panelEl.offsetWidth || 320;
    const panelHeight = panelEl.offsetHeight || 520;

    let left = buttonRect.left;
    let top = buttonRect.bottom + 12;

    const maxLeft = ownerWindow.innerWidth - panelWidth - margin;
    const maxTop = ownerWindow.innerHeight - panelHeight - margin;

    if (left > maxLeft) {
      left = Math.max(margin, maxLeft);
    }
    if (left < margin) {
      left = margin;
    }
    if (top > maxTop) {
      top = Math.max(margin, maxTop);
    }

    this.panel.setViewportPosition(left, top);
  }

  private updateDockPosition(rawLeft: number, rawTop: number): void {
    if (this.inline) {
      return;
    }

    const parentRect = this.rootEl.parentElement?.getBoundingClientRect();
    if (!parentRect) {
      return;
    }

    const dockRect = this.rootEl.getBoundingClientRect();
    const maxLeft = Math.max(0, parentRect.width - dockRect.width);
    const maxTop = Math.max(0, parentRect.height - dockRect.height);

    const localLeft = rawLeft - parentRect.left;
    const localTop = rawTop - parentRect.top;

    const clampedLeft = Math.min(Math.max(localLeft, 0), maxLeft);
    const clampedTop = Math.min(Math.max(localTop, 0), maxTop);
    const bottom = Math.max(0, parentRect.height - clampedTop - dockRect.height);

    this.rootEl.style.left = `${clampedLeft}px`;
    this.rootEl.style.bottom = `${bottom}px`;
  }

  destroy(): void {
    const ownerWindow = this.rootEl.ownerDocument.defaultView;
    this.rootEl.ownerDocument.removeEventListener('click', this.onDocumentClick);
    removeWindowListener(ownerWindow, 'resize', this.onWindowResize);
    removeWindowListener(ownerWindow, 'scroll', this.onWindowScroll, true);
    if (!this.inline) {
      removeWindowListener(ownerWindow, 'pointermove', this.onPointerMove as EventListener);
      removeWindowListener(ownerWindow, 'pointerup', this.onPointerUp as EventListener);
      removeWindowListener(ownerWindow, 'pointercancel', this.onPointerUp as EventListener);
    }
    this.close();
    this.rootEl.remove();
  }
}
