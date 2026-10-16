import 'dotenv/config';
import express from 'express';import cors from 'cors';
import {SipClient} from './sip/client.js';import {Sessions} from './sessions.js';import {routes} from './routes.js';
const app=express();app.disable('x-powered-by');app.use((q,s,n)=>{s.set({'X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'no-referrer'});n();});app.use(cors({origin:'http://localhost:5173'}));app.use(express.json({limit:'32kb'}));
const sip=new SipClient(process.env),sessions=new Sessions(sip,process.env.SESSION_IDLE_SECONDS||90);let ready=false;
const hits=new Map();app.use('/api/patron/identify',(q,s,n)=>{const ip=q.ip,now=Date.now(),a=(hits.get(ip)||[]).filter(t=>now-t<10000);if(a.length>=30)return s.status(429).json({ok:false,code:'RATE_LIMIT',message:'Too many requests'});a.push(now);hits.set(ip,a);n();});
app.use('/api',routes({sip,sessions,mode:process.env.MOCK_SIP==='true'?'mock':'live'}));
app.listen(4000,'127.0.0.1',()=>console.log('NFSU kiosk API listening on http://127.0.0.1:4000'));
async function boot(){try{await sip.connect();ready=true;}catch(e){console.error('SIP startup failed:',e.message);}}
boot();
