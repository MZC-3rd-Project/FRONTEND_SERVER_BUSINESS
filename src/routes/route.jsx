import { Routes, Route, Navigate } from "react-router";
import BusinessLayout from "@/components/layout/BusinessLayout.jsx";
import StoreCreatePage from "@/domains/store/page/StoreCreate.jsx";
import ItemsPage from "@/domains/items/page/Items.jsx";
import ItemDetailPage from "@/domains/items/page/ItemDetail.jsx";
import FundingPage from "@/domains/funding/page/Funding.jsx";
import FundingDetailPage from "@/domains/funding/page/FundingDetail.jsx";
import HotDealPage from "@/domains/hotdeal/page/HotDeal.jsx";
import HotDealDetailPage from "@/domains/hotdeal/page/HotDealDetail.jsx";
import AnalyticsPage from "@/domains/analytics/page/Analytics.jsx";
import GatewayPage from "@/domains/gateway/page/Gateway.jsx";
import LoginPage from "@/domains/auth/page/LoginPage.jsx";
import RegisterPage from "@/domains/auth/page/RegisterPage.jsx";
import { useMyStoreQuery } from "@/domains/items/hook/useItemsQuery.js";
import ReviewsPage from "@/domains/reviews/page/Reviews.jsx";
import ChatInboxPage from "@/domains/chat/page/ChatInbox.jsx";

function BusinessEntryRedirect() {
  const { data: myStore, isLoading } = useMyStoreQuery();

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-[40vh] max-w-3xl items-center justify-center">
        <div className="glass-panel rounded-[1.75rem] px-6 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            돈모아 워크스페이스를 확인하는 중입니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Navigate
      to={myStore ? "/business/dashboard" : "/business/store"}
      replace
    />
  );
}

function BusinessRoutes() {
  return (
    <BusinessLayout>
      <Routes>
        <Route path="/" element={<BusinessEntryRedirect />} />
        <Route path="/business" element={<BusinessEntryRedirect />} />
        <Route path="/auth/login" element={<LoginPage/>}></Route>
        <Route path="/auth/register" element={<RegisterPage/>}></Route>
        <Route path="/business/dashboard" element={<AnalyticsPage />} />
        <Route path="/business/store" element={<StoreCreatePage />} />
        <Route path="/business/items" element={<ItemsPage />} />
        <Route path="/business/items/:itemId" element={<ItemDetailPage />} />
        <Route path="/business/funding" element={<FundingPage />} />
        <Route path="/business/funding/:campaignId" element={<FundingDetailPage />} />
        <Route path="/business/hotdeal" element={<HotDealPage />} />
        <Route path="/business/hotdeal/:hotDealId" element={<HotDealDetailPage />} />
        <Route path="/business/reviews" element={<ReviewsPage />} />
        <Route path="/business/messages" element={<ChatInboxPage />} />
        <Route path="/business/analytics" element={<Navigate to="/business/dashboard" replace />} />
        <Route path="/business/gateway" element={<GatewayPage />} />
      </Routes>
    </BusinessLayout>
  );
}

export default BusinessRoutes;
