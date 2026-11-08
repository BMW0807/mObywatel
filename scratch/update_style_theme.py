with open('mockup/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Comprehensive Dark Mode & High Contrast Block
theme_block = '''
/* ==========================================================================
   ULEPSZENIA TRYBU CIEMNEGO (DARK MODE) I WYSOKIEGO KONTRASTU (WCAG AAA)
   ========================================================================== */

/* ---------- 1. DARK MODE KOMPONENTY ---------- */
.phone.dark-mode .rsum {
  background: #1e2433 !important;
  border: 1px solid rgba(255,255,255,0.08) !important;
  color: #f0f3fa !important;
}
.phone.dark-mode .rsum b {
  color: #ffffff !important;
}
.phone.dark-mode .rsum small {
  color: #a2a9ba !important;
}
.phone.dark-mode .rsum small em {
  color: #ff5270 !important;
}
.phone.dark-mode .rsum>svg {
  color: #838da0 !important;
}
.phone.dark-mode .person-change {
  background: rgba(220, 20, 60, 0.22) !important;
  color: #ff6b85 !important;
  border: 1px solid rgba(220, 20, 60, 0.35) !important;
}
.phone.dark-mode .bnav {
  background: rgba(18,22,31,.96) !important;
  border-top-color: rgba(255,255,255,0.08) !important;
}
.phone.dark-mode .bnav-btn {
  color: #a2a9ba !important;
}
.phone.dark-mode .bnav-btn.active {
  color: #ff5270 !important;
}
.phone.dark-mode .service-card {
  background: #1e2433 !important;
  border-color: rgba(255,255,255,0.08) !important;
  color: #f0f3fa !important;
}
.phone.dark-mode .service-card b,
.phone.dark-mode .service-card h3 {
  color: #ffffff !important;
}
.phone.dark-mode .service-card p,
.phone.dark-mode .service-card small {
  color: #a2a9ba !important;
}
.phone.dark-mode .sc-arrow {
  color: #6b7385 !important;
}
.phone.dark-mode .sc-icon {
  background: #252d3d !important;
}
.phone.dark-mode .valid {
  background: #15241b !important;
  color: #4ade80 !important;
  border: 1px solid rgba(74, 222, 128, 0.25) !important;
}
.phone.dark-mode .valid svg {
  color: #4ade80 !important;
}
.phone.dark-mode .ap-lang-row {
  background: #12151e !important;
  border-color: rgba(255,255,255,0.1) !important;
}
.phone.dark-mode .lang-btn {
  color: #a2a9ba !important;
}
.phone.dark-mode .lang-btn.active {
  background: #2b3345 !important;
  color: #ffffff !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.4) !important;
}
.phone.dark-mode .ap-row {
  color: #f0f3fa !important;
  border-bottom: 1px solid rgba(255,255,255,0.07) !important;
}
.phone.dark-mode .ap-row small {
  color: #949db0 !important;
}
.phone.dark-mode .search-pill {
  background: rgba(30, 36, 51, 0.94) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}
.phone.dark-mode .sp-search-ic,
.phone.dark-mode .sp-tx {
  color: #a2a9ba !important;
}
.phone.dark-mode .sp-mic-btn {
  background: rgba(220, 20, 60, 0.25) !important;
  color: #ff5270 !important;
}
.phone.dark-mode .homebar {
  background: rgba(255, 255, 255, 0.35) !important;
}
.phone.dark-mode *::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
.phone.dark-mode *::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2) !important;
  border-radius: 4px;
}
.phone.dark-mode *::-webkit-scrollbar-track {
  background: transparent !important;
}

/* ---------- 2. WYSOKI KONTRAST (HIGH CONTRAST / WCAG AAA) ---------- */
.high-contrast,
.phone.high-contrast,
body.high-contrast {
  --bg: #000000 !important;
  --surface: #000000 !important;
  --ink: #ffffff !important;
  --ink2: #ffd700 !important;
  --ink3: #ffd700 !important;
  --hair: #ffd700 !important;
  --red: #ff2a40 !important;
  --red-wash: #2b0006 !important;
  --ok: #00ff66 !important;
  --ok-wash: #00260e !important;
}
.high-contrast body {
  background: #000000 !important;
}
.high-contrast .phone {
  background: #000000 !important;
  box-shadow: 0 0 0 2px #ffd700 !important;
}
.high-contrast .top {
  background: #000000 !important;
  border-bottom: 2px solid #ffd700 !important;
}
.high-contrast .ico {
  color: #ffd700 !important;
  border: 1.5px solid #ffd700 !important;
  background: #000000 !important;
}
.high-contrast .ico:hover {
  background: #1a1a00 !important;
}
.high-contrast .title {
  color: #ffffff !important;
}
.high-contrast .title svg {
  color: #ffd700 !important;
}
.high-contrast .person-bar {
  background: #000000 !important;
  border: 2px solid #ffd700 !important;
  color: #ffffff !important;
}
.high-contrast .person-name {
  color: #ffffff !important;
}
.high-contrast .person-desc {
  color: #ffd700 !important;
}
.high-contrast .person-change {
  background: #ffd700 !important;
  color: #000000 !important;
  border: 2px solid #ffffff !important;
  font-weight: 700 !important;
}
.high-contrast .search-pill {
  background: #000000 !important;
  border: 2px solid #ffd700 !important;
  color: #ffffff !important;
}
.high-contrast .sp-search-ic,
.high-contrast .sp-tx {
  color: #ffd700 !important;
  font-weight: 700 !important;
}
.high-contrast .sp-mic-btn {
  background: #ffd700 !important;
  color: #000000 !important;
  border: 2px solid #ffffff !important;
}
.high-contrast .qt {
  background: #000000 !important;
  border: 2px solid #ffffff !important;
  color: #ffffff !important;
}
.high-contrast .qt-tx b {
  color: #ffffff !important;
}
.high-contrast .qt-tx small {
  color: #ffd700 !important;
}
.high-contrast .qt-ic {
  background: #ffd700 !important;
  color: #000000 !important;
  border: 1px solid #ffffff !important;
}
.high-contrast .rsum {
  background: #000000 !important;
  border: 2px solid #ffffff !important;
  color: #ffffff !important;
}
.high-contrast .rsum b {
  color: #ffffff !important;
  font-size: 15px !important;
}
.high-contrast .rsum small {
  color: #ffd700 !important;
}
.high-contrast .rsum small em {
  color: #ff2a40 !important;
  font-weight: 700 !important;
}
.high-contrast .rsum .rdot {
  background: #ffd700 !important;
  color: #000000 !important;
  border: 1.5px solid #ffffff !important;
  font-weight: 800 !important;
}
.high-contrast .rsum>svg {
  color: #ffd700 !important;
}
.high-contrast .bnav {
  background: #000000 !important;
  border-top: 2px solid #ffd700 !important;
}
.high-contrast .bnav-btn {
  color: #ffffff !important;
  font-weight: 700 !important;
}
.high-contrast .bnav-btn svg {
  stroke-width: 2.2px !important;
}
.high-contrast .bnav-btn.active {
  color: #ffd700 !important;
}
.high-contrast .bnav-qr-circle {
  background: #ffd700 !important;
  color: #000000 !important;
  border: 2px solid #ffffff !important;
  box-shadow: none !important;
}
.high-contrast .service-card {
  background: #000000 !important;
  border: 2px solid #ffd700 !important;
  color: #ffffff !important;
}
.high-contrast .service-card b,
.high-contrast .service-card h3 {
  color: #ffffff !important;
  font-size: 16px !important;
}
.high-contrast .service-card p,
.high-contrast .service-card small {
  color: #ffd700 !important;
}
.high-contrast .sc-arrow {
  color: #ffd700 !important;
  font-weight: 800 !important;
}
.high-contrast .sc-icon {
  background: #1a1a00 !important;
  border: 1.5px solid #ffd700 !important;
}
.high-contrast .valid {
  background: #000000 !important;
  color: #00ff66 !important;
  border: 2px solid #00ff66 !important;
  font-weight: 700 !important;
}
.high-contrast .valid svg {
  color: #00ff66 !important;
}
.high-contrast .sheet-modal .modal-box,
.high-contrast .lmenu .panel,
.high-contrast .a11y-pop,
.high-contrast .hmenu .panel {
  background: #000000 !important;
  border: 2px solid #ffd700 !important;
  color: #ffffff !important;
}
.high-contrast .modal-head h2 {
  color: #ffffff !important;
}
.high-contrast .modal-sub {
  color: #ffd700 !important;
}
.high-contrast .ap-lang-row {
  background: #000000 !important;
  border: 1.5px solid #ffd700 !important;
}
.high-contrast .lang-btn {
  background: #000000 !important;
  border: 1px solid #ffd700 !important;
  color: #ffffff !important;
}
.high-contrast .lang-btn.active {
  background: #ffd700 !important;
  color: #000000 !important;
  font-weight: 700 !important;
}
.high-contrast .ap-row {
  color: #ffffff !important;
  border-bottom: 1px solid rgba(255,255,255,0.2) !important;
}
.high-contrast .ap-row small {
  color: #ffd700 !important;
}
.high-contrast .ap-row .sw {
  border: 2px solid #ffd700 !important;
  background: #000000 !important;
}
.high-contrast .ap-row.on .sw {
  background: #ffd700 !important;
}
.high-contrast .ap-row.on .sw::after {
  background: #000000 !important;
}
.high-contrast .homebar {
  background: #ffd700 !important;
}
.high-contrast .btn.ghost {
  background: #000000 !important;
  color: #ffffff !important;
  border: 1.5px solid #ffffff !important;
}
.high-contrast .btn.primary {
  background: #ffd700 !important;
  color: #000000 !important;
  border: 2px solid #ffffff !important;
  font-weight: 700 !important;
}
'''

# Append to style.css if not already present
if '/* ULEPSZENIA TRYBU CIEMNEGO' in css:
    start_pos = css.find('/* ==========================================================================\n   ULEPSZENIA TRYBU CIEMNEGO')
    css = css[:start_pos] + theme_block
else:
    css += '\n' + theme_block

with open('mockup/style.css', 'w', encoding='utf-8', newline='\n') as f:
    f.write(css)

print('Updated mockup/style.css with theme improvements!')
