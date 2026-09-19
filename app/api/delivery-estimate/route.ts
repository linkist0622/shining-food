import {env} from 'cloudflare:workers';
import {validDeliveryAddress} from '@/lib/delivery';
import {lookupDelivery} from '@/lib/delivery-service';
const respond=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
let activeRequests=0;
export async function POST(request:Request){
 const origin=request.headers.get('origin');
 if(!origin||![new URL(request.url).origin,'https://shining-food-owner-demo.linkist39.chatgpt.site'].includes(origin))return respond({error:'このサイトの住所入力欄から確認してください。'},403);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return respond({error:'入力形式を確認してください。'},415);
 if(Number(request.headers.get('content-length'))>2048)return respond({error:'住所が長すぎます。'},413);
 let address:unknown;
 try{const raw=await request.text();if(raw.length>2048)return respond({error:'住所が長すぎます。'},413);address=JSON.parse(raw).address;}catch{return respond({error:'住所を確認してください。'},400);}
 if(!validDeliveryAddress(address))return respond({address:typeof address==='string'?address.slice(0,160):'',status:'needs_review',reason:'incomplete',checkedAt:Date.now()});
 // Per-isolate concurrency protection, not a global billing quota.
 if(activeRequests>=3)return respond({address,status:'unavailable',reason:'network',checkedAt:Date.now()},429);
 const key=(env as Record<string,unknown>).GOOGLE_MAPS_ROUTES_API_KEY;
 activeRequests++;
 try{return respond(await lookupDelivery(address,typeof key==='string'?key:undefined));}
 finally{activeRequests--;}
}
