import { bffApiInstance } from "@/common/api/apiInstance.js"
import { normalizeApiError, unwrapApiResponseBody } from "@/common/api/responseUtils.js"
import {
  demoGetCampaigns,
  demoGetHotDeals,
  demoGetSellerProducts,
  isDemoModeEnabled,
} from "@/domains/management/mock/demoBackend.js"

const DAY_IN_MS = 24 * 60 * 60 * 1000
const WEEKDAY_WEIGHTS = [0.86, 0.94, 1.02, 1.08, 1.16, 1.32, 1.18]

function parseDateOnly(value, fallback) {
  const source = value ? `${value}T00:00:00` : fallback
  const date = new Date(source)
  return Number.isNaN(date.getTime()) ? new Date(fallback) : date
}

function formatDateOnly(date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, "0")
  const day = `${date.getDate()}`.padStart(2, "0")
  return `${year}-${month}-${day}`
}

function addDays(date, days) {
  return new Date(date.getTime() + days * DAY_IN_MS)
}

function enumerateDateRange(from, to) {
  const buckets = []
  let cursor = new Date(from)
  const end = new Date(to)

  while (cursor <= end && buckets.length < 120) {
    buckets.push(formatDateOnly(cursor))
    cursor = addDays(cursor, 1)
  }

  return buckets
}

function buildDemoSeries(params = {}) {
  const fallbackEnd = "2026-03-27T00:00:00"
  const toDate = parseDateOnly(params?.to, fallbackEnd)
  const fromDate = parseDateOnly(params?.from, addDays(toDate, -6).toISOString())
  const buckets = enumerateDateRange(fromDate, toDate)

  return buckets.map((bucketStart, index) => {
    const weekdayWeight = WEEKDAY_WEIGHTS[index % WEEKDAY_WEIGHTS.length]
    const trendWeight = 1 + (index / Math.max(1, buckets.length - 1)) * 0.24
    const promoWeight = index % 6 === 4 ? 1.12 : index % 6 === 5 ? 1.18 : 1
    const grossSales = Math.round(210000 * weekdayWeight * trendWeight * promoWeight)
    const netSales = Math.round(grossSales * 0.943)
    const orderCount = Math.max(5, Math.round(netSales / 26500))

    return {
      bucketStart,
      grossSales,
      netSales,
      orderCount,
    }
  })
}

function buildItemSummary(products = []) {
  return products.reduce(
    (summary, product) => {
      const status = String(product?.status ?? "").toUpperCase()

      if (status === "ON_SALE") summary.onSaleCount += 1
      if (status === "SOLD_OUT") summary.soldOutCount += 1
      if (status === "HIDDEN") summary.hiddenCount += 1

      return summary
    },
    { onSaleCount: 0, soldOutCount: 0, hiddenCount: 0 },
  )
}

function buildReviewSummary(products = []) {
  const reviewedProducts = products.filter((product) => Number(product?.reviewCount) > 0)
  const reviewCount = reviewedProducts.reduce(
    (total, product) => total + Number(product?.reviewCount ?? 0),
    0,
  )
  const weightedRating = reviewedProducts.reduce(
    (total, product) =>
      total + Number(product?.averageRating ?? 0) * Number(product?.reviewCount ?? 0),
    0,
  )

  return {
    reviewCount,
    reviewedItemCount: reviewedProducts.length,
    averageRating: reviewCount > 0 ? Number((weightedRating / reviewCount).toFixed(2)) : 0,
  }
}

function buildSalesSummary(series = []) {
  const grossSales = series.reduce((total, point) => total + Number(point.grossSales ?? 0), 0)
  const netSales = series.reduce((total, point) => total + Number(point.netSales ?? 0), 0)
  const orderCount = series.reduce((total, point) => total + Number(point.orderCount ?? 0), 0)
  const cancelCount = Math.max(2, Math.round(orderCount * 0.03))
  const refundCount = Math.max(1, Math.round(orderCount * 0.015))

  return {
    grossSales,
    netSales,
    orderCount,
    cancelCount,
    refundCount,
  }
}

function buildSearchSummary(orderCount, cancelCount, refundCount) {
  const searchCount = Math.max(420, Math.round(orderCount * 6.7))
  const clickCount = Math.max(orderCount + cancelCount + refundCount, Math.round(searchCount * 0.24))
  const ctr = searchCount > 0 ? clickCount / searchCount : 0

  return {
    searchCount,
    clickCount,
    ctr,
  }
}

