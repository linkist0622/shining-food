"use client";
import {CreditCard,Wallet,ScanLine,LoaderCircle} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {RadioGroup,RadioGroupItem} from '@/components/ui/radio-group';
import {type DemoState,type PaymentMethod} from '@/lib/demo';
import {Notice} from './order-parts';
export const methods=[{id:'card',name:'クレジット／デビットカード',category:'カード',icon:CreditCard},{id:'apple_pay',name:'Apple Pay',category:'ウォレット',icon:Wallet},{id:'google_pay',name:'Google Pay',category:'ウォレット',icon:Wallet},{id:'paypay',name:'PayPay',category:'QR・コード決済',icon:ScanLine}] as const;
// Preview shows candidates. Production must use Stripe account, currency and device eligibility.
export function PaymentPanel({state,select,onPay,online}:{state:DemoState;select:(m:PaymentMethod)=>void;onPay:()=>void;online:boolean}){const busy=state.payment.phase==='processing';return <section className="payment-panel" aria-busy={busy}><h2>お支払い方法</h2><p className="subtle">ご利用いただく方法を選んでください。対応状況は確認中です。</p><RadioGroup aria-label="支払方法" value={state.payment.method} onValueChange={v=>select(v as PaymentMethod)} disabled={busy} className="payment-methods">{methods.map(m=><label key={m.id} className={`payment-option ${state.payment.method===m.id?'selected':''}`}><RadioGroupItem value={m.id}/><m.icon size={22}/><span><b>{m.name}</b><small>{m.category}</small></span></label>)}</RadioGroup>{state.payment.phase==='failed'&&<Notice tone="warm">お支払いを完了できませんでした。ご注文はまだ確定していません。方法を確認して、もう一度お試しください。</Notice>}<Button className="wide" disabled={!state.payment.method||busy||!online} onClick={onPay}>{busy?<><LoaderCircle className="spin" size={18}/>お支払いを処理しています</>:state.payment.phase==='failed'?'もう一度支払う':'この方法で支払い、注文を確定する'}</Button></section>;}
