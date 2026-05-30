const fs = require('fs');
const filePath = 'src/app/checkout/success/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('trackPurchase')) {
  content = content.replace(
    'import { useCart } from "@/context/CartContext";',
    'import { useCart } from "@/context/CartContext";\nimport { trackPurchase, trackLead } from "@/lib/metaPixel";'
  );

  const fbBlock = `            if ((window as any).fbq) {
              (window as any).fbq("track", "Purchase", {
                value: data.orderValue,
                currency: data.currency,
                content_name: data.productTitle,
                content_ids: [id],
                content_type: "product",
              });
            }`;

  const newFbBlock = `            const productIds = data.products && data.products.length > 0
              ? data.products.map((p: any) => p.id)
              : [id];
            
            trackPurchase(
              data.transactionId || id,
              data.productTitle || "منتجك الرقمي",
              productIds,
              parseFloat(data.orderValue || "0"),
              data.currency || "EGP"
            );`;

  content = content.replace(fbBlock, newFbBlock);

  content = content.replace(/href="\/dashboard"/g, 'href="/dashboard" onClick={() => trackLead(\'post_purchase_cta_click\')}');
  content = content.replace(/href=\{p\.downloadUrl \|\| "#"\}/g, 'href={p.downloadUrl || "#"} onClick={() => trackLead(\'post_purchase_cta_click\')}');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Success modifications done.");
} else {
  console.log("Already modified.");
}