function buildSalesFunnel(search, sales) {
  const createdCount = Math.max(
    sales.orderCount + sales.cancelCount + sales.refundCount,
    Math.round(search.clickCount * 0.72),
  )

  return {
    domainType: "NORMAL",
    entryCount: search.searchCount,
    conversionCount: sales.orderCount,
    conversionRate: search.searchCount > 0 ? sales.orderCount / search.searchCount : 0,
    steps: [
      { step: "SEARCH_EXECUTED", count: search.searchCount },
      { step: "SEARCH_ITEM_CLICKED", count: search.clickCount },
      { step: "ORDER_CREATED_EVENT", count: createdCount },
      { step: "ORDER_PAID_EVENT", count: sales.orderCount },
      { step: "ORDER_CANCELLED_EVENT", count: sales.cancelCount },
      { step: "ORDER_REFUNDED_EVENT", count: sales.refundCount },
    ],
  }
}

function buildFundingFunnel(campaigns = []) {
  const createdCount = Math.max(campaigns.length * 7, 0)
  const participatedCount = Math.max(campaigns.length, Math.round(createdCount * 0.64))
  const succeededCount = campaigns.filter(
    (campaign) => String(campaign?.status ?? "").toUpperCase() === "SUCCEEDED",
  ).length
  const failedCount = campaigns.filter(
    (campaign) => String(campaign?.status ?? "").toUpperCase() === "FAILED",
  ).length
  const conversionCount = Math.max(succeededCount, Math.round(participatedCount * 0.46))

  return {
    domainType: "FUNDING",
    entryCount: createdCount,
    conversionCount,
    conversionRate: createdCount > 0 ? conversionCount / createdCount : 0,
    steps: [
      { step: "FUNDING_CREATED", count: createdCount },
      { step: "FUNDING_PARTICIPATED", count: participatedCount },
      { step: "FUNDING_SUCCEEDED", count: conversionCount },
      { step: "FUNDING_FAILED", count: Math.max(failedCount, Math.round(createdCount * 0.12)) },
    ],
  }
}

function buildHotDealFunnel(hotDeals = []) {
  const entryCount = hotDeals.reduce(
    (total, deal) => total + Math.max(4, Math.round(Number(deal?.maxQuantity ?? 0) / 12)),
    0,
  )
  const purchaseCount = hotDeals.reduce(
    (total, deal) => total + Math.max(1, Math.round(Number(deal?.soldQuantity ?? 0) / 3)),
    0,
  )
  const endedCount = hotDeals.filter(
    (deal) => String(deal?.status ?? "").toUpperCase() === "ENDED",
  ).length

  return {
    domainType: "HOT_DEAL",
    entryCount,
    conversionCount: purchaseCount,
    conversionRate: entryCount > 0 ? purchaseCount / entryCount : 0,
    steps: [
      { step: "HOT_DEAL_STARTED", count: entryCount },
      { step: "HOT_DEAL_PURCHASED", count: purchaseCount },
      { step: "HOT_DEAL_ENDED", count: Math.max(endedCount, hotDeals.length > 0 ? 1 : 0) },
    ],
  }
}

function buildDemoDashboardOverview(params = {}) {
  const products = demoGetSellerProducts().items ?? []
  const campaigns = demoGetCampaigns().content ?? []
  const hotDeals = demoGetHotDeals() ?? []
  const series = buildDemoSeries(params)
  const sales = buildSalesSummary(series)
  const item = buildItemSummary(products)
  const review = buildReviewSummary(products)
  const search = buildSearchSummary(sales.orderCount, sales.cancelCount, sales.refundCount)

  return {
    mode: params?.mode ?? "RANGE",
    queryRange: {
      from: params?.from ?? series[0]?.bucketStart ?? "2026-03-21",
      to: params?.to ?? series[series.length - 1]?.bucketStart ?? "2026-03-27",
      bucket: params?.bucket ?? "DAY",
      timezone: params?.timezone ?? "Asia/Seoul",
    },
    asOf: `${params?.to ?? "2026-03-27"}T18:20:00+09:00`,
    lagStatus: "HEALTHY",
    partial: false,
    sales,
    item,
    search,
    series,
    apiVersion: "demo-v2",
    extensions: {
      review,
      funnel: {
        sales: buildSalesFunnel(search, sales),
        funding: buildFundingFunnel(campaigns),
        hotDeal: buildHotDealFunnel(hotDeals),
      },
    },
  }
}

export async function getSellerDashboardOverview(params = {}) {
  if (isDemoModeEnabled()) {
    return buildDemoDashboardOverview(params)
  }

  try {
    const response = await bffApiInstance.get("/bff/v1/seller/dashboard/overview", { params })
    return unwrapApiResponseBody(response, "판매 대시보드를 불러오지 못했습니다.")
  } catch (error) {
    throw normalizeApiError(error, "판매 대시보드 조회에 실패했습니다.")
  }
}
