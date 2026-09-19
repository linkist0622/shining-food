import {strict as assert} from 'node:assert';
import {parseRoute,lookupDelivery} from '../lib/delivery-service.ts';
import {DELIVERY_ORIGIN,deliveryTimes,japanTime,arrivalTime,freshDeliveryCheck,isDeliveryCheck,validDeliveryAddress} from '../lib/delivery.ts';
import {initialState,demoScenario,reduceDemo,referenceFee,consultationReasons} from '../lib/demo.ts';

const now=Date.parse('2026-09-19T00:00:00Z'),address='検証用住所1-2-3';
const precise={type:['street_address'],placeId:'test-place'};
function route(km=2){return {geocodingResults:{origin:{...precise},destination:{...precise}},routes:[{duration:'1201s',distanceMeters:Math.max(3500,km*1300),legs:[{startLocation:{latLng:{latitude:36,longitude:138}},endLocation:{latLng:{latitude:36+km/6371.0088*180/Math.PI,longitude:138}}}]}]};}
const inside=parseRoute(address,route(),now);
assert.equal(inside.status,'inside');assert.equal(inside.driveMinutes,21);
const times=deliveryTimes(inside,now);
assert.equal(times.totalMinutes,41);assert.equal(times.arrivesAt,Date.parse('2026-09-19T00:41:00Z'));
assert.equal(japanTime(times.orderAt),'09:00');assert.equal(arrivalTime(times.arrivesAt,times.orderAt),'09:41');
const midnight=deliveryTimes(inside,Date.parse('2026-09-19T14:50:00Z'));
assert.match(arrivalTime(midnight.arrivesAt,midnight.orderAt),/9\/20.*00:31/);
for(const km of [5,10,4.95,9.95])assert.equal(parseRoute(address,route(km),now).reason,'boundary');
assert.equal(parseRoute(address,route(10.11),now).status,'outside');
for(const endpoint of ['origin','destination']){
 const partial=route();partial.geocodingResults[endpoint].partialMatch=true;
 assert.equal(parseRoute(address,partial,now).reason,'imprecise');
 const locality=route();locality.geocodingResults[endpoint].type=['locality','political'];
 assert.equal(parseRoute(address,locality,now).reason,'imprecise');
}
for(const bad of [{routes:[]},{...route(),fallbackInfo:{}}, {...route(),geocodingResults:{}}])assert.equal(deliveryTimes(parseRoute(address,bad,now),now),null);
for(const duration of ['-12s','Infinitys','abc','12 minutes']){const bad=route();bad.routes[0].duration=duration;assert.equal(parseRoute(address,bad,now).reason,'no_route');}
const invalid=route();invalid.routes[0].legs[0].endLocation.latLng.latitude=NaN;assert.equal(parseRoute(address,invalid,now).reason,'no_route');
assert.equal(freshDeliveryCheck(inside,address,now+901000),null);
assert.equal(freshDeliveryCheck(inside,'別住所',now),null);
assert.equal(freshDeliveryCheck(inside,address,now-1),null);
assert.ok(isDeliveryCheck(inside));assert.ok(!isDeliveryCheck({...inside,driveMinutes:-1}));assert.ok(!isDeliveryCheck({status:'inside'}));
assert.ok(!validDeliveryAddress('群馬県'));assert.ok(!validDeliveryAddress('a'.repeat(161)));assert.ok(validDeliveryAddress(DELIVERY_ORIGIN.address));

let calls=0;
const unavailable=await lookupDelivery(address,undefined,async()=>{calls++;throw new Error('should not call');},now);
assert.equal(unavailable.reason,'not_configured');assert.equal(calls,0);assert.equal(deliveryTimes(unavailable,now),null);
const found=await lookupDelivery(address,'test-only-key',async(url,init)=>{
 calls++;assert.equal(url,'https://routes.googleapis.com/directions/v2:computeRoutes');assert.equal(init.method,'POST');
 const body=JSON.parse(init.body);assert.equal(body.origin.address,DELIVERY_ORIGIN.address);assert.equal(body.destination.address,address);assert.equal(body.travelMode,'DRIVE');assert.equal(body.routingPreference,'TRAFFIC_UNAWARE');assert.equal('departureTime' in body,false);
 return Response.json(route());
});
assert.equal(found.status,'inside');assert.equal(calls,1);
assert.equal((await lookupDelivery(address,'test-only-key',async()=>new Response('',{status:403}))).reason,'network');
assert.equal((await lookupDelivery(address,'test-only-key',async()=>{throw new Error('network');})).reason,'network');

assert.equal(initialState().draft.destType,'address');
let s=reduceDemo(demoScenario(1),{type:'edit',patch:{destType:'address',destId:'',address,meeting:'建物入口',handoff:true,deliveryTiming:'asap'}});
const fresh={...inside,checkedAt:Date.now()};
s=reduceDemo(s,{type:'edit',patch:{deliveryCheck:fresh}});
assert.equal(referenceFee(s.draft),1000);assert.ok(consultationReasons(s.draft).length);
const distant={...fresh,straightKm:6};assert.equal(referenceFee({...s.draft,deliveryCheck:distant}),2000);
assert.equal(referenceFee({...s.draft,fulfillment:'takeout'}),0);assert.equal(referenceFee({...s.draft,cart:{bowl:9}}),0);
const submitted=reduceDemo(s,{type:'submit',at:fresh.checkedAt});assert.equal(submitted.orderedAt,fresh.checkedAt);assert.equal(submitted.status,'review');
assert.equal(reduceDemo(submitted,{type:'edit',patch:{deliveryCheck:fresh}}),submitted);
for(const patch of [{address:'別の住所4-5-6'},{destType:'facility'},{fulfillment:'takeout'},{kind:'bbq'}]){
 const changed=reduceDemo(s,{type:'edit',patch});assert.equal(changed.draft.deliveryCheck,null);assert.equal(changed.orderedAt,null);
}
const changed=reduceDemo(s,{type:'edit',patch:{address:'別の住所4-5-6'}});
assert.equal(reduceDemo(changed,{type:'edit',patch:{deliveryCheck:fresh}}),changed);
assert.equal(reduceDemo(submitted,{type:'reset'}).orderedAt,null);
console.log('PASS: Conservative route validation, 5/10 km boundaries, missing key/no fabricated ETA, real provider request shape, 20-minute cooking addition, JST/date rollover, address invalidation and frozen order timestamp.');

// Submitted orders retain their fee reference at the actual submission time.
const oldDistant={...s.draft,deliveryCheck:{...distant,checkedAt:now}};
assert.equal(referenceFee(oldDistant,now),2000);
assert.equal(referenceFee(oldDistant,now+901000),1000);
const historicalOrder=reduceDemo({...s,draft:oldDistant},{type:'submit',at:now});
assert.equal(referenceFee(historicalOrder.draft,historicalOrder.orderedAt),2000);
