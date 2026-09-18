"use client";
import {useEffect,useState} from 'react';
import {Button} from '@/components/ui/button';
export function useConnectivity(){const [online,setOnline]=useState(true);useEffect(()=>{const update=()=>setOnline(navigator.onLine);update();window.addEventListener('online',update);window.addEventListener('offline',update);return ()=>{window.removeEventListener('online',update);window.removeEventListener('offline',update);};},[]);return online;}
export function PwaUpdate({canUpdate}:{canUpdate:boolean}){
 const [registration,setRegistration]=useState<ServiceWorkerRegistration|null>(null);const [waiting,setWaiting]=useState(false);
 useEffect(()=>{if(!('serviceWorker'in navigator))return;let mounted=true;let changing=false;
  const change=()=>{if(changing)location.reload();};navigator.serviceWorker.addEventListener('controllerchange',change);
  navigator.serviceWorker.register('/sw.js',{scope:'/'}).then(reg=>{if(!mounted)return;setRegistration(reg);setWaiting(!!reg.waiting);reg.addEventListener('updatefound',()=>{const next=reg.installing;next?.addEventListener('statechange',()=>{if(mounted&&next.state==='installed'&&navigator.serviceWorker.controller)setWaiting(true);});});}).catch(()=>{});
  const trigger=()=>{changing=true;};window.addEventListener('food-update',trigger);
  return ()=>{mounted=false;window.removeEventListener('food-update',trigger);navigator.serviceWorker.removeEventListener('controllerchange',change);};
 },[]);
 if(!waiting)return null;
 return <div className="update-notice" role="status">新しいバージョンがあります。{canUpdate?<Button variant="outline" size="sm" onClick={()=>{window.dispatchEvent(new Event('food-update'));registration?.waiting?.postMessage({type:'SKIP_WAITING'});}}>更新する</Button>:<span>今の操作を終えると更新できます。</span>}</div>;
}
