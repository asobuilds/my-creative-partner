import { useStudioStore } from '../store/studioStore';

const PALETTES={
  calm:{primary:'#7dd3fc',accent:'#38bdf8',bg:'#070b14',fog:'#070b14'},
  playful:{primary:'#f472b6',accent:'#f59e0b',bg:'#12071a',fog:'#12071a'},
  curious:{primary:'#a78bfa',accent:'#22d3ee',bg:'#0b0a1f',fog:'#0b0a1f'},
  wonder:{primary:'#00f0ff',accent:'#3b82f6',bg:'#070b14',fog:'#070b14'},
  default:{primary:'#00f0ff',accent:'#3b82f6',bg:'#070b14',fog:'#070b14'},
};

export function deriveMood(nodes=[],companionText=''){
  const lowered=String(companionText||'').toLowerCase();
  if(/dream|magic|shimmer|wonder|star|glow/.test(lowered))return 'wonder';
  if(/play|joy|laugh|dance|bounce|pink|bubble/.test(lowered))return 'playful';
  if(/quiet|still|slow|breath|gentle|calm/.test(lowered))return 'calm';
  if(/who|why|what if|curious|question|explore/.test(lowered))return 'curious';
  const moodNode=Array.isArray(nodes)&&nodes.find(n=>n&&n.type==='mood');
  if(moodNode&&moodNode.data&&moodNode.data.tone)return moodNode.data.tone;
  return 'default';
}

export function applyMood(key){
  const palette=PALETTES[key]||PALETTES.default;
  try{useStudioStore.getState().setMood(palette);}catch(e){}
  return palette;
}

export function startMoodSync(){
  let last='default';
  try{
    return useStudioStore.subscribe(state=>{try{const key=deriveMood(state.nodes,state.companion&&state.companion.text);if(key!==last){last=key;applyMood(key);}}catch(e){}});
  }catch(e){
    return ()=>{};
  }
}