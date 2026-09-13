import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";

const MainLayoutCommon = () => {
    return (
        <div className="site-layout">
            <Header />
            <div className="site-main">
                <Outlet />
            </div>
            <Footer />
        </div>
    );
};

export default MainLayoutCommon;
