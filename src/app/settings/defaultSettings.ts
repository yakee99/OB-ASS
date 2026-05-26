import { getDefaultHiddenProviderCommands } from '../../core/providers/commands/hiddenCommands';
import { type ClaudianSettings } from '../../core/types/settings';
import { getBuiltInProviderDefaultConfigs } from '../../providers/defaultProviderConfigs';

export const DEFAULT_SKILL_QUICK_ACTIONS = [
  { label: 'ZAO Studio', command: '/zao-studio' },
  { label: 'Developer Assistant', command: '/developer-assistant' },
  { label: 'iWen', command: '/iwen' },
];

export const DEFAULT_BUSINESS_LINE_LABELS = {
  iwen: 'iWen',
  designStudio: 'Design Studio',
  devStudio: 'Dev Studio',
};

export const DEFAULT_DEV_STUDIO_MENU_ITEMS = [
  { label: 'Developer Assistant', command: '/developer-assistant' },
];

export const DEFAULT_DESIGN_STUDIO_MENU_SECTIONS = [
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

export const DEFAULT_CLAUDIAN_SETTINGS: ClaudianSettings = {
  userName: '',

  permissionMode: 'yolo',

  model: 'haiku',
  thinkingBudget: 'off',
  effortLevel: 'high',
  serviceTier: 'default',
  enableAutoTitleGeneration: true,
  titleGenerationModel: '',

  excludedTags: [],
  mediaFolder: '',
  systemPrompt: '',
  persistentExternalContextPaths: [],

  sharedEnvironmentVariables: '',
  envSnippets: [],
  customContextLimits: {},
  customModelAliases: {},

  keyboardNavigation: {
    scrollUpKey: 'w',
    scrollDownKey: 's',
    focusInputKey: 'i',
  },
  requireCommandOrControlEnterToSend: false,
  skillQuickActions: DEFAULT_SKILL_QUICK_ACTIONS,
  businessLineLabels: DEFAULT_BUSINESS_LINE_LABELS,
  designStudioMenuSections: DEFAULT_DESIGN_STUDIO_MENU_SECTIONS,
  devStudioMenuItems: DEFAULT_DEV_STUDIO_MENU_ITEMS,

  locale: 'en',

  providerConfigs: getBuiltInProviderDefaultConfigs(),

  settingsProvider: 'claude',
  savedProviderModel: {},
  savedProviderEffort: {},
  savedProviderServiceTier: {},
  savedProviderThinkingBudget: {},
  savedProviderPermissionMode: {},

  lastCustomModel: '',

  maxTabs: 3,
  tabBarPosition: 'input',
  enableAutoScroll: true,
  deferMathRenderingDuringStreaming: true,
  chatViewPlacement: 'right-sidebar',

  hiddenProviderCommands: getDefaultHiddenProviderCommands(),
};
