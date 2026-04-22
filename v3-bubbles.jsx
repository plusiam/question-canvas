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
const V3_MAX_CHARS = 120;

/* 크기 프리셋 */
const V3_SIZES = {
  S: { width: 140, minHeight: 110, fontSize: 15, label: 'S' },
  M: { width: 190, minHeight: 140, fontSize: 19, label: 'M' },
  L: { width: 260, minHeight: 180, fontSize: 23, label: 'L' },
};

/* 색상 팔레트 */
const V3_COLORS = [
  { hex:'#2d2a26', label:'먹' },
  { hex:'#C0392B', label:'빨강' },
  { hex:'#1A6FA8', label:'파랑' },
  { hex:'#1E8449', label:'초록' },
  { hex:'#D4680A', label:'주황' },
  { hex:'#6B3FA0', label:'보라' },
];

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
      {eye==='round' && <circle cx="-9" cy="-5" r="3" fill="#2d2a26"/>}
      {eye==='sparkle' && <><circle cx="-9" cy="-5" r="3.5" fill="#2d2a26"/><circle cx="-8" cy="-6" r="1" fill="#fff"/></>}
      {eye==='curved' && <path d="M-13 -5 Q-9 -9 -5 -5" stroke="#2d2a26" strokeWidth="2.5" fill="none" strokeLinecap="round"/>}
      {eye==='star' && <path d="M-9 -8 L-8 -5 L-5 -4 L-8 -3 L-9 0 L-10 -3 L-13 -4 L-10 -5 z" fill="#2d2a26"/>}
      {eye==='round' && <circle cx="9" cy="-5" r="3" fill="#2d2a26"/>}
      {eye==='sparkle' && <><circle cx="9" cy="-5" r="3.5" fill="#2d2a26"/><circle cx="10" cy="-6" r="1" fill="#fff"/></>}
      {eye==='curved' && <path d="M5 -5 Q9 -9 13 -5" stroke="#2d2a26" strokeWidth="2.5" fill="none" strokeLinecap="round"/>}
      {eye==='star' && <path d="M9 -8 L10 -5 L13 -4 L10 -3 L9 0 L8 -3 L5 -4 L8 -5 z" fill="#2d2a26"/>}
      <circle cx="-12" cy="3" r="3.5" fill={type.deep} opacity=".35"/>
      <circle cx="12" cy="3" r="3.5" fill={type.deep} opacity=".35"/>
      <path d={mouthPath} stroke="#2d2a26" strokeWidth="2.5" fill={type.mouth==='open'?'#2d2a26':'none'} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ── 텍스트 입력 모달 (v3) ── */
function V3TextModal({ open, onClose, onConfirm, onExample, value, onChange, typeColor, type, noteSize, onSize }) {
  const taRef = React.useRef(null);
  const composing = React.useRef(false);
  const over = value.length > V3_MAX_CHARS;

  React.useEffect(() => {
    if (open) setTimeout(() => { taRef.current?.focus(); }, 50);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  if (!open) return null;

  const handleConfirm = () => {
    if (!value.trim() || over) return;
    onConfirm();
  };

  return (
    <div className="qc-no-print" onClick={onClose} style={{
      position:'fixed', inset:0, zIndex:1000,
      background:'rgba(0,0,0,.55)', display:'flex', alignItems:'center', justifyContent:'center',
    }}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:'#fff', borderRadius:24, border:`4px solid ${typeColor}`,
        boxShadow:`0 10px 0 ${type.deep}`, padding:'24px 28px',
        display:'flex', flexDirection:'column', gap:14,
        width:520, maxWidth:'95vw',
      }}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:12}}>
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <div style={{
              background:'#fff', borderRadius:'50%', border:`3px solid ${typeColor}`,
              padding:6, display:'inline-flex',
            }}>
              <V3Face type={type} size={44}/>
            </div>
            <div>
              <div style={{fontFamily:'Jua', fontSize:22, color:typeColor, lineHeight:1}}>{type.label} 질문</div>
              <div style={{fontFamily:'Gaegu', fontSize:13, color:'#7a7064'}}>{type.prompt}</div>
            </div>
          </div>
          <button onClick={onClose} style={{
            fontFamily:'Jua', fontSize:14, padding:'4px 14px', borderRadius:999,
            border:'2px solid #ddd', background:'#f5f5f5', cursor:'pointer',
          }}>닫기</button>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:6}}>
          <span style={{fontFamily:'Jua', fontSize:12, color:'#7a7064', minWidth:28}}>크기</span>
          {Object.entries(V3_SIZES).map(([k,v]) => (
            <button key={k} onClick={()=>onSize(k)} style={{
              fontFamily:'Jua', fontSize:12, width:30, height:24, borderRadius:999,
              border:`2px solid ${typeColor}`,
              background: noteSize===k ? typeColor : '#fff',
              color: noteSize===k ? '#fff' : typeColor, cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>{v.label}</button>
          ))}
        </div>
        <div style={{position:'relative'}}>
          <textarea ref={taRef} value={value} onChange={e=>onChange(e.target.value)}
            onCompositionStart={()=>{ composing.current=true; }}
            onCompositionEnd={()=>{ composing.current=false; }}
            onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey&&!composing.current){e.preventDefault();handleConfirm();} }}
            placeholder={type.placeholder}
            style={{
              fontFamily:'Gaegu', fontSize:22, border:`2px solid ${over?'#D63384':typeColor}`, borderRadius:14,
              padding:'14px 16px', resize:'none', outline:'none', width:'100%', minHeight:120,
              background: over?'#fff0f6':'#fff', boxSizing:'border-box', color:'#2d2a26', lineHeight:1.6,
            }}/>
          <span style={{
            position:'absolute', bottom:8, right:10, fontFamily:'Noto Sans KR', fontSize:11,
            color: over?'#D63384':'#aaa', fontWeight: over?700:400,
          }}>{value.length}/{V3_MAX_CHARS}</span>
        </div>
        <div style={{display:'flex', gap:8}}>
          <button onClick={onExample} style={{
            background:'#fff', border:'2px solid #2d2a26', borderRadius:10, padding:'10px 12px',
            fontSize:13, cursor:'pointer', fontFamily:'Jua', color:'#2d2a26', whiteSpace:'nowrap',
          }}>💡 힌트</button>
          <button onClick={handleConfirm} style={{
            flex:1, fontFamily:'Jua', padding:'12px 14px', border:'2px solid #2d2a26', borderRadius:12,
            color:'#2d2a26', cursor:'pointer', fontSize:17, background:'#fff',
            boxShadow:`0 4px 0 ${type.deep}`, opacity: !value.trim()||over ? 0.5 : 1,
          }}>🎈 띄우기</button>
        </div>
      </div>
    </div>
  );
}

