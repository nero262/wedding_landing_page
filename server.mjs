import http from 'node:http';
import { readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { randomBytes, timingSafeEqual } from 'node:crypto';

export function createApp({dataDir='./data',adminPassword=process.env.ADMIN_PASSWORD||'',secureCookie=false}={}) {
 mkdirSync(dataDir,{recursive:true});
 const db=new DatabaseSync(path.join(dataDir,'wedding.sqlite'));
 db.exec(`PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS submissions (id TEXT PRIMARY KEY, kind TEXT NOT NULL, name TEXT NOT NULL, attendance TEXT, guests INTEGER, message TEXT NOT NULL, approved INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL);`);
 db.exec('CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY, content TEXT NOT NULL)');
 const sessions=new Map(), limits=new Map();
 const root=path.resolve(fileURLToPath(new URL('./public/',import.meta.url))); 
 const send=(res,status,value)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(value));};
 const auth=req=>{const match=(req.headers.cookie||'').match(/(?:^|;\s*)session=([a-f0-9]+)/);return match&&sessions.get(match[1])>Date.now();};
 const text=(v,max)=>typeof v==='string'&&v.trim().length<=max?v.trim():'';
 const rate=(req,key,max)=>{const bucket=Math.floor(Date.now()/600000),k=`${req.socket.remoteAddress}:${key}:${bucket}`;if(limits.size>5000)limits.clear();const n=(limits.get(k)||0)+1;limits.set(k,n);return n<=max;};
 const body=async req=>{let raw='';for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>8192)throw Error('Yêu cầu quá lớn');}return JSON.parse(raw||'{}');};
 const server=http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Frame-Options','DENY');res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
  try {
   const url=new URL(req.url,'http://localhost');
   if(['POST','DELETE','PATCH'].includes(req.method)){
    const origin=req.headers.origin;
    if(!origin||new URL(origin).host!==req.headers.host)return send(res,403,{error:'Nguồn gửi không hợp lệ'});
    if(!(req.headers['content-type']||'').includes('application/json'))return send(res,415,{error:'Cần dữ liệu JSON'});
   }
   if(req.method==='GET'&&url.pathname==='/api/content'){const saved=db.prepare('SELECT content FROM settings WHERE id=1').get();return send(res,200,saved?JSON.parse(saved.content):JSON.parse(readFileSync(path.join(root,'content.json'),'utf8')));}
   if(req.method==='GET'&&url.pathname==='/api/wishes')return send(res,200,db.prepare("SELECT id,name,message,created_at FROM submissions WHERE kind='wish' AND approved=1 ORDER BY created_at DESC LIMIT 100").all());
   if(req.method==='POST'&&['/api/rsvp','/api/wishes'].includes(url.pathname)){
    if(!rate(req,'submit',30))return send(res,429,{error:'Bạn gửi quá nhanh. Vui lòng thử lại sau.'});
    const b=await body(req),name=text(b.name,100),message=text(b.message,1000),id=text(b.id,80);
    if(b.website)return send(res,400,{error:'Yêu cầu không hợp lệ'});
    if(!name||typeof b.message!=='string'||b.message.trim().length>1000||!/^[a-zA-Z0-9-]{16,80}$/.test(id))return send(res,400,{error:'Vui lòng kiểm tra tên khách mời.'});
    const kind=url.pathname==='/api/rsvp'?'rsvp':'wish';
    if(kind==='wish'&&!message)return send(res,400,{error:'Vui lòng nhập lời chúc (tối đa 1.000 ký tự).'});
    if(kind==='rsvp'&&(!['yes','no','maybe'].includes(b.attendance)||(b.attendance==='yes'&&(!Number.isInteger(b.guests)||b.guests<1||b.guests>20))))return send(res,400,{error:'Vui lòng kiểm tra số người tham dự.'});
    const existing=db.prepare('SELECT kind FROM submissions WHERE id=?').get(id);
    if(existing&&existing.kind!==kind)return send(res,409,{error:'Mã gửi đã được sử dụng'});
    if(!existing)db.prepare('INSERT INTO submissions VALUES (?,?,?,?,?,?,0,?)').run(id,kind,name,kind==='rsvp'?b.attendance:null,kind==='rsvp'&&b.attendance==='yes'?b.guests:0,message,new Date().toISOString());
    return send(res,200,{ok:true,id,pending:kind==='wish'});
   }
   if(req.method==='POST'&&url.pathname==='/api/admin/login'){
    if(!rate(req,'login',10))return send(res,429,{error:'Vui lòng thử lại sau.'});
    const b=await body(req),a=Buffer.from(String(b.password||'')),expected=Buffer.from(adminPassword);
    if(!adminPassword||a.length!==expected.length||!timingSafeEqual(a,expected))return send(res,401,{error:'Mật khẩu không đúng hoặc quản trị chưa được cấu hình.'});
    const token=randomBytes(32).toString('hex');sessions.set(token,Date.now()+8*3600000);
    res.setHeader('Set-Cookie',`session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${secureCookie?'; Secure':''}`);return send(res,200,{ok:true});
   }
   if(url.pathname.startsWith('/api/admin/')){
    if(!auth(req))return send(res,401,{error:'Vui lòng đăng nhập.'});
    if(req.method==='POST'&&url.pathname==='/api/admin/content'){const config=await body(req);const safeUrl=u=>typeof u==='string'&&(u.startsWith('/')&&!u.startsWith('//')||/^https:\/\//.test(u));if(!config.couple||!text(config.couple.groom,100)||!text(config.couple.bride,100)||!text(config.couple.shortGroom,40)||!text(config.couple.shortBride,40)||!/^\d{4}-\d{2}-\d{2}$/.test(config.date)||!Array.isArray(config.memories)||config.memories.length<1||config.memories.length>30||config.memories.some(m=>!safeUrl(m.src)||!text(m.caption,200)||!text(m.alt,200))||!Array.isArray(config.events)||config.events.length<1||config.events.length>10||config.events.some(e=>!text(e.title,100)||!/^\d{4}-\d{2}-\d{2}$/.test(e.date)||e.time&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(e.time)||e.mapUrl&&!/^https:\/\//.test(e.mapUrl)))return send(res,400,{error:'Nội dung chưa đúng định dạng. Vui lòng kiểm tra tên, ngày, ảnh và sự kiện.'});delete config.invitations;db.prepare('INSERT INTO settings VALUES (1,?) ON CONFLICT(id) DO UPDATE SET content=excluded.content').run(JSON.stringify(config));return send(res,200,{ok:true});}
    if(req.method==='GET'&&url.pathname==='/api/admin/submissions')return send(res,200,db.prepare('SELECT * FROM submissions ORDER BY created_at DESC').all());
    if(req.method==='POST'&&url.pathname==='/api/admin/logout'){const token=(req.headers.cookie||'').match(/session=([a-f0-9]+)/)?.[1];sessions.delete(token);res.setHeader('Set-Cookie','session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');return send(res,200,{ok:true});}
    if(req.method==='PATCH'&&url.pathname.startsWith('/api/admin/wishes/')){const b=await body(req);db.prepare("UPDATE submissions SET approved=? WHERE id=? AND kind='wish'").run(b.approved?1:0,url.pathname.split('/').pop());return send(res,200,{ok:true});}
    if(req.method==='DELETE'&&url.pathname.startsWith('/api/admin/submissions/')){db.prepare('DELETE FROM submissions WHERE id=?').run(url.pathname.split('/').pop());return send(res,200,{ok:true});}
   }
   if(url.pathname.startsWith('/api/'))return send(res,404,{error:'Không tìm thấy'});
   if(req.method!=='GET'&&req.method!=='HEAD')return send(res,405,{error:'Không hỗ trợ'});
   const relative=url.pathname==='/'?'index.html':url.pathname==='/admin'?'admin.html':decodeURIComponent(url.pathname).replace(/^\/+/, '');
   const file=path.resolve(root,relative);
   if(!file.startsWith(root+path.sep))return send(res,403,{error:'Không được truy cập'});
   let bytes;try{bytes=readFileSync(file);}catch{return send(res,404,{error:'Không tìm thấy'});}
   const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png'};
   res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(req.method==='HEAD'?undefined:bytes);
  }catch{send(res,400,{error:'Không thể xử lý yêu cầu. Vui lòng thử lại.'});}
 });
 server.on('close',()=>db.close());return server;
}
if(process.argv[1]===fileURLToPath(import.meta.url))createApp({dataDir:process.env.DATA_DIR||'./data',secureCookie:process.env.SECURE_COOKIE==='true'}).listen(Number(process.env.PORT||3000),process.env.HOST||'127.0.0.1',()=>console.log('Wedding server ready'));
