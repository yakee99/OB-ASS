# Oiwen 阶段开发存档

日期：2026-05-26  
阶段：Oiwen 本地 Obsidian 插件改造阶段收口  
项目目录：`D:\Naburu\.codex_tmp\claudian-upstream-latest`  
Obsidian 安装目录：`D:\Naburu\.obsidian\plugins\oiwen`  
备份仓库：`https://github.com/yakee99/OB-ASS`  
阶段提交：`bf87559 Backup Oiwen Obsidian plugin`

## 1. 阶段目标

本阶段目标是以 `YishenTu/claudian` 最新源码为基线，改造成本地 Obsidian 插件 `Oiwen`，并完成以下能力：

1. 插件从原 `realclaudian`/`claudian` 体系切换为本地插件 `oiwen`。
2. Oiwen 能在 Obsidian 中独立加载，不覆盖旧 `realclaudian`。
3. Codex 接口可正常对话并保留历史。
4. OpenCode 接 DeepSeek 可正常对话，并在 Obsidian 重启后从历史列表点击恢复旧会话内容。
5. 迁入上一阶段项目中的三个功能：对话链接可回链、输入框位置与快捷按钮、iWen 全套菜单设定。
6. 完成本地 Git 备份到 `yakee99/OB-ASS`。

## 2. 基线与仓库状态

上游基线：

- 上游仓库：`https://github.com/YishenTu/claudian.git`
- 上游基线提交：`4d6b8a0 feat: add Claude custom model aliases`
- 上游标签参考：`2.0.18`

本地当前状态：

- 分支：`main`
- 插件包名：`oiwen`
- 插件 ID：`oiwen`
- 插件名称：`Oiwen`
- 插件版本：`2.0.18`
- 本地备份远端：`backup -> https://github.com/yakee99/OB-ASS.git`
- 原上游远端仍保留：`origin -> https://github.com/YishenTu/claudian.git`

说明：`git@github.com:yakee99/OB-ASS.git` 在当前机器上不可用，原因是本机没有可用 SSH 公钥且 GitHub SSH 连接被关闭；已改用 HTTPS 成功推送。

## 3. 主要完成内容

### 3.1 插件改名与本地安装

已将插件身份切换为 Oiwen：

- `manifest.json`：`id` 改为 `oiwen`，`name` 改为 `Oiwen`。
- `package.json`：包名改为 `oiwen`，描述改为 `Oiwen local AI workspace plugin`。
- `src/core/types/chat.ts`：视图类型改为 `oiwen-view`。
- `src/main.ts`：Ribbon、协议处理、提示文案切换为 Oiwen。
- `src/core/prompt/mainAgent.ts`、`src/core/prompt/inlineEdit.ts`：系统身份改为 Oiwen。
- `src/i18n/locales/en.json`、`src/i18n/locales/zh-CN.json`：用户可见文案切换到 Oiwen。

安装结果：

- 当前安装目标是 `D:\Naburu\.obsidian\plugins\oiwen`。
- 旧 `realclaudian` 项目未作为本阶段目标继续修改。
- 构建产物 `main.js`、`styles.css` 不提交源码仓库，受 `.gitignore` 管理。

### 3.2 OpenCode 历史恢复修复

修复的问题：

- OpenCode 使用 DeepSeek 对话正常。
- 但 Obsidian 重启后，历史列表仍有条目，点击后无法加载旧会话内容。
- Codex 历史不受影响。

处理方向：

- 增强 OpenCode 会话历史读取逻辑。
- 会话元数据中保存 OpenCode 数据库路径，避免重启后只依赖当前默认路径。
- 历史恢复时优先使用已保存的 provider state，再回退到当前默认 OpenCode 数据库。
- 增加 OpenCode export 兜底读取，降低不同 OpenCode 存储形态导致恢复失败的概率。

关键文件：

- `src/providers/opencode/history/OpencodeHistoryStore.ts`
- `src/providers/opencode/history/OpencodeConversationHistoryService.ts`
- `src/providers/opencode/runtime/OpencodeChatRuntime.ts`
- `src/providers/opencode/runtime/OpencodePaths.ts`
- `src/providers/opencode/types/index.ts`
- `tests/unit/providers/opencode/OpencodeHistoryStore.test.ts`
- `tests/unit/providers/opencode/OpencodeConversationHistoryService.test.ts`
- `tests/unit/providers/opencode/OpencodeChatRuntime.test.ts`
- `tests/unit/providers/opencode/OpencodePaths.test.ts`

用户验收状态：

- 用户确认：OpenCode 历史列表点击后可以载入之前对话内容。

### 3.3 对话链接可回链

完成能力：

