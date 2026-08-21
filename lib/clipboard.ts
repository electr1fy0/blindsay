type ClipboardLike = {
  writeText?: (text: string) => Promise<unknown>;
};

type NavigatorLike = {
  clipboard?: ClipboardLike;
};

export async function copyTextToClipboard(
  text: string,
  navigatorLike: NavigatorLike | undefined =
    typeof navigator === "undefined" ? undefined : navigator,
): Promise<boolean> {
  const writeText = navigatorLike?.clipboard?.writeText;
  if (typeof writeText !== "function") return false;

  try {
    await writeText.call(navigatorLike.clipboard, text);
    return true;
  } catch {
    return false;
  }
}
