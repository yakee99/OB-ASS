import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

import {
  loadOpencodeSessionMessagesWithDatabasePath,
  mapOpencodeMessages,
} from '../../../../src/providers/opencode/history/OpencodeHistoryStore';

function createEmptyOpencodeDb(dbPath: string): void {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec(`
    create table session (id text primary key, time_created integer);
    create table message (id text primary key, session_id text not null, time_created integer not null, time_updated integer not null, data text not null);
    create table part (id text primary key, message_id text not null, session_id text not null, time_created integer not null, time_updated integer not null, data text not null);
  `);
  db.close();
}

function createFakeOpencodeCommand(tempRoot: string): string {
  if (process.platform === 'win32') {
    const commandPath = path.join(tempRoot, 'opencode.cmd');
    fs.writeFileSync(commandPath, [
      '@echo off',
      'echo Exporting session: %2',
      'echo {"messages":[{"info":{"id":"msg-user","role":"user","time":{"created":1000}},"parts":[{"id":"part-user","type":"text","text":"Hello from opencode export"}]}]}',
    ].join('\r\n'));
    return commandPath;
  }

  const commandPath = path.join(tempRoot, 'opencode');
  fs.writeFileSync(commandPath, [
    '#!/usr/bin/env sh',
    'echo "Exporting session: $2"',
    'echo \'{"messages":[{"info":{"id":"msg-user","role":"user","time":{"created":1000}},"parts":[{"id":"part-user","type":"text","text":"Hello from opencode export"}]}]}\'',
  ].join('\n'));
  fs.chmodSync(commandPath, 0o755);
  return commandPath;
}

