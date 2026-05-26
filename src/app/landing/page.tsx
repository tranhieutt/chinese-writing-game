'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import './landing.css';

/* ── Decorative SVG cloud ── */
function CloudSVG() {
  return (
    <svg viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 60 Q10 60 10 50 Q10 38 22 38 Q22 22 38 22 Q44 10 60 14 Q68 4 82 8 Q96 2 108 12 Q122 6 134 16 Q150 10 158 26 Q174 24 178 38 Q190 40 188 52 Q186 64 172 62 Q160 74 144 66 Q130 78 112 68 Q96 80 78 70 Q62 80 46 68 Q30 76 20 60Z" fill="#C0392B" opacity="0.6"/>
      <path d="M30 58 Q22 58 22 50 Q22 42 30 40 Q28 28 42 26 Q50 16 64 20" stroke="#C0392B" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.3"/>
    </svg>
  );
}

/* ── Panda mascot SVG (anime-cute) ── */
function PandaMascot() {
  return (
    <svg className="lp-mascot" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shadow */}
      <ellipse cx="80" cy="150" rx="40" ry="8" fill="rgba(0,0,0,0.08)"/>
      {/* Body */}
      <ellipse cx="80" cy="110" rx="38" ry="34" fill="white"/>
      <ellipse cx="80" cy="110" rx="38" ry="34" fill="url(#body-grad)" opacity="0.3"/>
      {/* Tummy */}
      <ellipse cx="80" cy="116" rx="22" ry="18" fill="#F5F5F5"/>
      {/* Left ear */}
      <ellipse cx="44" cy="46" rx="16" ry="14" fill="#1A1A1A"/>
      <ellipse cx="44" cy="46" rx="10" ry="9" fill="#333"/>
      {/* Right ear */}
      <ellipse cx="116" cy="46" rx="16" ry="14" fill="#1A1A1A"/>
      <ellipse cx="116" cy="46" rx="10" ry="9" fill="#333"/>
      {/* Head */}
      <circle cx="80" cy="70" r="46" fill="white"/>
      {/* Eye patches */}
      <ellipse cx="62" cy="66" rx="14" ry="12" fill="#1A1A1A" transform="rotate(-10 62 66)"/>
      <ellipse cx="98" cy="66" rx="14" ry="12" fill="#1A1A1A" transform="rotate(10 98 66)"/>
      {/* Eyes */}
      <circle cx="62" cy="67" r="7" fill="white"/>
      <circle cx="98" cy="67" r="7" fill="white"/>
      <circle cx="63" cy="67" r="4.5" fill="#1A1A1A"/>
      <circle cx="99" cy="67" r="4.5" fill="#1A1A1A"/>
      {/* Eye shine */}
      <circle cx="65" cy="64" r="2" fill="white"/>
      <circle cx="101" cy="64" r="2" fill="white"/>
      <circle cx="64" cy="69" r="1" fill="white" opacity="0.6"/>
      <circle cx="100" cy="69" r="1" fill="white" opacity="0.6"/>
      {/* Nose */}
      <ellipse cx="80" cy="79" rx="5" ry="3.5" fill="#FF8A65"/>
      {/* Mouth — big anime smile */}
      <path d="M68 86 Q80 98 92 86" stroke="#5D4037" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      {/* Cheeks blush */}
      <ellipse cx="52" cy="80" rx="10" ry="6" fill="#FFB3A7" opacity="0.5"/>
      <ellipse cx="108" cy="80" rx="10" ry="6" fill="#FFB3A7" opacity="0.5"/>
      {/* Arms */}
      <ellipse cx="44" cy="112" rx="13" ry="10" fill="#1A1A1A" transform="rotate(-30 44 112)"/>
      <ellipse cx="116" cy="112" rx="13" ry="10" fill="#1A1A1A" transform="rotate(30 116 112)"/>
      {/* Red headband */}
      <rect x="40" y="55" width="80" height="10" rx="5" fill="#C0392B" opacity="0.85"/>
      <rect x="72" y="49" width="16" height="8" rx="4" fill="#C0392B" opacity="0.85"/>
      {/* Gold star on headband */}
      <text x="80" y="63" textAnchor="middle" fontSize="10" fill="#F5C842">★</text>
      {/* Gradient def */}
      <defs>
        <radialGradient id="body-grad" cx="50%" cy="30%">
          <stop offset="0%" stopColor="#E0E0E0"/>
          <stop offset="100%" stopColor="transparent"/>
        </radialGradient>
      </defs>
    </svg>
  );
}

