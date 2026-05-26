type DesignStudioActionBehavior = 'fill' | 'send';

export interface DesignStudioActionItem {
  id: string;
  label: string;
  command: string;
  behavior?: DesignStudioActionBehavior;
}

export interface DesignStudioSection {
  id: string;
  title: string;
  label: string;
  items: DesignStudioActionItem[];
}

export interface DesignStudioPanelCallbacks {
  onAction: (item: DesignStudioActionItem) => void;
  onClose: () => void;
}

const DESIGN_STUDIO_SECTIONS: DesignStudioSection[] = [
  {
    id: 'entry',
    title: '总入口',
    label: 'design-studio',
    items: [
      { id: 'ds_entry', label: '进入工作室入口', command: '/zao-studio' },
      { id: 'role_project_window', label: '项目秘书', command: '/project-window' },
      { id: 'role_pre_design_research', label: 'pre-design-research', command: '/pre-design-research' },
      { id: 'role_pre_design_research_v2', label: 'pre-design-research-v2', command: '/pre-design-research-v2' },
      { id: 'role_project_strategy', label: '项目策略中枢', command: '/project-strategy' },
      { id: 'role_design_pm', label: '设计项目经理', command: '/design-project-manager' },
      { id: 'role_design_director', label: '00-Designer-设计总监', command: '/design-director' },
    ],
  },
  {
    id: 'departments',
    title: '部门入口',
    label: '专业部门',
    items: [
      { id: 'dept_project_strategy', label: '进入 project-strategy', command: '/project-strategy' },
      { id: 'dept_architecture', label: '进入硬装', command: '/zao-arch' },
      { id: 'dept_ffe', label: '进入软装', command: '/zao-ffe' },
      { id: 'dept_supplier', label: '进入供应链', command: '/zao-supply' },
      { id: 'dept_cost_control', label: '进入 cost-control', command: '/zao-cost' },
      { id: 'dept_rendering', label: '进入效果图', command: '/zao-render' },
    ],
  },
  {
    id: 'architecture',
    title: 'Architecture',
    label: '空间与概念角色',
    items: [
      { id: 'role_spatial_strategy', label: '00-Designer-空间策略研究', command: '/spatial-strategy-master' },
      { id: 'role_concept_pitch', label: '01-Designer-整体概念风格探索', command: '/concept-pitch-master' },
    ],
  },
  {
    id: 'ffe',
    title: 'FF&E',
    label: '软装与配置角色',
    items: [
      { id: 'role_styling_domino', label: '低成本生活化方向', command: '/styling-domino' },
      { id: 'role_styling_modern_heritage', label: '新传统主义方向', command: '/styling-modern-heritage' },
      { id: 'role_ffe_procurement', label: '软装采购清单助手', command: '/ffe-procurement-list' },
    ],
  },
  {
    id: 'supplier-cost',
    title: 'Supplier / Cost',
    label: '供应与成本',
    items: [
      { id: 'role_cost_director', label: 'Cost-成本总监', command: '/cost-director' },
      { id: 'role_cost_estimator', label: 'Cost-精算师', command: '/cost-estimator' },
      { id: 'role_cost_librarian', label: 'Cost-资料管理员', command: '/cost-librarian' },
      { id: 'role_cost_sourcing', label: 'Cost-价格分析师', command: '/cost-sourcing-analyst' },
    ],
  },
  {
    id: 'rendering',
    title: 'Rendering',
    label: '出图与控图角色',
    items: [
      { id: 'role_render_structure', label: '效果图风格转控助手', command: '/render-structure-controller' },
      { id: 'role_render_photography', label: '效果图摄影统筹助手', command: '/render-photography-style' },
      { id: 'role_furniture_curation', label: '效果图软装修改师', command: '/furniture-curation' },
      { id: 'role_material_alchemist', label: '效果图写实强化助手', command: '/material-alchemist' },
      { id: 'role_render_texture', label: '硬装材质纹理提取助手', command: '/render-material-texture-extractor' },
      { id: 'role_photograph_material_explorer', label: '多维度摄影材料探索', command: '/photograph-material-explorer' },
    ],
  },
];

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
    headerEl.createSpan({ cls: 'claudian-design-studio-panel-brand', text: 'ZAO' });
    headerEl.createSpan({ cls: 'claudian-design-studio-panel-title', text: 'Design Studio' });

    const closeBtn = headerEl.createEl('button', {
      cls: 'claudian-design-studio-panel-close',
      text: 'x',
    });
    closeBtn.setAttribute('aria-label', 'Close design studio panel');
    closeBtn.addEventListener('click', () => this.callbacks.onClose());

    const contentEl = this.rootEl.createDiv({ cls: 'claudian-design-studio-panel-content' });
    for (const section of DESIGN_STUDIO_SECTIONS) {
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
