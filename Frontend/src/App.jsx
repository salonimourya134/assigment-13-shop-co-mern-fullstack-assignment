import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/auth";
import { ProductProvider } from "./context/product";
import { ToastProvider } from "./context/toast";
import "./components/Toast/Toast.scss";
import { AppRoutes } from "./routes/AppRoutes";

const App = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <ProductProvider>
                    <ToastProvider>
                        <AppRoutes />
                    </ToastProvider>
                </ProductProvider>
            </AuthProvider>
        </BrowserRouter>
    );
};

export default App;
