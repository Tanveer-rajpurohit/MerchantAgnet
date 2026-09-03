"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Loader2, X } from "lucide-react";

interface DeleteChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  isDeleting: boolean;
  chatTitle: string;
}

export function DeleteChatModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  chatTitle,
}: DeleteChatModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 font-intert shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-auto">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xl font-instrument text-primary tracking-tight">
            Delete Chat
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:text-primary hover:bg-surface-muted transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
        <p className="text-xs text-muted mb-4 font-intert">
          This conversation and its associated operational calculations will be permanently deleted.
        </p>

        <div className="my-4 p-3 rounded-xl border border-border bg-bg truncate">
          <span className="text-[11px] text-muted block mb-0.5">
            Conversation
          </span>
          <span className="text-xs text-primary font-medium truncate block">
            {chatTitle}
          </span>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border mt-5">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-lg border border-border bg-surface text-secondary hover:text-primary text-xs font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isDeleting && <Loader2 size={13} className="animate-spin" />}
            <span>Delete Chat</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
