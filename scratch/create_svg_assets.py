import os

assets_dir = 'mockup/assets'

cards = {
    'card-karta-polaka.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
  <defs>
    <linearGradient id="gKP" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#881337"/>
      <stop offset="50%" stop-color="#9f1239"/>
      <stop offset="100%" stop-color="#4c0519"/>
    </linearGradient>
    <radialGradient id="glKP" cx="80%" cy="20%" r="60%">
      <stop offset="0%" stop-color="rgba(251,113,133,0.3)"/>
      <stop offset="100%" stop-color="rgba(136,19,55,0)"/>
    </radialGradient>
  </defs>
  <rect width="600" height="400" rx="36" fill="url(#gKP)"/>
  <rect width="600" height="400" rx="36" fill="url(#glKP)"/>
  <path d="M0 100 Q300 135 600 95" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
  <path d="M0 108 Q300 143 600 103" fill="none" stroke="rgba(225,29,72,0.4)" stroke-width="2"/>
  <g transform="translate(440,225)" stroke="rgba(255,255,255,0.09)" stroke-width="3" fill="none">
    <path d="M0 -50 L12 -24 L38 -18 L16 2 L26 32 L0 16 L-26 32 L-16 2 L-38 -18 L-12 -24 Z"/>
    <circle cx="0" cy="-6" r="12"/>
  </g>
  <rect x="510" y="34" width="54" height="26" rx="6" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
  <text x="537" y="52" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#fff" text-anchor="middle">RP</text>
</svg>''',

    'card-nauczyciel.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
  <defs>
    <linearGradient id="gN" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1e3a8a"/>
      <stop offset="50%" stop-color="#1d4ed8"/>
      <stop offset="100%" stop-color="#172554"/>
    </linearGradient>
    <radialGradient id="glN" cx="80%" cy="20%" r="60%">
      <stop offset="0%" stop-color="rgba(96,165,250,0.35)"/>
      <stop offset="100%" stop-color="rgba(30,58,138,0)"/>
    </radialGradient>
  </defs>
  <rect width="600" height="400" rx="36" fill="url(#gN)"/>
  <rect width="600" height="400" rx="36" fill="url(#glN)"/>
  <path d="M0 115 Q300 150 600 110" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>
  <g transform="translate(440,220)" stroke="rgba(255,255,255,0.08)" stroke-width="3" fill="none">
    <path d="M-40 20 Q-20 0 0 10 Q20 0 40 20 L40 -20 Q20 -40 0 -30 Q-20 -40 -40 -20 Z"/>
    <line x1="0" y1="-30" x2="0" y2="10"/>
  </g>
  <rect x="496" y="34" width="68" height="26" rx="6" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
  <text x="530" y="52" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#fff" text-anchor="middle">MEN</text>
</svg>''',

    'card-pwz-lekarz.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
  <defs>
    <linearGradient id="gL" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f766e"/>
      <stop offset="50%" stop-color="#0284c7"/>
      <stop offset="100%" stop-color="#134e4a"/>
    </linearGradient>
    <radialGradient id="glL" cx="80%" cy="20%" r="60%">
      <stop offset="0%" stop-color="rgba(56,189,248,0.35)"/>
      <stop offset="100%" stop-color="rgba(15,118,110,0)"/>
    </radialGradient>
  </defs>
  <rect width="600" height="400" rx="36" fill="url(#gL)"/>
  <rect width="600" height="400" rx="36" fill="url(#glL)"/>
  <path d="M0 105 Q300 145 600 95" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>
  <g transform="translate(440,220)" stroke="rgba(255,255,255,0.09)" stroke-width="3" fill="none">
    <line x1="0" y1="-55" x2="0" y2="55"/>
    <path d="M-15 -35 C-5 -45 15 -30 0 -15 C-20 0 20 20 0 35"/>
  </g>
  <rect x="502" y="34" width="62" height="26" rx="6" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
  <text x="533" y="52" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#fff" text-anchor="middle">NIL</text>
</svg>''',

    'card-pwz-pielegniarka.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
  <defs>
    <linearGradient id="gP" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#4338ca"/>
      <stop offset="50%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#312e81"/>
    </linearGradient>
    <radialGradient id="glP" cx="80%" cy="20%" r="60%">
      <stop offset="0%" stop-color="rgba(165,180,252,0.35)"/>
      <stop offset="100%" stop-color="rgba(67,56,202,0)"/>
    </radialGradient>
  </defs>
  <rect width="600" height="400" rx="36" fill="url(#gP)"/>
  <rect width="600" height="400" rx="36" fill="url(#glP)"/>
  <path d="M0 105 Q300 140 600 100" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>
  <g transform="translate(440,220)" stroke="rgba(255,255,255,0.09)" stroke-width="3" fill="none">
    <circle cx="0" cy="0" r="48"/>
    <path d="M-18 0 H18 M0 -18 V18"/>
  </g>
  <rect x="490" y="34" width="74" height="26" rx="6" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
  <text x="527" y="52" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#fff" text-anchor="middle">NIPiP</text>
</svg>''',

    'card-legitymacja-szkolna.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
  <defs>
    <linearGradient id="gS" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#9a3412"/>
      <stop offset="50%" stop-color="#ea580c"/>
      <stop offset="100%" stop-color="#7c2d12"/>
    </linearGradient>
    <radialGradient id="glS" cx="80%" cy="20%" r="60%">
      <stop offset="0%" stop-color="rgba(253,186,116,0.35)"/>
      <stop offset="100%" stop-color="rgba(154,52,18,0)"/>
    </radialGradient>
  </defs>
  <rect width="600" height="400" rx="36" fill="url(#gS)"/>
  <rect width="600" height="400" rx="36" fill="url(#glS)"/>
  <path d="M0 110 Q300 145 600 105" fill="none" stroke="rgba(255,255,255,0.16)" stroke-width="2"/>
  <g transform="translate(440,220)" stroke="rgba(255,255,255,0.08)" stroke-width="3" fill="none">
    <rect x="-35" y="-35" width="70" height="70" rx="14"/>
    <path d="M-20 -5 L0 15 L20 -5"/>
  </g>
  <rect x="496" y="34" width="68" height="26" rx="6" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
  <text x="530" y="52" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#fff" text-anchor="middle">MEN</text>
</svg>''',

    'strip-emeryt.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 70" width="400" height="70">
  <defs><linearGradient id="sEm" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#064e3b"/><stop offset="60%" stop-color="#047857"/><stop offset="100%" stop-color="#065f46"/></linearGradient></defs>
  <rect width="400" height="70" rx="16" fill="url(#sEm)"/>
  <rect x="340" y="24" width="40" height="22" rx="5" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.2"/>
  <text x="360" y="39" font-family="'Inter', sans-serif" font-size="9" font-weight="700" fill="#ffffff" text-anchor="middle">ZUS</text>
</svg>''',

    'strip-karta-polaka.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 70" width="400" height="70">
  <defs><linearGradient id="sKP" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#881337"/><stop offset="60%" stop-color="#9f1239"/><stop offset="100%" stop-color="#4c0519"/></linearGradient></defs>
  <rect width="400" height="70" rx="16" fill="url(#sKP)"/>
  <rect x="340" y="24" width="40" height="22" rx="5" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.2"/>
  <text x="360" y="39" font-family="'Inter', sans-serif" font-size="9" font-weight="700" fill="#ffffff" text-anchor="middle">RP</text>
</svg>''',

    'strip-nauczyciel.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 70" width="400" height="70">
  <defs><linearGradient id="sN" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#1e3a8a"/><stop offset="60%" stop-color="#1d4ed8"/><stop offset="100%" stop-color="#172554"/></linearGradient></defs>
  <rect width="400" height="70" rx="16" fill="url(#sN)"/>
  <rect x="340" y="24" width="40" height="22" rx="5" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.2"/>
  <text x="360" y="39" font-family="'Inter', sans-serif" font-size="9" font-weight="700" fill="#ffffff" text-anchor="middle">MEN</text>
</svg>''',

    'strip-pwz-lekarz.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 70" width="400" height="70">
  <defs><linearGradient id="sL" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#0f766e"/><stop offset="60%" stop-color="#0284c7"/><stop offset="100%" stop-color="#134e4a"/></linearGradient></defs>
  <rect width="400" height="70" rx="16" fill="url(#sL)"/>
  <rect x="340" y="24" width="40" height="22" rx="5" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.2"/>
  <text x="360" y="39" font-family="'Inter', sans-serif" font-size="9" font-weight="700" fill="#ffffff" text-anchor="middle">NIL</text>
</svg>''',

    'strip-pwz-pielegniarka.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 70" width="400" height="70">
  <defs><linearGradient id="sP" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#4338ca"/><stop offset="60%" stop-color="#6366f1"/><stop offset="100%" stop-color="#312e81"/></linearGradient></defs>
  <rect width="400" height="70" rx="16" fill="url(#sP)"/>
  <rect x="336" y="24" width="48" height="22" rx="5" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.2"/>
  <text x="360" y="39" font-family="'Inter', sans-serif" font-size="8.5" font-weight="700" fill="#ffffff" text-anchor="middle">NIPiP</text>
</svg>''',

    'strip-legitymacja-szkolna.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 70" width="400" height="70">
  <defs><linearGradient id="sS" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#9a3412"/><stop offset="60%" stop-color="#ea580c"/><stop offset="100%" stop-color="#7c2d12"/></linearGradient></defs>
  <rect width="400" height="70" rx="16" fill="url(#sS)"/>
  <rect x="340" y="24" width="40" height="22" rx="5" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.2"/>
  <text x="360" y="39" font-family="'Inter', sans-serif" font-size="9" font-weight="700" fill="#ffffff" text-anchor="middle">MEN</text>
</svg>'''
}

for filename, content in cards.items():
    p = os.path.join(assets_dir, filename)
    with open(p, 'w', encoding='utf-8', newline='\n') as f:
        f.write(content)
    print(f'Wrote {p}')
