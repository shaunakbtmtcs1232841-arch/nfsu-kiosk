const z2 = n => String(n).padStart(2,'0');
export function sipDate(date=new Date()) { return `${date.getFullYear()}${z2(date.getMonth()+1)}${z2(date.getDate())}    ${z2(date.getHours())}${z2(date.getMinutes())}${z2(date.getSeconds())}`; }
export function checksum(s) { return ((-Array.from(s).reduce((a,c)=>a+c.charCodeAt(0),0))&0xffff).toString(16).toUpperCase().padStart(4,'0'); }
export function addChecksum(msg, seq=0) { const base=msg.replace(/\r?$/,'')+`AY${seq%10}AZ`; return base+checksum(base)+'\r'; }
export function verifyChecksum(msg) { const m=msg.match(/AY[0-9]AZ([0-9A-Fa-f]{4})\r?$/); return !m || checksum(msg.slice(0,-5))===m[1].toUpperCase(); }
const v=(code,value='')=>`${code}${value}|`;
export const build={
 login:(user,pass,loc,seq=0,cs=false)=>finish(`9300CN${user}|CO${pass}|CP${loc}|`,seq,cs),
 scStatus:(seq=0,cs=false)=>finish('9900802.00',seq,cs),
 patronInformation:(id,pw='',seq=0,cs=false)=>finish(`63001${'NNYNNNNNNN'}AA${id}|${pw?`AD${pw}|`:''}`,seq,cs),
 patronStatus:(id,pw='',seq=0,cs=false)=>finish(`23001${sipDate()}AA${id}|${pw?`AD${pw}|`:''}`,seq,cs),
 checkout:(id,item,loc,term='',seq=0,cs=false)=>finish(`11NN${sipDate()}                  ${sipDate()}${v('AO',loc)}${v('AA',id)}${v('AB',item)}${v('AC',term)}${v('AD','')}`,seq,cs),
 checkin:(item,loc,term='',seq=0,cs=false)=>finish(`09N${sipDate()}${v('AP',loc)}${v('AO',loc)}${v('AB',item)}${v('AC',term)}`,seq,cs),
 renew:(id,item,loc,term='',seq=0,cs=false)=>finish(`29NN${sipDate()}${sipDate()}${v('AO',loc)}${v('AA',id)}${v('AB',item)}${v('AC',term)}`,seq,cs),
 itemInformation:(item,loc,seq=0,cs=false)=>finish(`17${sipDate()}${v('AO',loc)}${v('AB',item)}`,seq,cs),
 endPatronSession:(id,seq=0,cs=false)=>finish(`35${v('AA',id)}`,seq,cs)
};
function finish(m,s,c){return c?addChecksum(m,s):m+'\r';}
const fixed={12:[['ok',1],['renewalOk',1],['magneticMedia',1],['desensitize',1],['date',18]],10:[['ok',1],['resensitize',1],['magneticMedia',1],['alert',1],['date',18]],64:[['patronStatus',14],['language',3],['date',18],['holdCount',4],['overdueCount',4],['chargedCount',4],['fineCount',4],['recallCount',4],['unavailableCount',4]],18:[['circulationStatus',2],['securityMarker',2],['feeType',2],['date',18]],98:[['ok',1],['date',18]]};
const names={AA:'patronId',AB:'itemId',AU:'itemId',AE:'personalName',AF:'screenMessage',AG:'printLine',AH:'dueDate',AJ:'title',AQ:'permanentLocation',BL:'validPatron',CQ:'validPatronPassword',BV:'feeAmount',BE:'email',CL:'sortBin'};
const multi=new Set(['AU','AS','AT','AF']);
export function parse(msg){msg=msg.replace(/[\r\n]+$/,''); const type=msg.slice(0,2), out={type}; let pos=2;
 if(fixed[type]) for(const [k,n] of fixed[type]){out[k]=msg.slice(pos,pos+n);pos+=n;}
 const tail=msg.slice(pos).replace(/AY[0-9]AZ[0-9A-Fa-f]{4}$/,''); const re=/([A-Z0-9]{2})([^|]*)\|/g; let m; while((m=re.exec(tail))){const key=names[m[1]]||m[1]; if(multi.has(m[1]))(out[key]??=[]).push(m[2]); else out[key]=m[2];}
 if(type==='64') out.blocked=/Y/.test(out.patronStatus?.slice(0,6)||'');
 if(type==='94') {out.ok=msg[2]||'';}
 if(type==='98') {out.ok=msg[2]||'';}
 if(type==='24') {out.ok=msg[2]||'';}
 return out;
}
export function parseAndVerify(msg){ if(/AY[0-9]AZ[0-9A-Fa-f]{4}\r?$/.test(msg)&&!verifyChecksum(msg)) throw new Error('SIP checksum mismatch'); return parse(msg); }
