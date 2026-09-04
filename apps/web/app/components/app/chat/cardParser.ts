import type { AgentRunRecord } from "../../../types";
import type { ChatMessageData } from "./ChatMessageItem";

export function extractCardsFromRun(
  run: AgentRunRecord
): Pick<ChatMessageData, "paymentLink" | "campaignGate" | "catalogStock" | "revenueSummary" | "rateLimit"> {
  return extractCardsFromData(run.agent_response, run.tools_invoked, run.user_message);
}

export function extractCardsFromData(
  responseText: string,
  toolsInvoked?: AgentRunRecord["tools_invoked"],
  userMessage?: string
): Pick<ChatMessageData, "paymentLink" | "campaignGate" | "catalogStock" | "revenueSummary" | "rateLimit"> {
  const result: Pick<ChatMessageData, "paymentLink" | "campaignGate" | "catalogStock" | "revenueSummary" | "rateLimit"> = {};

  if (!responseText && (!toolsInvoked || toolsInvoked.length === 0)) {
    return result;
  }

  // 1. PAYMENT LINK EXTRACTION
  const paymentTool = toolsInvoked?.find(
    (t) => t.tool === "create_payment_link" || (t as { name?: string }).name === "create_payment_link"
  );

  let paymentUrl: string | null = null;
  let paymentAmount: string | null = null;
  let customerName: string = "Customer";
  let customerPhone: string | undefined = undefined;
  let description: string = "Payment Request";

  // URL regex for Razorpay payment links (rzp.io or custom links)
  const urlMatch = responseText.match(/https?:\/\/(?:rzp\.io\/[a-zA-Z0-9_\-\/]+|[\w-]+\.razorpay\.com\/[^\s\)\"\'\<\>]+)/i);
  if (urlMatch) {
    paymentUrl = urlMatch[0].replace(/[.,;:!?]+$/, "");
  }

  if (paymentTool) {
    const args = (paymentTool.args || {}) as Record<string, unknown>;
    const content = String(paymentTool.content || "");
    const toolUrlMatch = content.match(/LINK_URL:\s*(https?:\/\/[^\s\n]+)/i);
    if (toolUrlMatch) {
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
      if (amountMatch) {
        paymentAmount = `₹${amountMatch[1]}`;
      } else {
        paymentAmount = "₹0";
      }
    }
    if (customerName === "Customer" && userMessage) {
      const custMatch = userMessage.match(/(?:for|to)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
      if (custMatch) {
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

  // 2. CAMPAIGN GATE EXTRACTION
  const campaignTool = toolsInvoked?.find(
    (t) => t.tool === "create_campaign" || (t as { name?: string }).name === "create_campaign"
  );

  let isCampaignDraft = Boolean(campaignTool);
  let campaignName = "Special Store Campaign";
  let segmentDescription = "Recent connected customers";
  let targetCount = 1;
  let discountPercent = "10%";
  let offerMessage = "";

  if (campaignTool) {
    const args = (campaignTool.args || {}) as Record<string, unknown>;
    const content = String(campaignTool.content || "");
    if (args.offer_description) campaignName = String(args.offer_description);
    if (args.segment_description) segmentDescription = String(args.segment_description);
    if (args.discount_percent) discountPercent = String(args.discount_percent);
    if (args.message_template) offerMessage = String(args.message_template);

    const countMatch = content.match(/TARGET_COUNT:\s*(\d+)/i);
    if (countMatch) {
      targetCount = parseInt(countMatch[1], 10);
    } else if (Array.isArray(args.customer_connection_ids)) {
      targetCount = args.customer_connection_ids.length;
    }
  } else if (
    /CAMPAIGN_DRAFT_CREATED|Campaign Draft (?:Created|Ready for Approval|Draft)|### (?:Marketing )?Campaign Draft/i.test(
      responseText
    )
  ) {
    isCampaignDraft = true;
    const offerMatch = responseText.match(
      /(?:OFFER|Offer(?:\s+Description)?|Campaign(?:\s+Name)?):\s*([^\n]+)/i
    );
    const segMatch = responseText.match(
      /(?:SEGMENT|Target Segment|Segment(?:\s+Description)?):\s*([^\n]+)/i
    );
    const discMatch = responseText.match(
      /(?:DISCOUNT|Discount(?:\s+Offer)?):\s*([^\n]+)/i
    );
    const targetMatch = responseText.match(
      /(?:TARGET_COUNT|Target Customers?|Targets?|Audience):\s*(\d+)/i
    );
    const draftBlockMatch = responseText.match(/```(?:draft|whatsapp)?\s*([\s\S]*?)```/i);
    const msgMatch = responseText.match(/(?:MESSAGE(?:\s*PREVIEW)?|Message Preview):\s*"?([^\n"]+)"?/i);

    if (offerMatch) campaignName = offerMatch[1].trim();
    if (segMatch) segmentDescription = segMatch[1].trim();
    if (discMatch) discountPercent = discMatch[1].trim();
    if (targetMatch) targetCount = parseInt(targetMatch[1], 10);
    if (draftBlockMatch) {
      offerMessage = draftBlockMatch[1].trim();
    } else if (msgMatch) {
      offerMessage = msgMatch[1].trim();
    }
  }

  if (isCampaignDraft) {
    result.campaignGate = {
      campaignName,
      segmentDescription,
      targetCount: Math.max(1, targetCount),
      discountPercent: discountPercent.endsWith("%") ? discountPercent : `${discountPercent}%`,
      offerMessage: offerMessage || `Hi there! Special offer: ${campaignName} at our store. Valid while stocks last!`,
    };
  }

  // 3. RATE LIMIT / PEAK LOAD EXTRACTION
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
