"use client";
import {useState} from 'react';
import {Store,Check,Send,MessageCircle} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {consultationReasons,referenceFee,subtotal,type DemoState,type Action} from '@/lib/demo';
import {OrderDetail,Totals,Notice,Tick} from './order-parts';
export function StorePanel({state,onAction,onReviewResult,online}:{state:DemoState;onAction:(a:Action)=>void;onReviewResult:()=>void;online:boolean}){
 const [checked,setChecked]=useState(false);const [fee,setFee]=useState(String(referenceFee(state.draft,state.orderedAt??Date.now())));
 const [note,setNote]=useState('ご指定の日時に、ご本人へ直接お渡しします。待ち合わせ場所の詳細を調整します。');
 const [reason,setReason]=useState('ご希望日時は配送枠を確保できないため、今回は配達を承れません。');
 const [question,setQuestion]=useState('ご本人が待ち合わせ場所に到着できる時間を教えてください。');
 const [decision,setDecision]=useState<'accept'|'decline'|'ask'>('accept');
 const reasons=consultationReasons(state.draft),needsQuote=reasons.length>0;
 return <main className="shell store-shell"><div className="page-title"><p className="eyebrow">SHINING FOOD / RECEPTION</p><h1><Store size={26}/>受付内容の確認</h1><p>内容と提供・配送枠を確認し、お客様へ回答します。</p></div><div className="form-layout"><section className="panel"><h2>お申込み内容</h2><OrderDetail state={state}/><dl className="order-detail"><div><dt>お名前</dt><dd>{state.draft.contactName}</dd></div><div><dt>連絡先</dt><dd>{state.draft.contactPhone}</dd></div></dl><Totals sub={subtotal(state.draft)} fee={referenceFee(state.draft,state.orderedAt??Date.now())} total={subtotal(state.draft)+referenceFee(state.draft,state.orderedAt??Date.now())}/>{reasons.length>0&&<Notice><b>確認が必要な条件</b><ul>{reasons.map(r=><li key={r}>{r}</li>)}</ul></Notice>}{state.history.length>1&&<details className="history" open><summary>これまでのやり取り</summary><ol>{state.history.map((h,i)=><li key={i}>{h}</li>)}</ol></details>}</section>
 <section className="panel shop-actions"><h2>お客様への回答</h2>{state.status==='review'?<>
 <div className="decision-options" aria-label="回答の種類">{[['accept',needsQuote?'見積を提示':'受付可能'],['ask','追加確認'],['decline','お断り']].map(([v,label])=><Button key={v} variant={decision===v?'default':'outline'} onClick={()=>setDecision(v as typeof decision)}>{label}</Button>)}</div>
 {decision==='accept'&&<><Tick checked={checked} onChange={setChecked}>商品・実走経路・受渡し条件・厨房枠・配送枠を確認しました</Tick>{needsQuote&&<><div className="field"><label htmlFor="shop-fee">配達料（円）</label><Input id="shop-fee" type="number" min="0" max="50000" inputMode="numeric" value={state.draft.fulfillment==='takeout'?'0':fee} disabled={state.draft.fulfillment==='takeout'} onChange={e=>setFee(e.target.value)}/></div><div className="field"><label htmlFor="shop-note">見積の条件・受渡しのご案内</label><Textarea id="shop-note" value={note} maxLength={500} onChange={e=>setNote(e.target.value)}/></div><p className="subtle">商品代金＋配達料を提示し、お客様の了承を待ちます。</p></>}
 <Button className="wide" disabled={!checked||!online||(needsQuote&&(!fee.trim()||!Number.isInteger(Number(fee))||Number(fee)<0||Number(fee)>50000))} onClick={()=>onAction(needsQuote?{type:'quote',fee:Number(fee),note}:{type:'approve'})}><Check size={18}/>{needsQuote?'正式見積を提示する':'受付可能と回答する'}</Button></>}
 {decision==='decline'&&<><div className="field"><label htmlFor="decline-reason">お届けできない理由</label><Textarea id="decline-reason" value={reason} maxLength={500} onChange={e=>setReason(e.target.value)}/></div><p className="subtle">テイクアウト・別日時・別受取場所をご案内します。</p><Button className="wide decline-button" variant="outline" disabled={!online||!reason.trim()} onClick={()=>onAction({type:'decline',reason})}>理由と代替案を案内する</Button></>}
 {decision==='ask'&&<><div className="field"><label htmlFor="shop-question">確認したいこと</label><Textarea id="shop-question" value={question} maxLength={500} onChange={e=>setQuestion(e.target.value)}/></div><Button className="wide" disabled={!online||!question.trim()} onClick={()=>onAction({type:'ask',question})}><MessageCircle size={18}/>追加確認を依頼する</Button></>}
 </>:<><Notice>回答内容を保存しました。お客様側で内容をご確認ください。</Notice><Button className="wide" onClick={onReviewResult}><Send size={18}/>回答内容を確認する</Button></>}
 </section></div></main>;
}
