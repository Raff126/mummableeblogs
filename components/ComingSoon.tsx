'use client';

import { useState } from 'react';

export default function ComingSoon() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) return;

    setSubmitting(true);
    setMessage('');

    try {
      const res = await fetch('/api/subscribers/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, source: 'Coming Soon Page' }),
      });
      const data = await res.json();
      setMessage(data.message || 'Thank you for subscribing, look out for our exciting updates in your inbox soon');
      if (data.success) {
        setEmail('');
      }
    } catch (err) {
      setMessage('Thank you for subscribing, look out for our exciting updates in your inbox soon');
      setEmail('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cs-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Inter:wght@300;400;500;600&display=swap');

        .cs-root {
          background-color: #FBF4F5;
          color: #332D2F;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 40px 24px 30px 24px;
          position: relative;
          overflow-x: hidden;
          text-align: center;
          box-sizing: border-box;
        }

        .cs-glow-top-right {
          position: absolute;
          top: -120px;
          right: -100px;
          width: 550px;
          height: 550px;
          background: radial-gradient(circle, rgba(235, 175, 189, 0.28) 0%, rgba(251, 244, 245, 0) 70%);
          border-radius: 50%;
          pointer-events: none;
          filter: blur(40px);
        }

        .cs-glow-bottom-left {
          position: absolute;
          bottom: -120px;
          left: -120px;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(240, 190, 202, 0.25) 0%, rgba(251, 244, 245, 0) 70%);
          border-radius: 50%;
          pointer-events: none;
          filter: blur(40px);
        }

        .cs-main-container {
          max-width: 680px;
          width: 100%;
          margin: auto 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 10;
        }

        .cs-logo-badge {
          width: 86px !important;
          height: 86px !important;
          max-width: 86px !important;
          max-height: 86px !important;
          min-width: 86px !important;
          min-height: 86px !important;
          border-radius: 50%;
          padding: 4px;
          background: #FFFFFF;
          box-shadow: 0 8px 24px rgba(183, 91, 112, 0.15);
          border: 1px solid rgba(223, 42, 100, 0.15);
          margin: 0 auto 24px auto;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          box-sizing: border-box;
        }

        .cs-logo-badge img {
          width: 100% !important;
          height: 100% !important;
          max-width: 100% !important;
          max-height: 100% !important;
          object-fit: cover;
          border-radius: 50%;
          display: block;
        }

        .cs-brand-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 42px;
          font-weight: 500;
          color: #9E4A5C;
          letter-spacing: 0.02em;
          line-height: 1.1;
          margin-bottom: 16px;
        }

        .cs-coming-soon-pill {
          display: inline-block;
          font-size: 9.5px;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #B75B70;
          background: #F4E2E6;
          padding: 6px 18px;
          border-radius: 50px;
          margin-bottom: 32px;
          border: 1px solid rgba(183, 91, 112, 0.15);
        }

        .cs-tagline {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 34px;
          font-style: italic;
          font-weight: 400;
          color: #5C4B4F;
          line-height: 1.25;
          margin-bottom: 18px;
        }

        .cs-description {
          font-size: 13.5px;
          line-height: 1.65;
          color: #7E7073;
          max-width: 440px;
          margin: 0 auto 30px auto;
          font-weight: 400;
        }

        .cs-newsletter-box {
          width: 100%;
          max-width: 440px;
          margin: 0 auto 32px auto;
        }

        .cs-newsletter-form {
          display: flex;
          background: #FFFFFF;
          border: 1px solid rgba(183, 91, 112, 0.25);
          border-radius: 50px;
          padding: 4px;
          box-shadow: 0 4px 16px rgba(183, 91, 112, 0.08);
          gap: 6px;
        }

        .cs-newsletter-input {
          flex: 1;
          border: none;
          background: transparent;
          padding: 10px 18px;
          font-size: 13px;
          color: #332D2F;
          font-family: inherit;
          outline: none;
        }

        .cs-newsletter-btn {
          background: #DF2A64;
          color: #FFFFFF;
          border: none;
          padding: 10px 22px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .cs-newsletter-btn:hover {
          background: #B75B70;
        }

        .cs-newsletter-msg {
          font-size: 12px;
          color: #8C4052;
          background: #F4E2E6;
          border: 1px solid rgba(183, 91, 112, 0.2);
          border-radius: 20px;
          padding: 10px 16px;
          margin-top: 10px;
        }

        .cs-divider {
          width: 46px;
          height: 1.5px;
          background: #E8BFC9;
          margin: 0 auto 30px auto;
          border-radius: 2px;
        }

        .cs-social-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
        }

        .cs-social-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #F3DEE3;
          color: #8C4052;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          transition: all 0.25s ease;
        }

        .cs-social-btn:hover {
          background: #DF2A64;
          color: #FFFFFF;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(223, 42, 100, 0.25);
        }

        .cs-social-btn svg {
          width: 17px;
          height: 17px;
          fill: currentColor;
        }

        .cs-footer-copyright {
          font-size: 10.5px;
          color: #9C8F92;
          letter-spacing: 0.03em;
          position: relative;
          z-index: 10;
          margin-top: 24px;
        }

        @media (max-width: 600px) {
          .cs-brand-title {
            font-size: 34px;
          }
          .cs-tagline {
            font-size: 28px;
          }
          .cs-description {
            font-size: 13px;
            padding: 0 10px;
          }
        }
      `}</style>

      {/* Ambient Glows */}
      <div className="cs-glow-top-right" />
      <div className="cs-glow-bottom-left" />

      {/* Main Container */}
      <main className="cs-main-container">
        {/* Brand Logo Badge with hardcoded strict dimensions */}
        <div
          className="cs-logo-badge"
          style={{
            width: '86px',
            height: '86px',
            maxWidth: '86px',
            maxHeight: '86px',
            minWidth: '86px',
            minHeight: '86px',
            borderRadius: '50%',
            overflow: 'hidden',
          }}
        >
          <img
            src="/images/mama-logo.png"
            alt="MummaBeeBlog Logo"
            width={86}
            height={86}
            style={{
              width: '86px',
              height: '86px',
              maxWidth: '86px',
              maxHeight: '86px',
              objectFit: 'cover',
              borderRadius: '50%',
              display: 'block',
            }}
          />
        </div>

        {/* Brand Title */}
        <h1 className="cs-brand-title">MummaBeeBlog</h1>

        {/* Coming Soon Pill */}
        <div>
          <span className="cs-coming-soon-pill">COMING SOON</span>
        </div>

        {/* Tagline */}
        <h2 className="cs-tagline">Something beautiful is coming.</h2>

        {/* Description */}
        <p className="cs-description">
          We&apos;re currently working behind the scenes to give MummaBeeBlog a fresh new home. Sign up below to be the first to know when we launch and get our weekly UAE family guide.
        </p>

        {/* Newsletter Signup Box */}
        <div className="cs-newsletter-box">
          <form onSubmit={handleSubmit} className="cs-newsletter-form">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="cs-newsletter-input"
            />
            <button
              type="submit"
              disabled={submitting}
              className="cs-newsletter-btn"
            >
              {submitting ? 'Submitting...' : 'Get Notified'}
            </button>
          </form>
          {message && <div className="cs-newsletter-msg">{message}</div>}
        </div>

        {/* Divider */}
        <div className="cs-divider" />

        {/* Social Icons */}
        <div className="cs-social-row">
          {/* Instagram */}
          <a
            href="https://www.instagram.com/mummabeeblog/"
            target="_blank"
            rel="noopener noreferrer"
            className="cs-social-btn"
            title="Instagram"
          >
            <svg viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>

          {/* Facebook */}
          <a
            href="https://facebook.com/mummabeeblog"
            target="_blank"
            rel="noopener noreferrer"
            className="cs-social-btn"
            title="Facebook"
          >
            <svg viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </a>

          {/* TikTok */}
          <a
            href="https://tiktok.com/@mummabee.blog"
            target="_blank"
            rel="noopener noreferrer"
            className="cs-social-btn"
            title="TikTok"
          >
            <svg viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.47 6.27 6.27 0 0 0 1.94-4.52V8.47a8.28 8.28 0 0 0 4.83 1.54V6.69h-1z" />
            </svg>
          </a>

          {/* Pinterest */}
          <a
            href="https://ph.pinterest.com/mummabeeblog/"
            target="_blank"
            rel="noopener noreferrer"
            className="cs-social-btn"
            title="Pinterest"
          >
            <svg viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.332 1.357-.053.225-.177.268-.407.161-1.523-.708-2.472-2.934-2.472-4.721 0-3.844 2.793-7.375 8.058-7.375 4.232 0 7.521 3.016 7.521 7.047 0 4.204-2.651 7.589-6.331 7.589-1.236 0-2.399-.643-2.796-1.402l-.761 2.898c-.276 1.063-1.022 2.396-1.524 3.208C9.539 23.827 10.743 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
            </svg>
          </a>
        </div>
      </main>

      {/* Footer Copyright */}
      <footer className="cs-footer-copyright">
        © 2026 MummaBeeBlog · All rights reserved
      </footer>
    </div>
  );
}
