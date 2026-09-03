export function normalizeMessageContent(content: string): string {
  if (!content) return "";

  let text = content;

  // 1. Strip raw "Summary" or "**Summary**" run-on prefixes from the beginning of messages
  text = text.replace(/^(?:\*\*Summary\*\*|Summary|\*\*Overview\*\*|Overview)\s*[:\-–]?\s*/i, "");

  // 2. Fix date formatting (e.g. ensure standard comma between day and year)
  text = text.replace(
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})\s+(\d{4})\b/g,
    "$1 $2, $3"
  );

  // 3. Convert code blocks containing a message draft (tagged ```draft, ```whatsapp, or plain ```) into Markdown blockquotes
  text = text.replace(/```(?:draft|whatsapp|message|[a-z0-9_-]*)?\s*([\s\S]*?)```/gi, (match, body) => {
    const trimmed = body.trim();
    if (
      /^(?:Hi\b|Hello\b|Dear\b|Hey\b|Please\s+arrange|To:|Subject:)/i.test(trimmed) ||
      /(?:Thank\s+you|Thanks|Regards|Sincerely)[\s\S]*$/i.test(trimmed)
    ) {
      const lines = trimmed.split("\n");
      return "\n\n" + lines.map((l: string) => `> ${l}`).join("\n") + "\n\n";
    }
    return match;
  });

  // 3b. Handle unclosed streaming code blocks containing a draft message so cards mount live
  text = text.replace(/```(?:draft|whatsapp|message|[a-z0-9_-]*)?\s*([\s\S]*)$/gi, (match, body) => {
    const trimmed = body.trim();
    if (
      /^(?:Hi\b|Hello\b|Dear\b|Hey\b|Please\s+arrange|To:|Subject:)/i.test(trimmed)
    ) {
      const lines = trimmed.split("\n");
      return "\n\n" + lines.map((l: string) => `> ${l}`).join("\n");
    }
    return match;
  });

  // 4. Convert <draft_message>...</draft_message> or <draft>...</draft> into Markdown blockquotes
  text = text.replace(/<(?:draft_message|draft)>([\s\S]*?)<\/(?:draft_message|draft)>/gi, (_, body) => {
    const lines = body.trim().split("\n");
    return "\n\n" + lines.map((l: string) => `> ${l}`).join("\n") + "\n\n";
  });

  // 5. Remove raw decorative emoji slop from headings
  text = text.replace(/^[ \t]*[🚀📌✅📈📊💡🛍️⚠️⚡🎯]\s*/gm, "");

  // 6. Auto-wrap unwrapped message templates (including Dear / Hi / Subject: lines) into blockquotes
  const messagePattern = /(?:^|\n\n)(?!\s*>)(?:Subject:\s*[^\n]+\n\n?)?((?:Hi\b|Hello\b|Dear\b|Please\s+arrange)[^\n]+,?\n[\s\S]*?(?:(?:Best regards|Warm regards|Regards|Thanks|Thank you|Sincerely)[^\n]*(?:\n[^\n]+){0,4}))/i;
  
  const match = text.match(messagePattern);
  if (match && match[1]) {
    const rawMessage = match[1].trim();
    const quotedMessage = rawMessage
      .split("\n")
      .map((l) => `> ${l}`)
      .join("\n");
    text = text.replace(rawMessage, quotedMessage);
  }

  return text;
}
