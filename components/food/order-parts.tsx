"use client";
import { useId, type ReactNode } from 'react';
import { MapPin, Info } from 'lucide-react';
import {AddressCheck} from './address-check';
import {deliveryTimes,freshDeliveryCheck,japanTime,arrivalTime} from '@/lib/delivery';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { products,bbqSets,destinations,subtotal,meetingLabel,destinationLabel,isImmediateDelivery,requiresSchedule,scheduleLabel,type Draft,type DemoState } from '@/lib/demo';
export const yen=(n:number)=>`¥${n.toLocaleString('ja-JP')}`;
export function Choice({label,value,onChange,items,placeholder='選んでください'}:{label:string;value:string;onChange:(v:string)=>void;items:{value:string;label:string}[];placeholder?:string}){const id=useId();return <div className="field"><label htmlFor={id}>{label}</label><Select value={value} onValueChange={onChange}><SelectTrigger id={id} className="choice"><SelectValue placeholder={placeholder}/></SelectTrigger><SelectContent>{items.map(x=><SelectItem value={x.value} key={x.value}>{x.label}</SelectItem>)}</SelectContent></Select></div>;}
export function Tick({checked,onChange,children}:{checked:boolean;onChange:(v:boolean)=>void;children:ReactNode}){const id=useId();return <div className="tick"><Checkbox id={id} checked={checked} onCheckedChange={v=>onChange(v===true)}/><label htmlFor={id}>{children}</label></div>;}
export function Notice({children,tone='info'}:{children:ReactNode;tone?:'info'|'warm'}){return <div className={`notice ${tone}`}><Info size={18}/><div>{children}</div></div>;}
export function Totals({sub,fee,total,title='参考見積'}:{sub:number;fee:number;total:number;title?:string}){return <div className="totals"><p className="mini-label">{title}</p><div><span>商品代金</span><span>{yen(sub)}</span></div><div><span>配達料</span><span>{yen(fee)}</span></div><div className="total"><b>合計・参考</b><strong>{yen(total)}</strong></div><small>税込想定の参考価格です。販売価格・税の扱い・配達料は確認中です。</small></div>;}
export function OrderLines({draft}:{draft:Draft}){return <div className="order-lines">{draft.kind==='bbq'?<p><span>{bbqSets.find(s=>s.id===draft.setId)?.name} × {draft.people}名</span><b>{yen(subtotal(draft))}</b></p>:products.filter(p=>(draft.cart[p.id]??0)>0).map(p=><p key={p.id}><span>{p.name} × {draft.cart[p.id]}</span><b>{yen(p.price*(draft.cart[p.id]??0))}</b></p>)}</div>;}
export function OrderDetail({state}:{state:DemoState}){const d=state.draft;const times=state.orderedAt&&isImmediateDelivery(d)?deliveryTimes(freshDeliveryCheck(d.deliveryCheck,d.address,state.orderedAt),state.orderedAt):null;return <><OrderLines draft={d}/><dl className="order-detail">{state.orderedAt&&<div><dt>申込時刻</dt><dd>{japanTime(state.orderedAt,true)}</dd></div>}{times&&<div><dt>お届け目安</dt><dd>{arrivalTime(times.arrivesAt,times.orderAt)}頃<small className="field-help">調理20分＋車で約{times.driveMinutes}分。店舗確認前の目安です。</small><span className="maps-attribution" translate="no">Google Maps</span></dd></div>}<div><dt>受取方法</dt><dd>{d.fulfillment==='delivery'?'デリバリー':'テイクアウト'}</dd></div><div><dt>お届け・受取</dt><dd>{scheduleLabel(d)}</dd></div><div><dt>お届け先</dt><dd>{destinationLabel(d)}</dd></div><div><dt>待合場所</dt><dd>{meetingLabel(d)}<small className="field-help">場所の詳細・施設での受渡し条件は確認中です。</small></dd></div>{d.note&&<div><dt>ご要望</dt><dd>{d.note}</dd></div>}</dl></>;}
export function Schedule({d,edit}:{d:Draft;edit:(p:Partial<Draft>)=>void}){
 const timingId=useId();
 const canChooseTiming=d.kind==='meal'&&d.fulfillment==='delivery';
 return <>
  {canChooseTiming&&<fieldset className="delivery-timing"><legend>お届けのタイミング</legend><RadioGroup className="timing-options" aria-label="お届けのタイミング" value={d.deliveryTiming} onValueChange={v=>edit({deliveryTiming:v as Draft['deliveryTiming']})}>
   <label className="timing-option" htmlFor={`${timingId}-asap`}><RadioGroupItem id={`${timingId}-asap`} value="asap"/>できるだけ早く</label>
   <label className="timing-option" htmlFor={`${timingId}-scheduled`}><RadioGroupItem id={`${timingId}-scheduled`} value="scheduled"/>日時を指定する</label>
  </RadioGroup>{isImmediateDelivery(d)&&<small className="field-help">最短のお届けを希望します。受付可否とお届け目安は、店舗が確認してご案内します。</small>}</fieldset>}
  {requiresSchedule(d)&&<div className="two-fields"><div className="field"><label htmlFor="order-date">希望日</label><Input id="order-date" type="date" value={d.date} onInput={e=>edit({date:e.currentTarget.value})}/></div><Choice label="希望時間" value={d.time} onChange={time=>edit({time})} items={['17:00–17:30','17:30–18:00','18:00–18:30'].map(v=>({value:v,label:v}))}/><small className="field-help">受付時間・営業開始日は確認中です。</small></div>}
 </>;
}
export function DestinationPicker({d,edit}:{d:Draft;edit:(patch:Partial<Draft>)=>void}){return <section className="form-section"><h2>{d.fulfillment==='takeout'?'お受け取り場所':'お届け先・待ち合わせ'}</h2>{d.fulfillment==='takeout'?<div className="meeting-card"><MapPin size={21}/><div><b>Cafe&Bar あさま 共通受取カウンター</b><p>SHINING foodと厨房・受取場所を共有します。</p><small>住所・カウンター位置は確認中です。</small></div></div>:<>
 <Choice label="お届け先の種類" value={d.destType} onChange={v=>edit({destType:v as Draft['destType'],destId:'',address:'',meeting:'',range:'unverified'})} items={[{value:'address',label:'住所を入力する'},{value:'facility',label:'宿泊施設・キャンプ場'},{value:'villa',label:'別荘地・管理センター'}]}/>
 {d.destType==='facility'&&<><Choice label="宿泊施設・キャンプ場" value={d.destId} onChange={destId=>edit({destId})} items={destinations.filter(x=>x.type==='facility').map(x=>({value:x.id,label:x.name}))}/><small className="field-help">掲載施設への配達可否・受渡し許可は確認中です。店舗が確認してご案内します。</small></>}
 {d.destType==='villa'&&<><Choice label="管理センターを選択" value={d.destId} onChange={destId=>edit({destId})} items={destinations.filter(x=>x.type==='villa').map(x=>({value:x.id,label:x.name}))}/><div className="field"><label htmlFor="villa-detail">管理センター名・区画などの補足</label><Input id="villa-detail" value={d.address} maxLength={160} placeholder="その他の場合は分かる範囲でご記入ください" onChange={e=>edit({address:e.target.value})}/></div></>}
 {d.destType==='address'&&<><AddressCheck d={d} edit={edit}/><div className="field"><label htmlFor="meeting">ご本人との待ち合わせ場所</label><Input id="meeting" value={d.meeting} maxLength={160} placeholder="建物名・部屋番号・入口など" onChange={e=>edit({meeting:e.target.value})}/></div></>}
 {(d.destId||d.destType==='address')&&<div className="meeting-card"><MapPin size={21}/><div><span className="pill">待ち合わせ場所・確認中</span><b>{meetingLabel(d)||'場所を入力してください'}</b><p>施設スタッフには預けず、ご注文者本人に直接お渡しします。</p><small>施設での受渡し可否は、許可を含め確認中です。</small></div></div>}
 <Notice>直線10kmは一次判定です。実走・道路・商品・厨房枠・配送枠を確認して配達可否をご案内します。</Notice></>}
 </section>;}
