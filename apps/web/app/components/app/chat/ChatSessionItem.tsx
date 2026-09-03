"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useRenameSession, useDeleteSession } from "../../../../hooks";
import { RenameChatModal } from "./RenameChatModal";
import { DeleteChatModal } from "./DeleteChatModal";
import type { ChatSessionSummary } from "../../../../types";

interface ChatSessionItemProps {
  item: ChatSessionSummary;
  isActive: boolean;
  onCloseMobile?: () => void;
}

export function ChatSessionItem({
  item,
  isActive,
  onCloseMobile,
}: ChatSessionItemProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const renameMutation = useRenameSession();
  const deleteMutation = useDeleteSession();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const handleRename = async (newTitle: string) => {
    await renameMutation.mutateAsync({
      sessionId: item.session_id,
      payload: { title: newTitle },
    });
    setRenameOpen(false);
    setMenuOpen(false);
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(item.session_id);
    setDeleteOpen(false);
    setMenuOpen(false);
    if (isActive) {
      router.push("/chat");
    }
  };

  return (
    <>
      <div
        ref={menuRef}
        className={`group relative flex items-center justify-between rounded-lg transition-colors duration-150 mb-0.5 ${
          isActive
            ? "bg-brand/10 text-brand font-medium border border-brand/20"
            : "text-secondary hover:text-primary hover:bg-surface-muted"
        }`}
      >
        <Link
          href={`/chat/${item.session_id}`}
          onClick={onCloseMobile}
          title={item.title}
          className="flex-1 min-w-0 px-2.5 py-1.5 text-xs font-intert truncate"
        >
          {item.title}
        </Link>

        <button
          type="button"
          aria-label="Chat options"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMenuOpen((prev) => !prev);
          }}
          className={`shrink-0 w-6 h-6 mr-1.5 rounded-md flex items-center justify-center transition-all cursor-pointer ${
            menuOpen
              ? "opacity-100 bg-surface text-primary shadow-xs"
              : isActive
              ? "opacity-80 hover:opacity-100 text-brand hover:bg-brand/10"
              : "opacity-0 group-hover:opacity-100 hover:bg-surface text-muted hover:text-primary"
          }`}
        >
          <MoreHorizontal size={13} />
        </button>

        {menuOpen && (
          <div className="absolute right-1 top-full z-40 mt-1 w-36 rounded-xl border border-border bg-surface shadow-lg py-1 animate-in fade-in zoom-in-95 duration-100 font-intert">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
                setRenameOpen(true);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-xs text-secondary hover:text-primary hover:bg-surface-muted transition-colors cursor-pointer"
            >
              <Pencil size={12} className="text-muted" />
              <span>Rename</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
                setDeleteOpen(true);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-xs text-red-600 hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              <Trash2 size={12} className="text-red-500" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

      <RenameChatModal
        isOpen={renameOpen}
        onClose={() => setRenameOpen(false)}
        onConfirm={handleRename}
        isRenaming={renameMutation.isPending}
        currentTitle={item.title}
      />

      <DeleteChatModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        isDeleting={deleteMutation.isPending}
        chatTitle={item.title}
      />
    </>
  );
}
