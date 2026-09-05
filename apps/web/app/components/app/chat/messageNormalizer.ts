export function normalizeMessageContent(content: string): string {
  if (!content) return "";

  let text = content;

  text = text.replace(/^(?:\*\*Summary\*\*|Summary|\*\*Overview\*\*|Overview)\s*[:\-–]?\s*/i, "");

  text = text.replace(
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})\s+(\d{4})\b/g,
    "$1 $2, $3"
  );

  text = text.replace(/```(?:draft|whatsapp|message|[a-z0-9_-]*)?\s*([\s\S]*?)```/gi, (match, body) => {
    const trimmed = body.trim();
    if (
      /^(?:Hi\b|Hello\b|Dear\b|Hey\b|Namaste\b|Please\s+arrange|To:|Subject:)/i.test(trimmed) ||
      /(?:Thank\s+you|Thanks|Regards|Sincerely)[\s\S]*$/i.test(trimmed) ||
      match.toLowerCase().includes("draft") ||
      match.toLowerCase().includes("whatsapp")
    ) {
      const lines = trimmed.split("\n");
      return "\n\n" + lines.map((l: string) => `> ${l}`).join("\n") + "\n\n";
    }
    return match;
  });

  text = text.replace(/```(?:draft|whatsapp|message|[a-z0-9_-]*)?\s*([\s\S]*)$/gi, (match, body) => {
    const trimmed = body.trim();
    if (
      /^(?:Hi\b|Hello\b|Dear\b|Hey\b|Namaste\b|Please\s+arrange|To:|Subject:)/i.test(trimmed) ||
      match.toLowerCase().includes("draft") ||
      match.toLowerCase().includes("whatsapp")
    ) {
      const lines = trimmed.split("\n");
      return "\n\n" + lines.map((l: string) => `> ${l}`).join("\n");
    }
    return match;
  });

  text = text.replace(/<(?:draft_message|draft)>([\s\S]*?)<\/(?:draft_message|draft)>/gi, (_, body) => {
    const lines = body.trim().split("\n");
    return "\n\n" + lines.map((l: string) => `> ${l}`).join("\n") + "\n\n";
  });

  text = text.replace(
    /(?:^|\n)(?:\*\*)?(?:Draft\s+(?:WhatsApp\s+)?Message|WhatsApp\s+(?:Draft|Message|Template)|Message\s+Template|Supplier\s+(?:Order\s+)?Draft|Ready-to-copy\s+message|Draft)[:* \t]*\n+((?:[^\n]+\n?)+?)(?=\n\s*\n|\n[A-Z][a-z]+:|\n\b(?:If you|Let me|Please let|You can|Note)\b|$)/gi,
    (_, body) => {
      const trimmed = body.trim();
      if (trimmed.startsWith(">")) return `\n\n${trimmed}\n\n`;
      const lines = trimmed.split("\n");
      return "\n\n" + lines.map((l: string) => `> ${l}`).join("\n") + "\n\n";
    }
  );

  text = text.replace(/\uFFFD/g, "");
  text = text.replace(/^[ \t]*[\u25C6\u25C7\u25CA\u25C8\u25C9\u25CE\u25CF\u25B6\u25B7\u25BA\u25BB\u25C4\u25C5\u25E6\u2022\u2219◆◇◈►▶▸→]\s*/gm, "");
  text = text.replace(/(?:^|\n)[ \t]*[\u25C6◆◈]\s*(?:Next Step|NEXT STEP)/gim, "\n**NEXT STEP:**");
  text = text.replace(/^[ \t]*[🚀📌✅📈📊💡🛍️⚠️⚡🎯]\s*/gm, "");

  text = text.replace(/\{Your\s*name\}|\[Your\s*Name\]|\{Owner\s*Name\}|\[Owner\s*Name\]/gi, "Store Owner");
  text = text.replace(/\{Supplier\s*Name\}|\[Supplier\s*Name\]|\{Distributor\s*Name\}|\[Distributor\s*Name\]/gi, "Wholesaler / Distributor");
  text = text.replace(/\{Customer\s*Name\}|\[Customer\s*Name\]/gi, "Valued Customer");

  text = text.replace(/(?:^|\n)NOTE:\s*This is the definitive store profit[\s\S]*?(?=\n\n|$)/gi, "");
  text = text.replace(/(?:^|\n)NOTE:\s*In retail store operations, daily earnings[\s\S]*?(?=\n\n|$)/gi, "");
  text = text.replace(/^[ \t]*[•●◦]\s*/gm, "- ");

  text = text.replace(
    /(?:^|\n)STORE_REVENUE_AND_PROFIT_REPORT\s+STORE:\s*([^\n]+?)\s+TIMEFRAME:\s*([^\n]+?)\s+DATE_RANGE:\s*(From\s+[^\n]+)/gi,
    "\n### Revenue Summary\n**Store:** $1\n**Period:** $2\n**Date Range:** $3\n"
  );
  text = text.replace(/(?:^|\n)STORE_REVENUE_AND_PROFIT_REPORT\s*/gi, "\n### Revenue Summary\n");
  text = text.replace(/(?:^|\n)DAILY_COLLECTION_AND_PROFIT_REPORT\s*/gi, "\n### Daily Collection\n");
  text = text.replace(/(?:^|\n)CUSTOMER_UDHAAR_LEDGER\s*/gi, "\n### Customer Udhaar Ledger\n");

  const unwrappedPattern = /(?:^|\n\n)(?!\s*>)(?:Subject:\s*[^\n]+\n\n?)?((?:Hi\b|Hello\b|Dear\b|Hey\b|Namaste\b|Please\s+arrange)\b[\s\S]*?(?:(?:Best regards|Warm regards|Regards|Thanks|Thank you|Sincerely)[\s\S]*?(?:\.|\!|\n\n|$)))/gi;
  
  text = text.replace(unwrappedPattern, (_, rawMessage) => {
    const lines = rawMessage.trim().split("\n");
    return "\n\n" + lines.map((l: string) => `> ${l}`).join("\n") + "\n\n";
  });

  return text;
}
