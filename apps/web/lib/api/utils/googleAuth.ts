export function openGoogleSignInPopup(
  clientId: string,
  onSuccess: (idToken: string) => void,
  onError?: (errorMsg: string) => void
): void {
  if (typeof window === "undefined") return;

  const redirectUri = window.location.origin;
  const nonce = Math.random().toString(36).substring(2) + Date.now().toString(36);

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "id_token");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("nonce", nonce);
  authUrl.searchParams.set("prompt", "select_account");

  const width = 500;
  const height = 600;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  const popup = window.open(
    authUrl.toString(),
    "GoogleSignIn",
    `width=${width},height=${height},left=${left},top=${top},status=no,toolbar=no,menubar=no,location=no`
  );

  if (!popup) {
    onError?.("Popup was blocked by browser. Please allow popups for this site.");
    return;
  }

  const pollTimer = window.setInterval(() => {
    try {
      if (!popup || popup.closed) {
        window.clearInterval(pollTimer);
        return;
      }

      const popupUrl = popup.location.href;
      if (popupUrl && popupUrl.startsWith(redirectUri)) {
        const hash = popup.location.hash;
        if (hash) {
          const params = new URLSearchParams(hash.replace(/^#/, ""));
          const idToken = params.get("id_token");
          const error = params.get("error");

          window.clearInterval(pollTimer);
          popup.close();

          if (idToken) {
            onSuccess(idToken);
          } else if (error) {
            onError?.(params.get("error_description") || error);
          }
        }
      }
    } catch {
      // Cross-origin access while still on accounts.google.com
    }
  }, 300);
}
