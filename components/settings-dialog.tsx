"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { UsernameForm } from "@/components/username-form";
import { PauseInboxForm } from "@/components/pause-inbox-form";
import { HiddenWordsForm } from "@/components/hidden-words-form";
import { SignOutButton } from "@/components/sign-out-button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserSettings01Icon,
  Notification03Icon,
  HelpCircleIcon,
  PaintBoardIcon,
  ToggleOnIcon,
  ToggleOffIcon,
  GithubIcon,
  Cancel01Icon,
  Message01Icon,
  Link01Icon,
  Shield01Icon,
  UserIcon,
  Sun03Icon,
  Moon02Icon,
} from "@hugeicons/core-free-icons";
import { toggleInboxOpen, getUserSettings } from "@/app/actions";
import { formatRelativeTime } from "@/lib/relative-time";
import { SharePanel } from "@/components/share-panel";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import {
  accentThemes,
  useAccentTheme,
} from "@/components/accent-theme-provider";

type SettingsDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "account" | "share" | "inbox" | "appearance" | "support";
};

type UserSettingsData = {
  id: string;
  username: string | null;
  name: string | null;
  email: string | null;
  image: string | null;
  inboxOpen: boolean;
  inboxPausedUntil: Date | null;
  hiddenWords: string[];
};

