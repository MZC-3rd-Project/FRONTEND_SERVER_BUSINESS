import { Routes, Route, Navigate } from "react-router";
import BusinessLayout from "@/components/layout/BusinessLayout.jsx";
import StoreCreatePage from "@/domains/store/page/StoreCreate.jsx";
import ItemsPage from "@/domains/items/page/Items.jsx";
import FundingPage from "@/domains/funding/page/Funding.jsx";
import HotDealPage from "@/domains/hotdeal/page/HotDeal.jsx";
import AnalyticsPage from "@/domains/analytics/page/Analytics.jsx";
import GatewayPage from "@/domains/gateway/page/Gateway.jsx";
import LoginPage from "@/domains/auth/page/LoginPage.jsx";
import RegisterPage from "@/domains/auth/page/RegisterPage.jsx";

function BusinessRoutes() {
  return (
    <BusinessLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/business/store" replace />} />
        <Route path="/auth/login" element={<LoginPage/>}></Route>
        <Route path="/auth/register" element={<RegisterPage/>}></Route>
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
