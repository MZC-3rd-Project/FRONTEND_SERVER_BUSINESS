import {
  demoCampaigns,
  demoChatMessagesByRoomId,
  demoChatRooms,
  demoHotDeals,
  demoHotDealItems,
  demoItems,
  demoReviewsByItemId,
  demoStore,
} from "@/domains/management/mock/demoData.js"

const DEMO_MODE_KEY = "donmoa-business:demo-mode"
const DEMO_STATE_KEY = "donmoa-business:demo-state:v1"
const DEMO_STATE_VERSION = 2
const DEMO_USER_ID = 504

const DEMO_CATEGORIES = [
  {
    id: 1,
    name: "굿즈",
    children: [
      { id: 101, name: "의류", children: [] },
      { id: 102, name: "액세서리", children: [] },
      { id: 103, name: "문구", children: [] },
    ],
  },
  {
    id: 2,
    name: "공연/티켓",
    children: [
      { id: 201, name: "콘서트", children: [] },
      { id: 202, name: "팬미팅", children: [] },
      { id: 203, name: "전시", children: [] },
    ],
  },
]

function withSellerContext(items = []) {
  return items.map((item) => ({
    ...item,
    sellerId: DEMO_USER_ID,
    storeId: demoStore.id,
  }))
}

function buildDefaultState() {
  return {
    version: DEMO_STATE_VERSION,
    store: structuredClone(demoStore),
    products: withSellerContext(structuredClone(demoItems.concat(demoHotDealItems))),
    campaigns: structuredClone(demoCampaigns),
    hotDeals: structuredClone(demoHotDeals),
    reviewsByItemId: structuredClone(demoReviewsByItemId),
    chatRooms: structuredClone(demoChatRooms),
    chatMessagesByRoomId: structuredClone(demoChatMessagesByRoomId),
    categories: structuredClone(DEMO_CATEGORIES),
    counters: {
      store: 70001,
      item: 95000,
      campaign: 76000,
      hotDeal: 86000,
      message: 99020,
      room: 80010,
    },
  }
}

function hydrateLegacyState(state = {}) {
  const defaults = buildDefaultState()

  return {
    ...defaults,
    ...state,
    version: DEMO_STATE_VERSION,
    store: state?.store ?? defaults.store,
    products:
      Array.isArray(state?.products) && state.products.length > 0
        ? state.products
        : defaults.products,
    campaigns:
      Array.isArray(state?.campaigns) && state.campaigns.length > 0
        ? state.campaigns
        : defaults.campaigns,
    hotDeals:
      Array.isArray(state?.hotDeals) && state.hotDeals.length > 0
        ? state.hotDeals
        : defaults.hotDeals,
    reviewsByItemId:
      state?.reviewsByItemId && Object.keys(state.reviewsByItemId).length > 0
        ? state.reviewsByItemId
        : defaults.reviewsByItemId,
    chatRooms:
      Array.isArray(state?.chatRooms) && state.chatRooms.length > 0
        ? state.chatRooms
        : defaults.chatRooms,
    chatMessagesByRoomId:
      state?.chatMessagesByRoomId && Object.keys(state.chatMessagesByRoomId).length > 0
        ? state.chatMessagesByRoomId
        : defaults.chatMessagesByRoomId,
    categories:
      Array.isArray(state?.categories) && state.categories.length > 0
        ? state.categories
        : defaults.categories,
    counters: {
      ...defaults.counters,
      ...(state?.counters ?? {}),
    },
  }
}

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage)
}

function persistDemoFlag(value) {
  if (!canUseStorage()) return
  if (value) {
    window.localStorage.setItem(DEMO_MODE_KEY, "true")
  } else {
    window.localStorage.removeItem(DEMO_MODE_KEY)
  }
}

export function isDemoModeEnabled() {
  if (import.meta.env.VITE_DEMO_MODE === "true") {
    return true
  }

  if (typeof window === "undefined") {
    return false
  }

  const params = new URLSearchParams(window.location.search)
  if (params.get("demo") === "1") {
    persistDemoFlag(true)
    return true
  }
  if (params.get("demo") === "0") {
    persistDemoFlag(false)
    return false
  }

  return window.localStorage.getItem(DEMO_MODE_KEY) === "true"
}

function readState() {
  if (!canUseStorage()) return buildDefaultState()
  const raw = window.localStorage.getItem(DEMO_STATE_KEY)
  if (!raw) return buildDefaultState()

  try {
    const parsed = JSON.parse(raw)
    if (parsed?.version === DEMO_STATE_VERSION) {
      return parsed
    }

    const migrated = hydrateLegacyState(parsed)
    writeState(migrated)
    return migrated
  } catch {
    return buildDefaultState()
  }
}