/* ── 손글씨 모달 (v3) ── */
function V3DrawModal({ open, onClose, onConfirm, bgColor, penColor, typeColor, type }) {
  const canvasRef = React.useRef(null);
  const [pc, setPc] = React.useState(penColor);
  if (!open) return null;
  const handleConfirm = () => {
    if (!canvasRef.current?.isDirty()) return;
    onConfirm(canvasRef);
  };
  return (
    <div className="qc-no-print" onClick={onClose} style={{
      position:'fixed', inset:0, zIndex:1000,
      background:'rgba(0,0,0,.55)', display:'flex', alignItems:'center', justifyContent:'center',
    }}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:'#fff', borderRadius:24, border:`4px solid ${typeColor}`,
        boxShadow:`0 10px 0 ${type.deep}`, padding:'24px 28px',
        display:'flex', flexDirection:'column', gap:14, maxWidth:'95vw',
      }}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:20}}>
          <span style={{fontFamily:'Jua', fontSize:20, color:typeColor}}>{type.icon} {type.label} 손글씨</span>
          <button onClick={onClose} style={{
            fontFamily:'Jua', fontSize:14, padding:'4px 14px', borderRadius:999,
            border:'2px solid #ddd', background:'#f5f5f5', cursor:'pointer',
          }}>닫기</button>
        </div>
        <V3DrawCanvas ref={canvasRef} bgColor={bgColor} penColor={pc} large />
        <div style={{display:'flex', alignItems:'center', gap:6, flexWrap:'wrap'}}>
          {V3_COLORS.map(c => (
            <button key={c.hex} onClick={()=>setPc(c.hex)} title={c.label} style={{
              width:24, height:24, borderRadius:'50%', background:c.hex, cursor:'pointer',
              border: pc===c.hex ? '3px solid #2d2a26' : '2px solid rgba(0,0,0,.15)',
              boxShadow: pc===c.hex ? '0 0 0 2px rgba(255,255,255,.8)' : 'none', padding:0,
            }}/>
          ))}
        </div>
        <button onClick={handleConfirm} style={{
          fontFamily:'Jua', fontSize:18, padding:'12px 0', border:'none', borderRadius:14,
          color:'#fff', cursor:'pointer', background:typeColor,
          boxShadow:`0 4px 0 ${type.deep}`,
        }}>🎈 띄우기</button>
      </div>
    </div>
  );
}

