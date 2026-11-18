with open('mockup/core.js', 'r', encoding='utf-8') as f:
    c = f.read()

helper = """function cardImgUrl(u) {
  if (!u) return '';
  return u + (u.indexOf('?') !== -1 ? '&' : '?') + 'v=40';
}
"""

if 'function cardImgUrl' not in c:
    c = helper + c

target1 = "c.style.backgroundImage=`url(${d.img})`"
repl1 = "c.style.backgroundImage=`url(${cardImgUrl(d.img)})`"
assert target1 in c, "target1 not found"
c = c.replace(target1, repl1)

target2 = 'style="background-image:url(${d.img})"'
repl2 = 'style="background-image:url(${cardImgUrl(d.img)})"'
assert target2 in c, "target2 not found"
c = c.replace(target2, repl2)

with open('mockup/core.js', 'w', encoding='utf-8', newline='\n') as f:
    f.write(c)

print('Success updating core.js')
