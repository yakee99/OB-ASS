import type { ChatMessage } from '../core/types';

export interface ConversationLinkLocator {
  messageId?: string;
  userMessageId?: string;
  assistantMessageId?: string;
}

export function buildConversationLinkUrl(
  vaultName: string,
  conversationId: string,
  locator: ConversationLinkLocator = {},
  action = 'oiwen',
): string {
  const url = new URL(`obsidian://${action}`);
  url.searchParams.set('vault', vaultName);
  url.searchParams.set('conversationId', conversationId);

  if (locator.messageId) {
    url.searchParams.set('messageId', locator.messageId);
  }
  if (locator.userMessageId) {
    url.searchParams.set('userMessageId', locator.userMessageId);
  }
  if (locator.assistantMessageId) {
    url.searchParams.set('assistantMessageId', locator.assistantMessageId);
  }

  return url.toString();
}

export function buildConversationMarkdownLink(label: string, url: string): string {
  return `[${label.replace(/\]/g, '\\]')}](${url})`;
}

export function normalizeConversationLinkLabel(text: string, maxLength = 60): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) {
    return 'Conversation';
  }

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}

export function resolveConversationMessageId(
  messages: Pick<ChatMessage, 'id' | 'userMessageId' | 'assistantMessageId'>[],
  locator: ConversationLinkLocator,
): string | null {
  if (locator.messageId && messages.some((message) => message.id === locator.messageId)) {
    return locator.messageId;
  }

  if (locator.userMessageId) {
    const matched = messages.find((message) => message.userMessageId === locator.userMessageId);
    if (matched) {
      return matched.id;
    }
  }

  if (locator.assistantMessageId) {
    const matched = messages.find((message) => message.assistantMessageId === locator.assistantMessageId);
    if (matched) {
      return matched.id;
    }
  }

  return null;
}
