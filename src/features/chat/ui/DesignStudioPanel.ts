import { DEFAULT_DESIGN_STUDIO_MENU_SECTIONS } from '../../../app/settings/defaultSettings';
import type { ChatMenuActionItem, ChatMenuSection } from '../../../core/types/settings';

export type DesignStudioActionItem = ChatMenuActionItem;
export type DesignStudioSection = ChatMenuSection;

export interface DesignStudioPanelCallbacks {
  onAction: (item: DesignStudioActionItem) => void;
  onClose: () => void;
  sections?: DesignStudioSection[];
  title?: string;
  brand?: string;
}

export class DesignStudioPanel {
  private rootEl: HTMLElement;
  private callbacks: DesignStudioPanelCallbacks;

  constructor(parentEl: HTMLElement, callbacks: DesignStudioPanelCallbacks) {
    this.callbacks = callbacks;
    this.rootEl = parentEl.createDiv({ cls: 'claudian-design-studio-panel' });
    this.render();
  }

  private render(): void {
    this.rootEl.empty();

    const headerEl = this.rootEl.createDiv({ cls: 'claudian-design-studio-panel-header' });
    headerEl.createSpan({ cls: 'claudian-design-studio-panel-brand', text: this.callbacks.brand ?? 'ZAO' });
    headerEl.createSpan({ cls: 'claudian-design-studio-panel-title', text: this.callbacks.title ?? 'Design Studio' });

    const closeBtn = headerEl.createEl('button', {
      cls: 'claudian-design-studio-panel-close',
      text: 'x',
    });
    closeBtn.setAttribute('aria-label', 'Close design studio panel');
    closeBtn.addEventListener('click', () => this.callbacks.onClose());

    const contentEl = this.rootEl.createDiv({ cls: 'claudian-design-studio-panel-content' });
    for (const section of this.callbacks.sections ?? DEFAULT_DESIGN_STUDIO_MENU_SECTIONS) {
      this.renderSection(contentEl, section);
    }
  }

  private renderSection(parentEl: HTMLElement, section: DesignStudioSection): void {
    parentEl.createDiv({ cls: 'claudian-design-studio-group-title', text: section.title });

    const accordionEl = parentEl.createDiv({ cls: 'claudian-design-studio-accordion' });
    accordionEl.createSpan({ cls: 'claudian-design-studio-accordion-label', text: section.label });
    const chevronEl = accordionEl.createSpan({ cls: 'claudian-design-studio-chevron', text: '>' });

    const panelEl = parentEl.createDiv({ cls: 'claudian-design-studio-accordion-panel' });
    for (const item of section.items) {
      this.renderItem(panelEl, item);
    }

    accordionEl.addEventListener('click', () => {
      const expanded = accordionEl.hasClass('is-open');
      accordionEl.toggleClass('is-open', !expanded);
      panelEl.toggleClass('is-open', !expanded);
      chevronEl.toggleClass('is-open', !expanded);
    });
  }

  private renderItem(parentEl: HTMLElement, item: DesignStudioActionItem): void {
    const itemEl = parentEl.createDiv({ cls: 'claudian-design-studio-item' });
    const labelEl = itemEl.createSpan({ cls: 'claudian-design-studio-item-label', text: item.label });
    labelEl.setAttribute('title', item.label);
    itemEl.createSpan({ cls: 'claudian-design-studio-item-tag', text: item.command });

    itemEl.addEventListener('click', () => {
      itemEl.addClass('is-flash');
      window.setTimeout(() => itemEl.removeClass('is-flash'), 220);
      this.callbacks.onAction(item);
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
