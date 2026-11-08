with open('mockup/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# 1. Update all instances of the mobile media query to be universal for <= 920px or touch/standalone
old_mq1 = '@media (max-width:600px), (hover:none) and (pointer:coarse) and (max-width:800px), (display-mode:standalone)'
old_mq2 = '@media (max-width: 600px), (hover: none) and (pointer: coarse) and (max-width: 800px), (display-mode: standalone)'
new_mq = '@media (max-width: 920px), (pointer: coarse), (hover: none), (display-mode: standalone)'

css = css.replace(old_mq1, new_mq)
css = css.replace(old_mq2, new_mq)

# 2. Add overflow-x: hidden to html, body and ensure .phone has max-width: 100%
old_html_body = 'html,body{margin:0;min-height:100%}'
new_html_body = 'html,body{margin:0;min-height:100%;width:100%;max-width:100%;overflow-x:hidden}'
if old_html_body in css:
    css = css.replace(old_html_body, new_html_body)

# 3. Add styling for strip pill max-width and plate sizing
old_pill = '.pill{flex:none;background:#fff;color:var(--red);font-size:12px;font-weight:700;line-height:16px;padding:4px 9px;border-radius:12px;white-space:nowrap}'
new_pill = '.pill{flex:none;background:#fff;color:var(--red);font-size:11px;font-weight:700;line-height:14px;padding:3px 8px;border-radius:12px;white-space:nowrap;max-width:44%;overflow:hidden;text-overflow:ellipsis}'
if old_pill in css:
    css = css.replace(old_pill, new_pill)

# 4. Add layout scrollbar rules and grid adjustments
extra_rules = '''
/* Warianty układów: płynne przewijanie i ochrona przed kolizją */
.alt {
  box-sizing: border-box;
  scrollbar-width: none;
}
.alt::-webkit-scrollbar {
  display: none;
}
.grid {
  box-sizing: border-box;
  scrollbar-width: none;
}
.grid::-webkit-scrollbar {
  display: none;
}
.strip .st {
  flex: 1;
  min-width: 0;
}
.strip .st b, .strip .st small, .strip em {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.phone.compact-h .btn-dodaj-dok-bar {
  padding: 6px 12px;
  margin-bottom: 5px;
  font-size: 12px;
}
.phone.compact-h .search-pill {
  padding: 6px 12px;
  margin-bottom: 5px;
}
'''
if '/* Warianty układów: płynne przewijanie' not in css:
    css += '\n' + extra_rules

with open('mockup/style.css', 'w', encoding='utf-8', newline='\n') as f:
    f.write(css)

print('Updated mockup/style.css successfully!')
