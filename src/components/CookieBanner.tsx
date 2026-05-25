'use client';

import React, { useState, useEffect } from 'react';

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState<boolean>(false);

  useEffect(() => {
    // Kiểm tra xem người dùng đã lựa chọn cookie chưa
    const consent = localStorage.getItem('cookie_consent_accepted');
    if (consent === null) {
      // Nếu chưa có quyết định, hiển thị banner với delay ngắn để có hiệu ứng mượt mà
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = (accepted: boolean) => {
    localStorage.setItem('cookie_consent_accepted', accepted ? 'true' : 'false');
    
    // Cập nhật Consent Mode của Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        'analytics_storage': accepted ? 'granted' : 'denied'
      });
    }

    // Tắt banner
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="cookie-banner-container">
      {/* Thẻ Style chứa CSS phong cách Cổ phong đồng bộ với game */}
      <style dangerouslySetInnerHTML={{ __html: `
        .cookie-banner-container {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          width: 90%;
          max-width: 580px;
          background-color: var(--ds-rice);
          border: 2px solid var(--ds-ink);
          border-radius: var(--ds-radius);
          box-shadow: 4px 6px 0 rgba(33, 57, 79, 0.15), 0 12px 28px var(--ds-shadow);
          padding: 20px 24px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 16px;
          animation: slideUpFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          font-family: var(--font-nunito-sans), sans-serif;
        }

        @keyframes slideUpFadeIn {
          from {
            transform: translate(-50%, 40px);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }

        .cookie-banner-content {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }

        .cookie-banner-icon {
          font-size: 32px;
          user-select: none;
          animation: gentleSway 3s ease-in-out infinite;
        }

        @keyframes gentleSway {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(8deg); }
        }

        .cookie-banner-text {
          flex: 1;
          color: var(--ds-ink);
        }

        .cookie-banner-title {
          font-family: var(--font-noto-serif-sc), serif;
          font-weight: 700;
          font-size: 18px;
          margin-bottom: 6px;
          letter-spacing: 0.02em;
        }

        .cookie-banner-desc {
          font-size: 13.5px;
          line-height: 1.5;
          opacity: 0.9;
        }

        .cookie-banner-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          border-top: 1px dashed var(--ds-line);
          padding-top: 14px;
        }

        .cookie-btn {
          font-family: var(--font-nunito-sans), sans-serif;
          font-weight: 700;
          font-size: 13.5px;
          padding: 8px 18px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 2px solid var(--ds-ink);
          outline: none;
        }

        .cookie-btn-decline {
          background-color: transparent;
          color: var(--ds-ink);
          opacity: 0.8;
        }

        .cookie-btn-decline:hover {
          opacity: 1;
          background-color: rgba(33, 57, 79, 0.05);
        }

        .cookie-btn-accept {
          background: linear-gradient(145deg, var(--ds-blueprint), #3a6f94);
          color: #fbf7ee;
          box-shadow: 2px 3px 0 rgba(33, 57, 79, 0.15);
        }

        .cookie-btn-accept:hover {
          transform: translateY(-1px);
          box-shadow: 3px 4px 0 rgba(33, 57, 79, 0.2);
        }

        .cookie-btn-accept:active {
          transform: translateY(1px);
          box-shadow: 1px 1px 0 rgba(33, 57, 79, 0.2);
        }

        @media (max-width: 480px) {
          .cookie-banner-container {
            padding: 16px;
            bottom: 16px;
          }
          .cookie-banner-content {
            gap: 12px;
          }
          .cookie-banner-icon {
            font-size: 26px;
          }
          .cookie-banner-title {
            font-size: 16px;
          }
          .cookie-banner-desc {
            font-size: 12.5px;
          }
          .cookie-btn {
            padding: 6px 14px;
            font-size: 12.5px;
          }
        }
      ` }} />

      <div className="cookie-banner-content">
        <span className="cookie-banner-icon">🍪</span>
        <div className="cookie-banner-text">
          <h4 className="cookie-banner-title">Quyền riêng tư & Cookie</h4>
          <p className="cookie-banner-desc">
            Trang web sử dụng cookie để đo lường lượng truy cập và cải thiện trải nghiệm học tập của bạn. 
            Mọi dữ liệu hoàn toàn ẩn danh. Bạn có đồng ý cho phép sử dụng cookie không?
          </p>
        </div>
      </div>

      <div className="cookie-banner-buttons">
        <button 
          type="button" 
          className="cookie-btn cookie-btn-decline"
          onClick={() => handleConsent(false)}
        >
          Từ chối
        </button>
        <button 
          type="button" 
          className="cookie-btn cookie-btn-accept"
          onClick={() => handleConsent(true)}
        >
          Đồng ý
        </button>
      </div>
    </div>
  );
}
