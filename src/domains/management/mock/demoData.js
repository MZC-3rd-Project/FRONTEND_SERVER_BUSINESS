export const demoItems = [
  {
    id: 91001,
    title: "돈모아 시그니처 티셔츠",
    itemType: "GOODS",
    status: "ON_SALE",
    price: 32000,
    averageRating: 4.8,
    reviewCount: 124,
  },
  {
    id: 91002,
    title: "돈모아 아크릴 키링 세트",
    itemType: "GOODS",
    status: "HIDDEN",
    price: 18000,
    averageRating: 4.6,
    reviewCount: 48,
  },
  {
    id: 92001,
    title: "돈모아 라이브 쇼케이스",
    itemType: "PERFORMANCE",
    status: "ON_SALE",
    price: 77000,
    averageRating: 4.9,
    reviewCount: 312,
  },
]

export const demoCampaigns = [
  {
    id: 71001,
    itemId: 91001,
    title: "시그니처 티셔츠 1차 펀딩",
    fundingType: "AMOUNT_BASED",
    goalAmount: 5000000,
    currentAmount: 3580000,
    goalQuantity: null,
    currentQuantity: null,
    status: "ACTIVE",
    startAt: "2026-03-01T10:00:00",
    endAt: "2026-03-31T23:59:00",
    makerName: "돈모아 스튜디오",
    summary: "첫 제작 물량 확보를 위한 시그니처 굿즈 펀딩 예시 데이터입니다.",
  },
  {
    id: 71002,
    itemId: 92001,
    title: "쇼케이스 좌석 선오픈",
    fundingType: "QUANTITY_BASED",
    goalAmount: null,
    currentAmount: null,
    goalQuantity: 400,
    currentQuantity: 286,
    status: "SUCCEEDED",
    startAt: "2026-02-10T10:00:00",
    endAt: "2026-02-20T23:59:00",
    makerName: "돈모아 공연팀",
    summary: "공연형 상품의 수량 기반 펀딩 예시 데이터입니다.",
  },
]

export const demoHotDealItems = [
  {
    hotDealId: 86001,
    id: 93001,
    title: "돈모아 봄 한정 포토팩",
    itemType: "GOODS",
    status: "HOT_DEAL",
    price: 12000,
    averageRating: 4.7,
    reviewCount: 92,
  },
  {
    hotDealId: 86002,
    id: 93002,
    title: "돈모아 쇼케이스 얼리버드",
    itemType: "PERFORMANCE",
    status: "HOT_DEAL",
    price: 55000,
    averageRating: 4.9,
    reviewCount: 141,
  },
]

export const demoReviewsByItemId = {
  "91001": [
    {
      id: 50001,
      userId: 2101,
      rating: 5,
      title: "원단 퀄리티가 좋아요",
      content: "핏이 깔끔하고 두께감이 적당해서 만족스럽습니다.",
      createdAt: "2026-03-12T14:20:00",
    },
    {
      id: 50002,
      userId: 2102,
      rating: 4,
      title: "배송 빠름",
      content: "생각보다 빨리 도착했고 프린팅 상태도 괜찮았습니다.",
      createdAt: "2026-03-10T18:05:00",
    },
  ],
  "92001": [
    {
      id: 50003,
      userId: 3101,
      rating: 5,
      title: "현장 몰입감 최고",
      content: "좌석 안내와 입장 동선이 좋아서 공연 보기 편했습니다.",
      createdAt: "2026-03-08T19:40:00",
    },
    {
      id: 50004,
      userId: 3102,
      rating: 5,
      title: "재관람 의사 있어요",
      content: "MD 구성도 좋고 현장 운영이 안정적이었습니다.",
      createdAt: "2026-03-05T11:00:00",
    },
  ],
}

export const demoChatRooms = [
  {
    roomId: "80001",
    roomType: "INQUIRY_1TO1",
    status: "ACTIVE",
    itemId: "91001",
    title: "돈모아 시그니처 티셔츠 문의",
    storeId: "70001",
    storeName: "돈모아",
    buyerDisplayName: "고객 A",
    unreadCount: 2,
    updatedAt: "2026-03-21T13:12:00",
    lastMessage: {
      messageId: "99003",
      content: "사이즈 재입고 예정 있나요?",
      createdAt: "2026-03-21T13:12:00",
    },
  },
  {
    roomId: "80002",
    roomType: "INQUIRY_1TO1",
    status: "ACTIVE",
    itemId: "92001",
    title: "돈모아 라이브 쇼케이스 문의",
    storeId: "70001",
    storeName: "돈모아",
    buyerDisplayName: "고객 B",
    unreadCount: 0,
    updatedAt: "2026-03-20T09:48:00",
    lastMessage: {
      messageId: "99006",
      content: "공연 시작 30분 전 입장 가능합니다.",
      createdAt: "2026-03-20T09:48:00",
    },
  },
]

export const demoChatMessagesByRoomId = {
  "80001": [
    {
      messageId: "99001",
      senderId: "4101",
      messageType: "CHAT",
      content: "안녕하세요. 티셔츠 M 사이즈 품절인가요?",
      createdAt: "2026-03-21T12:40:00",
    },
    {
      messageId: "99002",
      senderId: "504",
      messageType: "CHAT",
      content: "현재 M 사이즈는 품절이고 다음 주 재입고 예정입니다.",
      createdAt: "2026-03-21T12:52:00",
    },
    {
      messageId: "99003",
      senderId: "4101",
      messageType: "CHAT",
      content: "사이즈 재입고 예정 있나요?",
      createdAt: "2026-03-21T13:12:00",
    },
  ],
  "80002": [
    {
      messageId: "99004",
      senderId: "4202",
      messageType: "CHAT",
      content: "쇼케이스 입장은 언제부터 가능한가요?",
      createdAt: "2026-03-20T09:21:00",
    },
    {
      messageId: "99005",
      senderId: "504",
      messageType: "CHAT",
      content: "공연 시작 30분 전부터 입장 가능합니다.",
      createdAt: "2026-03-20T09:48:00",
    },
  ],
}
