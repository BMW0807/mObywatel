# -*- coding: utf-8 -*-

# 1. Update core.js
with open('mockup/core.js', 'r', encoding='utf-8') as f:
    core = f.read()

# Replace bigcard background-image
core = core.replace(
    'style="background-image:url(${cardImgUrl(d.img)})"',
    'style="background-image:url(&quot;${cardImgUrl(d.img)}&quot;)"'
)

# Ensure cardImgUrl has data: check and v=41
if 'if (u.startsWith(\'data:\')) return u;' not in core:
    core = core.replace(
        "function cardImgUrl(u) {\n  if (!u) return '';\n",
        "function cardImgUrl(u) {\n  if (!u) return '';\n  if (u.startsWith('data:')) return u;\n"
    )

with open('mockup/core.js', 'w', encoding='utf-8', newline='\n') as f:
    f.write(core)
print('Updated mockup/core.js')

# 2. Update variants.js
with open('mockup/variants.js', 'r', encoding='utf-8') as f:
    var_c = f.read()

var_c = var_c.replace(
    'style="background-image:url(${imgUrl(d)})"',
    'style="background-image:url(&quot;${imgUrl(d)}&quot;)"'
)
var_c = var_c.replace(
    'style="background-image:url(${stripUrl(d)})"',
    'style="background-image:url(&quot;${stripUrl(d)}&quot;)"'
)

with open('mockup/variants.js', 'w', encoding='utf-8', newline='\n') as f:
    f.write(var_c)
print('Updated mockup/variants.js')

# 3. Update katalog-kart.js
with open('mockup/katalog-kart.js', 'r', encoding='utf-8') as f:
    kat = f.read()

# Safe svgToUri: replace parentheses and single quotes so they never break CSS url(...)
old_svg_to_uri = """  function svgToUri(str) {
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(str.trim());
  }"""

new_svg_to_uri = """  function svgToUri(str) {
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(str.trim())
      .replace(/\\(/g, '%28')
      .replace(/\\)/g, '%29')
      .replace(/'/g, '%27');
  }"""

if old_svg_to_uri in kat:
    kat = kat.replace(old_svg_to_uri, new_svg_to_uri)
    print('Replaced svgToUri with safeSvgToUri in katalog-kart.js')
else:
    print('Note: old_svg_to_uri pattern match check needed')

# Point KATALOG_DOKUMENTOW items to the real SVG assets on disk (with fallback to data uri)
kat = kat.replace("img: SVG_BGS.emeryt,\n          strip: SVG_BGS.emeryt,", "img: 'assets/card-emeryt.svg',\n          strip: 'assets/strip-emeryt.svg',")
kat = kat.replace("img: SVG_BGS.karta_polaka,\n          strip: SVG_BGS.karta_polaka,", "img: 'assets/card-karta-polaka.svg',\n          strip: 'assets/strip-karta-polaka.svg',")
kat = kat.replace("img: SVG_BGS.nauczyciel,\n          strip: SVG_BGS.nauczyciel,", "img: 'assets/card-nauczyciel.svg',\n          strip: 'assets/strip-nauczyciel.svg',")
kat = kat.replace("img: SVG_BGS.pwz_lekarz,\n          strip: SVG_BGS.pwz_lekarz,", "img: 'assets/card-pwz-lekarz.svg',\n          strip: 'assets/strip-pwz-lekarz.svg',")
kat = kat.replace("img: SVG_BGS.pwz_pielegniarka,\n          strip: SVG_BGS.pwz_pielegniarka,", "img: 'assets/card-pwz-pielegniarka.svg',\n          strip: 'assets/strip-pwz-pielegniarka.svg',")
kat = kat.replace("img: SVG_BGS.legitymacja_szkolna,\n          strip: SVG_BGS.legitymacja_szkolna,", "img: 'assets/card-legitymacja-szkolna.svg',\n          strip: 'assets/strip-legitymacja-szkolna.svg',")

with open('mockup/katalog-kart.js', 'w', encoding='utf-8', newline='\n') as f:
    f.write(kat)
print('Updated mockup/katalog-kart.js')
