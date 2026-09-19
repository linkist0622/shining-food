import {strict as assert} from 'node:assert';
import {initialState,demoScenario,reduceDemo,validation,consultationReasons,subtotal,pilotSlots,canPay,products,referenceFee,MINIMUM_ORDER_AMOUNT,minimumOrderShortfall,destination,destinationLabel,pilotDestinations,isImmediateDelivery,requiresSchedule,scheduleLabel,tomorrow} from '../lib/demo.ts';
const act=reduceDemo;
const ready=id=>act(demoScenario(id),{type:'edit',patch:{handoff:true}});
const normalReady=()=>act(ready(1),{type:'edit',patch:{destType:'address',destId:'',address:'検証用住所',meeting:'玄関前',range:'verified'}});
function payment(s,method='card'){s=act(s,{type:'select_payment',method});s=act(s,{type:'start_payment',attemptId:'a'});assert.equal(act(s,{type:'start_payment',attemptId:'b'}),s);return act(s,{type:'finish_payment',attemptId:'a',revision:s.revision,success:true});}
for(const id of [1,2,3]){let s=ready(id);assert.deepEqual(validation(s.draft),[]);s=act(s,{type:'submit'});assert.equal(s.status,'review');assert.equal(canPay(s),false);assert.equal(act(s,{type:'approve'}),s);s=act(s,{type:'quote',fee:1000,note:'受渡し条件を確認'});assert.equal(s.status,'quoted');s=act(s,{type:'accept'});s=payment(s);assert.equal(s.status,'confirmed');assert.equal(canPay(s),false);assert.equal(payment(s),s);}
let approved=act(ready(4),{type:'submit'});assert.equal(canPay(approved),false);approved=act(approved,{type:'quote',fee:2000,note:'確認条件'});assert.equal(approved.status,'quoted');assert.equal(approved.quote.total,6800);assert.equal(canPay(approved),false);approved=act(approved,{type:'accept'});assert.equal(payment(approved,'paypay').status,'confirmed');
let declined=act(act(ready(5),{type:'submit'}),{type:'decline',reason:'配送枠不足'});assert.equal(declined.status,'declined');assert.equal(canPay(declined),false);for(const mode of ['takeout','date','place']){const alt=act(declined,{type:'alternative',mode});assert.equal(alt.status,'draft');assert.equal(alt.quote,null);assert.equal(alt.draft.handoff,false);assert.equal(canPay(alt),false);}
let bbq=ready(6);assert.equal(subtotal(bbq.draft),16800);bbq=act(bbq,{type:'submit'});assert.equal(bbq.status,'review');assert.equal(act(bbq,{type:'approve'}),bbq);bbq=act(bbq,{type:'quote',fee:800,note:'本人受渡し'});assert.equal(canPay(bbq),false);assert.equal(payment(act(bbq,{type:'accept'})).status,'confirmed');
for(const field of [{cart:{bowl:3}},{date:'2028-01-01'},{destId:'F-002'},{people:7},{time:'18:00–18:30'}]){const stale=act(approved,{type:'edit',patch:field});assert.equal(stale.quote,null);assert.equal(stale.payment.method,'');assert.equal(canPay(stale),false);}
for(const patch of [{kitchen:false},{driver:false},{productReady:false},{special:true},{cart:{bowl:8}}]){const s=act(ready(1),{type:'edit',patch});assert.ok(consultationReasons(s.draft).length);assert.equal(act(act(s,{type:'submit'}),{type:'approve'}).status,'review');}
for(const id of pilotSlots){const s=act(ready(1),{type:'edit',patch:{destId:id,destType:pilotDestinations.find(f=>f.id===id).type}});assert.deepEqual(validation(s.draft),[]);assert.ok(consultationReasons(s.draft).length);assert.equal(act(act(s,{type:'submit'}),{type:'approve'}).status,'review');}
let q=act(normalReady(),{type:'submit'});q=act(q,{type:'ask',question:'何時に到着できますか？'});assert.equal(q.status,'awaiting_answer');assert.equal(canPay(q),false);q=act(q,{type:'answer',answer:'17時です'});assert.equal(q.status,'review');q=act(q,{type:'approve'});q=act(q,{type:'select_payment',method:'apple_pay'});q=act(q,{type:'start_payment',attemptId:'failed'});q=act(q,{type:'finish_payment',attemptId:'failed',revision:q.revision,success:false});assert.equal(q.status,'payment');assert.equal(q.payment.phase,'failed');q=payment(q,'google_pay');assert.equal(q.status,'confirmed');
let inflight=act(approved,{type:'select_payment',method:'card'});inflight=act(inflight,{type:'start_payment',attemptId:'late'});const cleared=act(inflight,{type:'reset'});assert.deepEqual(cleared,initialState());assert.equal(act(cleared,{type:'finish_payment',attemptId:'late',revision:inflight.revision,success:true}),cleared);
assert.ok(validation({...ready(1).draft,cart:{soup:1}}).length);assert.ok(validation({...ready(6).draft,people:0}).length);assert.equal(act(initialState(),{type:'submit'}).status,'draft');
console.log('PASS: Six order paths; all 12 provisional facilities; all payment candidates; failure/retry; duplicate and stale completion guards; quote invalidation; additional questions; decline alternatives; complete reset; channel/input gates.');

