import { createContext, useCallback, useContext, useState } from "react";
const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState(null);

    const showToast = useCallback((message, type = "success") => {
        setToast({ message, type });
        window.clearTimeout(showToast.timer);
        showToast.timer = window.setTimeout(() => setToast(null), 2600);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toast && (
                <div className={`toast toast--${toast.type}`} role="status">
                    <span className="toast__icon">{toast.type === "success" ? "✓" : "!"}</span>
                    <span className="toast__text">{toast.message}</span>
                </div>
            )}
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);