/* ── Data ── */
const SAMPLE_CHARS = [
  { char: '你', pinyin: 'nǐ', meaning: 'bạn' },
  { char: '好', pinyin: 'hǎo', meaning: 'tốt' },
  { char: '学', pinyin: 'xué', meaning: 'học' },
  { char: '中', pinyin: 'zhōng', meaning: 'trung' },
  { char: '文', pinyin: 'wén', meaning: 'văn' },
  { char: '人', pinyin: 'rén', meaning: 'người' },
  { char: '日', pinyin: 'rì', meaning: 'ngày' },
  { char: '月', pinyin: 'yuè', meaning: 'tháng' },
  { char: '水', pinyin: 'shuǐ', meaning: 'nước' },
  { char: '火', pinyin: 'huǒ', meaning: 'lửa' },
  { char: '山', pinyin: 'shān', meaning: 'núi' },
  { char: '木', pinyin: 'mù', meaning: 'cây' },
];

const FEATURES = [
  { color: 'red',  icon: '🖌️', title: 'Luyện nét bút thật', desc: 'Vẽ từng nét theo đúng thứ tự trên canvas. Hệ thống nhận diện thông minh chấp nhận nét hơi lệch — vừa học, vừa vui.' },
  { color: 'gold', icon: '✨', title: 'Gamification đầy đủ', desc: 'XP, cấp độ, streak ngày học, confetti mỗi khi hoàn thành chữ. Cảm giác tiến bộ mỗi ngày.' },
  { color: 'jade', icon: '🎯', title: 'Luyện ngẫu nhiên tính giờ', desc: 'Chế độ đấu tính giờ độc đáo. Chọn ngẫu nhiên nhóm 3, 5, 7 từ HSK, theo dõi tiến độ bằng chuỗi hạt ngọc bích và nhận XP cực lớn.' },
  { color: 'ink',  icon: '🐼', title: 'Mascot gấu trúc', desc: 'Gấu trúc anime dễ thương theo dõi hành trình học của bạn — động viên khi đúng, an ủi khi sai.' },
  { color: 'red',  icon: '🎵', title: 'Âm thanh phản hồi', desc: 'SFX sinh động bằng Web Audio API — không cần tải file. Nghe rõ khi nét đúng, sai, hay hoàn thành chữ.' },
  { color: 'gold', icon: '📚', title: '400+ từ HSK 1, 2, 3', desc: '22 nhóm chủ đề phong phú: Bộ phận cơ thể, Màu sắc, Thiên nhiên, Bốn mùa... Bao phủ kho từ vựng HSK đa dạng.' },
];

const STEPS = [
  { num: '一', title: 'Chọn nhóm chủ đề', desc: 'Chọn 1 trong 10 nhóm từ vựng HSK1 — số đếm, con người, thời gian, thiên nhiên...' },
  { num: '二', title: 'Xem animation nét', desc: 'Nhấn "Xem nét" để gấu trúc giải thích thứ tự từng nét của chữ bạn muốn học.' },
  { num: '三', title: 'Tự vẽ và nhận điểm', desc: 'Nhấn "Luyện viết", vẽ từng nét trên canvas. Mỗi nét đúng = 1 màu riêng + điểm XP.' },
  { num: '四', title: 'Duy trì streak mỗi ngày', desc: 'Học đều đặn để giữ streak. Lên cấp, thu thập XP — tiến bộ từng ngày.' },
];

