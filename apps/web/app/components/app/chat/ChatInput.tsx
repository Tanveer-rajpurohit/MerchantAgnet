"use client";

import { useRef, useEffect, useState } from "react";
import {
  ArrowUp,
  X,
  Users,
  ChevronDown,
  Check,
  Mic,
  MicOff,
} from "lucide-react";
import { useCustomerConnections } from "../../../../hooks";
import { VoiceSelector } from "./VoiceSelector";
import type {
  CustomerConnectionResponse,
  ActionMode,
  SpeechRecognitionInstance,
  SpeechWindow,
  SpeechRecognitionEvent,
  SpeechRecognitionErrorEvent,
} from "../../../../types";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (
    text: string,
    mode: ActionMode,
    attachedCustomers?: CustomerConnectionResponse[] | null,
  ) => void;
  placeholder?: string;
  autoFocus?: boolean;
  disabled?: boolean;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Ask anything about payment links, stock, or campaigns...",
  autoFocus = false,
  disabled = false,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const customerDropdownRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const isListeningRef = useRef<boolean>(false);
  const baseTextRef = useRef<string>("");
  const accumulatedRef = useRef<string>("");

  const [selectedCustomers, setSelectedCustomers] = useState<CustomerConnectionResponse[]>([]);
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const { customers, isLoading: isCustomersLoading } = useCustomerConnections();
  const connectedCustomers = customers.filter(
    (c) => c.status === "connected"
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        customerDropdownRef.current &&
        !customerDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCustomerDropdownOpen(false);
      }
    }
    if (isCustomerDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCustomerDropdownOpen]);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleInput = (val: string) => {
    onChange(val);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const nextHeight = Math.min(textareaRef.current.scrollHeight, 160);
      textareaRef.current.style.height = `${Math.max(nextHeight, 28)}px`;
      textareaRef.current.style.overflowY = textareaRef.current.scrollHeight > 160 ? "auto" : "hidden";
    }
  };

  const stopRecognition = () => {
    isListeningRef.current = false;
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        void e;
      }
      recognitionRef.current = null;
    }
  };

  const handleSend = () => {
    if (!value.trim() || disabled) return;
    const textToSend = value.trim();
    stopRecognition();
    onSubmit(
      textToSend,
      "default",
      selectedCustomers.length > 0 ? selectedCustomers : null
    );
    onChange("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.overflowY = "hidden";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleSpeechRecognition = async () => {
    if (typeof window === "undefined") return;
    const speechWin = window as unknown as SpeechWindow;
    const SpeechRecognition =
      speechWin.SpeechRecognition || speechWin.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isListening) {
      stopRecognition();
      return;
    }

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => {});
      }

      const recognition = new SpeechRecognition();
      recognition.lang = "hi-IN";
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      baseTextRef.current = value.trim();
      accumulatedRef.current = "";
      isListeningRef.current = true;
      setIsListening(true);

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          if (!res) continue;
          const transcript = res[0]?.transcript || "";
          if (res.isFinal) {
            accumulatedRef.current += (accumulatedRef.current ? " " : "") + transcript.trim();
          } else {
            interimTranscript += transcript;
          }
        }

        const currentSpoken = [accumulatedRef.current, interimTranscript.trim()].filter(Boolean).join(" ");
        const base = baseTextRef.current;
        const fullText = base ? `${base} ${currentSpoken}` : currentSpoken;
        handleInput(fullText);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error === "no-speech") {
          return;
        }
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          stopRecognition();
        }
      };

      recognition.onend = () => {
        if (isListeningRef.current) {
          try {
            recognition.start();
          } catch {
            setIsListening(false);
            isListeningRef.current = false;
          }
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
      isListeningRef.current = false;
    }
  };

  const isSpeechSupported =
    typeof window !== "undefined" &&
    Boolean(
      (window as unknown as SpeechWindow).SpeechRecognition ||
        (window as unknown as SpeechWindow).webkitSpeechRecognition
    );

  return (
    <div className="w-full">
      <div className="rounded-2xl border border-border bg-surface shadow-xs transition-all focus-within:border-brand/50 focus-within:bg-surface">
        {selectedCustomers.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 px-4 pt-2.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium bg-brand/10 text-brand border border-brand/20 shadow-2xs">
              <Users size={12} className="shrink-0" />
              {selectedCustomers.length === 1 && selectedCustomers[0] ? (
                <>
                  <span>To: <strong>{selectedCustomers[0].customer_name}</strong></span>
                  {selectedCustomers[0].customer_phone && (
                    <span className="text-[10px] text-muted">({selectedCustomers[0].customer_phone})</span>
                  )}
                </>
              ) : selectedCustomers[0] ? (
                <>
                  <span>
                    To: <strong>{selectedCustomers[0].customer_name}</strong> + {selectedCustomers.length - 1} other{selectedCustomers.length > 2 ? "s" : ""}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-brand/20 text-brand rounded-full font-semibold">
                    {selectedCustomers.length} selected
                  </span>
                </>
              ) : null}
              <button
                type="button"
                onClick={() => setSelectedCustomers([])}
                className="ml-1 text-muted hover:text-primary transition-colors cursor-pointer"
                title="Clear customer selection"
              >
                <X size={12} />
              </button>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar text-[11px]">
              <button
                type="button"
                onClick={() =>
                  handleInput(
                    selectedCustomers.length > 1
                      ? "Please message all selected customers that their orders are ready for pickup."
                      : "Please message the customer that their order is ready for pickup."
                  )
                }
                className="px-2 py-0.5 rounded-lg border border-border bg-surface-muted hover:bg-border/40 text-secondary hover:text-primary transition-colors cursor-pointer whitespace-nowrap"
              >
                Ready for pickup
              </button>
              <button
                type="button"
                onClick={() =>
                  handleInput(
                    selectedCustomers.length > 1
                      ? "Send a payment link for ₹100 to all attached customers."
                      : "Send a payment link for ₹100 to this customer."
                  )
                }
                className="px-2 py-0.5 rounded-lg border border-border bg-surface-muted hover:bg-border/40 text-secondary hover:text-primary transition-colors cursor-pointer whitespace-nowrap"
              >
                Send Pay Link
              </button>
              <button
                type="button"
                onClick={() =>
                  handleInput(
                    selectedCustomers.length > 1
                      ? "Send an exclusive 10% discount offer note to all attached customers."
                      : "Send an exclusive 10% discount offer note to this customer."
                  )
                }
                className="px-2 py-0.5 rounded-lg border border-border bg-surface-muted hover:bg-border/40 text-secondary hover:text-primary transition-colors cursor-pointer whitespace-nowrap"
              >
                10% Off Note
              </button>
            </div>
          </div>
        )}

        <div className="px-4 pt-3 pb-2">
          <textarea
            ref={textareaRef}
            value={value}
            disabled={disabled}
            onChange={(e) => handleInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening in real-time... bolte rahiye..." : placeholder}
            rows={1}
            className="w-full resize-none bg-transparent text-[15px] text-primary font-intert outline-none placeholder:text-muted/60 leading-relaxed disabled:opacity-50 max-h-[160px] overflow-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            style={{ minHeight: "28px" }}
          />
        </div>

        <div className="flex items-center justify-between px-3 pb-3 pt-1 border-t border-border-subtle/60">
          <div className="flex items-center gap-1.5">
            <div className="relative" ref={customerDropdownRef}>
              <button
                type="button"
                onClick={() => setIsCustomerDropdownOpen((prev) => !prev)}
                title="Select Connected Customer(s) to message"
                className={`flex items-center gap-1.5 px-2.5 h-8 rounded-lg text-xs font-medium font-intert transition-colors cursor-pointer ${
                  selectedCustomers.length > 0 || isCustomerDropdownOpen
                    ? "bg-brand/15 text-brand border border-brand/25"
                    : "text-muted hover:text-secondary hover:bg-surface-muted"
                }`}
              >
                <Users size={13} />
                <span className="max-w-[85px] sm:max-w-[120px] truncate">
                  {selectedCustomers.length === 0
                    ? "Customer"
                    : selectedCustomers.length === 1
                    ? selectedCustomers[0]?.customer_name || "Customer"
                    : `${selectedCustomers.length} Customers`}
                </span>
                <ChevronDown
                  size={11}
                  className={`transition-transform duration-200 ${
                    isCustomerDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isCustomerDropdownOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-72 max-h-72 overflow-y-auto rounded-2xl border border-border bg-surface shadow-xl z-50 p-2 font-intert animate-in fade-in zoom-in-95 duration-100">
                  <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-muted border-b border-border/50 mb-1.5">
                    <span>Connected Customers</span>
                    {connectedCustomers.length > 0 && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedCustomers.length === connectedCustomers.length) {
                              setSelectedCustomers([]);
                            } else {
                              setSelectedCustomers([...connectedCustomers]);
                            }
                          }}
                          className="text-[10px] text-brand hover:underline cursor-pointer font-medium"
                        >
                          {selectedCustomers.length === connectedCustomers.length
                            ? "Deselect All"
                            : "Select All"}
                        </button>
                        {selectedCustomers.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setSelectedCustomers([])}
                            className="text-[10px] text-muted hover:text-danger cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  {isCustomersLoading ? (
                    <div className="px-3 py-4 text-center text-xs text-muted">
                      Loading customers...
                    </div>
                  ) : connectedCustomers.length === 0 ? (
                    <div className="px-3 py-4 text-center text-xs text-muted">
                      No connected customers yet.
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      {connectedCustomers.map((cust) => {
                        const isSelected = selectedCustomers.some((c) => c.id === cust.id);
                        return (
                          <button
                            key={cust.id}
                            type="button"
                            onClick={() => {
                              setSelectedCustomers((prev) =>
                                isSelected
                                  ? prev.filter((c) => c.id !== cust.id)
                                  : [...prev, cust]
                              );
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-brand/10 text-brand font-medium"
                                : "hover:bg-surface-muted text-primary"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate pr-2">
                              <div
                                className={`w-4 h-4 rounded flex items-center justify-center border transition-colors shrink-0 ${
                                  isSelected
                                    ? "bg-brand border-brand text-white"
                                    : "border-border bg-surface-muted"
                                }`}
                              >
                                {isSelected && <Check size={11} strokeWidth={3} className="text-white" />}
                              </div>
                              <div className="truncate">
                                <p className="font-medium truncate">{cust.customer_name}</p>
                                <p className="text-[10px] text-muted truncate">
                                  {cust.customer_phone || cust.customer_email || "Connected via chat"}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                      <div className="pt-2 mt-1 border-t border-border/50 flex items-center justify-between px-2 text-[11px]">
                        <span className="text-muted">
                          {selectedCustomers.length} selected
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsCustomerDropdownOpen(false)}
                          className="px-2.5 py-1 rounded-lg bg-brand text-white text-[11px] font-medium hover:bg-brand/90 transition-colors cursor-pointer"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <VoiceSelector />
            {isSpeechSupported && (
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                title={isListening ? "Stop listening" : "Speak in Hinglish / Hindi to write in real time"}
                aria-label={isListening ? "Stop listening" : "Speak to write"}
                className={`flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isListening
                    ? "bg-red-500 text-white animate-pulse shadow-xs"
                    : "text-muted hover:text-secondary hover:bg-surface-muted"
                }`}
              >
                {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                <span className="hidden sm:inline">{isListening ? "Listening..." : "Speak"}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSend}
              disabled={!value.trim() || disabled}
              aria-label="Send message"
              className="flex items-center justify-center w-8 h-8 rounded-lg btn-brand-solid disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shadow-xs cursor-pointer"
            >
              <ArrowUp size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