function writeState(state) {
  if (!canUseStorage()) return
  window.localStorage.setItem(DEMO_STATE_KEY, JSON.stringify(state))
}

function updateState(updater) {
  const current = readState()
  const next = updater(current)
  writeState(next)
  return next
}

function nextId(state, key) {
  const current = state.counters[key] ?? 1
  state.counters[key] = current + 1
  return current
}

function normalizeCampaignItemIds(payload = {}) {
  return [...new Set(
    [
      ...(Array.isArray(payload?.itemIds) ? payload.itemIds : []),
      payload?.itemId,
      ...(
        Array.isArray(payload?.rewardOptions)
          ? payload.rewardOptions.flatMap((option) => [option?.itemId, ...(Array.isArray(option?.itemIds) ? option.itemIds : [])])
          : []
      ),
    ]
      .map((itemId) => Number(itemId))
      .filter((itemId) => Number.isFinite(itemId)),
  )]
}

function buildDemoRewardOptions(payload = {}, itemIds = []) {
  const sourceRewardOptions = Array.isArray(payload?.rewardOptions) ? payload.rewardOptions : []
  if (sourceRewardOptions.length > 0) {
    return sourceRewardOptions.map((option, index) => ({
      rewardOptionId: option?.rewardOptionId ?? option?.id ?? `${Date.now()}-${index}`,
      itemId: Number(option?.itemId ?? option?.itemIds?.[0] ?? itemIds[0] ?? payload?.itemId),
      itemIds: [Number(option?.itemId ?? option?.itemIds?.[0] ?? itemIds[0] ?? payload?.itemId)],
      title: option?.title ?? option?.label ?? `리워드 ${index + 1}`,
      description: option?.description ?? "",
      amount: Number(option?.amount ?? option?.price ?? 0),
      quantityLimit:
        option?.quantityLimit != null && option?.quantityLimit !== ""
          ? Number(option.quantityLimit)
          : null,
      sortOrder: option?.sortOrder ?? index,
    }))
  }

  return itemIds.map((itemId, index) => {
    const product = readState().products.find((candidate) => Number(candidate.id) === Number(itemId))
    return {
      rewardOptionId: `${Date.now()}-${index}`,
      itemId: Number(itemId),
      itemIds: [Number(itemId)],
      title: product?.title ?? `리워드 ${index + 1}`,
      description: "",
      amount: Number(product?.price ?? 0),
      quantityLimit: null,
      sortOrder: index,
    }
  })
}

function normalizeStoreResponse(store) {
  if (!store) return null
  return {
    ...store,
    store_name: store.storeName,
    addresses: store.addresses ?? [],
    contacts: store.contacts ?? [],
  }
}

export function demoGetMyStore() {
  return normalizeStoreResponse(readState().store)
}

export function demoCreateStore(payload) {
  const nextState = updateState((state) => {
    if (state.store) {
      throw new Error("이미 등록된 가게입니다.")
    }

    const storeId = nextId(state, "store")
    state.store = {
      id: storeId,
      userId: DEMO_USER_ID,
      storeName: payload.storeName,
      status: "ACTIVE",
      description: payload.description ?? "",
      addresses: [
        {
          id: storeId * 10 + 1,
          address_type: payload.addressType,
          address: payload.address,
          detail_address: "",
          is_default: true,
        },
      ],
      contacts: [
        {
          id: storeId * 10 + 2,
          contact_type: payload.contactType,
          contact_value: payload.contactValue,
          is_primary: true,
        },
      ],
    }
    return state
  })

  return normalizeStoreResponse(nextState.store)
}

export function demoGetCategories() {
  return readState().categories
}

export function demoGetSellerProducts() {
  return { items: readState().products }
}

function buildDefaultGoodsDetail(item) {
  const option = item?.options?.[0] ?? {
    id: `${item?.id}-opt-1`,
    optionName: "기본",
    additionalPrice: 0,
    stockQuantity: item?.stockQuantity ?? 50,
  }
  const shippingInfo = item?.shippingInfo ?? {
    shippingFee: 0,
    estimatedDays: 3,
  }

  return {
    id: item.id,
    title: item.title,
    description: item.description ?? "",
    price: item.price,
    status: item.status,
    itemType: "GOODS",
    averageRating: item.averageRating ?? 0,
    reviewCount: item.reviewCount ?? 0,
    categoryId: item.categoryId ?? 101,
    categoryName: "의류",
    sellerId: DEMO_USER_ID,
    storeId: item.storeId ?? 70001,
    options: [option],
    shippingInfo,
  }
}