- 聊天内容支持生成可回到 Oiwen 对话的 Obsidian 协议链接。
- 链接包含 vault、conversationId、messageId、userMessageId 等定位信息。
- 点击 `obsidian://oiwen?...` 可打开 Oiwen 视图并定位到对应会话。

关键文件：

- `src/utils/conversationLink.ts`
- `src/main.ts`
- `src/features/chat/ClaudianView.ts`
- `src/features/chat/rendering/MessageRenderer.ts`
- `tests/unit/utils/conversationLink.test.ts`
- `tests/unit/features/chat/ClaudianView.test.ts`

### 3.4 输入框位置与快捷按钮

完成能力：

- 调整聊天输入区域布局，使操作入口更贴近当前使用方式。
- 增加快捷按钮区域，提供常用入口。
- 当前快捷入口包含 `iWen`、`总结`、`改写`、`待办`。

关键文件：

- `src/features/chat/tabs/Tab.ts`
- `src/features/chat/tabs/TabManager.ts`
- `src/features/chat/tabs/types.ts`
- `src/style/components/input.css`
- `src/style/components/header.css`
- `src/style/index.css`

### 3.5 iWen 全套菜单设定与业务线入口

完成能力：

- 在聊天界面加入业务线选择入口。
- 当前业务线包括 `iWen`、`Design Studio`、`Dev Studio`。
- `Design Studio` 与 `Dev Studio` 有独立 dock 面板。
- iWen 作为默认业务线保留轻量快捷入口。

关键文件：

- `src/features/chat/ClaudianView.ts`
- `src/features/chat/ui/BusinessLineDock.ts`
- `src/features/chat/ui/DesignStudioPanel.ts`
- `src/style/components/business-line-dock.css`
- `src/style/components/design-studio-panel.css`
- `src/style/components/header.css`

## 4. 验证记录

已通过：

```text
npm run typecheck
结果：通过
```

```text
npm run build
结果：通过，生成 styles.css
```

本阶段关键测试：

```text
node scripts/run-jest.js --selectProjects unit --runTestsByPath tests/unit/utils/conversationLink.test.ts tests/unit/providers/opencode/OpencodeHistoryStore.test.ts tests/unit/providers/opencode/OpencodeConversationHistoryService.test.ts tests/unit/providers/opencode/OpencodeChatRuntime.test.ts tests/unit/features/chat/ClaudianView.test.ts --testMatch "**/tests/unit/**/*.test.ts"
结果：5 个测试套件通过，41 个测试用例通过
```

全量单测现状：

```text
npm test
结果：当前 Windows 环境下没有匹配到测试文件，退出码 1
```

```text
node scripts/run-jest.js --selectProjects unit --testMatch "**/tests/unit/**/*.test.ts"
结果：197 个测试套件通过，13 个测试套件失败；5273 个用例通过，36 个用例失败
```

失败类型主要分为：

- Windows 环境下 Unix/macOS 路径断言不兼容。
- Claudian 改名为 Oiwen 后，部分旧测试仍断言 `Claudian` 或 `claudian-view`。
- 少量既有行为断言与当前实现不一致，如外部路径冲突优先级、Agent 来源标记等。

这些失败没有在本阶段继续修复，原因是用户当前目标是功能迁移与阶段备份，不要求系统性清理全量旧测试。

## 5. Git 备份记录

已完成本地提交：

```text
bf87559 Backup Oiwen Obsidian plugin
```

已推送到：

```text
https://github.com/yakee99/OB-ASS.git main
```

当前远端设置：

```text
backup  https://github.com/yakee99/OB-ASS.git
origin  https://github.com/YishenTu/claudian.git
```

设计选择：

- 保留 `origin` 指向上游，便于后续同步 Claudian 更新。
- 使用 `backup` 指向 Oiwen 备份仓库，避免污染上游 remote。

## 6. 后续注意事项

1. 如果继续长期维护 Oiwen，建议补一个专门的测试修复阶段，把 Claudian 改名相关断言和 Windows 路径断言清理掉。
2. OpenCode 历史恢复依赖 OpenCode 本地数据库或 export 能力；如果未来 OpenCode 存储结构变化，需要优先检查 `OpencodeHistoryStore`。
3. 后续同步上游时，要重点关注 `src/features/chat`、`src/providers/opencode`、`src/core/types/chat.ts` 和 i18n 文件的冲突。
4. 如果要恢复 SSH 推送，需要在本机生成或配置 GitHub SSH key；当前 HTTPS 已能正常推送。
5. Obsidian 插件安装目录和源码目录分离，源码改动后仍需重新构建并同步到 `D:\Naburu\.obsidian\plugins\oiwen`。

## 7. 当前阶段结论

本阶段 Oiwen 插件改造、OpenCode 历史恢复修复、三项功能迁移、本地安装和 GitHub 备份均已完成。  
可作为下一阶段开发基线继续推进。