const TESTIMONIALS = [
  { stars: 5, text: 'Con tôi 8 tuổi mê chơi hơn xem hoạt hình! Gấu trúc dễ thương quá, mỗi tối tự nhắc ba mở app học.', name: 'Chị Lan Anh', role: 'Phụ huynh học sinh lớp 3', avatar: '👩' },
  { stars: 5, text: 'Đang tự học tiếng Trung cho công việc. App này giúp tôi nhớ nét bút nhanh hơn sách giáo trình nhiều lần.', name: 'Anh Minh Tuấn', role: 'Kế toán, đang học HSK2', avatar: '👨' },
  { stars: 5, text: 'Học sinh lớp tôi hay quên thứ tự nét. Từ khi dùng app này, cả lớp tiến bộ rõ rệt chỉ sau 2 tuần.', name: 'Cô Phương Thảo', role: 'Giáo viên tiếng Trung THCS', avatar: '👩‍🏫' },
];

/* ── Main page ── */
export default function LandingPage() {
  const sectionsRef = useRef<HTMLElement[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('visible');
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll('.lp-fade-up').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="lp-root">

      {/* ════ HERO ════ */}
      <section className="lp-hero">
        <div className="lp-hero-bg-char c1">漢</div>
        <div className="lp-hero-bg-char c2">字</div>

        <div className="lp-cloud top-left"><CloudSVG /></div>
        <div className="lp-cloud top-right"><CloudSVG /></div>
        <div className="lp-cloud bot-left"><CloudSVG /></div>

        <div className="lp-badge">🐼 Miễn phí · Không cần đăng ký</div>

        <PandaMascot />

        <h1 className="lp-hero-title">
          Luyện Viết<br/><span>Chữ Hán</span> 練字
        </h1>
        <p className="lp-hero-sub">
          Game học viết tiếng Trung theo thứ tự nét bút —<br/>
          vui như chơi, nhớ như in, phong cách cổ điển đầy màu sắc.
        </p>

        <div className="lp-cta-group" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link className="lp-btn-primary" href="/">
            🖌️ Học theo từ — Miễn phí
          </Link>
          <Link className="lp-btn-secondary" href="/practice" style={{ background: '#d6a85a', color: '#21394f' }}>
            🎯 Luyện tính giờ
          </Link>
          <Link className="lp-btn-secondary" href="/tournament" style={{ background: '#c95f66', color: 'white' }}>
            🏆 Đấu trường HSK
          </Link>
        </div>

        <div className="lp-scroll-hint">
          <span>▼</span>
          <span>CUỘN XUỐNG</span>
        </div>
      </section>

      {/* Wave divider */}
      <div className="lp-divider">
        <svg viewBox="0 0 1200 60" preserveAspectRatio="none" style={{height:50}}>
          <path d="M0,0 C200,60 400,0 600,40 C800,80 1000,20 1200,50 L1200,0 Z" fill="#C0392B"/>
        </svg>
      </div>

      {/* ════ STATS ════ */}
      <div className="lp-stats">
        {[
          { num: '400+', label: 'Chữ Hán HSK 1-3' },
          { num: '22',  label: 'Nhóm chủ đề' },
          { num: '100%', label: 'Miễn phí' },
          { num: '⏱️',   label: 'Luyện tính giờ' },
        ].map((s) => (
          <div className="lp-stat" key={s.label}>
            <div className="lp-stat-num">{s.num}</div>
            <div className="lp-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Wave divider bottom */}
      <div className="lp-divider" style={{transform:'scaleY(-1) scaleX(-1)'}}>
        <svg viewBox="0 0 1200 60" preserveAspectRatio="none" style={{height:40}}>
          <path d="M0,0 C200,60 400,0 600,40 C800,80 1000,20 1200,50 L1200,0 Z" fill="#C0392B"/>
        </svg>
      </div>

      {/* ════ FEATURES ════ */}
      <section className="lp-features" id="features">
        <h2 className="lp-section-title lp-fade-up">Tính năng nổi bật ✦</h2>
        <p className="lp-section-sub lp-fade-up">Được xây dựng để giúp bạn thực sự nhớ — không chỉ nhìn.</p>
        <div className="lp-features-grid">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className={`lp-feature-card ${f.color} lp-fade-up`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <span className="lp-feature-icon">{f.icon}</span>
              <div className="lp-feature-title">{f.title}</div>
              <p className="lp-feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════ CHARS SHOWCASE ════ */}
      <section className="lp-chars">
        <h2 className="lp-section-title lp-fade-up">Bắt đầu với những chữ này 字</h2>
        <p className="lp-section-sub lp-fade-up" style={{marginBottom:36}}>Học từ vựng HSK 1, 2, 3 — pinyin + nghĩa tiếng Việt đầy đủ</p>
        <div className="lp-chars-grid">
          {SAMPLE_CHARS.map((c) => (
            <div className="lp-char-chip lp-fade-up" key={c.char}>
              <span className="lp-char-hanzi">{c.char}</span>
              <span className="lp-char-pinyin">{c.pinyin}</span>
              <span className="lp-char-meaning">{c.meaning}</span>
            </div>
          ))}
        </div>
        <Link className="lp-btn-primary" href="/">
          🎮 Học tất cả 400+ chữ →
        </Link>
      </section>

      {/* ════ HOW IT WORKS ════ */}
      <section className="lp-how">
        <div className="lp-how-bg">習</div>
        <h2 className="lp-section-title lp-fade-up">Cách hoạt động 步</h2>
        <p className="lp-section-sub lp-fade-up">4 bước đơn giản — bắt đầu ngay không cần cài đặt</p>
        <div className="lp-steps">
          {STEPS.map((s, i) => (
            <div
              key={s.num}
              className="lp-step lp-fade-up"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="lp-step-num">{s.num}</div>
              <div className="lp-step-body">
                <div className="lp-step-title">{s.title}</div>
                <p className="lp-step-desc">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════ TESTIMONIALS ════ */}
      <section className="lp-testimonials">
        <h2 className="lp-section-title lp-fade-up">Học viên nói gì 評</h2>
        <p className="lp-section-sub lp-fade-up">Phản hồi thật từ người dùng thật</p>
        <div className="lp-testi-grid">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.name}
              className="lp-testi-card lp-fade-up"
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              <div className="lp-testi-stars">{'★'.repeat(t.stars)}</div>
              <p className="lp-testi-text">"{t.text}"</p>
              <div className="lp-testi-author">
                <div className="lp-testi-avatar">{t.avatar}</div>
                <div>
                  <div className="lp-testi-name">{t.name}</div>
                  <div className="lp-testi-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════ CTA BOTTOM ════ */}
      <section className="lp-cta-bottom">
        <div className="lp-cta-group" style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <Link className="lp-btn-primary" href="/">
            🐼 Học theo từ
          </Link>
          <Link className="lp-btn-primary" href="/practice" style={{ background: '#d6a85a', color: '#21394f' }}>
            🎯 Luyện tính giờ
          </Link>
          <Link className="lp-btn-primary" href="/tournament" style={{ background: '#c95f66', color: 'white' }}>
            🏆 Đấu trường HSK
          </Link>
        </div>
      </section>

      {/* ════ FOOTER ════ */}
      <footer className="lp-footer">
        <div className="lp-footer-hanzi">練字 · 學中文</div>
        <p className="lp-footer-text">
          Made with ❤️ ·{' '}
          <Link className="lp-footer-link" href="/">
            Về trang chủ game
          </Link>
        </p>
      </footer>

    </div>
  );
}
