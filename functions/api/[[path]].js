// Pages Function: /api/*  Bindings: DB (D1), R2 | Secrets: ADMIN_USER, ADMIN_PASS, SECRET
const J=(d,s=200)=>new Response(JSON.stringify(d),{status:s,headers:{'content-type':'application/json','cache-control':'no-store'}});
const enc=new TextEncoder();
async function sign(s,k){const key=await crypto.subtle.importKey('raw',enc.encode(k),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 return [...new Uint8Array(await crypto.subtle.sign('HMAC',key,enc.encode(s)))].map(b=>b.toString(16).padStart(2,'0')).join('')}
async function authed(req,env){const [exp,sig]=(req.headers.get('authorization')||'').slice(7).split('.');
 return !!exp&&+exp>Date.now()&&sig===await sign(exp,env.SECRET)}
const parse=r=>({...r,attrs:JSON.parse(r.attrs||'{}'),images:JSON.parse(r.images||'[]')});
const COLS=['title','type','category','status','price','city','district','hood','address','area','agent','description'];
const vals=b=>[...COLS.map(c=>b[c]??null),JSON.stringify(b.attrs||{}),JSON.stringify(b.images||[])];

export async function onRequest({request:req,env,params}){
 const [a,b,c]=params.path||[],db=env.DB,R2=env.IMAGES_BUCKET,u=new URL(req.url),m=req.method;
 if((a==='login'||a==='admin')&&!(env.SECRET&&env.ADMIN_USER&&env.ADMIN_PASS))return J({error:'Sunucu ayarı eksik: ADMIN_USER, ADMIN_PASS, SECRET'},500);
 if(!db&&a!=='img')return J({error:'D1 veritabanı bağlantısı bulunamadı (Pages > Ayarlar > Bağlantılar)'},500);
 try{
 if(a==='listings'&&!b&&m==='GET'){
  const w=['1=1'],v=[];
  for(const k of['type','category','status'])if(u.searchParams.get(k)){w.push(`${k}=?`);v.push(u.searchParams.get(k))}
  const q=u.searchParams.get('q');if(q){w.push('(title LIKE ? OR hood LIKE ? OR district LIKE ?)');v.push(...Array(3).fill(`%${q}%`))}
  if(u.searchParams.get('min')){w.push('price>=?');v.push(+u.searchParams.get('min'))}
  if(u.searchParams.get('max')){w.push('price<=?');v.push(+u.searchParams.get('max'))}
  const {results}=await db.prepare(`SELECT * FROM listings WHERE ${w.join(' AND ')} ORDER BY (status='active') DESC, id DESC LIMIT 200`).bind(...v).all();
  return J(results.map(parse));
 }
 if(a==='listings'&&b&&m==='GET'){
  const r=await db.prepare('SELECT * FROM listings WHERE id=?').bind(b).first();
  if(!r)return J({error:'Bulunamadı'},404);
  if(u.searchParams.get('v')!=='0')await db.prepare('UPDATE listings SET views=views+1 WHERE id=?').bind(b).run();
  return J(parse(r));
 }
 if(a==='leads'&&m==='POST'){
  const d=await req.json();if(!d.phone)return J({error:'Telefon gerekli'},400);
  await db.prepare('INSERT INTO leads(kind,name,phone,note,listing_id) VALUES(?,?,?,?,?)').bind(d.kind||'talep',d.name||'',d.phone,d.note||'',d.listing_id||null).run();
  return J({ok:1});
 }
 if(a==='locations'&&m==='GET'){const {results}=await db.prepare('SELECT id,city,district,hood FROM locations ORDER BY city,district,hood').all();return J(results)}
 if(a==='settings'&&m==='GET'){const r=await db.prepare("SELECT v FROM settings WHERE k='site'").first();return J(r?JSON.parse(r.v):{})}
 if(a==='img'&&b){
  if(!R2)return new Response('R2 yok',{status:500});const o=await R2.get(b,{range:req.headers});if(!o)return new Response('yok',{status:404});
  const h=new Headers({'content-type':o.httpMetadata?.contentType||'image/webp','cache-control':'public,max-age=31536000,immutable','accept-ranges':'bytes'});let st=200;
  if(o.range&&req.headers.get('range')){const r=o.range,off=r.offset??(r.suffix!=null?o.size-r.suffix:0),len=r.length??(o.size-off);h.set('content-range',`bytes ${off}-${off+len-1}/${o.size}`);st=206}
  return new Response(o.body,{status:st,headers:h});
 }
 if(a==='login'&&m==='POST'){
  const d=await req.json();
  if(d.user!==env.ADMIN_USER||d.pass!==env.ADMIN_PASS)return J({error:'Hatalı giriş'},401);
  const exp=String(Date.now()+12*3600e3);return J({token:exp+'.'+await sign(exp,env.SECRET)});
 }
 if(a==='admin'){
  if(!await authed(req,env))return J({error:'Yetkisiz'},401);
  if(b==='listings'&&!c&&m==='GET'){const {results}=await db.prepare('SELECT * FROM listings ORDER BY id DESC').all();return J(results.map(parse))}
  if(b==='listings'&&!c&&m==='POST'){
   const d=await req.json();
   const r=await db.prepare(`INSERT INTO listings(${COLS.join(',')},attrs,images) VALUES(${Array(COLS.length+2).fill('?')})`).bind(...vals(d)).run();
   return J({id:r.meta.last_row_id});
  }
  if(b==='listings'&&c&&m==='PUT'){
   const d=await req.json();
   await db.prepare(`UPDATE listings SET ${COLS.map(x=>x+'=?').join(',')},attrs=?,images=? WHERE id=?`).bind(...vals(d),c).run();
   return J({ok:1});
  }
  if(b==='listings'&&c&&m==='DELETE'){await db.prepare('DELETE FROM listings WHERE id=?').bind(c).run();return J({ok:1})}
  if(b==='health'){
   const out={db:{binding:'DB'},r2:{binding:'IMAGES_BUCKET'},secrets:{ADMIN_USER:!!env.ADMIN_USER,ADMIN_PASS:!!env.ADMIN_PASS,SECRET:!!env.SECRET}};
   for(const t of['listings','locations','leads','settings']){try{out.db[t]=(await db.prepare(`SELECT COUNT(*) n FROM ${t}`).first()).n}catch(e){out.db[t]='HATA: '+e.message}}
   if(!R2)out.r2.write='HATA: R2 bağlantısı yok';else try{await R2.put('_health.txt','ok');await R2.delete('_health.txt');out.r2.write=true}catch(e){out.r2.write='HATA: '+e.message}
   return J(out);
  }
  if(b==='locations'&&m==='POST'){
   const d=await req.json(),city=(d.city||'').trim(),dist=(d.district||'').trim();if(!city||!dist)return J({error:'İl ve ilçe gerekli'},400);
   const hs=['',...(d.hoods||[]).map(x=>String(x).trim()).filter(Boolean)];
   await db.batch(hs.map(h=>db.prepare('INSERT OR IGNORE INTO locations(city,district,hood) VALUES(?,?,?)').bind(city,dist,h)));return J({ok:1});
  }
  if(b==='locations'&&c&&m==='DELETE'){
   const r=await db.prepare('SELECT * FROM locations WHERE id=?').bind(c).first();if(!r)return J({ok:1});
   if(r.hood==='')await db.prepare('DELETE FROM locations WHERE city=? AND district=?').bind(r.city,r.district).run();
   else await db.prepare('DELETE FROM locations WHERE id=?').bind(c).run();
   return J({ok:1});
  }
  if(b==='leads'){const {results}=await db.prepare('SELECT * FROM leads ORDER BY id DESC LIMIT 200').all();return J(results)}
  if(b==='settings'&&m==='PUT'){await db.prepare("INSERT OR REPLACE INTO settings(k,v) VALUES('site',?)").bind(JSON.stringify(await req.json())).run();return J({ok:1})}
  if(b==='upload'&&m==='POST'){
   if(!R2)return J({error:"R2 bağlantısı bulunamadı."},500);
   const ct=req.headers.get('content-type')||'',ext=u.searchParams.get('ext')==='mp4'?'mp4':ct.includes('jpeg')?'jpg':ct.includes('png')?'png':'webp',key=crypto.randomUUID()+'.'+ext;
   const data=ext==='mp4'?req.body:await req.arrayBuffer();
   if(ext!=='mp4'&&!data.byteLength)return J({error:'Boş dosya geldi'},400);
   await R2.put(key,data,{httpMetadata:{contentType:{mp4:'video/mp4',jpg:'image/jpeg',png:'image/png',webp:'image/webp'}[ext]}});
   return J({url:'/api/img/'+key});
  }
 }
 return J({error:'Yok'},404);
 }catch(e){return J({error:e.message},500)}
}
