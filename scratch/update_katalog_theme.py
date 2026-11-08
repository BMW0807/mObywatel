with open('mockup/katalog-kart.js', 'r', encoding='utf-8') as f:
    code = f.read()

# Helper function definition and encoded SVGs
encoder_helper = """  function svgToUri(str) {
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(str.trim());
  }
"""

old_svg_defs = """  // --- 1. Definicje tła kart SVG (jako gotowe data URI) ---
  const SVG_BGS = {
    emeryt: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23064e3b"/><stop offset="50%" stop-color="%23047857"/><stop offset="100%" stop-color="%23065f46"/></linearGradient><radialGradient id="gl" cx="80%" cy="20%" r="60%"><stop offset="0%" stop-color="rgba(52,211,153,0.35)"/><stop offset="100%" stop-color="rgba(6,78,59,0)"/></radialGradient></defs><rect width="600" height="400" rx="36" fill="url(%23g)"/><rect width="600" height="400" rx="36" fill="url(%23gl)"/><path d="M0 110 Q300 150 600 100" fill="none" stroke="rgba(255,255,255,0.14)" stroke-width="2"/><path d="M0 320 Q300 270 600 325" fill="none" stroke="rgba(52,211,153,0.18)" stroke-width="2"/><g transform="translate(440,220)" stroke="rgba(255,255,255,0.08)" stroke-width="3" fill="none"><circle cx="0" cy="0" r="62"/><path d="M-28 -14 L0 -42 L28 -14 L16 32 L-16 32 Z"/><circle cx="0" cy="-4" r="11"/></g><rect x="496" y="34" width="68" height="26" rx="6" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/><text x="530" y="52" font-family="sans-serif" font-size="11" font-weight="700" fill="%23fff" text-anchor="middle">ZUS</text></svg>`,

    karta_polaka: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23881337"/><stop offset="50%" stop-color="%239f1239"/><stop offset="100%" stop-color="%234c0519"/></linearGradient><radialGradient id="gl" cx="80%" cy="20%" r="60%"><stop offset="0%" stop-color="rgba(251,113,133,0.3)"/><stop offset="100%" stop-color="rgba(136,19,55,0)"/></radialGradient></defs><rect width="600" height="400" rx="36" fill="url(%23g)"/><rect width="600" height="400" rx="36" fill="url(%23gl)"/><path d="M0 100 Q300 135 600 95" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2"/><path d="M0 108 Q300 143 600 103" fill="none" stroke="rgba(225,29,72,0.4)" stroke-width="2"/><g transform="translate(440,225)" stroke="rgba(255,255,255,0.09)" stroke-width="3" fill="none"><path d="M0 -50 L12 -24 L38 -18 L16 2 L26 32 L0 16 L-26 32 L-16 2 L-38 -18 L-12 -24 Z"/><circle cx="0" cy="-6" r="12"/></g><rect x="510" y="34" width="54" height="26" rx="6" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/><text x="537" y="52" font-family="sans-serif" font-size="11" font-weight="700" fill="%23fff" text-anchor="middle">RP</text></svg>`,

    nauczyciel: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%231e3a8a"/><stop offset="50%" stop-color="%231d4ed8"/><stop offset="100%" stop-color="%23172554"/></linearGradient><radialGradient id="gl" cx="80%" cy="20%" r="60%"><stop offset="0%" stop-color="rgba(96,165,250,0.35)"/><stop offset="100%" stop-color="rgba(30,58,138,0)"/></radialGradient></defs><rect width="600" height="400" rx="36" fill="url(%23g)"/><rect width="600" height="400" rx="36" fill="url(%23gl)"/><path d="M0 115 Q300 150 600 110" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/><g transform="translate(440,220)" stroke="rgba(255,255,255,0.08)" stroke-width="3" fill="none"><path d="M-40 20 Q-20 0 0 10 Q20 0 40 20 L40 -20 Q20 -40 0 -30 Q-20 -40 -40 -20 Z"/><line x1="0" y1="-30" x2="0" y2="10"/></g><rect x="496" y="34" width="68" height="26" rx="6" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/><text x="530" y="52" font-family="sans-serif" font-size="11" font-weight="700" fill="%23fff" text-anchor="middle">MEN</text></svg>`,

    pwz_lekarz: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%230f766e"/><stop offset="50%" stop-color="%230284c7"/><stop offset="100%" stop-color="%23134e4a"/></linearGradient><radialGradient id="gl" cx="80%" cy="20%" r="60%"><stop offset="0%" stop-color="rgba(56,189,248,0.35)"/><stop offset="100%" stop-color="rgba(15,118,110,0)"/></radialGradient></defs><rect width="600" height="400" rx="36" fill="url(%23g)"/><rect width="600" height="400" rx="36" fill="url(%23gl)"/><path d="M0 105 Q300 145 600 95" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/><g transform="translate(440,220)" stroke="rgba(255,255,255,0.09)" stroke-width="3" fill="none"><line x1="0" y1="-55" x2="0" y2="55"/><path d="M-15 -35 C-5 -45 15 -30 0 -15 C-20 0 20 20 0 35"/></g><rect x="502" y="34" width="62" height="26" rx="6" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/><text x="533" y="52" font-family="sans-serif" font-size="11" font-weight="700" fill="%23fff" text-anchor="middle">NIL</text></svg>`,

    pwz_pielegniarka: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%234338ca"/><stop offset="50%" stop-color="%236366f1"/><stop offset="100%" stop-color="%23312e81"/></linearGradient><radialGradient id="gl" cx="80%" cy="20%" r="60%"><stop offset="0%" stop-color="rgba(165,180,252,0.35)"/><stop offset="100%" stop-color="rgba(67,56,202,0)"/></radialGradient></defs><rect width="600" height="400" rx="36" fill="url(%23g)"/><rect width="600" height="400" rx="36" fill="url(%23gl)"/><path d="M0 105 Q300 140 600 100" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/><g transform="translate(440,220)" stroke="rgba(255,255,255,0.09)" stroke-width="3" fill="none"><circle cx="0" cy="0" r="48"/><path d="M-18 0 H18 M0 -18 V18"/></g><rect x="490" y="34" width="74" height="26" rx="6" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/><text x="527" y="52" font-family="sans-serif" font-size="10" font-weight="700" fill="%23fff" text-anchor="middle">NIPiP</text></svg>`,

    legitymacja_szkolna: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%239a3412"/><stop offset="50%" stop-color="%23ea580c"/><stop offset="100%" stop-color="%237c2d12"/></linearGradient><radialGradient id="gl" cx="80%" cy="20%" r="60%"><stop offset="0%" stop-color="rgba(253,186,116,0.35)"/><stop offset="100%" stop-color="rgba(154,52,18,0)"/></radialGradient></defs><rect width="600" height="400" rx="36" fill="url(%23g)"/><rect width="600" height="400" rx="36" fill="url(%23gl)"/><path d="M0 110 Q300 145 600 105" fill="none" stroke="rgba(255,255,255,0.16)" stroke-width="2"/><g transform="translate(440,220)" stroke="rgba(255,255,255,0.08)" stroke-width="3" fill="none"><rect x="-35" y="-35" width="70" height="70" rx="14"/><path d="M-20 -5 L0 15 L20 -5"/></g><rect x="496" y="34" width="68" height="26" rx="6" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/><text x="530" y="52" font-family="sans-serif" font-size="11" font-weight="700" fill="%23fff" text-anchor="middle">MEN</text></svg>`
  };"""

