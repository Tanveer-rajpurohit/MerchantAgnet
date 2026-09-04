import type { SendStatus } from "../message/types";

export type CampaignStatus = "draft" | "approved" | "sending" | "sent" | "cancelled";

export interface CampaignTargetDTO {
  id: string;
  customer_connection_id: string;
  customer_name: string;
  customer_phone: string | null;
  message_content: string;
  payment_link_id: string | null;
  payment_link_url: string | null;
  send_status: SendStatus;
  created_at: string;
}

export interface CampaignResponse {
  id: string;
  merchant_id: string;
  offer_description: string;
  segment_description: string;
  discount_percent: string;
  status: CampaignStatus;
  target_count: number;
  targets: CampaignTargetDTO[];
  created_at: string;
  approved_at: string | null;
  approved_by: string | null;
  updated_at: string;
}

export interface CampaignSummaryDTO {
  id: string;
  offer_description: string;
  segment_description: string;
  discount_percent: string;
  status: CampaignStatus;
  target_count: number;
  created_at: string;
  updated_at: string;
}

export interface CampaignListResponse {
  items: CampaignSummaryDTO[];
  total: number;
}

export interface CampaignApproveResult {
  campaign_id: string;
  status: CampaignStatus;
  sent_count: number;
  failed_count: number;
  targets: CampaignTargetDTO[];
}

export interface CampaignDeclineResult {
  campaign_id: string;
  status: CampaignStatus;
  message: string;
}
