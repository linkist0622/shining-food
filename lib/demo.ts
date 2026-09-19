import catalog from './catalog.json' with {type:'json'};
import {freshDeliveryCheck,type DeliveryCheck} from './delivery.ts';
/** Illustrative DEMO data only. No supplier recipes, prices or approved destinations. */
export type Product = {id:string; name:string; description:string; price:number; channel:'both'|'delivery'|'takeout'; icon:string; image?:string;imageLabel?:string;category?:string;groupId?:string;recordType?:string;available?:boolean;consultationRequired?:boolean};
const illustrativeProducts:Product[] = [
 {id:'bowl',name:'彩りチキンボウル',description:'ごはんとチキン、彩り野菜をひとつのボウルに。説明用の商品です。',price:1200,channel:'both',icon:'bowl',image:'/images/rice-bowl.jpg'},
 {id:'share',name:'みんなでシェアBOX',description:'集まる日の食卓をイメージした、3〜4名向けのセット。内容は確認中。',price:3600,channel:'delivery',icon:'share',image:'/images/bbq-grill.jpg'},
 {id:'soup',name:'あったかスープカップ',description:'店舗で受け取る、あたたかなスープ。内容・アレルゲンは未確定。',price:450,channel:'takeout',icon:'soup',image:'/images/catalog/sample-soup.png'}
];
export const products:Product[] = [...illustrativeProducts,...catalog as Product[]];
export const bbqSets = [{id:'standard',name:'スタンダードセット',price:2800,description:'お肉と野菜を楽しむセット。内容量・調理方法・器材の有無は確認中。'},{id:'gather',name:'みんなで楽しむセット',price:3400,description:'集まる日の食材セットを想定。料理・付帯サービスは未確定。'}];
// Names match the pilot register 04_施設実走. Names alone do not confirm delivery permission.
export const pilotDestinations = [
 {id:'F-001',name:'軽井沢倶楽部 ホテル軽井沢1130',type:'facility'},
 {id:'F-002',name:'北軽井沢スウィートグラス',type:'facility'},
 {id:'F-003',name:'outside BASE',type:'facility'},
 {id:'F-004',name:'Holiday Villa Hotel & Suites Karuizawa',type:'facility'},
 {id:'F-005',name:'あさま空山望 KUZANBO',type:'facility'},
 {id:'F-006',name:'Dot Glamping 北軽井沢 / 浅間山キャンプ場',type:'facility'},
 {id:'F-007',name:'GLAMPEAK 北軽井沢',type:'facility'},
 {id:'F-008',name:'TAKIVIVA KITAKARUIZAWA',type:'facility'},
 {id:'F-009',name:'ゆとりろガーデン北軽井沢 with DOGS',type:'facility'},
 {id:'F-010',name:'ホテルグリーンプラザ軽井沢',type:'facility'},
 {id:'F-011',name:'ANA Holiday Inn Resort Karuizawa by IHG',type:'facility'},
 {id:'F-012',name:'浅間ハイランドパーク',type:'villa'}
].map(f=>({...f,meeting:f.type==='villa'?'管理センター前（仮）。正式な位置・受渡し場所は店舗確認後に調整します':'施設への確認後に、ご本人との待ち合わせ場所を調整します',verified:false}));
export const pilotSlots=pilotDestinations.map(f=>f.id);
export const destinations = [
 ...pilotDestinations,
 {id:'center-pending',name:'その他の管理センター（正式名称・所在地確認中）',type:'villa',meeting:'待ち合わせ場所を店舗確認後に調整します',verified:false}
];
export type Draft={kind:'meal'|'bbq';fulfillment:'delivery'|'takeout';cart:Record<string,number>;people:number;setId:string;deliveryTiming:'asap'|'scheduled';date:string;time:string;destType:'facility'|'villa'|'address';destId:string;address:string;meeting:string;range:'unverified'|'outside'|'verified';deliveryCheck:DeliveryCheck|null;kitchen:boolean;driver:boolean;productReady:boolean;special:boolean;handoff:boolean;note:string;contactName:string;contactPhone:string};
export type Quote={subtotal:number;fee:number;total:number;note:string;revision:number};
export type Status='draft'|'review'|'awaiting_answer'|'quoted'|'accepted'|'payment'|'confirmed'|'declined';
export type PaymentMethod='card'|'apple_pay'|'google_pay'|'paypay';
export type Payment={method:PaymentMethod|'';phase:'idle'|'processing'|'failed'|'succeeded';attemptId:string;revision:number};
export const blankPayment=():Payment=>({method:'',phase:'idle',attemptId:'',revision:0});
export type DemoState={draft:Draft;orderedAt:number|null;status:Status;revision:number;quote:Quote|null;reason:string;notice:string;scenario:number;history:string[];question:string;payment:Payment};
export function tomorrow(){const d=new Date();d.setDate(d.getDate()+1);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
export function blankDraft():Draft{return {kind:'meal',fulfillment:'delivery',cart:{},people:6,setId:'standard',deliveryTiming:'asap',date:'',time:'',destType:'address',destId:'',address:'',meeting:'',range:'unverified',deliveryCheck:null,kitchen:true,driver:true,productReady:true,special:false,handoff:false,note:'',contactName:'',contactPhone:''};}
export function initialState():DemoState{return {draft:blankDraft(),orderedAt:null,status:'draft',revision:1,quote:null,reason:'',notice:'',scenario:0,history:[],question:'',payment:blankPayment()};}
export function subtotal(d:Draft){return d.kind==='bbq'?(bbqSets.find(s=>s.id===d.setId)?.price??0)*d.people:products.reduce((s,p)=>s+p.price*(d.cart[p.id]??0),0);}
// User clarification, 2026-09-19: delivery only; merchandise subtotal excludes delivery fees.
export const MINIMUM_ORDER_AMOUNT=3980;
export function minimumOrderShortfall(d:Draft){return d.fulfillment==='takeout'?0:Math.max(0,MINIMUM_ORDER_AMOUNT-subtotal(d));}
export function destination(d:Draft){return destinations.find(x=>x.id===d.destId);}
export function destinationLabel(d:Draft){return d.fulfillment==='takeout'?'Cafe&Bar あさま 共通受取場所（詳細確認中）':d.destType==='address'?d.address:destination(d)?.name??'未選択';}
export function meetingLabel(d:Draft){return d.fulfillment==='takeout'?'Cafe&Bar あさまと共通の受取カウンター（位置・住所確認中）':d.destType==='address'?d.meeting:destination(d)?.meeting??'台帳の待ち合わせ場所は未読・確認中';}
export function isImmediateDelivery(d:Draft){return d.kind==='meal'&&d.fulfillment==='delivery'&&d.deliveryTiming==='asap';}
export function requiresSchedule(d:Draft){return !isImmediateDelivery(d);}
export function scheduleLabel(d:Draft){return isImmediateDelivery(d)?'できるだけ早く（お届け目安は店舗確認後にご案内）':`${d.date||'希望日未選択'} / ${d.time||'希望時間未選択'}`;}
export function validation(d:Draft):string[]{const e:string[]=[];
 if(minimumOrderShortfall(d)>0)e.push(`デリバリーの最低注文金額は商品代金${MINIMUM_ORDER_AMOUNT.toLocaleString('ja-JP')}円です（配達料を除く）。あと${minimumOrderShortfall(d).toLocaleString('ja-JP')}円分の商品を追加してください。`);
 if(d.kind==='meal'&&!products.some(p=>(d.cart[p.id]??0)>0))e.push('商品を1点以上選んでください。');
 if(d.kind==='meal'&&products.some(p=>!Number.isInteger(d.cart[p.id]??0)||(d.cart[p.id]??0)<0||(d.cart[p.id]??0)>30))e.push('商品数量は0〜30点で指定してください。');
 if(d.kind==='bbq'&&(!Number.isInteger(d.people)||d.people<1||d.people>30))e.push('BBQの人数は1〜30名で入力してください。');
 if(d.kind==='bbq'&&!bbqSets.some(s=>s.id===d.setId))e.push('BBQセットを選んでください。');
 if(d.kind==='meal'&&d.fulfillment==='delivery'&&!['asap','scheduled'].includes(d.deliveryTiming))e.push('お届けのタイミングを選んでください。');
 if(requiresSchedule(d)){
  const date=new Date(`${d.date}T12:00:00`);
  const now=new Date();now.setHours(0,0,0,0);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(d.date)||Number.isNaN(date.getTime())||date.getDate()!==Number(d.date.slice(8))||date<now)e.push('今日以降の有効な希望日を選んでください。');
  if(!['17:00–17:30','17:30–18:00','18:00–18:30'].includes(d.time))e.push('希望時間を選んでください。');
 }
 if(d.fulfillment==='delivery'){
  if(d.destType==='address'&&(!d.address.trim()||!d.meeting.trim()))e.push('住所とご本人の待ち合わせ場所を入力してください。');
  if(d.destType!=='address'&&(!destination(d)||destination(d)?.type!==d.destType))e.push('施設または管理センターを選んでください。');
 }
 if(d.kind==='meal'&&products.some(p=>(d.cart[p.id]??0)>0&&p.available===false))e.push('提供再開を確認中の商品があります。カートから外してください。');
 if(!d.contactName.trim())e.push('お名前を入力してください。');
 if(!/^\d{10,11}$/.test(d.contactPhone.replace(/[-\s]/g,'')))e.push('連絡先は10〜11桁の電話番号で入力してください。');
 if(!d.handoff)e.push('ご本人との直接受渡しを確認してください。');
 if(d.kind==='meal'&&products.some(p=>(d.cart[p.id]??0)>0&&((p.channel==='takeout'&&d.fulfillment==='delivery')||(p.channel==='delivery'&&d.fulfillment==='takeout'))))e.push('受取方法に対応しない商品があります。商品か受取方法を変更してください。');
 return e;
}
export function consultationReasons(d:Draft):string[]{const r:string[]=[];
 if(d.kind==='bbq')r.push('BBQはすべて事前相談');
 if(d.kind==='meal'&&products.some(p=>(d.cart[p.id]??0)>0&&p.consultationRequired))r.push('候補商品の提供・販売条件の確認');
 if(d.fulfillment==='delivery'){
  if(d.destType==='address'){const check=freshDeliveryCheck(d.deliveryCheck,d.address);if(check?.status==='inside')r.push('道路状況・受付枠の最終確認');else if(check?.status==='outside')r.push('通常の配達エリア外・個別相談');else if(d.range==='outside')r.push('直線10kmを超える想定');else if(d.range!=='verified')r.push('住所・道路条件が未検証');}
  else if(!destination(d)?.verified)r.push('施設・待ち合わせ条件が未検証');
  if(!d.driver)r.push('配送枠の調整が必要');
 }
 if(!d.productReady)r.push('商品の提供条件が未検証');
 if(!d.kitchen)r.push('厨房枠の調整が必要');
 if(d.kind==='meal'&&(Object.values(d.cart).reduce((a,b)=>a+b,0)>=8||subtotal(d)>=10000))r.push('数量・金額に応じた個別確認');
 if(d.special)r.push('特別なご希望の確認が必要');
 return r;
}
export function referenceFee(d:Draft,at=Date.now()){if(d.fulfillment==='takeout'||subtotal(d)>=10000)return 0;const check=d.destType==='address'?freshDeliveryCheck(d.deliveryCheck,d.address,at):null;if(check&&(check.status==='inside'||check.status==='outside')&&Number.isFinite(check.straightKm))return check.straightKm!>5?2000:1000;return d.range==='outside'&&d.destType==='address'?2000:1000;}
export function demoScenario(id:number):DemoState{const s=initialState();s.scenario=id;s.draft={...s.draft,cart:{bowl:4},deliveryTiming:'scheduled',destType:'facility',date:tomorrow(),time:'17:30–18:00',handoff:false,destId:'F-001',contactName:'確認用のお客様',contactPhone:'00000000000'};
 if(id===2)s.draft.destId='F-002';
 if(id===3){s.draft.destType='villa';s.draft.destId='F-012';}
 if(id===4||id===5){s.draft.destType='address';s.draft.destId='';s.draft.address='デモ用：範囲外エリアの住所（実在住所の入力不要）';s.draft.meeting='入口で注文者ご本人と待ち合わせ（DEMO）';s.draft.range='outside';}
 if(id===6){s.draft.kind='bbq';s.draft.cart={};s.draft.people=6;s.draft.destId='F-002';}
 s.notice='ケースを読み込みました。入力内容は操作用の仮データです。';return s;}
