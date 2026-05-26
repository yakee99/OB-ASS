export interface OpencodeProviderState {
  cliPath?: string;
  databasePath?: string;
}

export function getOpencodeState(
  providerState?: Record<string, unknown>,
): OpencodeProviderState {
  return (providerState ?? {});
}
