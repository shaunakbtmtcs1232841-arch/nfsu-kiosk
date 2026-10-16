import {randomUUID} from 'node:crypto';
import {build} from './sip/sip2.js';
export class Sessions {
 constructor(sip, seconds=90){this.sip=sip;this.seconds=Number(seconds);this.map=new Map();this.timer=setInterval(()=>this.expire(),1000);this.timer.unref?.();}
 create(patronId){const token=randomUUID();this.map.set(token,{patronId,expires:Date.now()+this.seconds*1000});return token;}
 get(token){const s=this.map.get(token);if(!s)return null;s.expires=Date.now()+this.seconds*1000;return s.patronId;}
 async end(token){const s=this.map.get(token);this.map.delete(token);if(s)try{await this.sip.request(build.endPatronSession(s.patronId,this.sip.institution));}catch{}}
 async expire(){for(const [t,s] of this.map)if(s.expires<Date.now())await this.end(t);}
}
