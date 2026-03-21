import { useQuery } from "@tanstack/react-query"
import {
  getCampaigns,
  getCampaignById,
  getCampaignByItemId,
  getCampaignProgress,
} from "../api/fundingApi.js"

export function useCampaignsQuery(params = {}) {
  return useQuery({
    queryKey: ["campaigns", params],
    queryFn: () => getCampaigns(params),
  })
}

export function useCampaignQuery(campaignId) {
  return useQuery({
    queryKey: ["campaigns", campaignId],
    queryFn: () => getCampaignById(campaignId),
    enabled: !!campaignId,
  })
}

export function useCampaignByItemQuery(itemId) {
  return useQuery({
    queryKey: ["campaigns", "item", itemId],
    queryFn: () => getCampaignByItemId(itemId),
    enabled: !!itemId,
  })
}

export function useCampaignProgressQuery(campaignId) {
  return useQuery({
    queryKey: ["campaigns", campaignId, "progress"],
    queryFn: () => getCampaignProgress(campaignId),
    enabled: !!campaignId,
  })
}