assert.equal(referenceFee(ready(1).draft),1000);assert.equal(referenceFee(ready(4).draft),2000);assert.equal(referenceFee(ready(6).draft),0);assert.equal(products.filter(p=>p.groupId).length,40);

// User clarified: only delivery has a minimum; takeout is exempt for meals and BBQ.
assert.equal(MINIMUM_ORDER_AMOUNT,3980);
for(const fulfillment of ['delivery','takeout']){
 const below={...ready(1).draft,fulfillment,cart:{bowl:3}};
 assert.equal(subtotal(below),3600);
 assert.equal(minimumOrderShortfall(below),fulfillment==='delivery'?380:0);
 if(fulfillment==='delivery')assert.ok(subtotal(below)+referenceFee(below)>MINIMUM_ORDER_AMOUNT);
 assert.equal(validation(below).some(e=>e.includes('最低注文金額')),fulfillment==='delivery');
 assert.equal(act({...ready(1),draft:below},{type:'submit'}).status,fulfillment==='delivery'?'draft':'review');
 const above={...below,cart:{bowl:4}};
 assert.equal(act({...ready(1),draft:above},{type:'submit'}).status,'review');
 const smallBbq={...ready(6).draft,fulfillment,people:1};
 assert.equal(act({...ready(6),draft:smallBbq},{type:'submit'}).status,fulfillment==='delivery'?'draft':'review');
 assert.equal(act({...ready(6),draft:{...smallBbq,people:2}},{type:'submit'}).status,'review');
}
// Use the configurable preview catalog price to exercise the exact delivery boundary.
const boundaryProduct=products.find(p=>p.id==='bowl');
const originalPrice=boundaryProduct.price;
try {
 for(const [amount,allowed] of [[3979,false],[3980,true],[3981,true]]){
  boundaryProduct.price=amount;
  const s=act(ready(1),{type:'edit',patch:{cart:{bowl:1}}});
  assert.equal(subtotal(s.draft),amount);
  assert.equal(validation(s.draft).some(e=>e.includes('最低注文金額')),!allowed);
  assert.equal(act(s,{type:'submit'}).status,allowed?'review':'draft');
 }
} finally {boundaryProduct.price=originalPrice;}
const smallTakeout=act(ready(1),{type:'edit',patch:{fulfillment:'takeout',cart:{soup:1}}});
assert.deepEqual(validation(smallTakeout.draft),[]);
assert.equal(act(smallTakeout,{type:'submit'}).status,'review');
const changedToDelivery=act(smallTakeout,{type:'edit',patch:{fulfillment:'delivery',cart:{bowl:1}}});
assert.equal(act(changedToDelivery,{type:'submit'}).status,'draft');
assert.equal(act(act(changedToDelivery,{type:'edit',patch:{fulfillment:'takeout'}}),{type:'submit'}).status,'review');
assert.ok(validation({...smallTakeout.draft,cart:{}}).length);
// A prior quote cannot survive a quantity change below the minimum.
const reduced=act(approved,{type:'edit',patch:{cart:{bowl:1}}});
assert.equal(reduced.quote,null);
assert.equal(canPay(reduced),false);
assert.equal(act(reduced,{type:'submit'}).status,'draft');
console.log('PASS: Delivery-only minimum; takeout exempt including 450 yen orders; switching fulfillment; shipping excluded; 3,979/3,980/3,981 yen boundaries; quote invalidation.');

