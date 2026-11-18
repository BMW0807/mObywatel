with open('mockup/index.html', 'r', encoding='utf-8') as f:
    c = f.read()

# Replace ?v=37 with ?v=40
c = c.replace('style.css?v=37', 'style.css?v=40')
c = c.replace('.js?v=37', '.js?v=40')

with open('mockup/index.html', 'w', encoding='utf-8', newline='\n') as f:
    f.write(c)

print('Updated mockup/index.html to v=40')

with open('mockup/sw.js', 'r', encoding='utf-8') as f:
    sw = f.read()

sw = sw.replace("'mobywatel-pwa-v8'", "'mobywatel-pwa-v10'")
sw = sw.replace("?v=37", "?v=40")

# Ensure v2 SVGs are included in precache if any card SVGs are precached
if '/assets/card-ikp-v2.svg' not in sw:
    sw = sw.replace("'/assets/icon-mobywatel.svg'", "'/assets/icon-mobywatel.svg',\n  '/assets/card-ikp-v2.svg',\n  '/assets/card-firma-v2.svg'")

with open('mockup/sw.js', 'w', encoding='utf-8', newline='\n') as f:
    f.write(sw)

print('Updated mockup/sw.js to mobywatel-pwa-v10')