/* ── DrawCanvas (v3 스타일) ── */
const V3DrawCanvas = React.forwardRef(function V3DrawCanvas({ bgColor='#fff', penColor='#2d2a26', initialDataURL=null, large=false }, ref) {
  const canvasEl = React.useRef(null);
  const isDrawing = React.useRef(false);
  const isDirtyRef = React.useRef(false);
  const [penSize, setPenSize] = React.useState(4);
  const penColorRef = React.useRef(penColor);

  React.useEffect(() => { penColorRef.current = penColor; }, [penColor]);

  const W = large ? 480 : 280;
  const H = large ? 300 : 160;

  React.useEffect(() => {
    const canvas = canvasEl.current;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, W, H);
    if (initialDataURL) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, W, H);
      img.src = initialDataURL;
    }
  }, []);

  React.useImperativeHandle(ref, () => ({
    getDataURL: () => canvasEl.current.toDataURL('image/jpeg', 0.75),
    isDirty: () => isDirtyRef.current,
    clear: () => {
      const ctx = canvasEl.current.getContext('2d');
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, W, H);
      isDirtyRef.current = false;
    },
  }));

  const getPos = (e) => {
    const rect = canvasEl.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e) => {
    isDrawing.current = true;
    isDirtyRef.current = true;
    canvasEl.current.setPointerCapture(e.pointerId);
    const ctx = canvasEl.current.getContext('2d');
    ctx.lineWidth = penSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = penColorRef.current;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const onPointerMove = (e) => {
    if (!isDrawing.current) return;
    const ctx = canvasEl.current.getContext('2d');
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const onPointerUp = () => { isDrawing.current = false; };

  const clearAll = () => {
    const ctx = canvasEl.current.getContext('2d');
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 280, 160);
    isDirtyRef.current = false;
  };

  const penSizes = [
    { size: 2, label: '얇게' },
    { size: 5, label: '보통' },
    { size: 10, label: '굵게' },
  ];

  return (
    <div>
      <canvas
        ref={canvasEl}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          display:'block', border:'2px solid #2d2a26', borderRadius:12,
          cursor:'crosshair', touchAction:'none', background: bgColor,
        }}
      />
      <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:6 }}>
        {penSizes.map(p => (
          <button key={p.size} onClick={() => setPenSize(p.size)} style={{
            fontFamily:'Jua', fontSize:12, padding:'3px 10px', borderRadius:999,
            border:'2px solid #2d2a26',
            background: penSize === p.size ? '#2d2a26' : '#fff',
            color: penSize === p.size ? '#fff' : '#2d2a26',
            cursor:'pointer',
          }}>{p.label}</button>
        ))}
        <button onClick={clearAll} style={{
          marginLeft:'auto', fontFamily:'Jua', fontSize:12, padding:'3px 10px', borderRadius:999,
          border:'2px solid #F06AA3', color:'#F06AA3', background:'#fff', cursor:'pointer',
        }}>전체 지우기</button>
      </div>
    </div>
  );
});