// The registry and order summary use source-backed names, with all permissions still unverified.
assert.equal(pilotDestinations.length,12);
assert.equal(new Set(pilotDestinations.map(f=>f.name)).size,12);
for(const f of pilotDestinations){
 const draft={...ready(1).draft,destId:f.id,destType:f.type};
 assert.equal(destinationLabel(draft),f.name);
 assert.equal(destination(draft).verified,false);
 assert.ok(!f.name.includes(f.id));
 assert.ok(consultationReasons(draft).length);
}
assert.equal(pilotDestinations.find(f=>f.id==='F-012').type,'villa');
console.log('PASS: All 12 named facilities; names carried to order details; unverified delivery permissions retained.');


// ASAP is the initial choice for meal delivery only; scheduled orders still need a date/time.
assert.equal(initialState().draft.deliveryTiming,'asap');
assert.equal(isImmediateDelivery(initialState().draft),true);
const asap=act(ready(1),{type:'edit',patch:{deliveryTiming:'asap'}});
assert.equal(asap.draft.date,'');assert.equal(asap.draft.time,'');
assert.deepEqual(validation(asap.draft),[]);
assert.equal(act(asap,{type:'submit'}).status,'review');
assert.ok(scheduleLabel(asap.draft).includes('できるだけ早く'));
let scheduled=act(asap,{type:'edit',patch:{deliveryTiming:'scheduled'}});
assert.equal(requiresSchedule(scheduled.draft),true);
assert.ok(validation(scheduled.draft).some(e=>e.includes('希望日')));
assert.ok(validation(scheduled.draft).some(e=>e.includes('希望時間')));
assert.equal(act(scheduled,{type:'submit'}).status,'draft');
scheduled=act(scheduled,{type:'edit',patch:{date:tomorrow(),time:'17:30–18:00'}});
assert.deepEqual(validation(scheduled.draft),[]);
assert.equal(act(scheduled,{type:'submit'}).status,'review');
assert.equal(scheduleLabel(scheduled.draft),`${tomorrow()} / 17:30–18:00`);
assert.ok(validation({...scheduled.draft,date:'2026-02-30'}).some(e=>e.includes('希望日')));
assert.ok(validation({...scheduled.draft,deliveryTiming:'invalid'}).some(e=>e.includes('タイミング')));
for(const patch of [{fulfillment:'takeout'},{kind:'bbq'}]){
 const s=act(asap,{type:'edit',patch});
 assert.equal(requiresSchedule(s.draft),true);
 assert.ok(validation(s.draft).some(e=>e.includes('希望日')));
 assert.equal(act(s,{type:'submit'}).status,'draft');
}
const dateAlternative=act(asap,{type:'alternative',mode:'date'});
assert.equal(dateAlternative.draft.deliveryTiming,'scheduled');
assert.equal(requiresSchedule(dateAlternative.draft),true);
let asapQuoted=act(act(asap,{type:'submit'}),{type:'quote',fee:1000,note:'お届け目安を確認'});
asapQuoted=act(asapQuoted,{type:'accept'});
asapQuoted=act(asapQuoted,{type:'select_payment',method:'card'});
asapQuoted=act(asapQuoted,{type:'start_payment',attemptId:'timing-change'});
const changedTiming=act(asapQuoted,{type:'edit',patch:{deliveryTiming:'scheduled'}});
assert.equal(changedTiming.quote,null);assert.equal(canPay(changedTiming),false);
assert.equal(act(changedTiming,{type:'finish_payment',attemptId:'timing-change',revision:asapQuoted.revision,success:true}),changedTiming);
const immediateAgain=act(scheduled,{type:'edit',patch:{deliveryTiming:'asap'}});
assert.equal(immediateAgain.draft.date,'');assert.equal(immediateAgain.draft.time,'');
assert.deepEqual(validation(immediateAgain.draft),[]);
console.log('PASS: ASAP delivery defaults and summaries; scheduled-only date gates; takeout/BBQ scheduling; alternate date path; stale quote/payment invalidation.');
