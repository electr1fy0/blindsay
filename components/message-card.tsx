"use client";

import { memo, useState, useTransition, type ReactNode } from "react";
import type { MessageModel as Message } from "@/lib/generated/prisma/models";
import { formatRelativeTime } from "@/lib/relative-time";
import { deleteMessage, updateReplyMessage } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ShareMessageButton } from "@/components/share-message-button";
import { NewBadge } from "@/components/new-badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { Edit01Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface MessageCardProps {
  message: Message;
  reply?: Message | null;
  now?: Date;
  isOwner?: boolean;
  recipientUsername?: string;
  replyForm?: ReactNode;
}

export const MessageCard = memo(function MessageCard({
  message,
  reply,
  now = new Date(),
  isOwner = false,
  recipientUsername = "",
  replyForm,
}: MessageCardProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(reply?.content ?? "");
  const [isPending, startTransition] = useTransition();

  const handleDeleteMessage = () => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    startTransition(async () => {
      const res = await deleteMessage(message.id, recipientUsername);
      if (res.success) {
        toast.success("Deleted successfully.");
        router.refresh();
      } else {
        toast.error(res.message ?? "Failed to delete.");
      }
    });
  };

  const handleDeleteReply = () => {
    if (!reply) return;
    if (!confirm("Are you sure you want to delete this reply?")) return;
    startTransition(async () => {
      const res = await deleteMessage(reply.id, recipientUsername);
      if (res.success) {
        toast.success("Reply deleted.");
        router.refresh();
      } else {
        toast.error(res.message ?? "Failed to delete reply.");
      }
    });
  };

  const handleSaveEdit = () => {
    if (!reply) return;
    if (!editValue.trim()) return;
    startTransition(async () => {
      const res = await updateReplyMessage(
        reply.id,
        recipientUsername,
        editValue,
      );
      if (res.success) {
        setIsEditing(false);
        toast.success("Updated.");
        router.refresh();
      } else {
        toast.error(res.message ?? "Failed to save reply.");
      }
    });
  };

  return (
    <div className="border-b border-border/30 pb-6 mb-3 last:border-b-0 last:pb-0 last:mb-0 flex flex-col gap-4 w-full">
      {/* Incoming Anonymous Bubble */}
      <div className="flex flex-col gap-1.5 max-w-[88%] mr-auto">
        <div className="glass-bubble-incoming rounded-t-[1.15rem] rounded-r-[1.15rem] rounded-bl-[0.25rem] px-4.5 py-3">
          <p className="text-[13.5px] leading-relaxed font-normal tracking-wide text-foreground/90 whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
        <div className="flex items-center gap-2 pl-2">
          <span className="text-[0.55rem] font-semibold tracking-[0.16em] uppercase text-muted-foreground/60">
            {formatRelativeTime(message.createdAt, now)}
          </span>
          {isOwner && <NewBadge messageId={message.id} />}
          {isOwner && (
            <button
              type="button"
              disabled={isPending}
              onClick={handleDeleteMessage}
              className="text-muted-foreground hover:text-destructive cursor-pointer p-0.5 ml-1 transition-colors"
              title="Delete message"
            >
              <HugeiconsIcon icon={Delete02Icon} size={12} strokeWidth={1.5} />
            </button>
          )}
        </div>
      </div>

      {/* Outbound Reply Bubble */}
      {reply ? (
        <div className="flex flex-col gap-1.5 max-w-[88%] ml-auto items-end animate-in fade-in-20 duration-200">
          <div
            className="glass-bubble-reply rounded-t-[1.15rem] rounded-l-[1.15rem] rounded-br-[0.25rem] px-4.5 py-3 text-left"
          >
            {/* Inline reply edit editor or read-only text */}
            {isEditing ? (
              <div className="space-y-2 animate-in fade-in-20 duration-150 sm:min-w-[240px] min-w-0">
                <Textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value.slice(0, 4000))}
                  className="min-h-[80px] w-full text-sm rounded-lg border border-border bg-background text-foreground"
                  disabled={isPending}
                  placeholder="Edit your reply..."
                />
                <div className="flex gap-1.5 justify-end">
                  <Button
                    size="xs"
                    disabled={isPending || !editValue.trim()}
                    onClick={handleSaveEdit}
                    className="cursor-pointer font-medium"
                  >
                    Save
                  </Button>
                  <Button
                    size="xs"
                    variant="ghost"
                    disabled={isPending}
                    onClick={() => {
                      setIsEditing(false);
                      setEditValue(reply.content);
                    }}
                    className="cursor-pointer font-medium"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-[13.5px] leading-relaxed font-normal tracking-wide text-foreground/90 whitespace-pre-wrap break-words">
                {reply.content}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 pr-2">
            {!isEditing && (
              <div className="flex items-center gap-1.5 mr-1">
                <ShareMessageButton
                  messageContent={message.content}
                  replyContent={reply.content}
                  username={recipientUsername}
                  className="text-muted-foreground/60 hover:text-foreground cursor-pointer h-5 w-5"
                />
                {isOwner && (
                  <>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => {
                        setEditValue(reply.content);
                        setIsEditing(true);
                      }}
                      className="text-muted-foreground/60 hover:text-foreground cursor-pointer p-0.5"
                      title="Edit reply"
                    >
                      <HugeiconsIcon
                        icon={Edit01Icon}
                        size={13}
                        strokeWidth={1.5}
                      />
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={handleDeleteReply}
                      className="text-muted-foreground/60 hover:text-destructive cursor-pointer p-0.5"
                      title="Delete reply"
                    >
                      <HugeiconsIcon
                        icon={Delete02Icon}
                        size={13}
                        strokeWidth={1.5}
                      />
                    </button>
                  </>
                )}
              </div>
            )}
            <span className="text-[0.55rem] font-semibold tracking-[0.16em] uppercase text-muted-foreground/60">
              Reply · {formatRelativeTime(reply.createdAt, now)}
            </span>
          </div>
        </div>
      ) : null}

      {/* Reply Form */}
      {replyForm ? <div className="mt-2 w-full">{replyForm}</div> : null}
    </div>
  );
});
