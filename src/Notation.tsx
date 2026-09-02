import React from 'react';
import { StyleSheet,Text,View } from 'react-native';
import Svg,{Circle,Ellipse,Line,Path,Rect} from 'react-native-svg';
import type { RhythmKind,Visual } from './engine';

export function RhythmGlyph({kind,size=64}:{kind:RhythmKind;size?:number}){
  const fill=kind==='minim'||kind==='semibreve'||kind==='dottedMinim'?'none':'#10152F';
  if(kind==='crotchetRest'||kind==='minimRest')return <Svg width={size} height={size} viewBox="0 0 64 64" accessibilityLabel={kind==='crotchetRest'?'crotchet rest':'minim rest'}>{kind==='minimRest'?<Rect x="18" y="29" width="28" height="8" fill="#10152F"/>:<Path d="M37 8 L25 27 L37 39 L27 53 M27 53 C16 48 20 39 30 44" stroke="#10152F" strokeWidth="6" fill="none" strokeLinecap="round"/>}</Svg>;
  if(kind==='quaverPair'||kind==='semiquaverFour'){
    const count=kind==='quaverPair'?2:4;const xs=Array.from({length:count},(_,i)=>12+i*(40/(count-1)));
    return <Svg width={size} height={size} viewBox="0 0 64 64" accessibilityLabel={kind==='quaverPair'?'two quavers':'four semiquavers'}><Rect x="12" y="10" width="40" height="6" fill="#10152F"/>{kind==='semiquaverFour'&&<Rect x="12" y="19" width="40" height="5" fill="#10152F"/>}{xs.map((x,i)=><React.Fragment key={i}><Line x1={x} y1="12" x2={x} y2="48" stroke="#10152F" strokeWidth="3"/><Ellipse cx={x-5} cy="49" rx="8" ry="5" fill="#10152F" transform={`rotate(-18 ${x-5} 49)`}/></React.Fragment>)}</Svg>;
  }
  const stem=kind!=='semibreve';
  return <Svg width={size} height={size} viewBox="0 0 64 64" accessibilityLabel={kind}>{stem&&<Line x1="42" y1="10" x2="42" y2="48" stroke="#10152F" strokeWidth="3"/>}<Ellipse cx={stem?34:32} cy={stem?49:34} rx={kind==='semibreve'?15:11} ry={kind==='semibreve'?8:7} fill={fill} stroke="#10152F" strokeWidth="4" transform={`rotate(-18 ${stem?34:32} ${stem?49:34})`}/>{kind==='dottedMinim'&&<Circle cx="53" cy="48" r="3.5" fill="#10152F"/>}</Svg>;
}

export function Stave({clef,position}:{clef:'treble'|'bass';position:number}){
  const y=76-position*7.5;
  return <View style={styles.staveWrap}><Svg width="100%" height={115} viewBox="0 0 300 115" accessibilityLabel={`${clef} clef note`}>
    {[40,55,70,85,100].map(v=><Line key={v} x1="25" x2="280" y1={v} y2={v} stroke="#59656E" strokeWidth="1.5"/>)}
    <TextSvg x={clef==='treble'?35:38} y={88} text={clef==='treble'?'𝄞':'𝄢'} />
    <Ellipse cx="190" cy={y} rx="12" ry="8" fill="#10152F" transform={`rotate(-18 190 ${y})`}/><Line x1="201" y1={y} x2="201" y2={y-38} stroke="#10152F" strokeWidth="3"/>
  </Svg></View>;
}
function TextSvg({x,y,text}:{x:number;y:number;text:string}){return <Path d=""/>}

export function VisualQuestion({visual}:{visual:Visual}){
  if(visual.type==='stave')return <View style={styles.visual}><View style={styles.clefLabel}><Text style={styles.clefText}>{visual.clef==='treble'?'𝄞 Treble clef':'𝄢 Bass clef'}</Text></View><Stave clef={visual.clef} position={visual.position}/></View>;
  return <View style={styles.visual}><View style={styles.metre}><Text style={styles.metreText}>{visual.metre}</Text><Text style={styles.metreText}>4</Text></View><View style={styles.rhythmRow}>{visual.cells.map((cell,i)=><View key={`${cell}-${i}`} style={styles.cell}><RhythmGlyph kind={cell}/></View>)}{visual.missingIndex!==undefined&&<View style={[styles.cell,styles.missing]}><Text style={styles.missingText}>?</Text></View>}</View></View>;
}

const styles=StyleSheet.create({
  visual:{backgroundColor:'#FFFFFF',borderRadius:16,borderWidth:1,borderColor:'#DDE0EA',padding:14,marginVertical:16,flexDirection:'row',alignItems:'center'},metre:{width:38,alignItems:'center'},metreText:{fontSize:26,lineHeight:27,fontWeight:'800',color:'#10152F'},rhythmRow:{flex:1,flexDirection:'row',alignItems:'center',flexWrap:'wrap'},cell:{width:70,height:76,alignItems:'center',justifyContent:'center',borderLeftWidth:1,borderLeftColor:'#E3E5EF'},missing:{borderWidth:2,borderStyle:'dashed',borderColor:'#D44D27',borderRadius:10},missingText:{fontSize:28,color:'#D44D27',fontWeight:'800'},staveWrap:{flex:1},clefLabel:{width:70},clefText:{fontSize:18,fontWeight:'700',color:'#10152F'}
});
