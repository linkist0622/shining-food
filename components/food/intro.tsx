"use client";
import {useEffect,useState} from 'react';
import {ArrowRight,Sun} from 'lucide-react';
import {Button} from '@/components/ui/button';
export function Brand({large=false}:{large?:boolean}){return <span className={large?'brand brand-large':'brand'}><Sun aria-hidden="true"/><span>SHINING <i>food</i><small>DELIVERY & TAKEOUT</small></span></span>;}
export function BrandIntro({onFinish}:{onFinish:()=>void}){
 const [stage,setStage]=useState(0);
 useEffect(()=>{
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduced){const timer=setTimeout(onFinish,700);return ()=>clearTimeout(timer);}
  const timers=[setTimeout(()=>setStage(1),2000),setTimeout(()=>setStage(2),4000),setTimeout(()=>setStage(3),6000),setTimeout(()=>setStage(4),9000),setTimeout(onFinish,10000)];
  return ()=>timers.forEach(clearTimeout);
 },[onFinish]);
 return <section className={`brand-intro stage-${stage}`} aria-label="SHINING foodへようこそ">
  <div className="intro-photos" aria-hidden="true"><img className="nature" src="/images/intro-nature.jpg" alt=""/><img className="food" src="/images/rice-bowl.jpg" alt=""/></div>
  <div className="intro-copy"><Brand large/><p className="intro-kicker">旅先で、気になっていたひと皿を。</p><h1>全国の気になるおいしさを、<br/>北軽井沢・嬬恋へ。</h1><Button variant="outline" className="intro-skip" onClick={onFinish}>スキップしてメニューを見る <ArrowRight size={17}/></Button><small>写真はイメージです</small></div>
  <div className="intro-progress" aria-hidden="true"><span/></div>
 </section>;
}
