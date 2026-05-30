const fs = require('fs');
const filePath = 'src/app/checkout/success/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

let count = 0;
content = content.replace(/(<Link[\s\S]*?href=\{?[\"'][^>]*[\s\S]*?)(className=)/g, (match, p1, p2) => {
  if (match.includes('onClick')) return match;
  count++;
  return p1 + "onClick={() => trackLead('post_purchase_cta_click')} " + p2;
});

content = content.replace(/(<a[\s\S]*?href=\{?[\"'][^>]*[\s\S]*?)(className=)/g, (match, p1, p2) => {
  if (match.includes('onClick')) return match;
  count++;
  return p1 + "onClick={() => trackLead('post_purchase_cta_click')} " + p2;
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('Injected onClick tracking to ' + count + ' links in checkout/success/page.tsx');