export type Action=
 |{type:'edit';patch:Partial<Draft>}|{type:'scenario';id:number}|{type:'reset'}|{type:'submit';at?:number}
 |{type:'approve'}|{type:'quote';fee:number;note:string}|{type:'decline';reason:string}
 |{type:'ask';question:string}|{type:'answer';answer:string}|{type:'accept'}
 |{type:'select_payment';method:PaymentMethod}|{type:'start_payment';attemptId:string}
 |{type:'finish_payment';attemptId:string;revision:number;success:boolean}
 |{type:'alternative';mode:'takeout'|'date'|'place'};
export function canPay(s:DemoState){return ['payment','accepted'].includes(s.status)&&s.quote?.revision===s.revision;}
export function reduceDemo(s:DemoState,a:Action):DemoState{
 if(a.type==='reset')return initialState();
 if(a.type==='scenario')return a.id>=1&&a.id<=6?demoScenario(a.id):s;
 if(a.type==='edit'){
  const draft={...s.draft,...a.patch};
  if(a.patch.deliveryCheck&&(s.status!=='draft'||draft.destType!=='address'||draft.fulfillment!=='delivery'||a.patch.deliveryCheck.address!==draft.address))return s;
  if(draft.address!==s.draft.address||draft.destType!==s.draft.destType||draft.destId!==s.draft.destId||draft.fulfillment!==s.draft.fulfillment||draft.kind!==s.draft.kind){draft.deliveryCheck=null;if(a.patch.range===undefined)draft.range='unverified';}
  if(isImmediateDelivery(draft)){draft.date='';draft.time='';}
  return {...s,draft,orderedAt:null,status:'draft',quote:null,payment:blankPayment(),question:'',revision:s.revision+1,reason:'',notice:s.status==='draft'?'':'条件を変更しました。見積と了承を取り消し、店舗で再確認します。'};
 }
 if(a.type==='alternative'){
  let patch:Partial<Draft>={handoff:false};
  if(a.mode==='takeout')patch={...patch,fulfillment:'takeout',kind:'meal',cart:s.draft.kind==='bbq'?{}:Object.fromEntries(products.filter(p=>p.channel!=='delivery').map(p=>[p.id,s.draft.cart[p.id]??0])),kitchen:true,productReady:true,special:false};
  if(a.mode==='date')patch={...patch,deliveryTiming:'scheduled',date:'',time:'',kitchen:true,driver:true};
  if(a.mode==='place')patch={...patch,fulfillment:'delivery',destType:'facility',destId:'',address:'',meeting:'',range:'unverified'};
  return {...reduceDemo(s,{type:'edit',patch}),notice:'新しい条件でご相談いただけます。商品・日時・受取場所をご確認ください。'};
 }
 if(a.type==='submit'&&s.status==='draft'){
  const errors=validation(s.draft);if(errors.length)return {...s,notice:errors.join(' ')};
  return {...s,orderedAt:a.at??Date.now(),status:'review',quote:null,payment:blankPayment(),notice:'お申込みを受け付けました。店舗で確認しています。',history:[...s.history,'お申込み受付・店舗確認待ち']};
 }
 if(a.type==='approve'&&s.status==='review'&&!consultationReasons(s.draft).length){
  const sub=subtotal(s.draft),fee=referenceFee(s.draft,s.orderedAt??Date.now());
  return {...s,status:'payment',question:'',quote:{subtotal:sub,fee,total:sub+fee,note:'ご希望の内容で受付可能です。受取条件をご確認のうえ、お支払いへお進みください。',revision:s.revision},notice:'店舗が受付内容を確認しました。お支払いへお進みください。',history:[...s.history,'店舗：受付可能']};
 }
 if(a.type==='quote'&&s.status==='review'){
  if(!Number.isInteger(a.fee)||a.fee<0||a.fee>50000)return {...s,notice:'配達料は0〜50,000円の整数で入力してください。'};
  const sub=subtotal(s.draft),fee=s.draft.fulfillment==='takeout'?0:a.fee;
  return {...s,status:'quoted',question:'',quote:{subtotal:sub,fee,total:sub+fee,note:a.note.trim()||'ご本人に直接お渡しします。待ち合わせ場所の詳細は確認中です。',revision:s.revision},notice:'店舗から見積が届きました。内容をご確認ください。',history:[...s.history,'店舗：正式見積を提示']};
 }
 if(a.type==='decline'&&s.status==='review'){
  if(!a.reason.trim())return {...s,notice:'お断りの理由を入力してください。'};
  return {...s,status:'declined',quote:null,payment:blankPayment(),question:'',reason:a.reason.trim(),notice:'店舗から回答が届きました。',history:[...s.history,'店舗：対応不可・代替案のご案内']};
 }
 if(a.type==='ask'&&s.status==='review'){
  if(!a.question.trim())return {...s,notice:'確認したい内容を入力してください。'};
  return {...s,status:'awaiting_answer',quote:null,payment:blankPayment(),question:a.question.trim(),notice:'店舗から確認したいことがあります。',history:[...s.history,`店舗からの質問：${a.question.trim()}`]};
 }
 if(a.type==='answer'&&s.status==='awaiting_answer'){
  if(!a.answer.trim())return {...s,notice:'回答を入力してください。'};
  return {...s,status:'review',notice:'ご回答を受け付けました。店舗で確認しています。',history:[...s.history,`お客様の回答：${a.answer.trim()}`]};
 }
 if(a.type==='accept'&&s.status==='quoted'&&s.quote?.revision===s.revision)return {...s,status:'accepted',notice:'見積を了承しました。支払方法を選んでください。',history:[...s.history,'お客様：見積を了承']};
 if(a.type==='select_payment'&&canPay(s)&&s.payment.phase!=='processing'&&['card','apple_pay','google_pay','paypay'].includes(a.method))return {...s,payment:{...blankPayment(),method:a.method}};
 if(a.type==='start_payment'&&canPay(s)&&s.payment.method&&s.payment.phase!=='processing'&&a.attemptId){
  return {...s,payment:{...s.payment,phase:'processing',attemptId:a.attemptId,revision:s.revision},notice:'お支払いを処理しています。'};
 }
 if(a.type==='finish_payment'&&canPay(s)&&s.payment.phase==='processing'&&s.payment.attemptId===a.attemptId&&s.revision===a.revision&&s.payment.revision===a.revision){
  if(!a.success)return {...s,payment:{...s.payment,phase:'failed'},notice:'お支払いを完了できませんでした。時間をおいて再度お試しください。'};
  return {...s,status:'confirmed',payment:{...s.payment,phase:'succeeded'},notice:'ご注文を承りました。受取内容をご確認ください。',history:[...s.history,'支払い完了・注文確定']};
 }
 return s;
}
export const statusLabels:Record<Status,string>={draft:'内容を入力',review:'店舗確認待ち',awaiting_answer:'店舗からのご質問',quoted:'見積が届きました',accepted:'支払方法を選択',payment:'お支払い待ち',confirmed:'ご注文完了',declined:'今回はお届けできません'};
