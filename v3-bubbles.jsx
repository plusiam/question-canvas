// V3 — Speech-bubble playground. Each question type is a chubby cartoon
// character bubble with eyes; the 'board' is a playground sky where bubbles
// float and huddle. Most playful of the three.

const V3_TYPES = [
  { key:'fact',    label:'사실',  icon:'🔍', placeholder:'무엇이 궁금해요?',
    prompt:'무엇 · 언제 · 누가 · 어디서', color:'#3FA9F5', deep:'#1E6FB8',
    mouth:'straight', eyeStyle:'round' },
  { key:'think',   label:'생각',  icon:'💭', placeholder:'왜 그랬을지 궁금해요?',
    prompt:'왜 · 어떻게 · 무슨 까닭', color:'#F5C03F', deep:'#B8881E',
    mouth:'smile', eyeStyle:'sparkle' },
  { key:'heart',   label:'느낌',  icon:'💗', placeholder:'어떤 느낌이었을까요?',
    prompt:'느낌 · 기분 · 마음', color:'#F06AA3', deep:'#B83E74',
    mouth:'warm', eyeStyle:'curved' },
  { key:'imagine', label:'상상',  icon:'✨', placeholder:'만약에 ~하면?',
    prompt:'만약에 · 혹시 · 그랬다면', color:'#A879E8', deep:'#6F4CB8',
    mouth:'open', eyeStyle:'star' },
];

const V3_EXAMPLES = (c) => {
  const a = c.char1 || '이 친구';
  const b = c.char2 || '저 친구';
  return {
    fact:   [`${a}는 무엇을 했나요?`, `두 사람 사이에 어떤 일이 있었나요?`],
    think:  [`${a}는 왜 그랬을까요?`, `${b}는 왜 그런 말을 했을까요?`],
    heart:  [`${a}는 어떤 느낌이었을까요?`, `${b}의 기분은 어땠을까요?`],
    imagine:[`만약에 ${a}가 다르게 행동했다면 어땠을까요?`, `만약에 내가 ${a}라면?`],
  };
};

const V3_STORAGE_KEY = 'qc-v3-state';