function buildDefaultPerformanceDetail(item) {
  const seatGrade = item?.seatGrades?.[0] ?? {
    id: `${item?.id}-seat-1`,
    gradeName: "일반",
    price: item.price,
    totalQuantity: item.totalSeats ?? 300,
    fundingQuantity: 0,
  }

  return {
    id: item.id,
    title: item.title,
    description: item.description ?? "",
    price: item.price,
    status: item.status,
    itemType: "PERFORMANCE",
    averageRating: item.averageRating ?? 0,
    reviewCount: item.reviewCount ?? 0,
    categoryId: item.categoryId ?? 201,
    categoryName: "콘서트",
    sellerId: DEMO_USER_ID,
    storeId: item.storeId ?? 70001,
    venue: item.venue ?? "돈모아 홀",
    performanceDate: item.performanceDate ?? "2026-04-30",
    performanceTime: item.performanceTime ?? "19:00:00",
    totalSeats: item.totalSeats ?? 300,
    runningTimeMinutes: item.runningTimeMinutes ?? 110,
    ageLimit: item.ageLimit ?? "전체 관람가",
    venueAddress: item.venueAddress ?? "서울특별시 마포구",
    bookingNotice: item.bookingNotice ?? "공연 시작 후 입장이 제한될 수 있습니다.",
    organizer: item.organizer ?? "돈모아",
    host: item.host ?? "돈모아 라이브",
    seatGrades: [seatGrade],
  }
}

export function demoGetSellerGoodsDetail(itemId) {
  const item = demoGetSellerProducts().items.find(
    (product) => Number(product.id) === Number(itemId) && product.itemType === "GOODS"
  )
  return item ? buildDefaultGoodsDetail(item) : null
}

export function demoGetSellerPerformanceDetail(itemId) {
  const item = demoGetSellerProducts().items.find(
    (product) => Number(product.id) === Number(itemId) && product.itemType === "PERFORMANCE"
  )
  return item ? buildDefaultPerformanceDetail(item) : null
}

export function demoCreateGoods(payload) {
  const nextState = updateState((state) => {
    const itemId = nextId(state, "item")
    state.products.unshift({
      id: itemId,
      title: payload.title,
      price: Number(payload.price),
      itemType: "GOODS",
      status: "DRAFT",
      averageRating: 0,
      reviewCount: 0,
      sellerId: DEMO_USER_ID,
      storeId: Number(payload.storeId),
    })
    return state
  })

  return nextState.products[0]
}

export function demoCreatePerformance(payload) {
  const nextState = updateState((state) => {
    const itemId = nextId(state, "item")
    state.products.unshift({
      id: itemId,
      title: payload.title,
      price: Number(payload.price),
      itemType: "PERFORMANCE",
      status: "DRAFT",
      averageRating: 0,
      reviewCount: 0,
      sellerId: DEMO_USER_ID,
      storeId: Number(payload.storeId),
      venue: payload.venue,
      performanceDate: payload.performanceDate,
    })
    return state
  })

  return nextState.products[0]
}

export function demoToggleProductStatus(itemId, status) {
  const nextState = updateState((state) => {
    state.products = state.products.map((item) =>
      Number(item.id) === Number(itemId) ? { ...item, status } : item
    )
    return state
  })

  return nextState.products.find((item) => Number(item.id) === Number(itemId)) ?? null
}

export function demoDeleteProduct(itemId) {
  updateState((state) => {
    const normalizedItemId = Number(itemId)
    state.products = state.products.filter((item) => Number(item.id) !== Number(itemId))
    state.campaigns = state.campaigns.filter(
      (campaign) => !normalizeCampaignItemIds(campaign).includes(normalizedItemId),
    )
    state.hotDeals = state.hotDeals.filter((deal) => Number(deal.itemId) !== Number(itemId))
    delete state.reviewsByItemId[String(itemId)]
    return state
  })

  return { success: true }
}

export function demoUpdateGoods(itemId, payload) {
  const nextState = updateState((state) => {
    state.products = state.products.map((item) =>
      Number(item.id) === Number(itemId)
        ? {
            ...item,
            title: payload.title ?? item.title,
            description: payload.description ?? item.description,
            price: payload.price ?? item.price,
            categoryId: payload.categoryId ?? item.categoryId,
            options: payload.options ?? item.options,
            shippingInfo: payload.shippingInfo ?? item.shippingInfo,
          }
        : item
    )
    return state
  })

  return demoGetSellerGoodsDetail(itemId) ?? nextState.products.find((item) => Number(item.id) === Number(itemId)) ?? null
}

