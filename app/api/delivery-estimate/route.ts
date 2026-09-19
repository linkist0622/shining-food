import {validDeliveryAddress} from '@/lib/delivery';
import {lookupDelivery} from '@/lib/delivery-service';
export const runtime='nodejs';
export const maxDuration=20;
const respond=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
let activeRequests=0;
export async function POST(request:Request){
 const origin=request.headers.get('origin');
 // Next.js can use an internal hostname in request.url behind its proxy.
 const url=new URL(request.url);
 const host=request.headers.get('host')||url.host;
 const protocol=request.headers.get('x-forwarded-proto')||url.protocol.slice(0,-1);
 if(!origin||origin!==`${protocol}://${host}`)return respond({error:'このサイトの住所入力欄から確認してください。'},403);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return respond({error:'入力形式を確認してください。'},415);
 if(Number(request.headers.get('content-length'))>2048)return respond({error:'住所が長すぎます。'},413);
 let address:unknown;
 try{const raw=await request.text();if(raw.length>2048)return respond({error:'住所が長すぎます。'},413);address=JSON.parse(raw).address;}catch{return respond({error:'住所を確認してください。'},400);}
 if(!validDeliveryAddress(address))return respond({address:typeof address==='string'?address.slice(0,160):'',status:'needs_review',reason:'incomplete',checkedAt:Date.now()});
 // Per-instance concurrency protection, not a global billing quota.
 if(activeRequests>=3)return respond({address,status:'unavailable',reason:'network',checkedAt:Date.now()},429);
 const key=process.env.GOOGLE_MAPS_ROUTES_API_KEY;
 activeRequests++;
 try{return respond(await lookupDelivery(address,typeof key==='string'?key:undefined));}
 finally{activeRequests--;}
}
