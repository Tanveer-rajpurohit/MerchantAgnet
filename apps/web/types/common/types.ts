export interface ApiValidationErrorItem {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface ApiErrorPayload {
  detail?: string | ApiValidationErrorItem[];
}