export function SettingsDialog({
  isOpen,
  onClose,
  initialTab = "appearance",
}: SettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<
    "account" | "share" | "inbox" | "appearance" | "support"
  >(initialTab);
  const [user, setUser] = useState<UserSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [stars, setStars] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState("");
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const { accentTheme, setAccentTheme } = useAccentTheme();

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (!isOpen) return;

    async function loadData() {
      try {
        setLoading(true);
        const data = await getUserSettings();
        if (data) {
          setUser(data as UserSettingsData);
        }
      } catch (err) {
        toast.error("Failed to load settings.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [isOpen]);

  useEffect(() => {
    fetch("https://api.github.com/repos/electr1fy0/blindsay")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.stargazers_count) {
          const starCount = data.stargazers_count;
          setStars(
            starCount >= 1000
              ? `${(starCount / 1000).toFixed(1)}k`
              : String(starCount)
          );
        }
      })
      .catch(() => null);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && user?.username) {
      setShareUrl(
        `${window.location.protocol}//${window.location.host}/${user.username}`
      );
    }
  }, [user?.username]);

  if (!isOpen) return null;

  const handleToggleInbox = async () => {
    if (!user) return;
    try {
      const res = await toggleInboxOpen();
      if (res.success) {
        setUser({ ...user, inboxOpen: !user.inboxOpen });
        toast.success(
          `Inbox ${!user.inboxOpen ? "opened" : "closed"} successfully.`
        );
        router.refresh();
      } else {
        toast.error(res.message ?? "Failed to toggle inbox status.");
      }
    } catch {
      toast.error("An error occurred.");
    }
  };

  const isPaused = Boolean(
    user?.inboxPausedUntil && new Date(user.inboxPausedUntil) > new Date()
  );
  const now = new Date();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in-0 duration-200">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div className="relative flex h-[640px] max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-xl animate-in zoom-in-95 duration-200 md:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-50 text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={20} strokeWidth={1.5} />
        </button>

        {/* Sidebar for Desktop */}
        <aside className="hidden w-56 flex-col border-r border-border bg-muted/10 p-4 gap-1.5 md:flex shrink-0">
          <div className="mb-4 px-2">
            <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-semibold">
              Settings
            </span>
          </div>
          <button
            onClick={() => setActiveTab("appearance")}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer text-left ${
              activeTab === "appearance"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
            }`}
          >
            <HugeiconsIcon icon={PaintBoardIcon} size={18} strokeWidth={1.5} />
            Appearance
          </button>
          <button
            onClick={() => setActiveTab("account")}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer text-left ${
              activeTab === "account"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
            }`}
          >
            <HugeiconsIcon icon={UserSettings01Icon} size={18} strokeWidth={1.5} />
            Account
          </button>
          <button
            onClick={() => setActiveTab("share")}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer text-left ${
              activeTab === "share"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
            }`}
          >
            <HugeiconsIcon icon={Link01Icon} size={18} strokeWidth={1.5} />
            Share Link
          </button>
          <button
            onClick={() => setActiveTab("inbox")}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer text-left ${
              activeTab === "inbox"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
            }`}
          >
            <HugeiconsIcon icon={Notification03Icon} size={18} strokeWidth={1.5} />
            Inbox Control
          </button>
          <button
            onClick={() => setActiveTab("support")}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer text-left ${
              activeTab === "support"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
            }`}
          >
            <HugeiconsIcon icon={HelpCircleIcon} size={18} strokeWidth={1.5} />
            Support & Guide
          </button>
        </aside>

        {/* Top Navbar for Mobile */}
        <nav className="flex border-b border-border bg-muted/10 p-2 overflow-x-auto scrollbar-none md:hidden shrink-0 gap-1">
          <button
            onClick={() => setActiveTab("appearance")}
            className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === "appearance"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <HugeiconsIcon icon={PaintBoardIcon} size={15} strokeWidth={1.5} />
            Appearance
          </button>
          <button
            onClick={() => setActiveTab("account")}
            className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === "account"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <HugeiconsIcon icon={UserSettings01Icon} size={15} strokeWidth={1.5} />
            Account
          </button>
          <button
            onClick={() => setActiveTab("share")}
            className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === "share"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <HugeiconsIcon icon={Link01Icon} size={15} strokeWidth={1.5} />
            Share
          </button>
          <button
            onClick={() => setActiveTab("inbox")}
            className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === "inbox"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <HugeiconsIcon icon={Notification03Icon} size={15} strokeWidth={1.5} />
            Inbox
          </button>
          <button
            onClick={() => setActiveTab("support")}
            className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === "support"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <HugeiconsIcon icon={HelpCircleIcon} size={15} strokeWidth={1.5} />
            Support
          </button>
        </nav>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <span className="text-sm text-muted-foreground animate-pulse">
                Loading settings...
              </span>
            </div>
          ) : !user ? (
            <div className="flex h-full items-center justify-center text-center">
              <span className="text-sm text-red-500">
                Failed to load settings. Please log in again.
              </span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Account Tab Content */}
              {activeTab === "account" && (
                <div className="space-y-6 animate-in fade-in-20 duration-150">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">
                      Account Settings
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      Manage your digital identity on Blindsay.
                    </p>
                  </div>

                  <div className="panel-card-muted p-4 space-y-4">
                    {/* User profile detail block */}
                    <div className="flex items-start gap-4">
                      {user.image ? (
                        <Image
                          src={user.image}
                          alt={user.name ?? "Profile"}
                          width={48}
                          height={48}
                          className="h-12 w-12 rounded-full border border-border object-cover shrink-0"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-accent text-lg font-bold text-foreground shrink-0">
                          {(user.name ?? user.email ?? "U")
                            .slice(0, 1)
                            .toUpperCase()}
                        </div>
                      )}
                      <div className="space-y-1">
                        <div className="font-semibold text-sm">
                          {user.name ?? "Signed in"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-border pt-4">
                      <UsernameForm
                        initialValue={user.username ?? ""}
                        submitLabel={
                          user.username ? "Update username" : "Claim username"
                        }
                      />
                    </div>
                  </div>

                  {/* Open Source Banner */}
                  <div className="panel-card-muted p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold">Built in public</p>
                      <p className="mt-0.5 text-[0.68rem] text-muted-foreground">
                        Star the codebase or view source on GitHub.
                      </p>
                    </div>
                    <Link
                      href="https://github.com/electr1fy0/blindsay"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative p-[1px] rounded-full transition-all duration-300 shrink-0 select-none"
                    >
                      {/* Dynamic 1px border layer */}
                      <div className="absolute inset-0 rounded-full bg-black/10 dark:bg-white/10 transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-[#ff2a5f] group-hover:via-[#ffb000] group-hover:via-[#00f5a0] group-hover:via-[#00b9ff] group-hover:to-[#b800ff]" />

                      {/* Inner content layer masking the gradient */}
                      <div className="relative flex items-center gap-2 whitespace-nowrap rounded-full bg-white dark:bg-[#1c1c1f] px-3.5 py-1.5 text-xs font-semibold text-muted-foreground transition-all duration-300 group-hover:text-foreground dark:group-hover:text-white">
                        <HugeiconsIcon
                          icon={GithubIcon}
                          size={14}
                          color="currentColor"
                          strokeWidth={1.5}
                          className="shrink-0"
                        />
                        <span>GitHub</span>
                        {stars !== null && (
                          <>
                            <span className="text-black/10 dark:text-white/15 group-hover:text-black/20 dark:group-hover:text-white/20 transition-colors duration-200">|</span>
                            <span className="font-mono text-[12px] text-muted-foreground group-hover:text-foreground dark:group-hover:text-white transition-colors duration-200 flex items-center gap-1.5">
                              <svg
                                width="13"
                                height="13"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="text-muted-foreground/80 group-hover:text-foreground dark:group-hover:text-white transition-colors duration-200 shrink-0"
                              >
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                              </svg>
                              {stars}
                            </span>
                          </>
                        )}
                      </div>
                    </Link>
                  </div>

                  {/* Sign Out Action */}
                  <div className="border-t border-border pt-4">
                    <SignOutButton size="sm" className="w-full justify-center rounded-lg" />
                  </div>
                </div>
              )}

              {/* Share Link Tab Content */}
              {activeTab === "share" && (
                <div className="space-y-6 animate-in fade-in-20 duration-150">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">
                      Share Your Prompt
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      Let others leave honest anonymous notes on your profile.
                    </p>
                  </div>

                  <div className="panel-card p-4 space-y-4">
                    <p className="text-xs text-muted-foreground">
                      Copy your link or scan your QR code to share your inbox with friends, followers, or readers.
                    </p>
                    {user.username ? (
                      <SharePanel
                        url={shareUrl}
                        orientation="vertical"
                        className="border-0 bg-transparent shadow-none p-0"
                      />
                    ) : (
                      <p className="text-sm text-red-500">
                        Please set a username in the Account tab first before sharing your link.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "appearance" && (
                <div className="space-y-6 animate-in fade-in-20 duration-150">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">
                      Appearance
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Control light and dark mode plus the accent palette for buttons and replies.
                    </p>
                  </div>

                  <div className="panel-card-muted flex items-center justify-between gap-4 p-4">
                    <div>
                      <p className="text-xs font-semibold">Color mode</p>
                      <p className="mt-0.5 text-[0.68rem] text-muted-foreground">
                        Switch between light and dark themes.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setTheme(resolvedTheme === "dark" ? "light" : "dark")
                      }
                      className="h-9 cursor-pointer rounded-lg gap-1.5"
                    >
                      <HugeiconsIcon
                        icon={resolvedTheme === "dark" ? Sun03Icon : Moon02Icon}
                        size={15}
                        strokeWidth={1.5}
                      />
                      {resolvedTheme === "dark" ? "Light Mode" : "Dark Mode"}
                    </Button>
                  </div>

                  <div className="panel-card-muted p-4">
                    <div>
                      <p className="text-xs font-semibold">Accent theme</p>
                      <p className="mt-0.5 text-[0.68rem] text-muted-foreground">
                        Changes button accents and reply bubble color together.
                      </p>
                    </div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-3">
                      {accentThemes.map((themeOption) => {
                        const isSelected = accentTheme === themeOption.id;

                        return (
                          <button
                            key={themeOption.id}
                            type="button"
                            onClick={() => setAccentTheme(themeOption.id)}
                            className={`flex min-h-40 flex-col justify-start rounded-xl border p-3 text-left align-top transition-colors cursor-pointer ${
                              isSelected
                                ? "border-primary bg-primary/8"
                                : "border-border bg-background hover:border-primary/40"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <span
                                  className="h-3 w-3 rounded-full"
                                  style={{
                                    backgroundColor: themeOption.preview.accent,
                                  }}
                                />
                                <span
                                  className="h-3 w-3 rounded-full ring-1 ring-black/6 dark:ring-white/10"
                                  style={{
                                    backgroundColor:
                                      resolvedTheme === "dark"
                                        ? themeOption.preview.replyDark
                                        : themeOption.preview.reply,
                                  }}
                                />
                              </span>
                              <span className="text-sm leading-none font-semibold">
                                {themeOption.name}
                              </span>
                            </div>
                            <p className="mt-6 text-[0.68rem] leading-5 text-muted-foreground">
                              {themeOption.description}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Inbox Control Tab Content */}
              {activeTab === "inbox" && (
                <div className="space-y-6 animate-in fade-in-20 duration-150">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">
                      Inbox Control
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      Configure your anonymous message thresholds and filters.
                    </p>
                  </div>

                  {/* Active/Closed Status */}
                  <div className="panel-card-muted px-4 py-3.5 space-y-1">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <span className="text-[0.62rem] uppercase tracking-wider text-muted-foreground font-semibold">
                          Inbox Status
                        </span>
                        <div className="text-sm font-semibold mt-1">
                          {user.inboxOpen
                            ? isPaused
                              ? "Paused"
                              : "Active"
                            : "Closed"}
                        </div>
                        <p className="text-[0.68rem] text-muted-foreground mt-0.5">
                          {user.inboxOpen
                            ? isPaused
                              ? `Resumes ${
                                  user.inboxPausedUntil
                                    ? formatRelativeTime(
                                        new Date(user.inboxPausedUntil),
                                        now
                                      )
                                    : "soon"
                                }.`
                              : "Accepting new anonymous messages."
                            : "Rejecting all incoming messages."}
                        </p>
                      </div>
                      <Button
                        onClick={handleToggleInbox}
                        size="sm"
                        variant={user.inboxOpen ? "destructive" : "default"}
                        className="rounded-lg h-9"
                      >
                        <HugeiconsIcon
                          icon={user.inboxOpen ? ToggleOnIcon : ToggleOffIcon}
                          size={18}
                          strokeWidth={1.5}
                        />
                        {user.inboxOpen ? "Close Inbox" : "Open Inbox"}
                      </Button>
                    </div>
                  </div>

                  {/* Pause Inbox Controls */}
                  <div className="panel-card-muted px-4 py-3.5 space-y-1">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <span className="text-[0.62rem] uppercase tracking-wider text-muted-foreground font-semibold">
                          Temporary Pause
                        </span>
                        <div className="text-sm font-semibold mt-1">
                          {isPaused ? "Active" : "Disabled"}
                        </div>
                        <p className="text-[0.68rem] text-muted-foreground mt-0.5">
                          {isPaused
                            ? `Inbox is paused until ${
                                user.inboxPausedUntil
                                  ? formatRelativeTime(
                                      new Date(user.inboxPausedUntil),
                                      now
                                    )
                                  : "later"
                              }.`
                            : "Temporarily stop incoming messages."}
                        </p>
                      </div>
                      <PauseInboxForm isPaused={isPaused} />
                    </div>
                  </div>

                  {/* Moderation Panel */}
                  <div className="panel-card-muted p-4 space-y-3">
                    <div>
                      <span className="text-[0.62rem] uppercase tracking-wider text-muted-foreground font-semibold">
                        Word Filtering
                      </span>
                      <p className="text-[0.68rem] text-muted-foreground mt-0.5">
                        Messages containing these terms will be filtered.
                      </p>
                    </div>
                    <HiddenWordsForm initialValue={user.hiddenWords ?? []} />
                  </div>
                </div>
              )}

              {/* Support & Guide Tab Content */}
              {activeTab === "support" && (
                <div className="space-y-6 animate-in fade-in-20 duration-150">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">
                      Support & Guide
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      Quick overview of how Blindsay works.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-1 overflow-y-visible">
                    <div className="panel-card-muted p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <HugeiconsIcon
                          icon={Link01Icon}
                          size={16}
                          className="text-primary"
                        />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                          Getting Started
                        </h3>
                      </div>
                      <p className="text-[0.72rem] leading-relaxed text-muted-foreground">
                        Your inbox is active at{" "}
                        <code className="text-foreground font-semibold">
                          blindsay.app/{user.username ?? "yourname"}
                        </code>
                        . Share this link on your social profiles.
                      </p>
                    </div>

                    <div className="panel-card-muted p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <HugeiconsIcon
                          icon={Message01Icon}
                          size={16}
                          className="text-primary"
                        />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                          Replies & Visibility
                        </h3>
                      </div>
                      <p className="text-[0.72rem] leading-relaxed text-muted-foreground">
                        Messages you receive are completely private. If you reply
                        to a message, the exchange is published to your public
                        profile feed. Unreplied items remain hidden.
                      </p>
                    </div>

                    <div className="panel-card-muted p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <HugeiconsIcon
                          icon={UserIcon}
                          size={16}
                          className="text-primary"
                        />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                          Anonymous Senders
                        </h3>
                      </div>
                      <p className="text-[0.72rem] leading-relaxed text-muted-foreground">
                        Senders do not need an account. We do not track sender
                        details, but we support robust word filters and toggles
                        to keep your inbox safe.
                      </p>
                    </div>

                    <div className="panel-card-muted p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <HugeiconsIcon
                          icon={Shield01Icon}
                          size={16}
                          className="text-primary"
                        />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                          Safety Options
                        </h3>
                      </div>
                      <p className="text-[0.72rem] leading-relaxed text-muted-foreground">
                        Use the Inbox tab to pause new messages temporarily,
                        close the inbox, or configure word blocklists.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
