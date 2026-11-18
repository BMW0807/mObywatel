with open('mockup/core.js', 'r', encoding='utf-8') as f:
    code = f.read()

target = """ let cardH=natH,off=Math.min(62,(avail-natH)/Math.max(1,n-1));
 const minOff=H<680?26:36;
 if(!chatting&&off<minOff){
  off=Math.max(H<650?22:26,Math.min(minOff,Math.floor((avail-(H<650?115:130))/Math.max(1,n-1))));
  cardH=Math.max(H<650?110:122,Math.min(natH,avail-off*Math.max(1,n-1)));
 }"""

replacement = """ let cardH=natH,off=Math.min(58,(avail-natH)/Math.max(1,n-1));
 const minOff=H<680?22:30;
 if(!chatting&&off<minOff){
  off=Math.max(H<650?18:22,Math.min(minOff,Math.floor((avail-(H<650?100:114))/Math.max(1,n-1))));
  cardH=Math.max(H<650?96:108,Math.min(natH,avail-off*Math.max(1,n-1)));
 }"""

assert target in code, "target not found in core.js"
code = code.replace(target, replacement)

target2 = """ let used=(n-1)*off+cardH;
 if(!chatting&&typeof layoutAlt==='function'&&VARIANT!=='stos')used=layoutAlt(stackTop,avail,W);
 $('#reminders').style.top=remTop+'px';"""

replacement2 = """ let used=(n-1)*off+cardH;
 if(!chatting&&typeof layoutAlt==='function'&&VARIANT!=='stos')used=layoutAlt(stackTop,avail,W);
 remTop=Math.max(stackTop+used+(H<680?4:6), remTop);
 $('#reminders').style.top=remTop+'px';"""

assert target2 in code, "target2 not found in core.js"
code = code.replace(target2, replacement2)

with open('mockup/core.js', 'w', encoding='utf-8', newline='\n') as f:
    f.write(code)

print('Updated core.js successfully!')
