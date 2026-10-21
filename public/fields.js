let AGENTS={'Rasim Erdem':'905070373737','Yusuf Ay':'905356902194','Birkan Akıncı':'905443601619'};
const CATS={konut:'Konut',arsa:'Arsa',isyeri:'İşyeri',vasita:'Vasıta'};
const KONUT=[['rooms','Oda sayısı'],['gross','Brüt m²'],['net','Net m²'],['age','Bina yaşı'],['floor','Bulunduğu kat'],['heating','Isıtma'],['extras','Balkon / Asansör / Otopark'],['furnished','Eşya durumu']];
const FIELDS={konut:KONUT,isyeri:KONUT,
 arsa:[['ada','Ada / Parsel'],['m2','Toplam m²'],['zoning','İmar durumu'],['kaks','Kaks / Gabari'],['deed','Tapu durumu']],
 vasita:[['brand','Marka / Model / Seri'],['year','Yıl'],['km','KM'],['fuel','Yakıt'],['gear','Vites'],['body','Kasa tipi'],['expert','Ekspertiz / Boya / Değişen']]};
const TL=n=>Number(n||0).toLocaleString('tr-TR')+' ₺';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const STAT={sold:'Satıldı',rented:'Kiralandı'};
const LOGO='<svg viewBox="0 0 230 40" aria-label="Çözüm Emlak"><path d="M3 17l7-3 6 9L31 3l4 4-19 27z" fill="#1f9d55"/><text x="42" y="29" font-size="24" font-weight="800" font-family="Outfit,system-ui,sans-serif" textLength="184" lengthAdjust="spacingAndGlyphs"><tspan fill="#fff">ÇÖZÜM</tspan><tspan fill="#c8102e"> EMLAK</tspan></text></svg>';
const fmt=n=>{n=String(n||'').replace(/\D/g,'');if(n.startsWith('90'))n='0'+n.slice(2);return n.replace(/^(\d{4})(\d{3})(\d{2})(\d{2})$/,'$1 $2 $3 $4')};
const norm=n=>{n=String(n||'').replace(/\D/g,'');if(n.startsWith('0'))n='90'+n.slice(1);else if(n.length===10)n='90'+n;return n};
const SITE={phone:'905443601619',wa:'905443601619',instagram:'',agents:AGENTS};
async function loadSettings(){try{const s=await fetch('/api/settings').then(r=>r.json());if(s&&s.phone){SITE.phone=s.phone;SITE.wa=s.wa||s.phone;SITE.instagram=s.instagram||'';if(s.agents&&Object.keys(s.agents).length)AGENTS=SITE.agents=s.agents}}catch{}}
const PH='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="#e1e5e3"/><text x="400" y="310" font-size="36" fill="#8a948f" text-anchor="middle" font-family="sans-serif">Fotoğraf yok</text></svg>');