export function demoUpdatePerformance(itemId, payload) {
  const nextState = updateState((state) => {
    state.products = state.products.map((item) =>
      Number(item.id) === Number(itemId)
        ? {
            ...item,
            title: payload.title ?? item.title,
            description: payload.description ?? item.description,
            price: payload.price ?? item.price,
            categoryId: payload.categoryId ?? item.categoryId,
            venue: payload.venue ?? item.venue,
            performanceDate: payload.performanceDate ?? item.performanceDate,
            performanceTime: payload.performanceTime ?? item.performanceTime,
            totalSeats: payload.totalSeats ?? item.totalSeats,
            runningTimeMinutes: payload.runningTimeMinutes ?? item.runningTimeMinutes,
            ageLimit: payload.ageLimit ?? item.ageLimit,
            venueAddress: payload.venueAddress ?? item.venueAddress,
            bookingNotice: payload.bookingNotice ?? item.bookingNotice,
            organizer: payload.organizer ?? item.organizer,
            host: payload.host ?? item.host,
            seatGrades: payload.seatGrades ?? item.seatGrades,
          }
        : item
    )
    return state
  })

  return demoGetSellerPerformanceDetail(itemId) ?? nextState.products.find((item) => Number(item.id) === Number(itemId)) ?? null
}

export function demoGetCampaigns() {
  const state = readState()
  return {
    content: state.campaigns.length > 0 ? state.campaigns : structuredClone(demoCampaigns),
    nextCursor: null,
  }
}

