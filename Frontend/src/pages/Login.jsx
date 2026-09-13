import  { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth";
import { useToast } from "../context/toast";
import API from "../services/api";
import "./Login.scss";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(true);
    const [message, setMessage] = useState({ text: "", type: "" });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: "", type: "" });
        if (!email.trim() || !password) {
            setMessage({ text: "Please enter both email and password.", type: "error" });
            return;
        }

        try {
            setLoading(true);
            const { data } = await API.post("/api/auth/login", {
                email: email.trim(),
                password,
            });

            if (!data?.success) {
                throw new Error(data?.message || "Login failed");
            }

            login(data.user, data.token);
            showToast("Login successful");

            const from = location.state?.from?.pathname || location.state?.from || "";
            const destination = data.user?.role === "admin" ? "/admin/dashboard" : from || "/";
            setTimeout(() => navigate(destination, { replace: true }), 400);
        } catch (error) {
            setMessage({
                text: error.response?.data?.message || error.message || "Invalid email or password.",
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="login">
                <div className="login__box">
                    <div className="login__logo">SHOP.CO</div>
                    <h1 className="login__title">Welcome Back</h1>
                    <p className="login__subtitle">Login to your account</p>

                    <form noValidate className="login__form" onSubmit={handleSubmit}>
                        <div className="login__field">
                            <label htmlFor="login-email">Email</label>
                            <input id="login-email" type="email" className="login__input" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>

                        <div className="login__field">
                            <label htmlFor="login-password">Password</label>
                            <input id="login-password" type="password" className="login__input" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>

                        <div className="login__options">
                            <label className="login__remember">
                                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                                <span className="element-span">Remember me</span>
                            </label>
                            <button type="button" className="login__forgot">Forgot password?</button>
                        </div>

                        {message.text && <p className={`login__message login__message--${message.type}`}>{message.text}</p>}

                        <button type="submit" className="login__button" disabled={loading}>
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </form>

                    <div className="login__footer">
                        <span className="element-span">Don't have an account?</span>
                        <Link to="/register">Sign Up</Link>
                    </div>
                </div>
        </main>
    );
};

export default Login;
