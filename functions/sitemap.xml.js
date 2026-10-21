const pick=env=>Object.values(env).find(v=>v&&typeof v==='object'&&typeof v.prepare==='function');
export async function onRequest({env,request}){
 const b=new URL(request.url).origin,{results}=await pick(env).prepare("SELECT id FROM listings WHERE status='active' ORDER BY id DESC LIMIT 1000").all();
 return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${b}/</loc></url>${results.map(x=>`<url><loc>${b}/ilan/${x.id}</loc></url>`).join('')}</urlset>`,{headers:{'content-type':'application/xml'}});
}