/* 크기·색상 선택 공용 UI (v3 스타일) */
function V3NoteOptions({ size, onSize, penColor, onPenColor, typeColor, showColor }) {
  return (
    <div className="qc-no-print" style={{display:'flex', flexDirection:'column', gap:5}}>
      <div style={{display:'flex', alignItems:'center', gap:6}}>
        <span style={{fontFamily:'Jua', fontSize:11, color:'rgba(255,255,255,.85)', minWidth:26}}>크기</span>
        <div style={{display:'flex', gap:4}}>
          {Object.entries(V3_SIZES).map(([k, v]) => (
            <button key={k} onClick={()=>onSize(k)} style={{
              fontFamily:'Jua', fontSize:12, width:30, height:24, borderRadius:999,
              border:'2px solid #2d2a26',
              background: size===k ? '#2d2a26' : 'rgba(255,255,255,.8)',
              color: size===k ? '#fff' : '#2d2a26',
              cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
            }}>{v.label}</button>
          ))}
        </div>
      </div>
      {showColor && (
        <div style={{display:'flex', alignItems:'center', gap:6}}>
          <span style={{fontFamily:'Jua', fontSize:11, color:'rgba(255,255,255,.85)', minWidth:26}}>색</span>
          <div style={{display:'flex', gap:4}}>
            {V3_COLORS.map(c => (
              <button key={c.hex} onClick={()=>onPenColor(c.hex)}
                title={c.label}
                style={{
                  width:20, height:20, borderRadius:'50%', background:c.hex, cursor:'pointer',
                  border: penColor===c.hex ? '3px solid #2d2a26' : '2px solid rgba(0,0,0,.2)',
                  boxShadow: penColor===c.hex ? '0 0 0 2px rgba(255,255,255,.7)' : 'none',
                  padding:0,
                }}/>
            ))}
          </div>
        </div>
      )}
    </div>
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
  const undoStack = React.useRef([]);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(V3_STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (Array.isArray(s.notes)) setNotes(s.notes);
        if (typeof s.char1 === 'string') setChar1(s.char1);
        if (typeof s.char2 === 'string') setChar2(s.char2);
        if (typeof s.situation === 'string') setSituation(s.situation);
        if (Number.isFinite(s.nextId)) idRef.current = s.nextId;
      }
      const sName = sessionStorage.getItem('qc-v3-name');
      const sClass = sessionStorage.getItem('qc-v3-class');
      if (sName) setName(sName);
      if (sClass) setClassInfo(sClass);
    } catch {}
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(V3_STORAGE_KEY, JSON.stringify({
        notes, char1, char2, situation, nextId: idRef.current,
      }));
      sessionStorage.setItem('qc-v3-name', name);
      sessionStorage.setItem('qc-v3-class', classInfo);
    } catch(e) {
      if (e && (e.name === 'QuotaExceededError' || e.code === 22)) {
        showToast('저장 공간이 부족해요. 손글씨 노트가 많으면 줄여주세요 🗂️');
        try {
          sessionStorage.setItem('qc-v3-name', name);
          sessionStorage.setItem('qc-v3-class', classInfo);
        } catch {}
      }
    }
  }, [hydrated, notes, name, classInfo, char1, char2, situation]);

  const showToast = (msg, action) => {
    setToast({msg, action});
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(()=>setToast(null), action ? 4000 : 1800);
  };

  const nextPos = (currentNotes, sz) => {
    const s = V3_SIZES[sz||'M'];
    const cols = Math.floor(1012 / (s.width + 22));
    const idx = currentNotes.length;
    return { x: 24 + (idx % cols) * (s.width + 22), y: 24 + Math.floor(idx / cols) * (s.minHeight + 22) };
  };

  const addNote = (type, size, penColor) => {
    const text = inputs[type].trim();
    if(!text){ showToast('먼저 질문을 써주세요 ✍️'); return; }
    if(text.length > V3_MAX_CHARS){ showToast(`질문이 너무 길어요! ${V3_MAX_CHARS}자 이내로 줄여주세요 ✂️`); return; }
    setNotes(n => {
      const pos = nextPos(n, size);
      return [...n, {id:idRef.current++, type, text, tilt:(Math.random()*8-4).toFixed(1), drawData:null, size:size||'M', penColor:penColor||'#2d2a26', x:pos.x, y:pos.y}];
    });
    setInputs(i => ({...i, [type]:''}));
    showToast('질문이 떠올랐어요! 🎈');
  };

  const addDrawNote = (type, canvasRef, size, penColor) => {
    if (!canvasRef.current?.isDirty()) { showToast('먼저 그림을 그려주세요 ✏️'); return; }
    const drawData = canvasRef.current.getDataURL();
    setNotes(n => {
      const pos = nextPos(n, size);
      return [...n, {id:idRef.current++, type, text:'', tilt:(Math.random()*8-4).toFixed(1), drawData, size:size||'M', penColor:penColor||'#2d2a26', x:pos.x, y:pos.y}];
    });
    canvasRef.current.clear();
    showToast('질문이 떠올랐어요! 🎈');
  };

  const delNote = (id) => {
    const found = notes.find(n=>n.id===id);
    if(!found) return;
    undoStack.current.push(found);
    setNotes(n=>n.filter(x=>x.id!==id));
    showToast('풍선이 사라졌어요 (Ctrl+Z로 되돌리기)', { label:'되돌리기', onClick: () => {
      const last = undoStack.current.pop();
      if(last) setNotes(n => n.some(x=>x.id===last.id) ? n : [...n, last]);
      setToast(null);
      clearTimeout(toastTimer.current);
    }});
  };
  const moveNote = (id, x, y) => {
    setNotes(n => n.map(note => note.id===id ? {...note, x, y} : note));
  };

  const updateNote = (id, patch) => {
    setNotes(n => n.map(x => x.id===id ? {...x, ...patch} : x));
    showToast('수정했어요 ✏️');
  };

  React.useEffect(() => {
    const handler = (e) => {
      if(!(e.ctrlKey || e.metaKey) || e.key !== 'z') return;
      const tag = document.activeElement?.tagName;
      if(tag === 'INPUT' || tag === 'TEXTAREA') return;
      e.preventDefault();
      const last = undoStack.current.pop();
      if(last){
        setNotes(n => n.some(x=>x.id===last.id) ? n : [...n, last]);
        showToast('되돌렸어요! ↩️');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const exampleFor = (type) => {
    const arr = V3_EXAMPLES({char1, char2})[type];
    setInputs(i => ({...i, [type]: arr[Math.floor(Math.random()*arr.length)]}));
  };
  const clearAll = () => {
    if(!notes.length) return;
    showToast('정말 모두 지울까요?', {
      label: '네, 지워요 🗑️',
      onClick: () => {
        const backup = [...notes];
        undoStack.current.push(...backup);
        setNotes([]); idRef.current = 1;
        try {
          localStorage.removeItem(V3_STORAGE_KEY);
          sessionStorage.removeItem('qc-v3-name');
          sessionStorage.removeItem('qc-v3-class');
        } catch {}
        setToast(null);
        clearTimeout(toastTimer.current);
        showToast('모두 지웠어요 (Ctrl+Z로 되돌리기)');
      },
    });
  };

  const counts = notes.reduce((m,n)=>{m[n.type]=(m[n.type]||0)+1; return m;}, {fact:0,think:0,heart:0,imagine:0});
  const allFour = V3_TYPES.every(t => counts[t.key] >= 1);

  return (
    <div className="v3-root" style={{
      width, minHeight:height, position:'relative',
      fontFamily:"'Noto Sans KR', sans-serif", color:'#2d2a26',
      background: 'linear-gradient(180deg, #C7E9FF 0%, #FFF3D0 55%, #FFDDE9 100%)',
      padding:'36px 44px 60px', boxSizing:'border-box', overflow:'hidden',
    }}>
      <div style={{position:'absolute', top:80, right:40, width:60, height:60, borderRadius:'50%', background:'rgba(255,255,255,.5)', boxShadow:'inset -6px -6px 0 rgba(255,255,255,.6)'}}/>
      <div style={{position:'absolute', top:260, left:20, width:40, height:40, borderRadius:'50%', background:'rgba(255,255,255,.5)'}}/>
      <div style={{position:'absolute', bottom:180, right:60, width:80, height:80, borderRadius:'50%', background:'rgba(255,255,255,.4)'}}/>

      {/* Header */}
      <div className="v3-header" style={{position:'relative', zIndex:2, textAlign:'center', marginBottom:18}}>
        <a href="index.html" className="qc-no-print" style={{
          display:'inline-flex', alignItems:'center', gap:5,
          fontFamily:'Jua', fontSize:13, color:'#555', textDecoration:'none',
          background:'rgba(255,255,255,.75)', border:'2px solid rgba(0,0,0,.18)', borderRadius:100,
          padding:'4px 14px', marginBottom:12,
          transition:'background 0.12s',
        }}
        onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,.95)'}
        onMouseOut={e=>e.currentTarget.style.background='rgba(255,255,255,.75)'}
        >← 홈으로</a>
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
          <div style={{position:'absolute', bottom:-18, left:'50%', transform:'translateX(-50%)',
            width:0, height:0, borderLeft:'16px solid transparent', borderRight:'16px solid transparent',
            borderTop:'18px solid #2d2a26'}}/>
          <div style={{position:'absolute', bottom:-13, left:'50%', transform:'translateX(-50%)',
            width:0, height:0, borderLeft:'12px solid transparent', borderRight:'12px solid transparent',
            borderTop:'14px solid #fff'}}/>
        </div>
      </div>

      {/* Name + story row */}
      <div className="v3-name-story" style={{position:'relative', zIndex:2, display:'grid', gridTemplateColumns:'1fr 2fr', gap:16, marginTop:10, marginBottom:24}}>
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
      <div className="qc-no-print" style={{position:'relative', zIndex:2, display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:14}}>
        {V3_TYPES.map((t,i) => (
          <V3Character key={t.key} type={t} idx={i}
            value={inputs[t.key]}
            onChange={v=>setInputs(s=>({...s,[t.key]:v}))}
            onAdd={(size, penColor)=>addNote(t.key, size, penColor)}
            onAddDraw={(ref, size, penColor)=>addDrawNote(t.key, ref, size, penColor)}
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
        <div className="v3-board-header" style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', gap:12, flexWrap:'wrap', marginBottom:12}}>
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

        <div className="v3-board-inner" style={{
          position:'relative', background:'linear-gradient(180deg, #E8F5FF 0%, #FFF8E8 100%)',
          border:'3px solid #2d2a26', borderRadius:24, minHeight:380,
          boxShadow:'0 6px 0 #2d2a26', overflow:'hidden',
        }}>
          <div aria-hidden style={{position:'absolute', top:18, right:40, width:70, height:30, background:'#fff', borderRadius:20, opacity:.6, pointerEvents:'none'}}/>
          <div aria-hidden style={{position:'absolute', top:26, right:80, width:40, height:20, background:'#fff', borderRadius:14, opacity:.6, pointerEvents:'none'}}/>
          <div aria-hidden style={{position:'absolute', bottom:20, left:40, width:60, height:26, background:'#fff', borderRadius:16, opacity:.5, pointerEvents:'none'}}/>

          {notes.length===0 ? (
            <div style={{
              fontFamily:'Gaegu', fontSize:24, color:'#7a7064', width:'100%', textAlign:'center', padding:'40px 10px',
              position:'relative', zIndex:1,
            }}>여기에 질문 풍선이 둥실둥실 떠올라요 🎈✨</div>
          ) : notes.map(n => {
            const t = V3_TYPES.find(x=>x.key===n.type);
            return <V3Bubble key={n.id} note={n} type={t} onDel={()=>delNote(n.id)} onUpdate={(p)=>updateNote(n.id,p)} onMove={(x,y)=>moveNote(n.id,x,y)} />;
          })}
        </div>
      </div>

      {/* footer */}
      <div className="qc-no-print" style={{position:'relative', zIndex:2, marginTop:26, display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap'}}>
        <V3Btn bg="#B8F2C8" onClick={()=>window.print()}>🖨️ 인쇄</V3Btn>
        <V3Btn bg="#FFD4D4" onClick={clearAll}>🗑️ 모두 지우기</V3Btn>
      </div>
      <div className="v3-copyright" style={{position:'relative', zIndex:2, textAlign:'center', marginTop:24, color:'#7a7064', fontSize:13, fontFamily:'Gaegu'}}>
        ⓒ 질문 풍선 놀이터 · 룰루랄라 한기쌤
      </div>

      {toast && <V3Toast toast={toast}/>}

      <style>{`
        @keyframes v3pop{0%{transform:scale(0)}70%{transform:scale(1.15)}100%{transform:scale(1)}}
        @keyframes v3float{0%,100%{transform:translateY(0) rotate(var(--t,0deg))}50%{transform:translateY(-4px) rotate(var(--t,0deg))}}
        @keyframes v3bubblein{0%{transform:scale(.3);opacity:0}70%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
        @media print{
          @page{margin:10mm 10mm;size:A4 portrait}
          .qc-no-print{display:none !important}
          html,body{margin:0 !important;padding:0 !important;background:#fff !important;
            -webkit-print-color-adjust:exact;print-color-adjust:exact}
          #root{padding:0}

          .v3-root{
            width:100% !important;
            max-width:100% !important;
            min-height:unset !important;
            padding:4mm 4mm !important;
            background:linear-gradient(180deg,#C7E9FF 0%,#FFF3D0 55%,#FFDDE9 100%) !important;
            box-sizing:border-box !important;
            overflow:visible !important;
          }

          .v3-header{
            margin-bottom:6px !important;
          }
          .v3-header>div{
            padding:8px 20px 10px !important;
            box-shadow:none !important;
            border:2px solid #2d2a26 !important;
          }
          .v3-header h1{font-size:20px !important;margin:0 !important}
          .v3-header p{font-size:11px !important;margin:2px 0 0 !important}
          .v3-header div[style*="borderTop"]{display:none !important}

          .v3-name-story{
            margin-top:4px !important;
            margin-bottom:10px !important;
            gap:8px !important;
          }
          .v3-name-story>div{
            padding:8px 12px !important;
            box-shadow:none !important;
            border:1.5px solid #2d2a26 !important;
          }

          .v3-board-header{
            margin-top:6px !important;
            margin-bottom:4px !important;
          }
          .v3-board-header h2{font-size:18px !important;margin:0 !important}

          .v3-board-inner{
            display:flex !important;
            flex-wrap:wrap !important;
            gap:3mm !important;
            align-content:flex-start !important;
            padding:3mm !important;
            min-height:unset !important;
            background:#EDF8FF !important;
            background-image:none !important;
            border:2px solid #2d2a26 !important;
            border-radius:16px !important;
            box-shadow:none !important;
            break-inside:auto !important;
            overflow:visible !important;
          }

          .v3-bubble{
            break-inside:avoid !important;
            page-break-inside:avoid !important;
            flex-shrink:0 !important;
            width:calc((100% - 6mm) / 3) !important;
            animation:none !important;
          }
          .v3-bubble>div{
            transform:none !important;
            box-shadow:1px 2px 3px rgba(0,0,0,.1) !important;
            height:52mm !important;
            min-height:52mm !important;
            overflow:hidden !important;
            padding:6px 8px !important;
            box-sizing:border-box !important;
            width:100% !important;
          }
          .v3-bubble.is-draw>div{
            height:auto !important;
            min-height:36mm !important;
          }
          .v3-bubble img{
            max-height:36mm !important;
            height:auto !important;
            width:100% !important;
            object-fit:contain !important;
          }

          .v3-copyright{display:none !important}
        }
      `}</style>
    </div>
  );
}

function V3Character({type, idx, value, onChange, onAdd, onAddDraw, onExample, count, focused, onFocus, onBlur, isDrawMode, onSetDrawMode}){
  const [hover, setHover] = React.useState(false);
  const [noteSize, setNoteSize] = React.useState('M');
  const [penColor, setPenColor] = React.useState('#2d2a26');
  const [drawModalOpen, setDrawModalOpen] = React.useState(false);
  const [textModalOpen, setTextModalOpen] = React.useState(false);
  const composing = React.useRef(false);
  const drawCanvasRef = React.useRef(null);
  const over = value.length > V3_MAX_CHARS;
  const lean = [-2, 1.5, -1, 2][idx];
  const talking = focused || value.length > 0;

  return (
    <div style={{
      position:'relative',
      transform:`rotate(${lean}deg) ${hover?'translateY(-4px)':''}`,
      transition:'transform .2s',
    }} onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}>
      <div style={{
        background: type.color, borderRadius:'32px 32px 32px 6px',
        border:'3px solid #2d2a26', padding:'18px 16px 16px',
        boxShadow: hover ? '0 8px 0 #2d2a26' : '0 6px 0 #2d2a26',
        position:'relative',
        animation:`v3float 3.5s ease-in-out ${idx*.3}s infinite`,
        '--t': `${lean}deg`,
      }}>
        <div style={{
          position:'absolute', top:-12, right:-12, width:34, height:34, borderRadius:'50%',
          background:'#fff', border:'3px solid #2d2a26', display:'flex', alignItems:'center', justifyContent:'center',
          fontFamily:'Jua', fontSize:15, zIndex:2,
        }}>{count}</div>

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

        {/* 입력 모드 탭 자리 — 손글씨는 모달로 */}
        <div className="qc-no-print" style={{display:'flex', gap:4, marginBottom:8, justifyContent:'center'}}>
          {[{id:'text', label:'⌨️ 타자'}].map(m => (
            <button key={m.id} style={{
              fontFamily:'Jua', fontSize:12, padding:'4px 12px', borderRadius:999,
              border:'2px solid #2d2a26',
              background: '#2d2a26',
              color: '#fff',
              cursor:'default',
            }}>{m.label}</button>
          ))}
        </div>

        {/* 크기 옵션 */}
        <V3NoteOptions
          size={noteSize} onSize={setNoteSize}
          penColor={penColor} onPenColor={setPenColor}
          typeColor={type.color}
          showColor={false}
        />

        {/* 텍스트 미리보기 — 클릭하면 모달 오픈 */}
        <div className="qc-no-print" onClick={()=>setTextModalOpen(true)} style={{
          fontFamily:'Gaegu', fontSize:15, border:`2px solid ${over?'#D63384':'#2d2a26'}`, borderRadius:14,
          padding:'8px 10px', minHeight:48, background: over?'#fff0f6':'#fff', boxSizing:'border-box',
          color: value?'#2d2a26':'rgba(255,255,255,.7)', cursor:'text', lineHeight:1.5, position:'relative',
        }}>
          {value || type.placeholder}
          {value && <span style={{
            position:'absolute', bottom:4, right:6, fontFamily:'Noto Sans KR', fontSize:9,
            color: over?'#D63384':'#aaa', fontWeight: over?700:400,
          }}>{value.length}/{V3_MAX_CHARS}</span>}
        </div>
        <div className="qc-no-print" style={{display:'flex', gap:6, marginTop:8}}>
          <button onClick={onExample} style={{
            background:'#fff', border:'2px solid #2d2a26', borderRadius:10, padding:'7px 8px',
            fontSize:12, cursor:'pointer', fontFamily:'Jua', color:'#2d2a26',
          }}>💡</button>
          <button onClick={()=>onAdd(noteSize, penColor)} style={{
            flex:1, fontFamily:'Jua', padding:'8px 10px', border:'2px solid #2d2a26', borderRadius:10,
            color:'#2d2a26', cursor:'pointer', fontSize:14, background:'#fff',
            boxShadow:'2px 2px 0 #2d2a26', opacity: over||!value.trim() ? 0.5 : 1,
          }}>🎈 띄우기</button>
          <button onClick={()=>setDrawModalOpen(true)} style={{
            fontFamily:'Jua', fontSize:12, padding:'7px 10px', border:'2px solid #2d2a26', borderRadius:10,
            color:'#2d2a26', background:'rgba(255,255,255,.8)', cursor:'pointer', whiteSpace:'nowrap',
          }}>✏️ 손으로</button>
        </div>

        <V3TextModal
          open={textModalOpen}
          onClose={()=>setTextModalOpen(false)}
          onConfirm={()=>{ onAdd(noteSize, penColor); setTextModalOpen(false); }}
          onExample={onExample}
          value={value}
          onChange={onChange}
          typeColor={type.color}
          type={type}
          noteSize={noteSize}
          onSize={setNoteSize}
        />

        <V3DrawModal
          open={drawModalOpen}
          onClose={()=>setDrawModalOpen(false)}
          onConfirm={(ref)=>{ onAddDraw(ref, noteSize, penColor); setDrawModalOpen(false); }}
          bgColor="#fff"
          penColor={penColor}
          typeColor={type.color}
          type={type}
        />
      </div>

      {/* tail */}
      <svg width="30" height="24" viewBox="0 0 30 24" style={{position:'absolute', bottom:-22, left:4}}>
        <path d="M6 0 Q4 18 26 22 Q10 14 10 0z" fill={type.color} stroke="#2d2a26" strokeWidth="3" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

function V3Bubble({note, type, onDel, onUpdate, onMove}){
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(note.text);
  const [draftType, setDraftType] = React.useState(note.type);
  const [draftSize, setDraftSize] = React.useState(note.size||'M');
  const [dragging, setDragging] = React.useState(false);
  const taRef = React.useRef(null);
  const editDrawRef = React.useRef(null);
  const composing = React.useRef(false);
  const dragOffset = React.useRef({x:0, y:0});
  const isDrawNote = !!note.drawData;

  const onDragStart = (e) => {
    if(editing) return;
    if(e.target.closest('button')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = e.currentTarget.getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setDragging(true);
  };
  const onDragMove = (e) => {
    if(!dragging) return;
    const board = e.currentTarget.closest('.v3-board-inner');
    if(!board) return;
    const boardRect = board.getBoundingClientRect();
    const sz = V3_SIZES[note.size||'M'];
    const x = Math.max(0, Math.min(e.clientX - boardRect.left - dragOffset.current.x, boardRect.width - sz.width));
    const y = Math.max(0, e.clientY - boardRect.top - dragOffset.current.y);
    onMove(x, y);
  };
  const onDragEnd = () => setDragging(false);

  const sz = V3_SIZES[note.size||'M'];

  const openEdit = () => {
    setDraft(note.text);
    setDraftType(note.type);
    setDraftSize(note.size||'M');
    setEditing(true);
    if (!isDrawNote) setTimeout(()=>{ taRef.current?.focus(); taRef.current?.select(); }, 30);
  };
  const save = () => {
    if (isDrawNote) {
      const newData = editDrawRef.current?.isDirty()
        ? editDrawRef.current.getDataURL()
        : note.drawData;
      onUpdate({text:'', type:draftType, drawData:newData, size:draftSize});
    } else {
      const t = draft.trim();
      if(t) onUpdate({text:t, type:draftType, drawData:null, size:draftSize});
    }
    setEditing(false);
  };
  const cancel = () => setEditing(false);
  const curType = V3_TYPES.find(t=>t.key===draftType);

  if(editing){
    return (
      <div style={{position:'absolute', left: note.x ?? 24, top: note.y ?? 24, zIndex:200}}>
      <div className="qc-no-print" style={{
        position:'relative', width: isDrawNote ? 320 : 220,
        background:'#fff', border:`3px solid ${type.color}`,
        borderRadius:16, padding:'12px 14px',
        boxShadow:`0 6px 0 ${type.deep}`,
        display:'flex', flexDirection:'column', gap:8,
        animation:'v3bubblein .2s ease',
      }}>
        <div style={{display:'flex', gap:4, flexWrap:'wrap'}}>
          {V3_TYPES.map(t=>(
            <button key={t.key} onClick={()=>setDraftType(t.key)} style={{
              fontFamily:'Jua', fontSize:11, padding:'2px 8px', borderRadius:999,
              border:`2px solid ${t.color}`,
              background: draftType===t.key ? t.color : '#fff',
              color: draftType===t.key ? '#fff' : t.deep,
              cursor:'pointer',
            }}>{t.icon} {t.label}</button>
          ))}
        </div>
        {/* 크기 선택 */}
        <div style={{display:'flex', alignItems:'center', gap:6}}>
          <span style={{fontFamily:'Jua', fontSize:11, color:'#7a7064', minWidth:26}}>크기</span>
          {Object.entries(V3_SIZES).map(([k,v])=>(
            <button key={k} onClick={()=>setDraftSize(k)} style={{
              fontFamily:'Jua', fontSize:12, width:30, height:24, borderRadius:999,
              border:`2px solid ${curType?curType.color:'#888'}`,
              background: draftSize===k ? (curType?curType.color:'#888') : '#fff',
              color: draftSize===k ? '#fff' : (curType?curType.color:'#888'),
              cursor:'pointer',
            }}>{v.label}</button>
          ))}
        </div>
        {isDrawNote ? (
          <V3DrawCanvas ref={editDrawRef} bgColor="#fff" penColor={curType ? curType.deep : '#2d2a26'} initialDataURL={note.drawData} />
        ) : (
          <textarea ref={taRef} value={draft} onChange={e=>setDraft(e.target.value)}
            onCompositionStart={()=>{ composing.current=true; }}
            onCompositionEnd={()=>{ composing.current=false; }}
            onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey&&!composing.current){e.preventDefault();save();} if(e.key==='Escape') cancel(); }}
            style={{
              fontFamily:'Gaegu', fontSize:18, border:`2px solid ${curType ? curType.color : '#ccc'}`,
              borderRadius:10, padding:'8px 10px', resize:'none', outline:'none',
              minHeight:70, boxSizing:'border-box', width:'100%',
            }}/>
        )}
        <div style={{display:'flex', gap:6}}>
          <button onClick={save} style={{
            flex:1, fontFamily:'Jua', fontSize:14, padding:'7px 0', borderRadius:999,
            border:'none', background: curType ? curType.color : '#888', color:'#fff', cursor:'pointer',
          }}>저장</button>
          <button onClick={cancel} style={{
            fontFamily:'Jua', fontSize:14, padding:'7px 12px', borderRadius:999,
            border:'2px solid #ddd', background:'#f5f5f5', cursor:'pointer',
          }}>취소</button>
          <button onClick={onDel} style={{
            fontFamily:'Jua', fontSize:14, padding:'7px 12px', borderRadius:999,
            border:'2px solid #ff6b9d', background:'#fff0f6', color:'#d63384', cursor:'pointer',
          }}>삭제</button>
        </div>
      </div>
      </div>
    );
  }

  return (
    <div className={`v3-bubble${isDrawNote ? ' is-draw' : ''}`}
      onPointerDown={onDragStart}
      onPointerMove={onDragMove}
      onPointerUp={onDragEnd}
      onPointerCancel={onDragEnd}
      style={{
        position:'absolute',
        left: note.x ?? 24, top: note.y ?? 24,
        width: sz.width,
        animation:'v3bubblein .35s cubic-bezier(.3,1.4,.5,1)',
        cursor: dragging ? 'grabbing' : 'grab',
        zIndex: dragging ? 100 : 1,
        userSelect:'none', touchAction:'none',
      }}>
      <div style={{
        background:'#fff', border:`3px solid ${type.color}`, borderRadius:'24px 24px 24px 4px',
        padding:'12px 14px 14px', minHeight: sz.minHeight,
        boxShadow: dragging ? `6px 10px 20px ${type.deep}88` : `0 4px 0 ${type.deep}`,
        transform:`rotate(${note.tilt}deg)${dragging?' scale(1.04)':''}`,
        position:'relative',
        color: note.penColor && !isDrawNote ? note.penColor : '#2d2a26',
        fontFamily:'Gamja Flower, Gaegu, sans-serif', fontSize: sz.fontSize, lineHeight:1.35,
        wordBreak:'keep-all',
        transition: dragging ? 'none' : 'box-shadow .15s, transform .15s',
      }}>
        <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:8}}>
          <div style={{width:22, height:22, borderRadius:'50%', background:type.color,
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:12}}>
            <V3Face type={type} size={18}/>
          </div>
          <span style={{fontFamily:'Jua', fontSize:12, color:type.deep}}>{type.label}</span>
          <button onClick={openEdit} className="qc-no-print" style={{
            marginLeft:'auto', border:'none', background:'transparent', cursor:'pointer',
            color:'#7a7064', fontSize:13,
          }}>✏️</button>
          <button onClick={onDel} className="qc-no-print" style={{
            border:'none', background:'transparent', cursor:'pointer',
            color:'#7a7064', fontSize:14,
          }}>✕</button>
        </div>
        {note.drawData
          ? <img src={note.drawData} alt="손글씨 질문"
              style={{display:'block', width:'100%', height:'auto', borderRadius:8}}/>
          : <div>{note.text}</div>
        }
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
