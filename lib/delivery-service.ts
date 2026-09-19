import {DELIVERY_ORIGIN,straightLineKm,type DeliveryCheck,type Coordinates} from './delivery.ts';
const isPoint=(p:unknown):p is Coordinates=>!!p&&typeof p==='object'&&'latitude' in p&&'longitude' in p&&typeof p.latitude==='number'&&typeof p.longitude==='number'&&Number.isFinite(p.latitude)&&Number.isFinite(p.longitude)&&Math.abs(p.latitude)<=90&&Math.abs(p.longitude)<=180;
type Geocoded={type?:string[];partialMatch?:boolean;placeId?:string;geocoderStatus?:{code?:number}};
type RouteResponse={geocodingResults?:{origin?:Geocoded;destination?:Geocoded};fallbackInfo?:unknown;routes?:{duration?:string;distanceMeters?:number;warnings?:string[];legs?:{startLocation?:{latLng?:Coordinates};endLocation?:{latLng?:Coordinates}}[]}[]};
function precise(p:Geocoded|undefined){return !!p&&!!p.placeId&&p.partialMatch!==true&&(!p.geocoderStatus?.code)&&p.type?.some(t=>['street_address','premise','subpremise'].includes(t));}
export function parseRoute(address:string,data:RouteResponse,now=Date.now()):DeliveryCheck{
 const base={address,checkedAt:now};
 if(!data.routes?.length)return {...base,status:'needs_review',reason:'no_route'};
 if(!precise(data.geocodingResults?.origin)||!precise(data.geocodingResults?.destination)||data.fallbackInfo)return {...base,status:'needs_review',reason:'imprecise'};
 const route=data.routes[0],legs=route.legs;
 const start=legs?.[0]?.startLocation?.latLng,end=legs?.[legs.length-1]?.endLocation?.latLng;
 if(!isPoint(start)||!isPoint(end)||typeof route.duration!=='string'||!/^\d+(\.\d+)?s$/.test(route.duration)||!Number.isFinite(route.distanceMeters)||route.distanceMeters!<0)return {...base,status:'needs_review',reason:'no_route'};
 const straightKm=straightLineKm(start,end),roadKm=route.distanceMeters!/1000,driveMinutes=Math.ceil(parseFloat(route.duration)/60);
 if(!Number.isFinite(driveMinutes)||roadKm+0.5<straightKm)return {...base,status:'needs_review',reason:'no_route'};
 const warnings=route.warnings?.filter(x=>typeof x==='string').slice(0,5);
 const result={...base,straightKm,roadKm,driveMinutes,warnings};
 // Coordinates are road-snapped. Send 100 m around fee/radius boundaries to manual review.
 if(Math.abs(straightKm-10)<=0.1||Math.abs(straightKm-5)<=0.1)return {...result,status:'needs_review',reason:'boundary'};
 return {...result,status:straightKm<=10?'inside':'outside',reason:'distance'};
}
export async function lookupDelivery(address:string,apiKey:string|undefined,fetcher:typeof fetch=fetch,now=Date.now()):Promise<DeliveryCheck>{
 const base={address,checkedAt:now};
 if(!apiKey)return {...base,status:'unavailable',reason:'not_configured'};
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),12000);
 try{
  const response=await fetcher('https://routes.googleapis.com/directions/v2:computeRoutes',{
   method:'POST',signal:controller.signal,headers:{'Content-Type':'application/json','X-Goog-Api-Key':apiKey,'X-Goog-FieldMask':'routes.duration,routes.distanceMeters,routes.legs.startLocation.latLng,routes.legs.endLocation.latLng,routes.warnings,geocodingResults,fallbackInfo'},
   body:JSON.stringify({origin:{address:DELIVERY_ORIGIN.address},destination:{address},travelMode:'DRIVE',routingPreference:'TRAFFIC_UNAWARE',computeAlternativeRoutes:false,languageCode:'ja',regionCode:'jp',units:'METRIC'}),
  });
  if(!response.ok)return {...base,status:'unavailable',reason:'network'};
  return parseRoute(address,await response.json());
 }catch{return {...base,status:'unavailable',reason:controller.signal.aborted?'timeout':'network'};}
 finally{clearTimeout(timeout);}
}
