"use client";
import {arrivalTime,deliveryTimes,freshDeliveryCheck,japanTime} from '@/lib/delivery';
import {isImmediateDelivery,type Draft} from '@/lib/demo';
export function DeliveryOrderTiming({d,now}:{d:Draft;now:number}){
 if(!isImmediateDelivery(d)||d.destType!=='address')return null;
 const check=freshDeliveryCheck(d.deliveryCheck,d.address,now),times=deliveryTimes(check,now);
 return <span className="order-timing"><span>今ご注文の場合：{japanTime(now)}</span>{times?<><strong>お届け目安 {arrivalTime(times.arrivesAt,times.orderAt)}頃</strong><span>調理20分＋車で約{times.driveMinutes}分</span><span className="maps-attribution" translate="no">Google Maps</span></>:<span>お届け時間は店舗確認後にご案内</span>}<span className="order-timing-note">{times?'渋滞・混雑により前後します。店舗確認前の目安です。':'住所の「範囲・時間を確認」から確認できます。'}</span></span>;
}
