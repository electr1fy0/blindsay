"use client";

import { useState, useTransition, useEffect } from "react";
import type { MessageModel as Message } from "@/lib/generated/prisma/models";
import { formatRelativeTime } from "@/lib/relative-time";
import { updateReplyMessage } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DeleteMessageButton } from "@/components/message-actions";
import { ShareMessageButton } from "@/components/share-message-button";
import { NewBadge } from "@/components/new-badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { Edit01Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { ReplyForm } from "@/components/reply-form";

interface MessageCardProps {
  message: Message;
  reply?: Message | null;
  now?: Date;
  isOwner?: boolean;
  recipientUsername?: string;
  recipientId?: string;
}

export function MessageCard({
  message,
  reply,
  now = new Date(),
  isOwner = false,
  recipientUsername = "",
  recipientId,
}: MessageCardProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [currentReply, setCurrentReply] = useState<Message | null>(reply ?? null);
  const [editValue, setEditValue] = useState(reply?.content ?? "");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setCurrentReply(reply ?? null);
    setEditValue(reply?.content ?? "");
  }, [reply]);

  const handleSaveEdit = () => {
    if (!currentReply) return;
    if (!editValue.trim()) return;
    startTransition(async () => {
      try {
        const res = await updateReplyMessage(
          currentReply.id,
          recipientUsername,
          editValue,
        );
        if (res.success) {
          setIsEditing(false);
          setCurrentReply({ ...currentReply, content: editValue });
          toast.success("Updated.");
          router.refresh();
        } else {
          toast.error(res.message ?? "Failed to save reply.");
        }
      } catch {
        toast.error("Failed to save reply.");
      }
    });
  };

  return (
    <motion.div
      layout
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 38
      }}
      className="relative border-b border-border/30 pb-6 mb-3 last:border-b-0 last:pb-0 last:mb-0 flex flex-col gap-4 w-full"
    >
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
            <DeleteMessageButton
              messageId={message.id}
              recipientUsername={recipientUsername}
              size="icon-xs"
              className="text-muted-foreground hover:text-destructive cursor-pointer p-0.5 ml-1 transition-colors"
            />
          )}
        </div>
      </div>

      <AnimatePresence mode="popLayout" initial={false}>
        {currentReply ? (
          <motion.div
            key={`reply-bubble-${message.id}`}
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 550,
              damping: 30
            }}
            className="flex flex-col gap-1.5 max-w-[88%] ml-auto items-end w-full"
          >
            <div
              className="glass-bubble-reply rounded-t-[1.15rem] rounded-l-[1.15rem] rounded-br-[0.25rem] px-4.5 py-3 text-left"
            >
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
                        setEditValue(currentReply.content);
                      }}
                      className="cursor-pointer font-medium"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-[13.5px] leading-relaxed font-normal tracking-wide text-foreground/90 whitespace-pre-wrap break-words">
                  {currentReply.content}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 pr-2">
              {!isEditing && (
                <div className="flex items-center gap-1.5 mr-1">
                  <ShareMessageButton
                    messageContent={message.content}
                    replyContent={currentReply.content}
                    username={recipientUsername}
                    className="text-muted-foreground/60 hover:text-foreground cursor-pointer h-5 w-5"
                  />
                  {isOwner && (
                    <>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => {
                          setEditValue(currentReply.content);
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
                      <DeleteMessageButton
                        messageId={currentReply.id}
                        recipientUsername={recipientUsername}
                        size="icon-xs"
                        className="text-muted-foreground/60 hover:text-destructive cursor-pointer p-0.5"
                        onSuccess={() => {
                          setCurrentReply(null);
                        }}
                      />
                    </>
                  )}
                </div>
              )}
              <span className="text-[0.55rem] font-semibold tracking-[0.16em] uppercase text-muted-foreground/60">
                Reply · {formatRelativeTime(currentReply.createdAt, now)}
              </span>
            </div>
          </motion.div>
        ) : (
          isOwner && (
            <motion.div
              key={`reply-form-container-${message.id}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 36
              }}
              className="mt-2 w-full"
            >
              <ReplyForm
                recipientId={recipientId ?? message.recipientId ?? ""}
                recipientUsername={recipientUsername}
                parentId={message.id}
                onSuccess={(newReply) => {
                  setCurrentReply(newReply);
                }}
              />
            </motion.div>
          )
        )}
      </AnimatePresence>
    </motion.div>
  );
}