new_svg_defs = """  // --- 1. Definicje tła kart SVG (jako bezpiecznie zakodowane data URI) ---
  function svgToUri(str) {
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(str.trim());
  }

  const SVG_BGS = {
    emeryt: svgToUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#064e3b"/><stop offset="50%" stop-color="#047857"/><stop offset="100%" stop-color="#065f46"/></linearGradient><radialGradient id="gl" cx="80%" cy="20%" r="60%"><stop offset="0%" stop-color="rgba(52,211,153,0.35)"/><stop offset="100%" stop-color="rgba(6,78,59,0)"/></radialGradient></defs><rect width="600" height="400" rx="36" fill="url(#g)"/><rect width="600" height="400" rx="36" fill="url(#gl)"/><path d="M0 110 Q300 150 600 100" fill="none" stroke="rgba(255,255,255,0.14)" stroke-width="2"/><path d="M0 320 Q300 270 600 325" fill="none" stroke="rgba(52,211,153,0.18)" stroke-width="2"/><g transform="translate(440,220)" stroke="rgba(255,255,255,0.08)" stroke-width="3" fill="none"><circle cx="0" cy="0" r="62"/><path d="M-28 -14 L0 -42 L28 -14 L16 32 L-16 32 Z"/><circle cx="0" cy="-4" r="11"/></g><rect x="496" y="34" width="68" height="26" rx="6" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/><text x="530" y="52" font-family="sans-serif" font-size="11" font-weight="700" fill="#fff" text-anchor="middle">ZUS</text></svg>`),

    karta_polaka: svgToUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#881337"/><stop offset="50%" stop-color="#9f1239"/><stop offset="100%" stop-color="#4c0519"/></linearGradient><radialGradient id="gl" cx="80%" cy="20%" r="60%"><stop offset="0%" stop-color="rgba(251,113,133,0.3)"/><stop offset="100%" stop-color="rgba(136,19,55,0)"/></radialGradient></defs><rect width="600" height="400" rx="36" fill="url(#g)"/><rect width="600" height="400" rx="36" fill="url(#gl)"/><path d="M0 100 Q300 135 600 95" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2"/><path d="M0 108 Q300 143 600 103" fill="none" stroke="rgba(225,29,72,0.4)" stroke-width="2"/><g transform="translate(440,225)" stroke="rgba(255,255,255,0.09)" stroke-width="3" fill="none"><path d="M0 -50 L12 -24 L38 -18 L16 2 L26 32 L0 16 L-26 32 L-16 2 L-38 -18 L-12 -24 Z"/><circle cx="0" cy="-6" r="12"/></g><rect x="510" y="34" width="54" height="26" rx="6" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/><text x="537" y="52" font-family="sans-serif" font-size="11" font-weight="700" fill="#fff" text-anchor="middle">RP</text></svg>`),

    nauczyciel: svgToUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1e3a8a"/><stop offset="50%" stop-color="#1d4ed8"/><stop offset="100%" stop-color="#172554"/></linearGradient><radialGradient id="gl" cx="80%" cy="20%" r="60%"><stop offset="0%" stop-color="rgba(96,165,250,0.35)"/><stop offset="100%" stop-color="rgba(30,58,138,0)"/></radialGradient></defs><rect width="600" height="400" rx="36" fill="url(#g)"/><rect width="600" height="400" rx="36" fill="url(#gl)"/><path d="M0 115 Q300 150 600 110" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/><g transform="translate(440,220)" stroke="rgba(255,255,255,0.08)" stroke-width="3" fill="none"><path d="M-40 20 Q-20 0 0 10 Q20 0 40 20 L40 -20 Q20 -40 0 -30 Q-20 -40 -40 -20 Z"/><line x1="0" y1="-30" x2="0" y2="10"/></g><rect x="496" y="34" width="68" height="26" rx="6" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/><text x="530" y="52" font-family="sans-serif" font-size="11" font-weight="700" fill="#fff" text-anchor="middle">MEN</text></svg>`),

    pwz_lekarz: svgToUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0f766e"/><stop offset="50%" stop-color="#0284c7"/><stop offset="100%" stop-color="#134e4a"/></linearGradient><radialGradient id="gl" cx="80%" cy="20%" r="60%"><stop offset="0%" stop-color="rgba(56,189,248,0.35)"/><stop offset="100%" stop-color="rgba(15,118,110,0)"/></radialGradient></defs><rect width="600" height="400" rx="36" fill="url(#g)"/><rect width="600" height="400" rx="36" fill="url(#gl)"/><path d="M0 105 Q300 145 600 95" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/><g transform="translate(440,220)" stroke="rgba(255,255,255,0.09)" stroke-width="3" fill="none"><line x1="0" y1="-55" x2="0" y2="55"/><path d="M-15 -35 C-5 -45 15 -30 0 -15 C-20 0 20 20 0 35"/></g><rect x="502" y="34" width="62" height="26" rx="6" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/><text x="533" y="52" font-family="sans-serif" font-size="11" font-weight="700" fill="#fff" text-anchor="middle">NIL</text></svg>`),

    pwz_pielegniarka: svgToUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#4338ca"/><stop offset="50%" stop-color="#6366f1"/><stop offset="100%" stop-color="#312e81"/></linearGradient><radialGradient id="gl" cx="80%" cy="20%" r="60%"><stop offset="0%" stop-color="rgba(165,180,252,0.35)"/><stop offset="100%" stop-color="rgba(67,56,202,0)"/></radialGradient></defs><rect width="600" height="400" rx="36" fill="url(#g)"/><rect width="600" height="400" rx="36" fill="url(#gl)"/><path d="M0 105 Q300 140 600 100" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/><g transform="translate(440,220)" stroke="rgba(255,255,255,0.09)" stroke-width="3" fill="none"><circle cx="0" cy="0" r="48"/><path d="M-18 0 H18 M0 -18 V18"/></g><rect x="490" y="34" width="74" height="26" rx="6" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/><text x="527" y="52" font-family="sans-serif" font-size="10" font-weight="700" fill="#fff" text-anchor="middle">NIPiP</text></svg>`),

    legitymacja_szkolna: svgToUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#9a3412"/><stop offset="50%" stop-color="#ea580c"/><stop offset="100%" stop-color="#7c2d12"/></linearGradient><radialGradient id="gl" cx="80%" cy="20%" r="60%"><stop offset="0%" stop-color="rgba(253,186,116,0.35)"/><stop offset="100%" stop-color="rgba(154,52,18,0)"/></radialGradient></defs><rect width="600" height="400" rx="36" fill="url(#g)"/><rect width="600" height="400" rx="36" fill="url(#gl)"/><path d="M0 110 Q300 145 600 105" fill="none" stroke="rgba(255,255,255,0.16)" stroke-width="2"/><g transform="translate(440,220)" stroke="rgba(255,255,255,0.08)" stroke-width="3" fill="none"><rect x="-35" y="-35" width="70" height="70" rx="14"/><path d="M-20 -5 L0 15 L20 -5"/></g><rect x="496" y="34" width="68" height="26" rx="6" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/><text x="530" y="52" font-family="sans-serif" font-size="11" font-weight="700" fill="#fff" text-anchor="middle">MEN</text></svg>`)
  };"""