export function demoCreateCampaign(payload) {
  const nextState = updateState((state) => {
    const campaignId = nextId(state, "campaign")
    const itemIds = normalizeCampaignItemIds(payload)
    const rewardOptions = buildDemoRewardOptions(payload, itemIds)
    state.campaigns.unshift({
      id: campaignId,
      itemId: Number(payload.itemId ?? itemIds[0]),
      itemIds,
      sellerId: DEMO_USER_ID,
      title: payload.title || "새 펀딩 캠페인",
      summary: payload.summary || "",
      makerName: payload.makerName || demoStore.storeName,
      category: payload.category || "",
      fundingType: payload.fundingType,
      goalAmount: payload.goalAmount ?? 0,
      currentAmount: 0,
      goalQuantity: payload.goalQuantity ?? null,
      currentQuantity: 0,
      minAmount: payload.minAmount ?? 0,
      status: "ACTIVE",
      startAt: payload.startAt,
      endAt: payload.endAt,
      rewardOptions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    state.products = state.products.map((item) =>
      itemIds.includes(Number(item.id)) ? { ...item, status: "FUNDING" } : item
    )
    return state
  })

  return nextState.campaigns[0]
}

export function demoCancelCampaign(campaignId) {
  const nextState = updateState((state) => {
    const target = state.campaigns.find((campaign) => Number(campaign.id) === Number(campaignId))
    if (target) {
      const campaignItemIds = normalizeCampaignItemIds(target)
      target.status = "CANCELLED"
      target.updatedAt = new Date().toISOString()
      state.products = state.products.map((item) =>
        campaignItemIds.includes(Number(item.id)) && item.status === "FUNDING"
          ? { ...item, status: "ON_SALE" }
          : item
      )
    }
    return state
  })

  return nextState.campaigns.find((campaign) => Number(campaign.id) === Number(campaignId)) ?? null
}

export function demoGetCampaignById(campaignId) {
  return demoGetCampaigns().content.find((campaign) => Number(campaign.id) === Number(campaignId)) ?? null
}

export function demoUpdateCampaign(campaignId, payload) {
  const nextState = updateState((state) => {
    const previous = state.campaigns.find((campaign) => Number(campaign.id) === Number(campaignId))
    const previousItemIds = previous ? normalizeCampaignItemIds(previous) : []
    const nextItemIds = normalizeCampaignItemIds({ ...previous, ...payload })
    const nextRewardOptions = buildDemoRewardOptions({ ...previous, ...payload }, nextItemIds)

    state.campaigns = state.campaigns.map((campaign) =>
      Number(campaign.id) === Number(campaignId)
        ? {
            ...campaign,
            ...payload,
            itemId: Number(payload?.itemId ?? nextItemIds[0] ?? campaign.itemId),
            itemIds: nextItemIds,
            rewardOptions: nextRewardOptions,
            updatedAt: new Date().toISOString(),
          }
        : campaign
    )
    state.products = state.products.map((item) => {
      const itemId = Number(item.id)
      if (previousItemIds.includes(itemId) && !nextItemIds.includes(itemId) && item.status === "FUNDING") {
        return { ...item, status: "ON_SALE" }
      }
      if (nextItemIds.includes(itemId)) {
        return { ...item, status: "FUNDING" }
      }
      return item
    })
    return state
  })

  return nextState.campaigns.find((campaign) => Number(campaign.id) === Number(campaignId)) ?? null
}

export function demoGetCampaignByItemId(itemId) {
  return (
    demoGetCampaigns().content.find((campaign) =>
      normalizeCampaignItemIds(campaign).includes(Number(itemId)),
    ) ?? null
  )
}

export function demoGetCampaignProgress(campaignId) {
  const campaign = demoGetCampaignById(campaignId)
  if (!campaign) return null

  if (campaign.fundingType === "QUANTITY_BASED") {
    return {
      currentQuantity: campaign.currentQuantity ?? 0,
      goalQuantity: campaign.goalQuantity ?? 0,
      progressRate:
        campaign.goalQuantity && campaign.goalQuantity > 0
          ? Math.round(((campaign.currentQuantity ?? 0) / campaign.goalQuantity) * 100)
          : 0,
    }
  }

  return {
    currentAmount: campaign.currentAmount ?? 0,
    goalAmount: campaign.goalAmount ?? 0,
    progressRate:
      campaign.goalAmount && campaign.goalAmount > 0
        ? Math.round(((campaign.currentAmount ?? 0) / campaign.goalAmount) * 100)
        : 0,
  }
}

export function demoCreateHotDeal(payload) {
  const nextState = updateState((state) => {
    const item = state.products.find((product) => Number(product.id) === Number(payload.itemId))
    const hotDealId = nextId(state, "hotDeal")
    state.hotDeals.unshift({
      id: hotDealId,
      itemId: Number(payload.itemId),
      title: item?.title ?? "새 핫딜",
      discountRate: Number(payload.discountRate),
      discountedPrice: item?.price
        ? Math.floor((Number(item.price) * (100 - Number(payload.discountRate))) / 100)
        : 0,
      soldQuantity: 0,
      maxQuantity: Number(payload.maxQuantity),
      endAt: payload.endAt ?? null,
    })
    state.products = state.products.map((product) =>
      Number(product.id) === Number(payload.itemId)
        ? { ...product, status: "HOT_DEAL" }
        : product
    )
    return state
  })

  return nextState.hotDeals[0]
}

export function demoGetHotDeals() {
  const state = readState()
  return state.hotDeals
}

export function demoGetHotDealById(hotDealId) {
  return readState().hotDeals.find((deal) => Number(deal.id) === Number(hotDealId)) ?? null
}

export function demoGetItemReviews(itemId) {
  const reviews = readState().reviewsByItemId[String(itemId)] ?? []
  return {
    content: reviews,
    totalElements: reviews.length,
    totalPages: 1,
    size: reviews.length,
    number: 0,
  }
}

export function demoFetchMyChatRooms() {
  return {
    items: readState().chatRooms,
    nextCursor: null,
    hasNext: false,
  }
}

export function demoFetchChatMessages(roomId) {
  return {
    items: readState().chatMessagesByRoomId[String(roomId)] ?? [],
    nextCursor: null,
    hasNext: false,
  }
}

export function demoSendChatRoomMessage(roomId, payload) {
  const nextState = updateState((state) => {
    const messageId = nextId(state, "message")
    const roomKey = String(roomId)
    const nextMessage = {
      messageId: String(messageId),
      senderId: String(DEMO_USER_ID),
      messageType: payload.messageType,
      content: payload.content,
      createdAt: new Date().toISOString(),
    }

    const existing = state.chatMessagesByRoomId[roomKey] ?? []
    state.chatMessagesByRoomId[roomKey] = [...existing, nextMessage]
    state.chatRooms = state.chatRooms.map((room) =>
      String(room.roomId) === roomKey
        ? {
            ...room,
            updatedAt: nextMessage.createdAt,
            unreadCount: 0,
            lastMessage: {
              messageId: nextMessage.messageId,
              content: nextMessage.content,
              createdAt: nextMessage.createdAt,
            },
          }
        : room
    )
    return state
  })

  const roomMessages = nextState.chatMessagesByRoomId[String(roomId)] ?? []
  return roomMessages[roomMessages.length - 1] ?? null
}

export function demoUpdateChatReadPointer(roomId, lastReadMessageId) {
  updateState((state) => {
    state.chatRooms = state.chatRooms.map((room) =>
      String(room.roomId) === String(roomId)
        ? { ...room, lastReadMessageId: String(lastReadMessageId), unreadCount: 0 }
        : room
    )
    return state
  })

  return {
    roomId: String(roomId),
    lastReadMessageId: String(lastReadMessageId),
  }
}
