import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

import type { Conversation } from '@/core/types';
import { OpencodeConversationHistoryService } from '@/providers/opencode/history/OpencodeConversationHistoryService';

function createOpencodeDb(dbPath: string, sessionId: string, withMessages: boolean): void {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec(`
    create table session (id text primary key, time_created integer);
    create table message (id text primary key, session_id text not null, time_created integer not null, time_updated integer not null, data text not null);
    create table part (id text primary key, message_id text not null, session_id text not null, time_created integer not null, time_updated integer not null, data text not null);
  `);

  if (withMessages) {
    db.prepare('insert into session (id, time_created) values (?, ?)').run(sessionId, 1_000);
    db.prepare('insert into message (id, session_id, time_created, time_updated, data) values (?, ?, ?, ?, ?)').run(
      'msg-user',
      sessionId,
      1_000,
      1_000,
      JSON.stringify({ id: 'msg-user', role: 'user', time: { created: 1_000 } }),
    );
    db.prepare('insert into part (id, message_id, session_id, time_created, time_updated, data) values (?, ?, ?, ?, ?, ?)').run(
      'part-user',
      'msg-user',
      sessionId,
      1_000,
      1_000,
      JSON.stringify({ text: 'Hello from fallback DB', type: 'text' }),
    );
  }

  db.close();
}

describe('OpencodeConversationHistoryService', () => {
  let originalHome: string | undefined;
  let originalXdgDataHome: string | undefined;
  let tempRoot: string;

  beforeEach(() => {
    originalHome = process.env.HOME;
    originalXdgDataHome = process.env.XDG_DATA_HOME;
    tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'claudian-opencode-history-'));
    process.env.HOME = path.join(tempRoot, 'home');
    delete process.env.XDG_DATA_HOME;
  });

  afterEach(() => {
    if (originalHome === undefined) {
      delete process.env.HOME;
    } else {
      process.env.HOME = originalHome;
    }
    if (originalXdgDataHome === undefined) {
      delete process.env.XDG_DATA_HOME;
    } else {
      process.env.XDG_DATA_HOME = originalXdgDataHome;
    }
    fs.rmSync(tempRoot, { recursive: true, force: true });
  });

  it('falls back to the resolved OpenCode database and backfills provider state when persisted path is stale', async () => {
    const sessionId = 'ses-fallback';
    const staleDbPath = path.join(tempRoot, 'stale', 'opencode.db');
    const resolvedDbPath = path.join(process.env.HOME!, '.local', 'share', 'opencode', 'opencode.db');
    createOpencodeDb(staleDbPath, sessionId, false);
    createOpencodeDb(resolvedDbPath, sessionId, true);

    const conversation: Conversation = {
      id: 'conv-opencode',
      providerId: 'opencode',
      title: 'OpenCode History',
      createdAt: 1_000,
      updatedAt: 1_000,
      sessionId,
      providerState: { databasePath: staleDbPath },
      messages: [],
    };

    const service = new OpencodeConversationHistoryService();
    await service.hydrateConversationHistory(conversation, null);

    expect(conversation.messages).toHaveLength(1);
    expect(conversation.messages[0]).toMatchObject({
      content: 'Hello from fallback DB',
      role: 'user',
    });
    expect((conversation.providerState as Record<string, unknown>).databasePath).toBe(resolvedDbPath);
  });
});
