import type { AgentRunRecord, ChatMessageData, ToolInvocation } from "../../../../types";

export function extractCardsFromRun(
  run: AgentRunRecord
): Partial<Pick<ChatMessageData, "paymentLink" | "campaignGate" | "catalogStock" | "revenueSummary" | "rateLimit">> {
  return extractCardsFromData(run.agent_response, run.tools_invoked, run.user_message);
}

export function extractCardsFromData(
  responseText: string,
  toolsInvoked?: AgentRunRecord["tools_invoked"],
  userMessage?: string
): Partial<Pick<ChatMessageData, "paymentLink" | "campaignGate" | "catalogStock" | "revenueSummary" | "rateLimit">> {
  const result: Partial<Pick<ChatMessageData, "paymentLink" | "campaignGate" | "catalogStock" | "revenueSummary" | "rateLimit">> = {};

  if (!responseText && (!toolsInvoked || toolsInvoked.length === 0)) {
    return result;
  }

  const paymentTool = toolsInvoked?.find(
    (t: ToolInvocation) => t.tool === "create_payment_link" || (t as { name?: string }).name === "create_payment_link"
  );

  let paymentUrl: string | null = null;
  let paymentAmount: string | null = null;
  let customerName: string = "Customer";
  let customerPhone: string | undefined = undefined;
  let description: string = "Payment Request";

  const urlMatch = responseText.match(/https?:\/\/(?:rzp\.io\/[a-zA-Z0-9_\-\/]+|[\w-]+\.razorpay\.com\/[^\s\)\"\'\<\>]+)/i);
  if (urlMatch && urlMatch[0]) {
    paymentUrl = urlMatch[0].replace(/[.,;:!?]+$/, "");
  }

  if (paymentTool) {
    const args = (paymentTool.args || {}) as Record<string, unknown>;
    const content = String(paymentTool.content || "");
    const toolUrlMatch = content.match(/LINK_URL:\s*(https?:\/\/[^\s\n]+)/i);
    if (toolUrlMatch && toolUrlMatch[1]) {
      paymentUrl = toolUrlMatch[1].replace(/[.,;:!?]+$/, "");
    }
    if (args.customer_name) customerName = String(args.customer_name);
    if (args.customer_phone) customerPhone = String(args.customer_phone);
    if (args.description) description = String(args.description);
    if (args.amount !== undefined && args.amount !== null) {
      const num = Number(args.amount);
      paymentAmount = isNaN(num) ? String(args.amount) : `₹${num.toLocaleString("en-IN")}`;
    }
  }

  if (paymentUrl) {
    if (!paymentAmount) {
      const amountMatch = responseText.match(/(?:AMOUNT|Amount|Total|total|₹|Rs\.?)\s*[:=]?\s*(?:₹|INR\s*|Rs\.?)?\s*([\d,]+(?:\.\d+)?)/i);
      if (amountMatch && amountMatch[1]) {
        paymentAmount = `₹${amountMatch[1]}`;
      } else {
        paymentAmount = "₹0";
      }
    }
    if (customerName === "Customer" && userMessage) {
      const custMatch = userMessage.match(/(?:for|to)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
      if (custMatch && custMatch[1]) {
        customerName = custMatch[1];
      }
    }

    result.paymentLink = {
      customerName,
      customerPhone,
      amount: paymentAmount.startsWith("₹") ? paymentAmount : `₹${paymentAmount}`,
      description,
      linkUrl: paymentUrl,
      status: "active",
    };
  }

  const campaignTools = (toolsInvoked || []).filter(
    (t: ToolInvocation) => t.tool === "create_campaign" || (t as { name?: string }).name === "create_campaign"
  );
  const campaignTool =
    campaignTools.find((t) => Boolean(t.content && /CAMPAIGN_ID:/i.test(String(t.content)))) ||
    campaignTools[0];

  let isCampaignDraft = Boolean(campaignTool);
  let campaignId: string | undefined = undefined;
  let campaignName = "Special Store Campaign";
  let segmentDescription = "Recent connected customers";
  let targetCount = 1;
  let discountPercent = "10%";
  let offerMessage = "";

  for (const t of campaignTools) {
    const c = String(t.content || "");
    const idMatch = c.match(/CAMPAIGN_ID:\s*([a-f0-9\-]+)/i);
    if (idMatch && idMatch[1]) {
      campaignId = idMatch[1];
      break;
    }
  }

  if (campaignTool) {
    const args = (campaignTool.args || {}) as Record<string, unknown>;
    const content = String(campaignTool.content || "");
    if (!campaignId) {
      const idMatch = content.match(/CAMPAIGN_ID:\s*([a-f0-9\-]+)/i);
      if (idMatch && idMatch[1]) campaignId = idMatch[1];
    }

    if (args.offer_description) campaignName = String(args.offer_description);
    if (args.segment_description) segmentDescription = String(args.segment_description);
    if (args.discount_percent) discountPercent = String(args.discount_percent);
    if (args.message_template) offerMessage = String(args.message_template);

    const countMatch = content.match(/TARGET_COUNT:\s*(\d+)/i);
    if (countMatch && countMatch[1]) {
      targetCount = parseInt(countMatch[1], 10);
    } else if (Array.isArray(args.customer_connection_ids)) {
      targetCount = args.customer_connection_ids.length;
    }
  } else if (
    /CAMPAIGN_DRAFT_CREATED|(?:Campaign Draft|Draft Campaign)(?:\s*\([^\)]*\))?|Approval Batch|### (?:Marketing )?Campaign/i.test(
      responseText
    )
  ) {
    isCampaignDraft = true;
    const idMatch = responseText.match(/CAMPAIGN_ID:\s*([a-f0-9\-]+)/i);
    if (idMatch && idMatch[1]) campaignId = idMatch[1];

    const offerMatch = responseText.match(
      /(?:Offer\s+Description|OFFER(?:\s+DESCRIPTION)?|Campaign\s+Name|Occasion|OFFER)\s*[:|]\s*([^\n|]+)/i
    );
    const segMatch = responseText.match(
      /(?:SEGMENT|Target Segment|Segment(?:\s+Description)?)\s*[:|]\s*([^\n|]+)/i
    );
    const discMatch = responseText.match(
      /(?:DISCOUNT|Discount(?:\s+Offer|\s+Percent)?)\s*[:|]\s*([^\n|]+)/i
    );
    const targetMatch = responseText.match(
      /(?:TARGET_COUNT|Target Customers?|Targets?|Audience|Customer\s+Count)\s*[:|]\s*(\d+)/i
    );
    const draftBlockMatch = responseText.match(/```(?:draft|whatsapp)?\s*([\s\S]*?)```/i);
    const msgMatch = responseText.match(/(?:MESSAGE(?:\s*TEMPLATE|\s*PREVIEW)?|Message Template|Message Preview)\s*[:|]\s*"?([^\n"|]+)"?/i);

    if (offerMatch && offerMatch[1]) campaignName = offerMatch[1].trim();
    if (segMatch && segMatch[1]) segmentDescription = segMatch[1].trim();
    if (discMatch && discMatch[1]) discountPercent = discMatch[1].trim();
    if (targetMatch && targetMatch[1]) targetCount = parseInt(targetMatch[1], 10);
    if (draftBlockMatch && draftBlockMatch[1]) {
      offerMessage = draftBlockMatch[1].trim();
    } else if (msgMatch && msgMatch[1]) {
      offerMessage = msgMatch[1].trim();
    }
  }

  if (!campaignId) {
    const fallbackIdMatch = responseText.match(/CAMPAIGN_ID:\s*([a-f0-9\-]+)/i);
    if (fallbackIdMatch && fallbackIdMatch[1]) campaignId = fallbackIdMatch[1];
  }

  if (isCampaignDraft) {
    result.campaignGate = {
      campaignId,
      campaignName,
      segmentDescription,
      targetCount: Math.max(1, targetCount),
      discountPercent: discountPercent.endsWith("%") ? discountPercent : `${discountPercent}%`,
      offerMessage: offerMessage || `Hi there! Special offer: ${campaignName} at our store. Valid while stocks last!`,
    };
  }

  if (
    /Current load is too high|upgrade to Premium|AI capacity limit reached|capacity saturated|rate limit hit/i.test(
      responseText
    )
  ) {
    result.rateLimit = {
      isRateLimited: true,
    };
  }

  return result;
}
