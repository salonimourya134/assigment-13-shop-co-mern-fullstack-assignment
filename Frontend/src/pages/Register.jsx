import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import "./Login.scss";

const Register = () => {
    const [formData, setFormData] = useState({ name: "", email: "", password: "" });
    const [message, setMessage] = useState({ text: "", type: "" });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: "", type: "" });

        const name = formData.name.trim();
        const email = formData.email.trim();

        if (!name || !email || !formData.password) {
            setMessage({ text: "Please fill all fields.", type: "error" });
            return;
        }

        if (!/^\S+@\S+\.\S+$/.test(email)) {
            setMessage({ text: "Please enter a valid email address.", type: "error" });
            return;
        }

        if (formData.password.length < 6) {
            setMessage({ text: "Password must be at least 6 characters long.", type: "error" });
            return;
        }

        try {
            setLoading(true);
            const { data } = await API.post("/api/auth/signup", {
                name,
                email,
                password: formData.password,
            });

            if (data?.success) {
                setMessage({ text: "Account created successfully! Redirecting...", type: "success" });
                setTimeout(() => navigate("/login"), 900);
            }
        } catch (error) {
            setMessage({
                text: error.response?.data?.message || "Registration failed. Please try again.",
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
                    <h1 className="login__title">CREATE ACCOUNT</h1>
                    <p className="login__subtitle">Join us and start shopping</p>

                    <form noValidate className="login__form" onSubmit={handleSubmit}>
                        <div className="login__field">
                            <label htmlFor="reg-name">Name</label>
                            <input id="reg-name" name="name" type="text" className="login__input" placeholder="Enter your name" value={formData.name} onChange={handleChange} />
                        </div>

                        <div className="login__field">
                            <label htmlFor="reg-email">Email</label>
                            <input id="reg-email" name="email" type="email" className="login__input" placeholder="Enter your email" value={formData.email} onChange={handleChange} />
                        </div>

                        <div className="login__field">
                            <label htmlFor="reg-password">Password</label>
                            <input id="reg-password" name="password" type="password" className="login__input" placeholder="Create a password" value={formData.password} onChange={handleChange} />
                        </div>

                        {message.text && <p className={`login__message login__message--${message.type}`}>{message.text}</p>}

                        <button type="submit" className="login__button" disabled={loading}>
                            {loading ? "Creating Account..." : "Sign Up"}
                        </button>
                    </form>

                    <div className="login__footer">
                        <span className="element-span">Already have an account?</span>
                        <Link to="/login">Login</Link>
                    </div>
                </div>
        </main>
    );
};

export default Register;
