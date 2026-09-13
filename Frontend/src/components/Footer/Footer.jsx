import { useState } from "react";
import emailjs from "@emailjs/browser";
import { Link } from "react-router-dom";
import "./Footer.scss";

import twitterIcon from "../../assets/icons/social-icons/logo-twitter 2.svg";
import facebookIcon from "../../assets/icons/social-icons/Group.svg";
import instagramIcon from "../../assets/icons/social-icons/logo-instagram 1.svg";
import githubIcon from "../../assets/icons/social-icons/Group (1).svg";

import visaIcon from "../../assets/icons/social-icons/paymenticons/Visa.svg";
import mastercardIcon from "../../assets/icons/social-icons/paymenticons/Mastercard.svg";
import paypalIcon from "../../assets/icons/social-icons/paymenticons/Paypal.svg";
import applePayIcon from "../../assets/icons/social-icons/paymenticons/Apple-Pay.svg";
import gPayIcon from "../../assets/icons/social-icons/paymenticons/G Pay.svg";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [newsletterError, setNewsletterError] = useState("");
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const handleSubscribe = async (e) => {
    e.preventDefault();

    const value = email.trim();

    setNewsletterError("");
    setSubscribed(false);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setNewsletterError("Please enter a valid email address.");
      return;
    }

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      setNewsletterError("Newsletter service is not configured.");
      return;
    }
    try {
      setNewsletterLoading(true);

      await emailjs.send(
        serviceId,
        templateId,
        {
          subscriber_email: value,
        },
        {
          publicKey,
        },
      );
      setSubscribed(true);
      setEmail("");
    } catch (error) {
      console.error("Newsletter subscription failed:", error);
      setNewsletterError("Subscription failed. Please try again.");
    } finally {
      setNewsletterLoading(false);
    }
  };

  return (
    <footer className="footer">
      <section className="newsletter">
        <div className="newsletter__content">
          <h2 className="newsletter__heading">
            STAY UPTO DATE ABOUT
            <span className="newsletter__break" />
            OUR LATEST OFFERS
          </h2>

          <form
            noValidate
            className="newsletter__form"
            onSubmit={handleSubscribe}
          >
            <div className="newsletter__input">
              <span className="newsletter__icon">✉</span>
              <input
                type="email"
                className="newsletter__input-field"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="newsletter__button"
              disabled={newsletterLoading}
            >
              {newsletterLoading ? "Subscribing..." : "Subscribe to Newsletter"}
            </button>
            {subscribed && (
              <span className="newsletter__msg">
                ✓ Thank you for subscribing!
              </span>
            )}
            {newsletterError && (
              <span className="newsletter__msg">{newsletterError}</span>
            )}
          </form>
        </div>
      </section>

      <div className="footer__main">
        <div className="footer__brand">
          <h2 className="footer__logo">SHOP.CO</h2>
          <p className="footer__description">
            We have clothes that suits your style and which you're proud to
            wear. From women to men.
          </p>
          <div className="footer__socials">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="footer__social"
              aria-label="Twitter"
            >
              <img
                className="footer__social-icon"
                src={twitterIcon}
                alt="twitter-icon"
              />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="footer__social footer__social--facebook"
              aria-label="Facebook"
            >
              <img
                className="footer__social-icon"
                src={facebookIcon}
                alt="facebook-icon"
              />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="footer__social"
              aria-label="Instagram"
            >
              <img
                className="footer__social-icon"
                src={instagramIcon}
                alt="insta-icon"
              />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="footer__social"
              aria-label="GitHub"
            >
              <img
                className="footer__social-icon"
                src={githubIcon}
                alt="github-icon"
              />
            </a>
          </div>
        </div>

        <div className="footer__column">
          <h3 className="footer__title">COMPANY</h3>
          <Link to="/products" className="footer__link">
            About
          </Link>
          <Link to="/products" className="footer__link">
            Features
          </Link>
          <Link to="/products" className="footer__link">
            Works
          </Link>
          <Link to="/products" className="footer__link">
            Career
          </Link>
        </div>

        <div className="footer__column">
          <h3 className="footer__title">HELP</h3>
          <Link to="/profile" className="footer__link">
            Customer Support
          </Link>
          <Link to="/orders" className="footer__link">
            Delivery Details
          </Link>
          <Link to="/products" className="footer__link">
            Terms &amp; Conditions
          </Link>
          <Link to="/products" className="footer__link">
            Privacy Policy
          </Link>
        </div>

        <div className="footer__column">
          <h3 className="footer__title">FAQ</h3>
          <Link to="/profile" className="footer__link">
            Account
          </Link>
          <Link to="/orders" className="footer__link">
            Manage Deliveries
          </Link>
          <Link to="/orders" className="footer__link">
            Orders
          </Link>
          <Link to="/cart" className="footer__link">
            Payments
          </Link>
        </div>

        <div className="footer__column">
          <h3 className="footer__title">RESOURCES</h3>
          <Link to="/products" className="footer__link">
            Free eBooks
          </Link>
          <Link to="/products" className="footer__link">
            Development Tutorial
          </Link>
          <Link to="/products" className="footer__link">
            How to - Blog
          </Link>
          <Link to="/products" className="footer__link">
            YouTube Playlist
          </Link>
        </div>
      </div>

      <div className="footer__bottom">
        <p className="footer__copyright">
          Shop.co © 2000-2023, All Rights Reserved
        </p>
        <div className="footer__payments">
          <span className="footer__payment">
            <img className="footer__payment-icon" src={visaIcon} alt="Visa" />
          </span>
          <span className="footer__payment">
            <img
              className="footer__payment-icon"
              src={mastercardIcon}
              alt="Mastercard"
            />
          </span>
          <span className="footer__payment">
            <img
              className="footer__payment-icon"
              src={paypalIcon}
              alt="Paypal"
            />
          </span>
          <span className="footer__payment">
            <img
              className="footer__payment-icon"
              src={applePayIcon}
              alt="Apple Pay"
            />
          </span>
          <span className="footer__payment">
            <img
              className="footer__payment-icon"
              src={gPayIcon}
              alt="Google Pay"
            />
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