// Cute bubble character face
function V3Face({type, size=70, talking=false}){
  const eye = type.eyeStyle;
  const mouthPath = {
    straight: 'M-5 4 L5 4',
    smile:    'M-6 2 Q0 8 6 2',
    warm:     'M-5 3 Q0 6 5 3',
    open:     'M0 4 m-3 0 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0',
  }[type.mouth];
  return (
    <svg width={size} height={size} viewBox="-30 -30 60 60">
      {/* left eye */}
      {eye==='round' && <circle cx="-9" cy="-5" r="3" fill="#2d2a26"/>}
      {eye==='sparkle' && <><circle cx="-9" cy="-5" r="3.5" fill="#2d2a26"/><circle cx="-8" cy="-6" r="1" fill="#fff"/></>}
      {eye==='curved' && <path d="M-13 -5 Q-9 -9 -5 -5" stroke="#2d2a26" strokeWidth="2.5" fill="none" strokeLinecap="round"/>}
      {eye==='star' && <path d="M-9 -8 L-8 -5 L-5 -4 L-8 -3 L-9 0 L-10 -3 L-13 -4 L-10 -5 z" fill="#2d2a26"/>}
      {/* right eye */}
      {eye==='round' && <circle cx="9" cy="-5" r="3" fill="#2d2a26"/>}
      {eye==='sparkle' && <><circle cx="9" cy="-5" r="3.5" fill="#2d2a26"/><circle cx="10" cy="-6" r="1" fill="#fff"/></>}
      {eye==='curved' && <path d="M5 -5 Q9 -9 13 -5" stroke="#2d2a26" strokeWidth="2.5" fill="none" strokeLinecap="round"/>}
      {eye==='star' && <path d="M9 -8 L10 -5 L13 -4 L10 -3 L9 0 L8 -3 L5 -4 L8 -5 z" fill="#2d2a26"/>}
      {/* cheeks */}
      <circle cx="-12" cy="3" r="3.5" fill={type.deep} opacity=".35"/>
      <circle cx="12" cy="3" r="3.5" fill={type.deep} opacity=".35"/>
      {/* mouth */}
      <path d={mouthPath} stroke="#2d2a26" strokeWidth="2.5" fill={type.mouth==='open'?'#2d2a26':'none'} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function V3Toast({toast}){
  return <div className="qc-no-print" style={{
    position:'absolute', bottom:20, left:'50%', transform:'translateX(-50%)',
    background:'#2d2a26', color:'#fff', padding:'12px 24px', borderRadius:999,
    fontFamily:'Jua', fontSize:15, zIndex:20, boxShadow:'0 6px 18px rgba(0,0,0,.3)',
    whiteSpace:'nowrap', display:'inline-flex', alignItems:'center', gap:12,
  }}>
    <span>{toast.msg}</span>
    {toast.action && (
      <button onClick={toast.action.onClick} style={{
        background:'transparent', border:'1px solid rgba(255,255,255,.5)', color:'#fff',
        fontFamily:'Jua', fontSize:13, padding:'3px 10px', borderRadius:999, cursor:'pointer',
      }}>{toast.action.label}</button>
    )}
  </div>;
}

function V3({width=1100, height=1400}){
  const [notes, setNotes] = React.useState([]);
  const [inputs, setInputs] = React.useState({fact:'',think:'',heart:'',imagine:''});
  const [focused, setFocused] = React.useState(null);
  const [toast, setToast] = React.useState(null);
  const [name, setName] = React.useState('');
  const [classInfo, setClassInfo] = React.useState('');
  const [char1, setChar1] = React.useState('예은');
  const [char2, setChar2] = React.useState('친구');
  const [situation, setSituation] = React.useState('자기 생각을 당당히 말하지 못한 일');
  const [hydrated, setHydrated] = React.useState(false);
  const idRef = React.useRef(1);
  const toastTimer = React.useRef(null);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(V3_STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (Array.isArray(s.notes)) setNotes(s.notes);
        if (typeof s.name === 'string') setName(s.name);
        if (typeof s.classInfo === 'string') setClassInfo(s.classInfo);
        if (typeof s.char1 === 'string') setChar1(s.char1);
        if (typeof s.char2 === 'string') setChar2(s.char2);
        if (typeof s.situation === 'string') setSituation(s.situation);
        if (Number.isFinite(s.nextId)) idRef.current = s.nextId;
      }
    } catch {}
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(V3_STORAGE_KEY, JSON.stringify({
        notes, name, classInfo, char1, char2, situation, nextId: idRef.current,
      }));
    } catch {}
  }, [hydrated, notes, name, classInfo, char1, char2, situation]);

  const showToast = (msg, action) => {
    setToast({msg, action});
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(()=>setToast(null), action ? 4000 : 1800);
  };

  const addNote = (type) => {
    const text = inputs[type].trim();
    if(!text){ showToast('먼저 질문을 써주세요 ✍️'); return; }
    setNotes(n => [...n, {id:idRef.current++, type, text, tilt:(Math.random()*8-4).toFixed(1)}]);
    setInputs(i => ({...i, [type]:''}));
    showToast('질문이 떠올랐어요! 🎈');
  };
  const delNote = (id) => {
    const found = notes.find(n=>n.id===id);
    if(!found) return;
    setNotes(n=>n.filter(x=>x.id!==id));
    showToast('풍선이 사라졌어요', { label:'되돌리기', onClick: () => {
      setNotes(n => n.some(x=>x.id===found.id) ? n : [...n, found]);
      setToast(null);
      clearTimeout(toastTimer.current);
    }});
  };
  const exampleFor = (type) => {
    const arr = V3_EXAMPLES({char1, char2})[type];
    setInputs(i => ({...i, [type]: arr[Math.floor(Math.random()*arr.length)]}));
  };
  const clearAll = () => {
    if(notes.length && confirm('모두 지울까요?')){
      setNotes([]); idRef.current = 1;
      try { localStorage.removeItem(V3_STORAGE_KEY); } catch {}
    }
  };

  const counts = notes.reduce((m,n)=>{m[n.type]=(m[n.type]||0)+1; return m;}, {fact:0,think:0,heart:0,imagine:0});
  const allFour = V3_TYPES.every(t => counts[t.key] >= 1);

  return (
    <div style={{
      width, minHeight:height, position:'relative',
      fontFamily:"'Noto Sans KR', sans-serif", color:'#2d2a26',
      background: 'linear-gradient(180deg, #C7E9FF 0%, #FFF3D0 55%, #FFDDE9 100%)',
      padding:'36px 44px 60px', boxSizing:'border-box', overflow:'hidden',
    }}>
      {/* floating decorative bubbles */}
      <div style={{position:'absolute', top:80, right:40, width:60, height:60, borderRadius:'50%', background:'rgba(255,255,255,.5)', boxShadow:'inset -6px -6px 0 rgba(255,255,255,.6)'}}/>
      <div style={{position:'absolute', top:260, left:20, width:40, height:40, borderRadius:'50%', background:'rgba(255,255,255,.5)'}}/>
      <div style={{position:'absolute', bottom:180, right:60, width:80, height:80, borderRadius:'50%', background:'rgba(255,255,255,.4)'}}/>

      {/* Header */}
      <div style={{position:'relative', zIndex:2, textAlign:'center', marginBottom:18}}>
        <div style={{
          display:'inline-block', background:'#fff', borderRadius:40, padding:'24px 40px',
          border:'4px solid #2d2a26', boxShadow:'0 8px 0 #2d2a26',
          position:'relative',
        }}>
          <h1 style={{fontFamily:'Jua', fontSize:48, margin:0, letterSpacing:'-0.02em', lineHeight:1.1}}>
            <span style={{fontSize:44}}>🎈</span> 질문 풍선 놀이터
          </h1>
          <p style={{fontFamily:'Gaegu', fontSize:20, color:'#7a7064', margin:'6px 0 0'}}>
            네 친구와 함께 이야기 속 궁금한 걸 물어봐요!
          </p>
          {/* tail */}
          <div style={{position:'absolute', bottom:-18, left:'50%', transform:'translateX(-50%)',
            width:0, height:0, borderLeft:'16px solid transparent', borderRight:'16px solid transparent',
            borderTop:'18px solid #2d2a26'}}/>
          <div style={{position:'absolute', bottom:-13, left:'50%', transform:'translateX(-50%)',
            width:0, height:0, borderLeft:'12px solid transparent', borderRight:'12px solid transparent',
            borderTop:'14px solid #fff'}}/>
        </div>
      </div>

      {/* Name + story row */}
      <div style={{position:'relative', zIndex:2, display:'grid', gridTemplateColumns:'1fr 2fr', gap:16, marginTop:10, marginBottom:24}}>
        <div style={{background:'#fff', border:'3px solid #2d2a26', borderRadius:22, padding:'14px 18px',
          boxShadow:'4px 4px 0 #2d2a26'}}>
          <div style={{fontFamily:'Jua', fontSize:14, color:'#7a7064', marginBottom:6}}>👤 나는</div>
          <div style={{display:'flex', gap:10}}>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="이름"
              style={{fontFamily:'Gaegu', fontSize:20, flex:1, border:'none', borderBottom:'2px dashed #2d2a26', outline:'none', padding:'2px 6px', background:'transparent'}}/>
            <input value={classInfo} onChange={e=>setClassInfo(e.target.value)} placeholder="4학년 2반"
              style={{fontFamily:'Gaegu', fontSize:20, width:100, border:'none', borderBottom:'2px dashed #2d2a26', outline:'none', padding:'2px 6px', background:'transparent'}}/>
          </div>
        </div>
        <div style={{background:'#fff', border:'3px solid #2d2a26', borderRadius:22, padding:'14px 18px',
          boxShadow:'4px 4px 0 #2d2a26'}}>
          <div style={{fontFamily:'Jua', fontSize:14, color:'#7a7064', marginBottom:6}}>📖 오늘 이야기</div>
          <div style={{display:'flex', gap:8, alignItems:'center', flexWrap:'wrap'}}>
            <input value={char1} onChange={e=>setChar1(e.target.value)}
              style={{fontFamily:'Gaegu', fontSize:20, width:80, border:'none', borderBottom:'2px dashed #2d2a26', outline:'none', padding:'2px 6px', background:'transparent', textAlign:'center'}}/>
            <span style={{fontFamily:'Gaegu', fontSize:18, color:'#7a7064'}}>와</span>
            <input value={char2} onChange={e=>setChar2(e.target.value)}
              style={{fontFamily:'Gaegu', fontSize:20, width:80, border:'none', borderBottom:'2px dashed #2d2a26', outline:'none', padding:'2px 6px', background:'transparent', textAlign:'center'}}/>
            <span style={{fontFamily:'Gaegu', fontSize:18, color:'#7a7064'}}>의</span>
            <input value={situation} onChange={e=>setSituation(e.target.value)}
              style={{fontFamily:'Gaegu', fontSize:20, flex:1, minWidth:180, border:'none', borderBottom:'2px dashed #2d2a26', outline:'none', padding:'2px 6px', background:'transparent'}}/>
          </div>
        </div>
      </div>

      {/* The 4 character bubbles */}
      <div style={{position:'relative', zIndex:2, display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:14}}>
        {V3_TYPES.map((t,i) => (
          <V3Character key={t.key} type={t} idx={i}
            value={inputs[t.key]}
            onChange={v=>setInputs(s=>({...s,[t.key]:v}))}
            onAdd={()=>addNote(t.key)}
            onExample={()=>exampleFor(t.key)}
            count={counts[t.key]}
            focused={focused===t.key}
            onFocus={()=>setFocused(t.key)}
            onBlur={()=>setFocused(null)}
          />
        ))}
      </div>

      {/* Sky board */}
      <div style={{position:'relative', zIndex:2, marginTop:34}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', gap:12, flexWrap:'wrap', marginBottom:12}}>
          <h2 style={{fontFamily:'Jua', fontSize:28, margin:0, display:'flex', alignItems:'center', gap:10}}>
            <span style={{fontSize:30}}>☁️</span> 질문이 떠다니는 하늘
          </h2>
          <div style={{display:'flex', gap:8, flexWrap:'wrap', alignItems:'center'}}>
            {V3_TYPES.map(t => (
              <span key={t.key} style={{
                fontFamily:'Jua', fontSize:14, padding:'5px 12px', borderRadius:999,
                background:'#fff', border:`2px solid ${t.color}`, color:t.deep,
                display:'inline-flex', alignItems:'center', gap:6,
              }}>
                <span style={{width:10, height:10, borderRadius:'50%', background:t.color}}/>
                {t.label} {counts[t.key]}
              </span>
            ))}
            {allFour && <span style={{
              fontFamily:'Jua', fontSize:14, padding:'6px 14px', borderRadius:999,
              background:'linear-gradient(135deg,#F5C03F,#F06AA3)', color:'#fff', border:'2px solid #2d2a26',
              animation:'v3pop .4s ease',
            }}>🏆 네 친구 모두!</span>}
          </div>
        </div>

        <div style={{
          position:'relative', background:'linear-gradient(180deg, #E8F5FF 0%, #FFF8E8 100%)',
          border:'3px solid #2d2a26', borderRadius:24, padding:'28px 22px', minHeight:300,
          boxShadow:'0 6px 0 #2d2a26',
          display:'flex', flexWrap:'wrap', gap:18, alignContent:'flex-start', overflow:'hidden',
        }}>
          {/* decorative clouds */}
          <div aria-hidden style={{position:'absolute', top:18, right:40, width:70, height:30, background:'#fff', borderRadius:20, opacity:.6}}/>
          <div aria-hidden style={{position:'absolute', top:26, right:80, width:40, height:20, background:'#fff', borderRadius:14, opacity:.6}}/>
          <div aria-hidden style={{position:'absolute', bottom:20, left:40, width:60, height:26, background:'#fff', borderRadius:16, opacity:.5}}/>

          {notes.length===0 ? (
            <div style={{
              fontFamily:'Gaegu', fontSize:24, color:'#7a7064', width:'100%', textAlign:'center', padding:'40px 10px',
              position:'relative', zIndex:1,
            }}>여기에 질문 풍선이 둥실둥실 떠올라요 🎈✨</div>
          ) : notes.map(n => {
            const t = V3_TYPES.find(x=>x.key===n.type);
            return <V3Bubble key={n.id} note={n} type={t} onDel={()=>delNote(n.id)} />;
          })}
        </div>
      </div>

      {/* footer */}
      <div className="qc-no-print" style={{position:'relative', zIndex:2, marginTop:26, display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap'}}>
        <V3Btn bg="#B8F2C8" onClick={()=>window.print()}>🖨️ 인쇄</V3Btn>
        <V3Btn bg="#FFD4D4" onClick={clearAll}>🗑️ 모두 지우기</V3Btn>
      </div>
      <div style={{position:'relative', zIndex:2, textAlign:'center', marginTop:24, color:'#7a7064', fontSize:13, fontFamily:'Gaegu'}}>
        ⓒ 질문 풍선 놀이터 · 룰루랄라 한기쌤
      </div>

      {toast && <V3Toast toast={toast}/>}

      <style>{`
        @keyframes v3pop{0%{transform:scale(0)}70%{transform:scale(1.15)}100%{transform:scale(1)}}
        @keyframes v3float{0%,100%{transform:translateY(0) rotate(var(--t,0deg))}50%{transform:translateY(-4px) rotate(var(--t,0deg))}}
        @keyframes v3bubblein{0%{transform:scale(.3);opacity:0}70%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
        @media print{.qc-no-print{display:none !important}}
      `}</style>
    </div>
  );
}

function V3Character({type, idx, value, onChange, onAdd, onExample, count, focused, onFocus, onBlur}){
  const [hover, setHover] = React.useState(false);
  const lean = [-2, 1.5, -1, 2][idx];
  const talking = focused || value.length > 0;
  return (
    <div style={{
      position:'relative',
      transform:`rotate(${lean}deg) ${hover?'translateY(-4px)':''}`,
      transition:'transform .2s',
    }} onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}>
      {/* speech-bubble shape */}
      <div style={{
        background: type.color, borderRadius:'32px 32px 32px 6px',
        border:'3px solid #2d2a26', padding:'18px 16px 16px',
        boxShadow: hover ? '0 8px 0 #2d2a26' : '0 6px 0 #2d2a26',
        position:'relative',
        animation:`v3float 3.5s ease-in-out ${idx*.3}s infinite`,
        '--t': `${lean}deg`,
      }}>
        {/* counter badge */}
        <div style={{
          position:'absolute', top:-12, right:-12, width:34, height:34, borderRadius:'50%',
          background:'#fff', border:'3px solid #2d2a26', display:'flex', alignItems:'center', justifyContent:'center',
          fontFamily:'Jua', fontSize:15, zIndex:2,
        }}>{count}</div>

        {/* character face */}
        <div style={{display:'flex', flexDirection:'column', alignItems:'center', marginBottom:10}}>
          <div style={{
            background:'#fff', borderRadius:'50%', border:'3px solid #2d2a26',
            padding:6, marginBottom:6,
          }}>
            <V3Face type={type} size={58} talking={talking}/>
          </div>
          <div style={{
            fontFamily:'Jua', fontSize:22, color:'#fff', lineHeight:1,
            textShadow:'1px 1px 0 #2d2a26',
          }}>{type.label} 질문</div>
          <div style={{fontFamily:'Gaegu', fontSize:14, color:'rgba(255,255,255,.9)', marginTop:2}}>
            {type.prompt}
          </div>
        </div>

        {/* input */}
        <textarea value={value} onChange={e=>onChange(e.target.value)}
          onFocus={onFocus} onBlur={onBlur}
          onKeyDown={e=>{ if(e.key==='Enter' && !e.shiftKey && !e.nativeEvent.isComposing){ e.preventDefault(); onAdd(); } }}
          placeholder={type.placeholder}
          className="qc-no-print"
          style={{
            fontFamily:'Gaegu', fontSize:17, border:'2px solid #2d2a26', borderRadius:14,
            padding:'8px 10px', resize:'none', outline:'none', width:'100%', minHeight:60,
            background:'#fff', boxSizing:'border-box', color:'#2d2a26',
          }}/>

        <div className="qc-no-print" style={{display:'flex', gap:6, marginTop:8}}>
          <button onClick={onExample} style={{
            background:'#fff', border:'2px solid #2d2a26', borderRadius:10, padding:'7px 8px',
            fontSize:12, cursor:'pointer', fontFamily:'Jua', color:'#2d2a26',
          }}>💡</button>
          <button onClick={onAdd} style={{
            flex:1, fontFamily:'Jua', padding:'8px 10px', border:'2px solid #2d2a26', borderRadius:10,
            color:'#2d2a26', cursor:'pointer', fontSize:14, background:'#fff',
            boxShadow:'2px 2px 0 #2d2a26',
          }}>🎈 띄우기</button>
        </div>
      </div>

      {/* tail */}
      <svg width="30" height="24" viewBox="0 0 30 24" style={{position:'absolute', bottom:-22, left:4}}>
        <path d="M6 0 Q4 18 26 22 Q10 14 10 0z" fill={type.color} stroke="#2d2a26" strokeWidth="3" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

function V3Bubble({note, type, onDel}){
  return (
    <div style={{
      position:'relative', width:200,
      animation:'v3bubblein .35s cubic-bezier(.3,1.4,.5,1)',
    }}>
      <div style={{
        background:'#fff', border:`3px solid ${type.color}`, borderRadius:'24px 24px 24px 4px',
        padding:'12px 14px 14px', boxShadow:`0 4px 0 ${type.deep}`,
        transform:`rotate(${note.tilt}deg)`,
        position:'relative', color:'#2d2a26',
        fontFamily:'Gamja Flower, Gaegu, sans-serif', fontSize:18, lineHeight:1.35,
        wordBreak:'keep-all',
      }}>
        <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:8}}>
          <div style={{width:22, height:22, borderRadius:'50%', background:type.color,
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:12}}>
            <V3Face type={type} size={18}/>
          </div>
          <span style={{fontFamily:'Jua', fontSize:12, color:type.deep}}>{type.label}</span>
          <button onClick={onDel} className="qc-no-print" style={{
            marginLeft:'auto', border:'none', background:'transparent', cursor:'pointer',
            color:'#7a7064', fontSize:14,
          }}>✕</button>
        </div>
        <div>{note.text}</div>
      </div>
    </div>
  );
}

function V3Btn({children, bg, onClick}){
  const [h,setH]=React.useState(false);
  return <button onClick={onClick}
    onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
    style={{
      fontFamily:'Jua', fontSize:15, padding:'12px 24px', borderRadius:999,
      border:'3px solid #2d2a26', background:bg, cursor:'pointer',
      boxShadow: h ? '0 5px 0 #2d2a26' : '0 4px 0 #2d2a26',
      transform: h ? 'translateY(-1px)' : 'none', transition:'all .15s',
    }}>{children}</button>;
}

Object.assign(window, { V3 });
