import type { SkillId } from './curriculum';

export type RhythmKind = 'semibreve'|'minim'|'crotchet'|'quaverPair'|'semiquaverFour'|'crotchetRest'|'minimRest'|'dottedMinim';
export type Visual = { type:'rhythm'; metre:2|3|4; cells:RhythmKind[]; missingIndex?:number } | { type:'stave'; clef:'treble'|'bass'; position:number };
export type Question = { id:string; skill:SkillId; prompt:string; choices:string[]; answer:string; explanation:string; visual?:Visual };

const durations:Record<RhythmKind,number> = { semibreve:4,minim:2,crotchet:1,quaverPair:1,semiquaverFour:1,crotchetRest:1,minimRest:2,dottedMinim:3 };
const names:Record<RhythmKind,string> = { semibreve:'semibreve',minim:'minim',crotchet:'crotchet',quaverPair:'two quavers',semiquaverFour:'four semiquavers',crotchetRest:'crotchet rest',minimRest:'minim rest',dottedMinim:'dotted minim' };

function mulberry32(seed:number){return()=>{let t=seed+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function pick<T>(items:T[],rnd:()=>number){return items[Math.floor(rnd()*items.length)]}
function shuffled<T>(items:T[],rnd:()=>number){return [...items].sort(()=>rnd()-.5)}
function qid(skill:SkillId,seed:number){return `${skill}-${seed}`}

function valueQuestion(skill:SkillId,seed:number,level:number):Question{
  const rnd=mulberry32(seed);
  const pool:RhythmKind[]=level<2?['crotchet','minim','semibreve','crotchetRest']:['crotchet','minim','semibreve','quaverPair','semiquaverFour','crotchetRest','minimRest','dottedMinim'];
  const token=pick(pool,rnd), value=durations[token];
  const answer=value===1?'1 beat':`${value} beats`;
  return {id:qid(skill,seed),skill,prompt:`How long does this ${names[token]} last in crotchet beats?`,choices:shuffled(['1 beat','2 beats','3 beats','4 beats'],rnd),answer,explanation:`A ${names[token]} occupies ${answer}.`,visual:{type:'rhythm',metre:4,cells:[token]}};
}

function restQuestion(seed:number,level:number):Question{
  const rnd=mulberry32(seed), value=level<2?pick([1,2],rnd):pick([1,2,4],rnd);
  const answer=value===1?'Crotchet rest':value===2?'Minim rest':'Semibreve rest';
  return {id:qid('rests',seed),skill:'rests',prompt:`Which rest preserves ${value} ${value===1?'beat':'beats'} of silence?`,choices:shuffled(['Crotchet rest','Minim rest','Semibreve rest'],rnd),answer,explanation:`The ${answer.toLowerCase()} measures ${value} ${value===1?'beat':'beats'} of silence.`};
}

function completeBar(skill:SkillId,seed:number,level:number):Question{
  const rnd=mulberry32(seed), metre=pick(level<2?[2,3,4] as const:[2,3,4] as const,rnd);
  const used=Math.max(1,Math.floor(rnd()*metre)); const remaining=metre-used;
  const cells:Array<RhythmKind>=Array.from({length:used},()=>pick(level>1?['crotchet','quaverPair','crotchetRest'] as RhythmKind[]:['crotchet','crotchetRest'] as RhythmKind[],rnd));
  const answer=remaining===1?'1 beat':`${remaining} beats`;
  return {id:qid(skill,seed),skill,prompt:`This is a ${metre}/4 bar. How much time is missing?`,choices:shuffled(['1 beat','2 beats','3 beats'],rnd),answer,explanation:`${metre} beats are required. ${used} ${used===1?'is':'are'} shown, so ${answer} remain.`,visual:{type:'rhythm',metre,cells,missingIndex:used}};
}

function subdivision(seed:number,semi=false):Question{
  const skill:SkillId=semi?'semiquavers':'quavers', rnd=mulberry32(seed);
  const answer=semi?'4 equal sounds':'2 equal sounds';
  return {id:qid(skill,seed),skill,prompt:`How is one crotchet beat divided by ${semi?'four semiquavers':'two quavers'}?`,choices:shuffled(['1 sound','2 equal sounds','3 equal sounds','4 equal sounds'],rnd),answer,explanation:`They divide one beat into ${answer}.`,visual:{type:'rhythm',metre:4,cells:[semi?'semiquaverFour':'quaverPair']}};
}

const treble=['E','F','G','A','B','C','D','E','F']; const bass=['G','A','B','C','D','E','F','G','A'];
function staveQuestion(skill:'stave'|'treble-notes'|'bass-notes',seed:number):Question{
  const rnd=mulberry32(seed), clef=skill==='bass-notes'?'bass':'treble',position=Math.floor(rnd()*9),answer=(clef==='treble'?treble:bass)[position];
  return {id:qid(skill,seed),skill,prompt:`What is the name of this ${clef}-clef note?`,choices:shuffled([answer,...['A','B','C','D','E','F','G'].filter(x=>x!==answer).slice(0,3)],rnd),answer,explanation:`Counting each line and space from the bottom gives ${answer}.`,visual:{type:'stave',clef,position}};
}

const knowledge:Partial<Record<SkillId,Array<[string,string,string[]]>>> = {
  pulse:[['What must remain even when a rest appears?','The beat',['The note name','The clef','The dynamic']]],
  'simple-time':[['What does the top number of a simple time signature show?','Beats in each bar',['The speed','The key','The number of notes']]],
  'dots-ties':[['What does a dot add to a note?','Half its original value',['One beat','Double its value','Half a beat']],['What can a tie join?','Two notes of the same pitch',['Two rests','Any two notes','Two time signatures']]],
  bars:[['What is the purpose of a bar line?','To divide music into measured groups',['To make music stop','To change pitch','To show loudness']]],
  'rhythm-writing':[['Why are quavers beamed by beat?','To make the beat structure clear',['To change their duration','To make them louder','To change the key']]],
  accidentals:[['What does a sharp do?','Raises a note by a semitone',['Lowers a note','Makes it louder','Doubles its length']],['What does a natural do?','Cancels a sharp or flat',['Adds a beat','Raises an octave','Changes the clef']]],
  'tones-semitones':[['Which pair is naturally a semitone apart?','B and C',['C and D','F and G','A and B']]],
  'major-scales':[['What is the major-scale pattern?','T T S T T T S',['T S T T S T T','S T T S T T T','T T T S T T S']]],
  'key-signatures':[['Which accidental belongs to G major?','F sharp',['B flat','C sharp','No accidentals']],['Which accidental belongs to F major?','B flat',['F sharp','E flat','No accidentals']]],
  'scale-degrees':[['Which number is the tonic degree?','1',['3','5','7']]],
  'interval-number':[['When naming an interval, which notes are counted?','Both starting and finishing notes',['Only spaces between','Only the top note','Only black notes']]],
  'tonic-triad':[['Which scale degrees form a tonic triad?','1, 3 and 5',['1, 2 and 3','2, 4 and 6','3, 5 and 7']],['What is the tonic triad of G major?','G, B, D',['G, A, D','F, B, D','G, C, E']]],
  dynamics:[['What does forte mean?','Loud',['Soft','Fast','Detached']],['What does crescendo mean?','Gradually louder',['Gradually slower','Suddenly soft','Smoothly']]],
  articulation:[['What does staccato mean?','Short and detached',['Smoothly connected','Very loud','Getting faster']],['What does legato mean?','Smoothly connected',['Short and detached','Very soft','Getting slower']]],
  'tempo-terms':[['What does allegro describe?','A quick tempo',['A soft dynamic','A short note','A major key']],['What does adagio mean?','Slow',['Loud','Detached','Gradually faster']]],
};

function knowledgeQuestion(skill:SkillId,seed:number):Question{
  const rnd=mulberry32(seed), bank=knowledge[skill]??knowledge.pulse!,item=pick(bank,rnd); return {id:qid(skill,seed),skill,prompt:item[0],choices:shuffled([item[1],...item[2]],rnd),answer:item[1],explanation:`${item[1]} is the correct rule.`};
}

export function generateQuestion(skill:SkillId,seed:number,level=1):Question{
  if(['crotchet','minim','semibreve','compare-values'].includes(skill)) return valueQuestion(skill,seed,level);
  if(skill==='rests') return restQuestion(seed,level);
  if(skill==='quavers') return subdivision(seed,false);
  if(skill==='semiquavers') return subdivision(seed,true);
  if(skill==='bars'||skill==='simple-time') return seed%2?completeBar(skill,seed,level):knowledgeQuestion(skill,seed);
  if(skill==='stave'||skill==='treble-notes'||skill==='bass-notes') return staveQuestion(skill,seed);
  return knowledgeQuestion(skill,seed);
}
