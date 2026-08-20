type CheckForNewMessages = (
  since: Date,
) => Promise<{ hasNew: boolean }>;

type RunAutoRefreshCheckOptions = {
  hidden: boolean;
  lastCheck: number | null;
  checkForNewMessages: CheckForNewMessages;
  refresh: () => void;
  now?: () => number;
};

export async function runAutoRefreshCheck({
  hidden,
  lastCheck,
  checkForNewMessages,
  refresh,
  now = Date.now,
}: RunAutoRefreshCheckOptions): Promise<number | null> {
  if (hidden || lastCheck === null) return lastCheck;

  try {
    const { hasNew } = await checkForNewMessages(new Date(lastCheck));
    if (!hasNew) return lastCheck;

    const nextCheck = now();
    refresh();
    return nextCheck;
  } catch {
    return lastCheck;
  }
}
