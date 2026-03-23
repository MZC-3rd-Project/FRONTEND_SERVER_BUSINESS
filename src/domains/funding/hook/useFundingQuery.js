import { useQuery } from "@tanstack/react-query"
import { shouldRetryRequest } from "@/common/api/queryRetry.js"
import {
  getCampaigns,
  getCampaignById,
  getCampaignByItemId,
  getCampaignProgress,
} from "../api/fundingApi.js"
import {
  mapFundingCampaignListPayload,
  mapFundingCampaignPayload,
  mapFundingProgressPayload,
} from "../lib/fundingMappers.js"

export const fundingKeys = {
  all: ["funding"],
  lists: () => [...fundingKeys.all, "list"],
  list: (params) => [...fundingKeys.lists(), params],
  details: () => [...fundingKeys.all, "detail"],
  detail: (campaignId) => [...fundingKeys.details(), campaignId],
  item: (itemId) => [...fundingKeys.all, "item", itemId],
  progress: (campaignId) => [...fundingKeys.all, campaignId, "progress"],
}

export function useCampaignsQuery(params = {}) {
  return useQuery({
    queryKey: fundingKeys.list(params),
    queryFn: async () => mapFundingCampaignListPayload(await getCampaigns(params)),
    retry: shouldRetryRequest,
    staleTime: 30_000,
  })
}

export function useCampaignQuery(campaignId) {
  return useQuery({
    queryKey: fundingKeys.detail(campaignId),
    queryFn: async () => mapFundingCampaignPayload(await getCampaignById(campaignId)),
    enabled: !!campaignId,
    retry: shouldRetryRequest,
    staleTime: 30_000,
  })
}

export function useCampaignByItemQuery(itemId) {
  return useQuery({
    queryKey: fundingKeys.item(itemId),
    queryFn: async () => mapFundingCampaignPayload(await getCampaignByItemId(itemId)),
    enabled: !!itemId,
    retry: shouldRetryRequest,
    staleTime: 30_000,
  })
}

export function useCampaignProgressQuery(campaignId) {
  return useQuery({
    queryKey: fundingKeys.progress(campaignId),
    queryFn: async () => mapFundingProgressPayload(await getCampaignProgress(campaignId)),
    enabled: !!campaignId,
    retry: shouldRetryRequest,
    staleTime: 10_000,
  })
}
