import type { ChatMessage } from '@/core/types';
import {
  buildConversationLinkUrl,
  buildConversationMarkdownLink,
  normalizeConversationLinkLabel,
  resolveConversationMessageId,
} from '@/utils/conversationLink';

describe('conversationLink utilities', () => {
  it('builds an obsidian protocol URL with conversation and message locators', () => {
    const url = buildConversationLinkUrl('My Vault', 'conv-123', {
      messageId: 'msg-1',
      userMessageId: 'user-1',
    });

    expect(url).toBe(
      'obsidian://oiwen?vault=My+Vault&conversationId=conv-123&messageId=msg-1&userMessageId=user-1',
    );
  });

  it('builds a markdown link and escapes closing brackets in labels', () => {
    const markdown = buildConversationMarkdownLink('A [draft] note]', 'obsidian://oiwen?conversationId=1');

    expect(markdown).toBe('[A [draft\\] note\\]](obsidian://oiwen?conversationId=1)');
  });

  it('normalizes and truncates message labels', () => {
    expect(normalizeConversationLinkLabel('  hello   world  ', 20)).toBe('hello world');
    expect(normalizeConversationLinkLabel('a'.repeat(25), 10)).toBe('aaaaaaa...');
    expect(normalizeConversationLinkLabel('   ', 10)).toBe('Conversation');
  });

  it('resolves by direct message id first, then provider-native ids', () => {
    const messages: Pick<ChatMessage, 'id' | 'userMessageId' | 'assistantMessageId'>[] = [
      { id: 'msg-1', userMessageId: 'user-1' },
      { id: 'msg-2', assistantMessageId: 'assistant-2' },
    ];

    expect(resolveConversationMessageId(messages, { messageId: 'msg-1' })).toBe('msg-1');
    expect(resolveConversationMessageId(messages, { userMessageId: 'user-1' })).toBe('msg-1');
    expect(resolveConversationMessageId(messages, { assistantMessageId: 'assistant-2' })).toBe('msg-2');
    expect(resolveConversationMessageId(messages, { messageId: 'missing', userMessageId: 'missing' })).toBeNull();
  });
});