describe('mapOpencodeMessages', () => {
  it('falls back to opencode export when direct SQLite reads return no rows', async () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'opencode-export-history-'));
    try {
      const databasePath = path.join(tempRoot, 'opencode.db');
      const cliPath = createFakeOpencodeCommand(tempRoot);
      createEmptyOpencodeDb(databasePath);

      const result = await loadOpencodeSessionMessagesWithDatabasePath('ses-export', {
        cliPath,
        databasePath,
      });

      expect(result.messages).toHaveLength(1);
      expect(result.messages[0]).toMatchObject({
        content: 'Hello from opencode export',
        role: 'user',
      });
    } finally {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  });

  it('maps stored OpenCode messages into Claudian chat messages', () => {
    const messages = mapOpencodeMessages([
      {
        info: {
          id: 'msg-user',
          role: 'user',
          time: { created: 1_000 },
        },
        parts: [
          {
            id: 'part-user',
            text: 'Summarize this\n\n<current_note>\nnotes/today.md\n</current_note>',
            type: 'text',
          },
        ],
      },
      {
        info: {
          id: 'msg-assistant',
          role: 'assistant',
          time: { created: 2_000, completed: 4_000 },
        },
        parts: [
          {
            id: 'part-thinking',
            text: 'Thinking...',
            time: { start: 2_000, end: 3_000 },
            type: 'reasoning',
          },
          {
            callID: 'tool-1',
            id: 'part-tool',
            state: {
              input: { filePath: 'notes/today.md' },
              output: 'read ok',
              status: 'completed',
            },
            tool: 'read',
            type: 'tool',
          },
          {
            id: 'part-text',
            text: 'Done.',
            type: 'text',
          },
        ],
      },
    ]);

    expect(messages).toEqual([
      {
        assistantMessageId: undefined,
        content: 'Summarize this',
        id: 'msg-user',
        role: 'user',
        timestamp: 1_000,
        userMessageId: 'msg-user',
      },
      {
        assistantMessageId: 'msg-assistant',
        content: 'Done.',
        contentBlocks: [
          { content: 'Thinking...', durationSeconds: 1, type: 'thinking' },
          { toolId: 'tool-1', type: 'tool_use' },
          { content: 'Done.', type: 'text' },
        ],
        durationSeconds: 2,
        id: 'msg-assistant',
        role: 'assistant',
        timestamp: 2_000,
        toolCalls: [{
          id: 'tool-1',
          input: { file_path: 'notes/today.md' },
          name: 'Read',
          result: 'read ok',
          status: 'completed',
        }],
      },
    ]);
  });

  it('hydrates stored question tools with resolved answers', () => {
    const messages = mapOpencodeMessages([
      {
        info: {
          id: 'msg-assistant',
          role: 'assistant',
          time: { created: 2_000, completed: 4_000 },
        },
        parts: [
          {
            callID: 'tool-question',
            id: 'part-tool',
            state: {
              input: {
                questions: [{
                  header: 'Deploy',
                  id: 'deploy',
                  options: [
                    { description: 'Ship the change', label: 'Yes' },
                    { description: 'Hold the deploy', label: 'No' },
                  ],
                  question: 'Deploy now?',
                }],
              },
              metadata: {
                answers: [['Yes']],
              },
              output: 'User has answered your questions.',
              status: 'completed',
            },
            tool: 'question',
            type: 'tool',
          },
        ],
      },
    ]);

    expect(messages).toEqual([
      {
        assistantMessageId: 'msg-assistant',
        content: '',
        contentBlocks: [
          { toolId: 'tool-question', type: 'tool_use' },
        ],
        durationSeconds: 2,
        id: 'msg-assistant',
        role: 'assistant',
        timestamp: 2_000,
        toolCalls: [{
          id: 'tool-question',
          input: {
            questions: [{
              header: 'Deploy',
              id: 'deploy',
              multiSelect: false,
              options: [
                { description: 'Ship the change', label: 'Yes' },
                { description: 'Hold the deploy', label: 'No' },
              ],
              question: 'Deploy now?',
            }],
          },
          name: 'AskUserQuestion',
          resolvedAnswers: {
            deploy: 'Yes',
            'Deploy now?': 'Yes',
          },
          result: 'User has answered your questions.',
          status: 'completed',
        }],
      },
    ]);
  });

  it('merges adjacent assistant fragments from one OpenCode turn', () => {
    const messages = mapOpencodeMessages([
      {
        info: {
          id: 'msg-user',
          role: 'user',
          time: { created: 1_000 },
        },
        parts: [
          {
            id: 'part-user',
            text: 'Search it',
            type: 'text',
          },
        ],
      },
      {
        info: {
          id: 'msg-assistant-1',
          role: 'assistant',
          time: { created: 2_000, completed: 4_000 },
        },
        parts: [
          {
            id: 'part-thinking-1',
            text: 'Searching...',
            time: { start: 2_000, end: 3_000 },
            type: 'reasoning',
          },
          {
            callID: 'tool-websearch',
            id: 'part-tool',
            state: {
              input: {
                action: {
                  query: 'Apple stock price today',
                },
              },
              output: 'Search complete',
              status: 'completed',
            },
            tool: 'websearch',
            type: 'tool',
          },
        ],
      },
      {
        info: {
          id: 'msg-assistant-2',
          role: 'assistant',
          time: { created: 4_500, completed: 7_000 },
        },
        parts: [
          {
            id: 'part-thinking-2',
            text: 'Summarizing...',
            time: { start: 4_500, end: 5_000 },
            type: 'reasoning',
          },
          {
            id: 'part-text',
            text: 'Apple is trading at $272.41.',
            type: 'text',
          },
        ],
      },
    ]);

    expect(messages).toEqual([
      {
        assistantMessageId: undefined,
        content: 'Search it',
        id: 'msg-user',
        role: 'user',
        timestamp: 1_000,
        userMessageId: 'msg-user',
      },
      {
        assistantMessageId: 'msg-assistant-2',
        content: 'Apple is trading at $272.41.',
        contentBlocks: [
          { content: 'Searching...', durationSeconds: 1, type: 'thinking' },
          { toolId: 'tool-websearch', type: 'tool_use' },
          { content: 'Summarizing...', durationSeconds: 0.5, type: 'thinking' },
          { content: 'Apple is trading at $272.41.', type: 'text' },
        ],
        durationSeconds: 5,
        id: 'msg-assistant-1',
        role: 'assistant',
        timestamp: 2_000,
        toolCalls: [{
          id: 'tool-websearch',
          input: {
            actionType: 'search',
            query: 'Apple stock price today',
          },
          name: 'WebSearch',
          result: 'Search complete',
          status: 'completed',
        }],
      },
    ]);
  });
});
