import React,{createContext,useContext,useEffect,useMemo,useState} from 'react';
import { clearProgress, emptyProgress, loadProgress, saveProgress, type Progress } from './progress';

type Value={progress:Progress;ready:boolean;update:(next:Progress)=>void;reset:()=>Promise<void>};
const Context=createContext<Value|undefined>(undefined);

export function ProgressProvider({children}:{children:React.ReactNode}){
  const [progress,setProgress]=useState<Progress>(emptyProgress);const[ready,setReady]=useState(false);
  useEffect(()=>{loadProgress().then(value=>{setProgress(value);setReady(true)})},[]);
  const update=(next:Progress)=>{setProgress(next);void saveProgress(next)};
  const reset=async()=>{await clearProgress();setProgress(emptyProgress)};
  const value=useMemo(()=>({progress,ready,update,reset}),[progress,ready]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useProgress(){const value=useContext(Context);if(!value)throw new Error('ProgressProvider missing');return value}
