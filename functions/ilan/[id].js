// /ilan/:id  -> WhatsApp/Google önizlemesi (başlık, fiyat, kapak foto) sonra siteye yönlendirir
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export async function onRequest({params,env,request}){
 const base=new URL(request.url).origin,r=await env.DB.prepare('SELECT * FROM listings WHERE id=?').bind(params.id).first();
 if(!r)return Response.redirect(base+'/',302);
 const imgs=JSON.parse(r.images||'[]'),img=imgs[0]?new URL(imgs[0],base).href:'',loc=[r.hood,r.district,r.city].filter(Boolean).join(', ');
 const price=Number(r.price).toLocaleString('tr-TR')+' ₺'+(r.type==='rent'?' / ay':'');
 const d=`${r.type==='rent'?'Kiralık':'Satılık'} ${loc}${r.area?' · '+r.area+' m²':''} · ${price}. Çözüm Emlak Gayrimenkul & Danışmanlık.`,u=`${base}/ilan/${r.id}`;
 const html=`<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(r.title)} - ${esc(price)} | Çözüm Emlak</title><meta name="description" content="${esc(d)}"><link rel="canonical" href="${u}">
<meta property="og:type" content="website"><meta property="og:title" content="${esc(r.title+' - '+price)}"><meta property="og:description" content="${esc(d)}"><meta property="og:url" content="${u}">${img?`<meta property="og:image" content="${esc(img)}"><meta name="twitter:card" content="summary_large_image">`:''}
<meta http-equiv="refresh" content="0;url=/#/i/${r.id}"></head><body><h1>${esc(r.title)}</h1><p>${esc(d)}</p>${img?`<img src="${esc(img)}" alt="${esc(r.title)}" style="max-width:100%">`:''}<p><a href="/#/i/${r.id}">İlanı aç</a></p><script>location.replace('/#/i/${r.id}')</script></body></html>`;
 return new Response(html,{headers:{'content-type':'text/html;charset=utf-8','cache-control':'public,max-age=60'}});
}
