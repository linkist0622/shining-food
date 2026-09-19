export const DELIVERY_ORIGIN={name:'SHINING resort',address:'日本、群馬県吾妻郡嬬恋村鎌原1053-8599',mapUrl:'https://maps.app.goo.gl/YhdZXmRqpHyoBCk27?g_st=ic'};
export const DELIVERY_RADIUS_KM=10;
export const COOKING_MINUTES=20;
export const ESTIMATE_VALID_MS=15*60*1000;
export type Coordinates={latitude:number;longitude:number};
export type DeliveryCheck={address:string;status:'inside'|'outside'|'needs_review'|'unavailable';reason:'distance'|'boundary'|'imprecise'|'incomplete'|'not_configured'|'network'|'timeout'|'no_route';straightKm?:number;roadKm?:number;driveMinutes?:number;checkedAt:number;warnings?:string[]};
export function isDeliveryCheck(value:unknown):value is DeliveryCheck{
 if(!value||typeof value!=='object')return false;
 const v=value as Record<string,unknown>;
 if(typeof v.address!=='string'||typeof v.status!=='string'||!['inside','outside','needs_review','unavailable'].includes(v.status)||typeof v.reason!=='string'||!['distance','boundary','imprecise','incomplete','not_configured','network','timeout','no_route'].includes(v.reason)||typeof v.checkedAt!=='number'||!Number.isFinite(v.checkedAt))return false;
 for(const key of ['straightKm','roadKm','driveMinutes'])if(v[key]!==undefined&&(typeof v[key]!=='number'||!Number.isFinite(v[key])||v[key]<0))return false;
 if(['inside','outside'].includes(v.status)&&['straightKm','roadKm','driveMinutes'].some(key=>v[key]===undefined))return false;
 return v.warnings===undefined||(Array.isArray(v.warnings)&&v.warnings.length<=5&&v.warnings.every(x=>typeof x==='string'));
}
export function straightLineKm(a:Coordinates,b:Coordinates){
 const rad=Math.PI/180,dLat=(b.latitude-a.latitude)*rad,dLng=(b.longitude-a.longitude)*rad;
 const h=Math.sin(dLat/2)**2+Math.cos(a.latitude*rad)*Math.cos(b.latitude*rad)*Math.sin(dLng/2)**2;
 return 6371.0088*2*Math.asin(Math.sqrt(Math.min(1,Math.max(0,h))));
}
export function validDeliveryAddress(address:unknown):address is string{
 return typeof address==='string'&&address.trim().length>=7&&address.length<=160&&/[0-9０-９一二三四五六七八九十]/.test(address)&&!/[\u0000-\u001f]/.test(address);
}
export function freshDeliveryCheck(check:DeliveryCheck|null|undefined,address:string,now=Date.now()){
 return check?.address===address&&check.checkedAt<=now&&now-check.checkedAt<=ESTIMATE_VALID_MS?check:null;
}
export function deliveryTimes(check:DeliveryCheck|null,orderAt:number){
 if(!check||check.status!=='inside'||!Number.isFinite(check.driveMinutes)||check.driveMinutes!<0)return null;
 const totalMinutes=COOKING_MINUTES+check.driveMinutes!;
 return {orderAt,arrivesAt:orderAt+totalMinutes*60000,totalMinutes,driveMinutes:check.driveMinutes!};
}
export function japanTime(time:number,withDate=false){
 return new Intl.DateTimeFormat('ja-JP',{timeZone:'Asia/Tokyo',hour:'2-digit',minute:'2-digit',hourCycle:'h23',...(withDate?{month:'numeric',day:'numeric'}:{})}).format(time);
}
export function arrivalTime(arrivesAt:number,orderAt:number){
 const day=(n:number)=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(n);
 return japanTime(arrivesAt,day(arrivesAt)!==day(orderAt));
}
export function deliveryCheckText(result:DeliveryCheck){
 const distance=result.straightKm===undefined?'':`経路の起終点間は直線で約${result.straightKm.toFixed(1)}kmです。`;
 if(result.status==='inside')return {title:'配達エリアの目安内です',detail:`${distance}道路状況・商品・受付枠を店舗で確認してご案内します。`};
 if(result.status==='outside')return {title:'通常の配達エリアを超えています',detail:`${distance}このまま店舗へご相談いただけます。テイクアウトもお選びいただけます。`};
 if(result.reason==='boundary')return {title:'配達範囲・送料の境界付近です',detail:`${distance}正確な場所と配達料を店舗で確認します。`};
 if(result.reason==='incomplete')return {title:'住所を番地まで入力してください',detail:'都道府県・市町村・番地を入力してください。建物名や部屋番号は待ち合わせ欄にご記入ください。'};
 if(result.reason==='not_configured')return {title:'自動確認は準備中です',detail:'現在は店舗が配達範囲とお届け時間を確認します。住所と待ち合わせ場所を入力し、このままご相談ください。'};
 if(result.reason==='network'||result.reason==='timeout')return {title:'経路を確認できませんでした',detail:'通信状況を確認して、もう一度お試しください。このまま店舗へご相談いただくこともできます。'};
 return {title:'住所・車の経路の確認が必要です',detail:'番地までの住所を見直して再確認するか、このまま店舗へご相談ください。建物名・部屋番号は待ち合わせ欄にご記入ください。'};
}
