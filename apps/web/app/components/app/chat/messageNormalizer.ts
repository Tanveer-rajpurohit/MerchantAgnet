export function normalizeMessageContent(content: string): string {
  if (!content) return "";

  let text = content;

  // 1. Fix date format missing comma: "September 3 2026" -> "September 3, 2026"
  text = text.replace(
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})\s+(\d{4})\b/g,
    "$1 $2, $3"
  );

  // 2. Convert <draft_message>...</draft_message> or <draft>...</draft> into Markdown blockquotes
  text = text.replace(/<(?:draft_message|draft)>([\s\S]*?)<\/(?:draft_message|draft)>/gi, (_, body) => {
    const lines = body.trim().split("\n");
    return "\n\n" + lines.map((l: string) => `> ${l}`).join("\n") + "\n\n";
  });

  // 3. Remove raw decorative emoji slop from headings
  text = text.replace(/^[ \t]*[🚀📌✅📈📊💡🛍️⚠️⚡🎯]\s*/gm, "");

  // 4. Sanitize any accidental placeholder brackets with clean contextual defaults
  text = text.replace(/\[(?:Wholesaler(?:'s)?\s*Name(?:\s*\/\s*Company)?|Wholeseller\s*\/\s*Supplier\s*Name|Supplier\s*Name)\]/gi, "Wholesaler");
  text = text.replace(/\[(?:Your\s*Name)\]/gi, "Tanveer");
  text = text.replace(/\[(?:Your\s*(?:Business|Store)\s*Name)\]/gi, "Tanveer's shop");
  text = text.replace(/\[(?:Your\s*Store\s*Address)\]/gi, "randhe banglow, gandevi, navsari, gujarat, Gandevi");
  text = text.replace(/\[(?:desired\s*delivery\s*date)\]/gi, "within 3 days");
  text = text.replace(/<your-UPI-ID>/gi, "Active Store UPI");
  text = text.replace(/\[(?:Your\s*contact)\]|\+91XXXXXXXXXX/gi, "Registered Contact");
  text = text.replace(/\[(?:Your\s*email)\]|yourmail@example\.com/gi, "Registered Email");

  // 5. Auto-wrap unwrapped message templates into blockquotes so MessageSnippetCard activates
  const messagePattern = /(?:^|\n\n)(?!\s*>)(Hi\s+[^\n]+,?\n[\s\S]*?(?:(?:Best regards|Warm regards|Regards|Thanks|Thank you|Sincerely),?[\s\S]*?(?:\n\n|$)))/i;
  
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
