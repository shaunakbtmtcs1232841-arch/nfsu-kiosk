import net from 'node:net';
import {parse,addChecksum} from './sip/sip2.js';
const patrons={'NFSU2026001':'Aarav Shah','NFSU2026002':'Priya Patel','NFSU2026099':'Blocked User'};
const items={'NFSU-B-0001':'Forensic Science Handbook','NFSU-B-0002':'Digital Forensics and Incident Response','NFSU-B-0003':'Principles of Toxicology','NFSU-B-0004':'Fingerprint Analysis','NFSU-B-0005':'Cyber Crime Investigation'};
const loans=new Map([['NFSU2026002',new Map([['NFSU-B-0005','20261010    235900']])]]);
const date=()=>{const d=new Date(Date.now()+14*864e5);return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}    235900`;};
const vf=(k,v)=>`${k}${v}|`;
function respond(m){const p=parse(m),field=(code)=>m.match(new RegExp(code+'([^|]*)\\|'))?.[1]||'',id=p.patronId||p.AA||field('AA'),item=p.itemId||p.AB||field('AB'),cs=process.env.SIP_USE_CHECKSUM==='true';let out;
 switch(p.type){case '93':out='941';break;case '99':out='98Y'+date();out+=vf('AO','NFSU')+vf('BX','YYYYYYYYYYYYYYYYYYYY');break;
 case '63':{const l=loans.get(id)||new Map();const blocked=id==='NFSU2026099';out=`64${blocked?'YNNNNNNNNNNNNN':'NNNNNNNNNNNNNN'}001${date()}${'0000'}${id==='NFSU2026002'?'0001':'0000'}${String(l.size).padStart(4,'0')}000000000000`;out+=vf('AA',id)+vf('AE',patrons[id]||'')+vf('BL',patrons[id]?'Y':'N')+vf('CQ','Y')+vf('BV','0.00');for(const [x,d] of l){out+=vf('AU',x)+vf('AH',d)+vf('AJ',items[x]||'');}break;}
 case '23':out='24Y';break;
 case '11':{const l=loans.get(id)||new Map();if(!patrons[id])out='120N'+'N'+'N'+'N'+date()+vf('AF','Invalid patron');else if(id==='NFSU2026099')out='120N'+'N'+'N'+'N'+date()+vf('AF','Account blocked');else if(!items[item])out='120N'+'N'+'N'+'N'+date()+vf('AF','Item not found');else if([...loans.values()].some(x=>x.has(item)&&!l.has(item)))out='120N'+'N'+'N'+'N'+date()+vf('AF','Item already checked out');else{l.set(item,date());loans.set(id,l);out='121NNY20261016    140530'+vf('AH',date())+vf('AJ',items[item]);}break;}
 case '09':{let found=false;for(const l of loans.values())if(l.delete(item))found=true;out='101NNN'+'N'+date()+vf('AJ',items[item]||'')+vf('AF',found?'':'Item was not checked out');break;}
 case '29':{const l=loans.get(id)||new Map();if(l.has(item)){l.set(item,date());out='301'+date()+vf('AH',date())+vf('AJ',items[item]||'');}else out='300'+date()+vf('AF','Item is not checked out by this patron');break;}
 case '17':{const charged=[...loans.values()].some(l=>l.has(item));out=`18${charged?'04':'03'}0000${date()}${vf('AB',item)}${vf('AJ',items[item]||'')}${charged?vf('AH',date()):''}`;break;}
 case '35':out='36';break;default:out='96';}
 return cs?addChecksum(out,0):out+'\r'; }
net.createServer(s=>{s.setEncoding('utf8');let b='';s.on('data',d=>{b+=d;let i;while((i=b.indexOf('\r'))>=0){const m=b.slice(0,i+1);b=b.slice(i+1);console.log('SIP IN:',m.trim().replace(/CO[^|]*/,'CO***'));const r=respond(m);console.log('SIP OUT:',r.trim());s.write(r);}});}).listen(6601,'127.0.0.1',()=>console.log('Mock SIP2 listening on 127.0.0.1:6601'));
