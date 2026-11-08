# -*- coding: utf-8 -*-

# 1. Update style.css
with open('mockup/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

target = """.ui .rows{padding:0 16px 4px}
.ui .row{display:flex;justify-content:space-between;gap:16px;padding:9px 0;border-top:1px solid var(--hair);font-size:14px;line-height:19px}
.ui .row span{color:var(--ink2);flex:none}
.ui .row b{font-weight:500;text-align:right;min-width:0;overflow-wrap:anywhere}"""

replacement = """.ui .rows{padding:0 16px 4px}
.ui .row{display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:3px 12px;padding:9px 0;border-top:1px solid var(--hair);font-size:14px;line-height:20px}
.ui .row span{color:var(--ink2);flex:1 1 auto;min-width:90px;max-width:100%;word-break:normal;overflow-wrap:break-word}
.ui .row b{font-weight:500;text-align:right;flex:1 1 auto;min-width:100px;max-width:100%;word-break:normal;overflow-wrap:break-word}
.ui .row.row-stack{flex-direction:column;align-items:flex-start;gap:3px}
.ui .row.row-stack b{text-align:left;width:100%}"""

if target in css:
    css = css.replace(target, replacement)
    print('Replaced .ui .row in style.css')
else:
    print('Warning: Target not found directly in style.css')

# Also protect .upo-row
target_upo = ".upo-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-size: 13px; }"
replacement_upo = ".upo-row { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 4px 10px; padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-size: 13px; }\n.upo-label { color: #64748b; flex: 1 1 auto; max-width: 100%; }\n.upo-val { font-weight: 600; text-align: right; flex: 1 1 auto; max-width: 100%; word-break: normal; overflow-wrap: break-word; }"

if target_upo in css:
    css = css.replace(target_upo, replacement_upo)
    print('Replaced .upo-row in style.css')

with open('mockup/style.css', 'w', encoding='utf-8', newline='\n') as f:
    f.write(css)

# 2. Update core.js
with open('mockup/core.js', 'r', encoding='utf-8') as f:
    core = f.read()

target_core = "function rowsH(rows){return rows.map(([k,v])=>`<div class=\"row\"><span>${k}</span><b>${v}</b></div>`).join('')}"
replacement_core = "function rowsH(rows){return rows.map(([k,v])=>{const s=(k&&k.length>22)||(v&&v.length>30);return `<div class=\"row${s?' row-stack':''}\"><span>${k}</span><b>${v}</b></div>`}).join('')}"

if target_core in core:
    core = core.replace(target_core, replacement_core)
    print('Replaced rowsH in core.js')
else:
    print('Warning: Target not found directly in core.js')

with open('mockup/core.js', 'w', encoding='utf-8', newline='\n') as f:
    f.write(core)

# 3. Bump version in index.html and sw.js
with open('mockup/index.html', 'r', encoding='utf-8') as f:
    idx = f.read()
idx = idx.replace('?v=41', '?v=42')
with open('mockup/index.html', 'w', encoding='utf-8', newline='\n') as f:
    f.write(idx)

with open('mockup/sw.js', 'r', encoding='utf-8') as f:
    sw = f.read()
sw = sw.replace('?v=41', '?v=42').replace('mobywatel-pwa-v11', 'mobywatel-pwa-v12')
with open('mockup/sw.js', 'w', encoding='utf-8', newline='\n') as f:
    f.write(sw)
print('Bumped version to v42')
