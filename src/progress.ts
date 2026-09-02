import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SkillId, StageId } from './curriculum';

export type SkillProgress = { mastery:number; attempts:number; correct:number; streak:number; level:number; lastSeen:number; dueAt:number };
export type Attempt = { id:string; skill:SkillId; correct:boolean; firstTry:boolean; at:number; lessonId:string };
export type Session = { id:string; lessonId:string; stage:StageId; startedAt:number; completedAt:number; correct:number; attempts:number; skills:SkillId[] };
export type Progress = { version:1; skills:Partial<Record<SkillId,SkillProgress>>; attempts:Attempt[]; sessions:Session[]; completedLessons:string[] };

const KEY='music-theory-path.progress.v1';
export const emptyProgress:Progress={version:1,skills:{},attempts:[],sessions:[],completedLessons:[]};
const baseSkill=():SkillProgress=>({mastery:0,attempts:0,correct:0,streak:0,level:1,lastSeen:0,dueAt:0});

export async function loadProgress():Promise<Progress>{
  try{const raw=await AsyncStorage.getItem(KEY);if(!raw)return emptyProgress;const parsed=JSON.parse(raw) as Progress;return parsed.version===1?parsed:emptyProgress}catch{return emptyProgress}
}
export async function saveProgress(value:Progress){await AsyncStorage.setItem(KEY,JSON.stringify(value))}
export async function clearProgress(){await AsyncStorage.removeItem(KEY)}

export function recordAttempt(progress:Progress,input:{skill:SkillId;correct:boolean;firstTry:boolean;lessonId:string;at?:number}):Progress{
  const at=input.at??Date.now(), old=progress.skills[input.skill]??baseSkill();
  const gain=input.correct?(input.firstTry?14:6):-9;
  const mastery=Math.max(0,Math.min(100,old.mastery+gain));
  const streak=input.correct?old.streak+1:0;
  const level=mastery>=85?3:mastery>=55?2:1;
  const spacing=mastery>=85?7*86400000:mastery>=55?2*86400000:mastery>=30?12*3600000:0;
  const next:SkillProgress={mastery,attempts:old.attempts+1,correct:old.correct+(input.correct?1:0),streak,level,lastSeen:at,dueAt:at+spacing};
  const attempt:Attempt={id:`${at}-${input.skill}`,skill:input.skill,correct:input.correct,firstTry:input.firstTry,at,lessonId:input.lessonId};
  return {...progress,skills:{...progress.skills,[input.skill]:next},attempts:[attempt,...progress.attempts].slice(0,500)};
}

export function completeSession(progress:Progress,input:Omit<Session,'id'|'completedAt'>):Progress{
  const completedAt=Date.now();const session:Session={...input,id:`session-${completedAt}`,completedAt};
  return {...progress,sessions:[session,...progress.sessions].slice(0,100),completedLessons:Array.from(new Set([...progress.completedLessons,input.lessonId]))};
}

export function chooseSkill(skills:SkillId[],progress:Progress,now=Date.now()):SkillId{
  return [...skills].sort((a,b)=>{
    const A=progress.skills[a]??baseSkill(),B=progress.skills[b]??baseSkill();
    const aDue=A.dueAt<=now?0:1,bDue=B.dueAt<=now?0:1;
    return aDue-bDue||A.mastery-B.mastery||A.lastSeen-B.lastSeen;
  })[0];
}

export function stageMastery(skills:SkillId[],progress:Progress){
  if(!skills.length)return 0;return Math.round(skills.reduce((sum,s)=>sum+(progress.skills[s]?.mastery??0),0)/skills.length);
}
