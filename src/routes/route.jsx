import { Routes, Route, Navigate } from "react-router";
import BusinessLayout from "@/components/layout/BusinessLayout.jsx";
import StoreCreatePage from "@/domains/business/store/page/StoreCreate.jsx";
import ItemsPage from "@/domains/business/items/page/Items.jsx";
import FundingPage from "@/domains/business/funding/page/Funding.jsx";
import HotDealPage from "@/domains/business/hotdeal/page/HotDeal.jsx";
import AnalyticsPage from "@/domains/business/analytics/page/Analytics.jsx";
import GatewayPage from "@/domains/business/gateway/page/Gateway.jsx";

function BusinessRoutes() {
  return (
    <BusinessLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/business/store" replace />} />
        <Route path="/business/store" element={<StoreCreatePage />} />
        <Route path="/business/items" element={<ItemsPage />} />
        <Route path="/business/funding" element={<FundingPage />} />
        <Route path="/business/hotdeal" element={<HotDealPage />} />
        <Route path="/business/analytics" element={<AnalyticsPage />} />
        <Route path="/business/gateway" element={<GatewayPage />} />
      </Routes>
    </BusinessLayout>
  );
}

export default BusinessRoutes;