assert old_svg_defs in code, "old_svg_defs not found"
code = code.replace(old_svg_defs, new_svg_defs)

# Fix line 424 style background-image
old_preview = """<div class="kc-preview" style="background-image:url('${item.build ? item.build(typeof OS !== 'undefined' ? OS : {}).img : ''}')">"""
new_preview = """<div class="kc-preview" style="background-image:url(&quot;${item.build ? item.build(typeof OS !== 'undefined' ? OS : {}).img : ''}&quot;)">"""
assert old_preview in code, "old_preview not found"
code = code.replace(old_preview, new_preview)

# Add comprehensive dark mode and high contrast styles in injectStyles
old_hc_rule = """      .high-contrast .btn-dodaj-dok-bar {
        background: #000 !important;
        color: #ffd700 !important;
        border: 2px solid #ffd700 !important;
      }"""

new_hc_rule = """      .high-contrast .btn-dodaj-dok-bar {
        background: #000 !important;
        color: #ffd700 !important;
        border: 2px solid #ffd700 !important;
      }
      .high-contrast .btn-dodaj-dok-bar .bdd-icon,
      .high-contrast .btn-dodaj-dok-bar .bdd-label,
      .high-contrast .btn-dodaj-dok-bar .bdd-badge {
        color: #ffd700 !important;
      }
      .high-contrast .btn-dodaj-dok-bar .bdd-badge {
        background: #ffd700 !important;
        color: #000000 !important;
      }
      .phone.dark-mode .katalog-search-bar input {
        background: #181d28 !important;
        border-color: rgba(255,255,255,0.15) !important;
        color: #ffffff !important;
      }
      .phone.dark-mode .katalog-card {
        background: #1e2433 !important;
        border-color: rgba(255,255,255,0.08) !important;
        color: #f0f3fa !important;
      }
      .phone.dark-mode .kc-title {
        color: #ffffff !important;
      }
      .phone.dark-mode .kc-desc {
        color: #9ea7ba !important;
      }
      .phone.dark-mode .chip-sm {
        background: #1e2433 !important;
        color: #9ea7ba !important;
        border-color: rgba(255,255,255,0.1) !important;
      }
      .phone.dark-mode .chip-sm.active {
        background: var(--red) !important;
        color: #ffffff !important;
      }
      .high-contrast .katalog-modal-box {
        background: #000000 !important;
        border: 2px solid #ffd700 !important;
        color: #ffffff !important;
      }
      .high-contrast .katalog-search-bar input {
        background: #000000 !important;
        border: 2px solid #ffd700 !important;
        color: #ffffff !important;
      }
      .high-contrast .katalog-search-bar input::placeholder {
        color: #ffd700 !important;
        opacity: 0.9 !important;
      }
      .high-contrast .katalog-card {
        background: #000000 !important;
        border: 2px solid #ffffff !important;
        color: #ffffff !important;
      }
      .high-contrast .kc-title {
        color: #ffffff !important;
      }
      .high-contrast .kc-desc {
        color: #ffd700 !important;
      }
      .high-contrast .kc-inst {
        color: #00ff66 !important;
      }
      .high-contrast .chip-sm {
        background: #000000 !important;
        border: 1.5px solid #ffffff !important;
        color: #ffffff !important;
      }
      .high-contrast .chip-sm.active {
        background: #ffd700 !important;
        color: #000000 !important;
        border-color: #ffd700 !important;
        font-weight: 700 !important;
      }
      .high-contrast .kc-btn.primary {
        background: #ffd700 !important;
        color: #000000 !important;
        border: 2px solid #ffffff !important;
        font-weight: 700 !important;
      }
      .high-contrast .kc-btn.secondary {
        background: #000000 !important;
        color: #00ff66 !important;
        border: 2px solid #00ff66 !important;
      }"""

assert old_hc_rule in code, "old_hc_rule not found"
code = code.replace(old_hc_rule, new_hc_rule)

with open('mockup/katalog-kart.js', 'w', encoding='utf-8', newline='\n') as f:
    f.write(code)

print('Updated mockup/katalog-kart.js with safe SVG encoding and theme rules!')
