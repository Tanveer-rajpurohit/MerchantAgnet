export interface ApiValidationErrorItem {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface ApiErrorPayload {
  detail?: string | ApiValidationErrorItem[];
}

export interface SpeechResultItem {
  transcript: string;
}

export interface SpeechResult {
  isFinal: boolean;
  [index: number]: SpeechResultItem;
}

export interface SpeechResultList {
  length: number;
  [index: number]: SpeechResult;
}

export interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechResultList;
}

export interface SpeechRecognitionErrorEvent {
  error: string;
}

export interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

export interface SpeechWindow extends Window {
  SpeechRecognition?: new () => SpeechRecognitionInstance;
  webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
}

export type TTSStatus = "idle" | "speaking" | "loading" | "error";

export interface VoiceOption {
  id: string;
  name: string;
  label: string;
  gender: "female" | "male";
  accent: string;
  description: string;
  previewText: string;
}

export interface UseTTSReturn {
  speak: (text: string, customLang?: string, customVoice?: string, messageId?: string) => Promise<void>;
  stop: () => void;
  status: TTSStatus;
  speaking: boolean;
  activeId: string | null;
  supported: boolean;
}

export interface UseAutoScrollOptions {
  threshold?: number;
  deps?: unknown[];
}

export interface VoiceState {
  selectedVoice: string;
  setSelectedVoice: (voiceId: string) => void;
}

