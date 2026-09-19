"use client";
import {useEffect,useRef,useState} from 'react';
import {LoaderCircle,MapPin} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {deliveryCheckText,DELIVERY_ORIGIN,freshDeliveryCheck,isDeliveryCheck,type DeliveryCheck} from '@/lib/delivery';
import type {Draft} from '@/lib/demo';

export function AddressCheck({d,edit}:{d:Draft;edit:(patch:Partial<Draft>)=>void}){
 const [pending,setPending]=useState(false);
 const sequence=useRef(0);
 const active=useRef<AbortController|null>(null);
 useEffect(()=>{sequence.current++;setPending(false);return ()=>{sequence.current++;active.current?.abort();active.current=null;};},[d.address]);
 const result=freshDeliveryCheck(d.deliveryCheck,d.address);
 const copy=result?deliveryCheckText(result):null;
 async function check(){
  if(active.current)return;
  const request=++sequence.current,address=d.address;
  const controller=new AbortController();active.current=controller;
  const timeout=setTimeout(()=>controller.abort(),15000);
  setPending(true);
  edit({deliveryCheck:null});
  let checked:DeliveryCheck;
  try{
   const response=await fetch('/api/delivery-estimate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({address}),signal:controller.signal,cache:'no-store'});
   if(!response.ok)throw new Error('lookup-failed');
   const value=await response.json();
   if(!isDeliveryCheck(value)||value.address!==address)throw new Error('invalid-result');
   checked=value;
  }catch{checked={address,status:'unavailable',reason:controller.signal.aborted?'timeout':'network',checkedAt:Date.now()};}
  finally{clearTimeout(timeout);}
  if(sequence.current!==request)return;
  active.current=null;setPending(false);edit({deliveryCheck:checked});
 }
 return <div className="address-check">
  <div className="field"><label htmlFor="address">お届け先の住所</label><div className="address-check-row"><Input id="address" value={d.address} maxLength={160} autoComplete="off" placeholder="都道府県・市町村・番地" aria-describedby="address-help address-result" onChange={e=>{sequence.current++;active.current?.abort();active.current=null;setPending(false);edit({address:e.target.value});}}/><Button type="button" className="address-check-button" disabled={pending||!d.address.trim()} onClick={check}>{pending?<LoaderCircle size={17} className="spin"/>:<MapPin size={17}/>}<span>{pending?'確認中…':'範囲・時間を確認'}</span></Button></div><small id="address-help" className="field-help">都道府県から番地まで入力してください。建物名・部屋番号は下の待ち合わせ欄へ。</small></div>
  <div id="address-result" aria-live="polite" aria-atomic="true">{pending?<p className="field-help">住所と車の経路を確認しています…</p>:copy&&result?<div className={`address-result ${result.status==='inside'?'address-result-inside':'requirement-error'}`}><b>{copy.title}</b><p>{copy.detail}</p>{result.driveMinutes!==undefined&&<><p>車で約{result.driveMinutes}分・道路距離 約{result.roadKm?.toFixed(1)}km</p><small>現在の渋滞・一時的な通行止めは反映されません。</small><span className="maps-attribution" translate="no">Google Maps</span></>}{result.warnings?.map((warning,i)=><small key={i}>{warning}</small>)}</div>:d.deliveryCheck?<p className="requirement-error">確認から時間が経ったため、もう一度「範囲・時間を確認」を押してください。</p>:null}</div>
  <small className="address-data-credit">確認時に住所をGoogle Mapsへ送信し、経路を計算します。このサイトでは住所・経路を画面内でのみ保持します。<a href="https://policies.google.com/privacy?hl=ja" target="_blank" rel="noreferrer">プライバシー</a>・<a href="https://maps.google.com/help/terms_maps/" target="_blank" rel="noreferrer">利用規約</a></small>
  <small className="field-help">出発地：<a href={DELIVERY_ORIGIN.mapUrl} target="_blank" rel="noreferrer">{DELIVERY_ORIGIN.name}</a>。直線10kmを配達範囲の目安としています。</small>
 </div>;
}
