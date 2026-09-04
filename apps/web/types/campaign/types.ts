export interface CampaignApproveResult {
  campaign_id: string;
  status: "approved";
  approved_targets_count: number;
  messages_dispatched: number;
  messages_failed: number;
}

export interface CampaignDeclineResult {
  campaign_id: string;
  status: "declined";
  declined_targets_count: number;
}
