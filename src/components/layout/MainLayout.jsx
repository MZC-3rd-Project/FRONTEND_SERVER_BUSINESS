import {Outlet} from "react-router";
import Header from "@/components/layout/Header.jsx";

function MainLayout() {
    return (
        <>
            <div className="min-h-screen pt-25 pb-50 px-4 sm:px-8 md:px-30">
                <Header />
                <div className="max-w-9xl mx-auto">
                    <Outlet/>
                </div>
            </div>
        </>
    )
}

export default MainLayout;