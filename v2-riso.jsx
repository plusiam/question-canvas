const V2_TYPES = [
  { key:'fact',    label:'사실',   sub:'FACT',    hint:'무엇일까?',       placeholder:'무엇을 물어보고 싶어요?',   color:'#4A7FB8', wash:'#FFE8A3', paper:'#E4EEF7' },
  { key:'think',   label:'생각',   sub:'THINK',   hint:'왜 ~~~~?',        placeholder:'왜 그랬을지 궁금해요?',     color:'#D4902A', wash:'#FFC9B8', paper:'#FCEFD0' },
  { key:'heart',   label:'느낌',   sub:'FEELING', hint:'어떤 느낌?',      placeholder:'어떤 느낌이었을까요?',      color:'#C85A86', wash:'#C6E3CF', paper:'#F5DCE6' },
  { key:'imagine', label:'상상',   sub:'IMAGINE', hint:'만약에 ~~~~?',    placeholder:'만약에 ~하면 어떻게 될까?', color:'#6B5AAF', wash:'#FFE8A3', paper:'#E1D9EF' },
];

const V2_EXAMPLES = (c) => {
  const a = c.char1 || '이 친구';
  const b = c.char2 || '저 친구';
  return {
    fact:   [`${a}는 무엇을 했나요?`, `두 사람 사이에 어떤 일이 있었나요?`],
    think:  [`${a}는 왜 그랬을까요?`, `${b}는 왜 그런 말을 했을까요?`],
    heart:  [`${a}는 어떤 느낌이었을까요?`, `${b}의 기분은 어땠을까요?`],
    imagine:[`만약에 ${a}가 다르게 행동했다면 어땠을까요?`, `만약에 내가 ${a}라면 어떻게 했을까요?`],
  };
};

const V2_STORAGE_KEY = 'qc-v2-state';
const V2_MAX_CHARS = 120;

/* 크기 프리셋 */
const V2_SIZES = {
  S: { width: 140, minHeight: 110, fontSize: 15, label: 'S' },
  M: { width: 190, minHeight: 140, fontSize: 19, label: 'M' },
  L: { width: 260, minHeight: 180, fontSize: 23, label: 'L' },
};

/* 색상 팔레트 */
const V2_COLORS = [
  { hex:'#3C2F2A', label:'먹' },
  { hex:'#C0392B', label:'빨강' },
  { hex:'#1A6FA8', label:'파랑' },
  { hex:'#1E8449', label:'초록' },
  { hex:'#D4680A', label:'주황' },
  { hex:'#6B3FA0', label:'보라' },
];

const V2Icon = ({type, size=36}) => {
  const c = type.color;
  if(type.key==='fact') return (
    <svg width={size} height={size} viewBox="0 0 36 36">
      <circle cx="15" cy="15" r="9" fill="none" stroke={c} strokeWidth="2.5"/>
      <path d="M22 22l7 7" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
  if(type.key==='think') return (
    <svg width={size} height={size} viewBox="0 0 36 36">
      <path d="M8 14 Q8 6 18 6 Q28 6 28 14 Q28 20 22 22 L22 28 L17 23 Q8 22 8 14z" fill="none" stroke={c} strokeWidth="2.5" strokeLinejoin="round"/>
      <circle cx="14" cy="14" r="1.5" fill={c}/>
      <circle cx="18" cy="14" r="1.5" fill={c}/>
      <circle cx="22" cy="14" r="1.5" fill={c}/>
    </svg>
  );
  if(type.key==='heart') return (
    <svg width={size} height={size} viewBox="0 0 36 36">
      <path d="M18 30 C6 22 4 14 10 10 C14 7 18 10 18 13 C18 10 22 7 26 10 C32 14 30 22 18 30z" fill="none" stroke={c} strokeWidth="2.5" strokeLinejoin="round"/>
    </svg>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 36 36">
      <path d="M18 4 L20 14 L30 14 L22 20 L25 30 L18 24 L11 30 L14 20 L6 14 L16 14z" fill="none" stroke={c} strokeWidth="2.5" strokeLinejoin="round"/>
    </svg>
  );
};

const V2Tape = ({color='#FFE8A3', rotate=-4, width=80, top=-10, left=20, pattern='stripe'}) => (
  <div style={{
    position:'absolute', top, left, width, height:22, transform:`rotate(${rotate}deg)`,
    background: pattern==='dot'
      ? `radial-gradient(circle, rgba(0,0,0,.15) 1px, transparent 1.5px) 0 0/6px 6px, ${color}`
      : pattern==='stripe'
      ? `repeating-linear-gradient(45deg, rgba(0,0,0,.08) 0 3px, transparent 3px 8px), ${color}`
      : color,
    boxShadow:'0 1px 3px rgba(0,0,0,.1)', opacity:.9, zIndex:3,
    borderLeft:'1px dashed rgba(0,0,0,.08)', borderRight:'1px dashed rgba(0,0,0,.08)',
  }} />
);

/* ── DrawCanvas (v2 스타일) ── */
const V2DrawCanvas = React.forwardRef(function V2DrawCanvas({ bgColor='#FFF8ED', penColor='#3C2F2A', initialDataURL=null }, ref) {
  const canvasEl = React.useRef(null);
  const isDrawing = React.useRef(false);
  const isDirtyRef = React.useRef(false);
  const [penSize, setPenSize] = React.useState(4);
  const penColorRef = React.useRef(penColor);

  React.useEffect(() => { penColorRef.current = penColor; }, [penColor]);

  React.useEffect(() => {
    const canvas = canvasEl.current;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 280 * dpr;
    canvas.height = 160 * dpr;
    canvas.style.width = '280px';
    canvas.style.height = '160px';
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 280, 160);
    if (initialDataURL) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, 280, 160);
      img.src = initialDataURL;
    }
  }, []);

  React.useImperativeHandle(ref, () => ({
    getDataURL: () => canvasEl.current.toDataURL('image/jpeg', 0.75),
    isDirty: () => isDirtyRef.current,
    clear: () => {
      const ctx = canvasEl.current.getContext('2d');
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, 280, 160);
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

  const penSizes = [{ size:2, label:'얇게' }, { size:5, label:'보통' }, { size:10, label:'굵게' }];

  return (
    <div>
      <canvas ref={canvasEl}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove}
        onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
        style={{ display:'block', border:'1.5px solid #3C2F2A', cursor:'crosshair', touchAction:'none', background:bgColor }}
      />
      <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:6, flexWrap:'wrap' }}>
        {penSizes.map(p => (
          <button key={p.size} onClick={() => setPenSize(p.size)} style={{
            fontFamily:'Jua', fontSize:12, padding:'3px 10px',
            border:`1.5px solid #3C2F2A`,
            background: penSize===p.size ? '#3C2F2A' : 'transparent',
            color: penSize===p.size ? '#FFF8ED' : '#3C2F2A',
            cursor:'pointer',
          }}>{p.label}</button>
        ))}
        <button onClick={clearAll} style={{
          marginLeft:'auto', fontFamily:'Jua', fontSize:12, padding:'3px 10px',
          border:'1.5px solid #C85A86', color:'#C85A86', background:'transparent', cursor:'pointer',
        }}>전체 지우기</button>
      </div>
    </div>
  );
});

function V2Toast({toast}){
  return <div className="qc-no-print" style={{
    position:'absolute', bottom:18, left:'50%', transform:'translateX(-50%) rotate(-1deg)',
    background:'#3C2F2A', color:'#FFF6E1', padding:'10px 22px',
    fontFamily:'Gaegu', fontSize:16, zIndex:20,
    boxShadow:'3px 3px 0 rgba(0,0,0,.2)', whiteSpace:'nowrap',
    display:'inline-flex', alignItems:'center', gap:12,
  }}>
    <span>{toast.msg}</span>
    {toast.action && (
      <button onClick={toast.action.onClick} style={{
        background:'transparent', border:'1px solid rgba(255,246,225,.5)', color:'#FFF6E1',
        fontFamily:'Jua', fontSize:13, padding:'3px 10px', cursor:'pointer',
      }}>{toast.action.label}</button>
    )}
  </div>;
}

function V2({width=1100, height=1400}){
  const [notes, setNotes] = React.useState([]);
  const [inputs, setInputs] = React.useState({fact:'',think:'',heart:'',imagine:''});
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
      const raw = localStorage.getItem(V2_STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (Array.isArray(s.notes)) setNotes(s.notes);
        if (typeof s.char1 === 'string') setChar1(s.char1);
        if (typeof s.char2 === 'string') setChar2(s.char2);
        if (typeof s.situation === 'string') setSituation(s.situation);
        if (Number.isFinite(s.nextId)) idRef.current = s.nextId;
      }
      const sName = sessionStorage.getItem('qc-v2-name');
      const sClass = sessionStorage.getItem('qc-v2-class');
      if (sName) setName(sName);
      if (sClass) setClassInfo(sClass);
    } catch {}
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(V2_STORAGE_KEY, JSON.stringify({
        notes, char1, char2, situation, nextId: idRef.current,
      }));
      sessionStorage.setItem('qc-v2-name', name);
      sessionStorage.setItem('qc-v2-class', classInfo);
    } catch(e) {
      if (e && (e.name === 'QuotaExceededError' || e.code === 22)) {
        showToast('저장 공간이 부족해요. 손글씨 노트가 많으면 줄여주세요 🗂️');
        try {
          sessionStorage.setItem('qc-v2-name', name);
          sessionStorage.setItem('qc-v2-class', classInfo);
        } catch {}
      }
    }
  }, [hydrated, notes, name, classInfo, char1, char2, situation]);

  const showToast = (msg, action) => {
    setToast({msg, action});
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(()=>setToast(null), action ? 4000 : 1800);
  };

  const addNote = (type, size, penColor) => {
    const text = inputs[type].trim();
    if(!text){ showToast('먼저 질문을 써주세요'); return; }
    if(text.length > V2_MAX_CHARS){ showToast(`질문이 너무 길어요! ${V2_MAX_CHARS}자 이내로 줄여주세요 ✂️`); return; }
    setNotes(n => [...n, {id:idRef.current++, type, text, tilt:(Math.random()*12-6).toFixed(1), drawData:null, size:size||'M', penColor:penColor||'#3C2F2A'}]);
    setInputs(i => ({...i, [type]:''}));
    showToast('도화지에 붙였어요!');
  };

  const addDrawNote = (type, canvasRef, size, penColor) => {
    if (!canvasRef.current?.isDirty()) { showToast('먼저 그림을 그려주세요 ✏️'); return; }
    const drawData = canvasRef.current.getDataURL();
    setNotes(n => [...n, {id:idRef.current++, type, text:'', tilt:(Math.random()*12-6).toFixed(1), drawData, size:size||'M', penColor:penColor||'#3C2F2A'}]);
    canvasRef.current.clear();
    showToast('도화지에 붙였어요!');
  };

  const delNote = (id) => {
    const found = notes.find(n=>n.id===id);
    if(!found) return;
    undoStack.current.push(found);
    setNotes(n=>n.filter(x=>x.id!==id));
    showToast('오렸던 걸 뗐어요 (Ctrl+Z로 되돌리기)', { label:'되돌리기', onClick: () => {
      const last = undoStack.current.pop();
      if(last) setNotes(n => n.some(x=>x.id===last.id) ? n : [...n, last]);
      setToast(null);
      clearTimeout(toastTimer.current);
    }});
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
    const arr = V2_EXAMPLES({char1, char2})[type];
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
          localStorage.removeItem(V2_STORAGE_KEY);
          sessionStorage.removeItem('qc-v2-name');
          sessionStorage.removeItem('qc-v2-class');
        } catch {}
        setToast(null);
        clearTimeout(toastTimer.current);
        showToast('모두 지웠어요 (Ctrl+Z로 되돌리기)');
      },
    });
  };

  const counts = notes.reduce((m,n)=>{m[n.type]=(m[n.type]||0)+1; return m;}, {fact:0,think:0,heart:0,imagine:0});
  const allFour = V2_TYPES.every(t => counts[t.key] >= 1);

  const grain = `url("data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/><feColorMatrix values='0 0 0 0 0.3 0 0 0 0 0.25 0 0 0 0 0.2 0 0 0 0.18 0'/></filter><rect width='200' height='200' filter='url(#n)'/></svg>`
  )}")`;

  return (
    <div className="v2-root" style={{
      width, minHeight:height, position:'relative',
      fontFamily:"'Noto Sans KR', sans-serif", color:'#3C2F2A',
      background:'#F4EBD9', padding:'40px 44px 60px', boxSizing:'border-box',
    }}>
      <div className="v2-grain" style={{position:'absolute', inset:0, backgroundImage:grain, pointerEvents:'none', mixBlendMode:'multiply', opacity:.35}} />

      {/* Header */}
      <div style={{position:'relative', padding:'24px 30px', background:'#FFF8ED',
        boxShadow:'0 4px 0 rgba(60,47,42,.15), 6px 10px 24px rgba(60,47,42,.12)',
        clipPath:'polygon(0 6%, 2% 0, 14% 4%, 28% 1%, 46% 5%, 66% 1%, 82% 4%, 98% 0, 100% 7%, 99% 94%, 97% 100%, 80% 96%, 58% 99%, 34% 96%, 16% 100%, 2% 97%, 1% 100%, 0 94%)',
      }}>
        <V2Tape color="#FFC9B8" rotate={-6} width={90} top={-8} left={60} pattern="stripe"/>
        <V2Tape color="#C6E3CF" rotate={5} width={80} top={-8} left={'calc(100% - 160px)'} pattern="dot"/>
        <div style={{display:'flex', alignItems:'baseline', gap:14, flexWrap:'wrap'}}>
          <a href="index.html" className="qc-no-print" style={{
            display:'inline-flex', alignItems:'center', gap:5,
            fontFamily:'Jua', fontSize:13, color:'#6B5445', textDecoration:'none',
            background:'#F0E4D0', border:'2px solid #C8A882', borderRadius:100,
            padding:'4px 12px', marginBottom:6, alignSelf:'flex-start', transition:'background 0.12s',
          }}
          onMouseOver={e=>e.currentTarget.style.background='#E4D4BC'}
          onMouseOut={e=>e.currentTarget.style.background='#F0E4D0'}
          >← 홈으로</a>
          <h1 style={{fontFamily:'Jua', fontSize:44, margin:0, letterSpacing:'-0.02em', color:'#3C2F2A'}}>
            질문 공방 <span style={{fontSize:32}}>✂️</span>
          </h1>
          <div style={{fontFamily:'Gaegu', fontSize:20, color:'#8A6F5E'}}>오려 붙이는 질문 만들기</div>
        </div>
        <p style={{fontFamily:'Gaegu', fontSize:19, color:'#6B5445', margin:'6px 0 16px'}}>
          이야기 속 두 인물에게 궁금한 걸 오려 붙여봐요 — 사실, 생각, 느낌, 상상!
        </p>
        <div style={{display:'flex', gap:18, flexWrap:'wrap'}}>
          <V2Field label="이름" value={name} onChange={setName} width={150} />
          <V2Field label="학년 반" value={classInfo} onChange={setClassInfo} width={170} />
        </div>
      </div>

      {/* Story strip */}
      <div style={{marginTop:24, position:'relative', background:'#FFF8ED',
        padding:'18px 24px', border:'1.5px solid #3C2F2A',
        backgroundImage:`repeating-linear-gradient(0deg, transparent 0 28px, rgba(60,47,42,.08) 28px 29px),
                         repeating-linear-gradient(90deg, transparent 0 28px, rgba(60,47,42,.06) 28px 29px)`,
        boxShadow:'4px 4px 0 #3C2F2A',
      }}>
        <V2Tape color="#FFE8A3" rotate={-3} width={70} top={-12} left={30} pattern="stripe"/>
        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:12}}>
          <span style={{fontFamily:'Jua', fontSize:13, background:'#3C2F2A', color:'#FFF6E1', padding:'3px 10px'}}>STORY</span>
          <h2 style={{fontFamily:'Jua', fontSize:22, margin:0}}>오늘의 이야기</h2>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 2.2fr', gap:14}}>
          <V2Input label="인물 ①" value={char1} onChange={setChar1}/>
          <V2Input label="인물 ②" value={char2} onChange={setChar2}/>
          <V2Input label="어떤 상황?" value={situation} onChange={setSituation}/>
        </div>
      </div>

      {/* 4 cards */}
      <div className="v2-cards qc-no-print" style={{marginTop:28, display:'grid', gridTemplateColumns:'1fr 1fr', gap:22}}>
        {V2_TYPES.map((t,i) => (
          <V2TypeCard key={t.key} type={t} idx={i}
            value={inputs[t.key]}
            onChange={v=>setInputs(i=>({...i,[t.key]:v}))}
            onAdd={(size, penColor)=>addNote(t.key, size, penColor)}
            onAddDraw={(ref, size, penColor)=>addDrawNote(t.key, ref, size, penColor)}
            onExample={()=>exampleFor(t.key)}
            count={counts[t.key]}
          />
        ))}
      </div>

      {/* Board */}
      <div style={{marginTop:36}}>
        <div className="v2-board-header" style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', gap:12, flexWrap:'wrap', marginBottom:14}}>
          <div>
            <div style={{fontFamily:'Jua', fontSize:13, color:'#8A6F5E', letterSpacing:2}}>MY BOARD</div>
            <h2 style={{fontFamily:'Jua', fontSize:30, margin:0}}>내 질문 도화지</h2>
          </div>
          <div style={{display:'flex', gap:10, flexWrap:'wrap', alignItems:'center'}}>
            {V2_TYPES.map(t => (
              <span key={t.key} style={{
                fontFamily:'Jua', fontSize:14, padding:'4px 12px',
                background:t.paper, color:t.color, border:`1.5px solid ${t.color}`,
                display:'inline-flex', alignItems:'center', gap:6,
              }}>
                <span style={{width:8, height:8, borderRadius:'50%', background:t.color}}/>
                {t.label} {counts[t.key]}
              </span>
            ))}
            {allFour && <span style={{
              fontFamily:'Jua', fontSize:14, padding:'6px 14px', background:'#3C2F2A', color:'#FFE8A3',
              transform:'rotate(-2deg)',
            }}>★ 네 가지 모두 완성!</span>}
          </div>
        </div>

        <div className="v2-board-inner" style={{
          position:'relative', background:'#FFF8ED',
          border:'2px solid #3C2F2A', padding:'30px 26px', minHeight:320,
          backgroundImage:`radial-gradient(circle, rgba(60,47,42,.12) 1px, transparent 1.5px)`,
          backgroundSize:'16px 16px', boxShadow:'6px 6px 0 #3C2F2A',
          display:'flex', flexWrap:'wrap', gap:22, alignContent:'flex-start',
        }}>
          <V2Tape color="#FFC9B8" rotate={-40} width={70} top={-14} left={-18} pattern="stripe"/>
          <V2Tape color="#C6E3CF" rotate={38} width={70} top={-14} left={'calc(100% - 52px)'} pattern="dot"/>
          {notes.length===0 ? (
            <div style={{fontFamily:'Gaegu', fontSize:24, color:'#8A6F5E', width:'100%', textAlign:'center', padding:'40px 10px'}}>
              오린 질문을 여기에 붙여봐요 ✂️📌
            </div>
          ) : notes.map(n => {
            const t = V2_TYPES.find(x=>x.key===n.type);
            return <V2Note key={n.id} note={n} type={t} onDel={()=>delNote(n.id)} onUpdate={(p)=>updateNote(n.id,p)} />;
          })}
        </div>
      </div>

      {/* footer */}
      <div className="qc-no-print" style={{marginTop:26, display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap'}}>
        <V2Btn bg="#C6E3CF" icon="🖨️" onClick={()=>window.print()}>도화지 인쇄</V2Btn>
        <V2Btn bg="#FFC9B8" icon="🗑️" onClick={clearAll}>모두 지우기</V2Btn>
      </div>
      <div style={{textAlign:'center', marginTop:30, color:'#8A6F5E', fontSize:13, fontFamily:'Gaegu'}}>
        ⓒ 질문 공방 · 룰루랄라 한기쌤
      </div>

      {toast && <V2Toast toast={toast} />}
      <style>{`
        @media print {
          @page { margin: 14mm 12mm; size: A4 portrait; }

          .qc-no-print { display: none !important; }

          html, body {
            margin: 0 !important; padding: 0 !important;
            background: #fff !important;
            -webkit-print-color-adjust: exact; print-color-adjust: exact;
          }

          /* 최상위 컨테이너: 높이 제한 없이 페이지 자유롭게 넘어감 */
          .v2-root {
            width: 100% !important;
            min-height: unset !important;
            padding: 16px 20px 24px !important;
            background: #F4EBD9 !important;
          }

          .v2-grain { display: none !important; }
          .v2-cards { display: none !important; }
          .v2-board-header { margin-bottom: 10px !important; }

          /* 도화지: flex wrap, 페이지 자유롭게 넘어감 */
          .v2-board-inner {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 4mm !important;
            align-content: flex-start !important;
            padding: 3mm 3mm !important;
            min-height: unset !important;
            box-shadow: none !important;
            border: 1.5px solid #3C2F2A !important;
            background: #FFF8ED !important;
            break-inside: auto !important;
          }

          /* 각 포스트잇 wrapper: 잘리지 않음, 3열 고정 너비 */
          .v2-note-wrap {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            flex-shrink: 0 !important;
            margin: 0 !important;
            width: calc((100% - 8mm) / 3) !important;
          }

          /* 포스트잇 내부: 회전 제거, mm 단위 고정 높이 */
          .v2-note-inner {
            transform: none !important;
            box-shadow: 1px 2px 4px rgba(60,47,42,.15) !important;
            clip-path: none !important;
            width: 100% !important;
            min-height: 60mm !important;
            height: 60mm !important;
            overflow: hidden !important;
            padding: 8px 10px 8px !important;
            box-sizing: border-box !important;
          }
          /* 손글씨 포스트잇: 이미지 비율 유지 */
          .v2-note-inner.is-draw {
            height: auto !important;
            min-height: 40mm !important;
          }
        }
      `}</style>
    </div>
  );
}

function V2Field({label, value, onChange, width}){
  return (
    <div style={{display:'flex', alignItems:'baseline', gap:8}}>
      <span style={{fontFamily:'Jua', fontSize:15, color:'#6B5445'}}>{label}</span>
      <input value={value} onChange={e=>onChange(e.target.value)}
        style={{fontFamily:'Gaegu', fontSize:22, padding:'2px 8px', border:'none',
          borderBottom:'2px dotted #3C2F2A', background:'transparent', width, outline:'none'}}/>
    </div>
  );
}
function V2Input({label, value, onChange}){
  return (
    <label style={{display:'flex', flexDirection:'column', gap:4}}>
      <span style={{fontFamily:'Gaegu', fontSize:16, color:'#8A6F5E'}}>{label}</span>
      <input value={value} onChange={e=>onChange(e.target.value)}
        style={{fontFamily:'Noto Sans KR', fontSize:15, padding:'9px 12px',
          border:'1.5px solid #3C2F2A', background:'#FFFBF0', outline:'none'}}/>
    </label>
  );
}

/* 크기·색상 선택 공용 UI */
function V2NoteOptions({ size, onSize, penColor, onPenColor, typeColor, showColor }) {
  return (
    <div className="qc-no-print" style={{display:'flex', flexDirection:'column', gap:6}}>
      {/* 크기 */}
      <div style={{display:'flex', alignItems:'center', gap:6}}>
        <span style={{fontFamily:'Jua', fontSize:11, color:'#8A6F5E', minWidth:28}}>크기</span>
        <div style={{display:'flex', gap:4}}>
          {Object.entries(V2_SIZES).map(([k, v]) => (
            <button key={k} onClick={()=>onSize(k)} style={{
              fontFamily:'Jua', fontSize:12, width:32, height:26,
              border:`1.5px solid ${typeColor}`,
              background: size===k ? typeColor : 'transparent',
              color: size===k ? '#fff' : typeColor,
              cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
            }}>{v.label}</button>
          ))}
        </div>
      </div>
      {/* 색상 (손글씨 탭에서만) */}
      {showColor && (
        <div style={{display:'flex', alignItems:'center', gap:6}}>
          <span style={{fontFamily:'Jua', fontSize:11, color:'#8A6F5E', minWidth:28}}>색</span>
          <div style={{display:'flex', gap:4}}>
            {V2_COLORS.map(c => (
              <button key={c.hex} onClick={()=>onPenColor(c.hex)}
                title={c.label}
                style={{
                  width:22, height:22, borderRadius:'50%', background:c.hex, cursor:'pointer',
                  border: penColor===c.hex ? '3px solid #3C2F2A' : '2px solid rgba(0,0,0,.15)',
                  boxShadow: penColor===c.hex ? '0 0 0 2px #FFF8ED' : 'none',
                  padding:0,
                }}/>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function V2TypeCard({type, value, onChange, onAdd, onAddDraw, onExample, count, idx}){
  const [h, setH] = React.useState(false);
  const [inputMode, setInputMode] = React.useState('text');
  const [noteSize, setNoteSize] = React.useState('M');
  const [penColor, setPenColor] = React.useState('#3C2F2A');
  const composing = React.useRef(false);
  const drawCanvasRef = React.useRef(null);
  const over = value.length > V2_MAX_CHARS;
  const rotations = [-1.2, 1, -0.6, 1.5];
  const tapeColors = ['#FFE8A3', '#FFC9B8', '#C6E3CF', '#E1D9EF'];
  const tapePatterns = ['stripe', 'dot', 'plain', 'stripe'];

  return (
    <div style={{
      position:'relative', background:type.paper,
      padding:'22px 22px 18px', border:'1.5px solid #3C2F2A',
      transform:`rotate(${rotations[idx]}deg) ${h?'translateY(-3px)':''}`,
      boxShadow: h ? '6px 8px 0 #3C2F2A' : '4px 6px 0 #3C2F2A',
      transition:'transform .18s, box-shadow .18s',
      display:'flex', flexDirection:'column', gap:12,
    }}
      onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}>

      <V2Tape color={tapeColors[idx]} rotate={-8+idx*5} width={90} top={-10} left={30} pattern={tapePatterns[idx]}/>

      <div style={{position:'absolute', top:14, right:14,
        fontFamily:'Jua', fontSize:11, letterSpacing:2, color:type.color,
        border:`1.5px solid ${type.color}`, padding:'3px 8px', transform:'rotate(4deg)',
        background:'rgba(255,255,255,.6)',
      }}>No.{count.toString().padStart(2,'0')}</div>

      <div style={{display:'flex', alignItems:'center', gap:12}}>
        <div style={{width:56, height:56, background:'#FFF8ED', border:`2px solid ${type.color}`,
          display:'flex', alignItems:'center', justifyContent:'center'}}>
          <V2Icon type={type} size={34}/>
        </div>
        <div>
          <div style={{fontFamily:'Jua', fontSize:11, letterSpacing:3, color:type.color, marginBottom:2}}>{type.sub}</div>
          <h3 style={{fontFamily:'Jua', fontSize:28, margin:0, color:'#3C2F2A', lineHeight:1}}>{type.label}</h3>
        </div>
      </div>

      <div style={{fontFamily:'Gaegu', fontSize:20, color:'#6B5445',
        padding:'6px 0', borderBottom:`2px dashed ${type.color}`}}>" {type.hint} "</div>

      {/* 입력 모드 탭 */}
      <div className="qc-no-print" style={{display:'flex', gap:0, borderBottom:`1.5px solid ${type.color}`}}>
        {[{id:'text', label:'⌨️ 타자로'}, {id:'draw', label:'✏️ 손으로'}].map(m => (
          <button key={m.id} onClick={()=>setInputMode(m.id)} style={{
            fontFamily:'Jua', fontSize:13, padding:'5px 14px', border:'none', cursor:'pointer',
            background: inputMode===m.id ? type.color : 'transparent',
            color: inputMode===m.id ? '#fff' : type.color,
            borderRadius:'4px 4px 0 0',
          }}>{m.label}</button>
        ))}
      </div>

      {/* 크기·색상 옵션 (공통) */}
      <V2NoteOptions
        size={noteSize} onSize={setNoteSize}
        penColor={penColor} onPenColor={setPenColor}
        typeColor={type.color}
        showColor={inputMode==='draw'}
      />

      {inputMode === 'text' ? (
        <>
          <div style={{position:'relative'}}>
            <textarea value={value} onChange={e=>onChange(e.target.value)}
              onCompositionStart={()=>{ composing.current=true; }}
              onCompositionEnd={()=>{ composing.current=false; }}
              onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey&&!composing.current){e.preventDefault(); onAdd(noteSize, penColor);} }}
              placeholder={type.placeholder}
              className="qc-no-print"
              style={{
                fontFamily:'Gaegu', fontSize:20, border:`1.5px solid ${over?'#D63384':type.color}`,
                padding:'10px 12px', resize:'none', outline:'none', width:'100%', minHeight:70,
                background: over?'#fff0f6':'#FFFBF0', boxSizing:'border-box', color:'#3C2F2A',
              }}/>
            <span className="qc-no-print" style={{
              position:'absolute', bottom:6, right:8, fontFamily:'Noto Sans KR', fontSize:11,
              color: over?'#D63384':'#aaa', fontWeight: over?700:400,
            }}>{value.length}/{V2_MAX_CHARS}</span>
          </div>
          <div className="qc-no-print" style={{display:'flex', gap:8}}>
            <button onClick={onExample} style={{
              background:'transparent', border:`1.5px solid ${type.color}`, padding:'9px 14px',
              fontSize:13, cursor:'pointer', color:type.color, fontFamily:'Jua',
            }}>힌트 💡</button>
            <button onClick={()=>onAdd(noteSize, penColor)} style={{
              flex:1, fontFamily:'Jua', padding:'10px 14px', border:'none',
              color:'#FFF6E1', cursor:'pointer', fontSize:16, background:type.color,
              boxShadow:`2px 2px 0 #3C2F2A`, opacity: over?0.5:1,
            }}>✂️ 오려서 붙이기</button>
          </div>
        </>
      ) : (
        <>
          <div className="qc-no-print">
            <V2DrawCanvas ref={drawCanvasRef} bgColor={type.paper} penColor={penColor} />
          </div>
          <div className="qc-no-print">
            <button onClick={()=>onAddDraw(drawCanvasRef, noteSize, penColor)} style={{
              width:'100%', fontFamily:'Jua', padding:'10px 14px', border:'none',
              color:'#FFF6E1', cursor:'pointer', fontSize:16, background:type.color,
              boxShadow:`2px 2px 0 #3C2F2A`,
            }}>✂️ 오려서 붙이기</button>
          </div>
        </>
      )}
    </div>
  );
}

function V2Note({note, type, onDel, onUpdate}){
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(note.text);
  const [draftType, setDraftType] = React.useState(note.type);
  const [draftSize, setDraftSize] = React.useState(note.size||'M');
  const taRef = React.useRef(null);
  const editDrawRef = React.useRef(null);
  const composing = React.useRef(false);
  const isDrawNote = !!note.drawData;

  const sz = V2_SIZES[note.size||'M'];

  const openEdit = () => {
    setDraft(note.text);
    setDraftType(note.type);
    setDraftSize(note.size||'M');
    setEditing(true);
    if(!isDrawNote) setTimeout(()=>{ taRef.current?.focus(); taRef.current?.select(); }, 30);
  };
  const save = () => {
    if(isDrawNote){
      const newData = editDrawRef.current?.isDirty() ? editDrawRef.current.getDataURL() : note.drawData;
      onUpdate({text:'', type:draftType, drawData:newData, size:draftSize});
    } else {
      const t = draft.trim();
      if(t) onUpdate({text:t, type:draftType, drawData:null, size:draftSize});
    }
    setEditing(false);
  };
  const cancel = () => setEditing(false);
  const curType = V2_TYPES.find(t=>t.key===draftType);

  const clips = [
    'polygon(3% 4%,97% 2%,100% 95%,2% 97%)',
    'polygon(0 4%,98% 0,100% 97%,4% 100%)',
    'polygon(2% 0,100% 6%,96% 100%,0 95%)',
  ];
  const clip = clips[note.id % 3];

  if(editing){
    return (
      <div className="qc-no-print" style={{
        position:'relative', width: isDrawNote ? 310 : 230, padding:'12px 14px',
        background:'#FFF8ED', border:`2px solid ${type.color}`,
        boxShadow:'4px 4px 0 rgba(60,47,42,.3)',
        display:'flex', flexDirection:'column', gap:8, animation:'v2notein .2s ease',
      }}>
        {/* 종류 선택 */}
        <div style={{display:'flex', gap:4, flexWrap:'wrap'}}>
          {V2_TYPES.map(t=>(
            <button key={t.key} onClick={()=>setDraftType(t.key)} style={{
              fontFamily:'Jua', fontSize:10, padding:'2px 7px', letterSpacing:1,
              border:`1.5px solid ${t.color}`,
              background: draftType===t.key ? t.color : 'transparent',
              color: draftType===t.key ? '#fff' : t.color, cursor:'pointer',
            }}>{t.sub}</button>
          ))}
        </div>
        {/* 크기 선택 */}
        <div style={{display:'flex', alignItems:'center', gap:6}}>
          <span style={{fontFamily:'Jua', fontSize:11, color:'#8A6F5E', minWidth:28}}>크기</span>
          {Object.entries(V2_SIZES).map(([k,v])=>(
            <button key={k} onClick={()=>setDraftSize(k)} style={{
              fontFamily:'Jua', fontSize:12, width:32, height:26,
              border:`1.5px solid ${curType?curType.color:'#888'}`,
              background: draftSize===k ? (curType?curType.color:'#888') : 'transparent',
              color: draftSize===k ? '#fff' : (curType?curType.color:'#888'),
              cursor:'pointer',
            }}>{v.label}</button>
          ))}
        </div>
        {isDrawNote ? (
          <V2DrawCanvas ref={editDrawRef} bgColor={curType?curType.paper:'#FFF8ED'} penColor="#3C2F2A" initialDataURL={note.drawData} />
        ) : (
          <textarea ref={taRef} value={draft} onChange={e=>setDraft(e.target.value)}
            onCompositionStart={()=>{ composing.current=true; }}
            onCompositionEnd={()=>{ composing.current=false; }}
            onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey&&!composing.current){e.preventDefault();save();} if(e.key==='Escape') cancel(); }}
            style={{fontFamily:'Gamja Flower', fontSize:18, border:`1.5px solid ${curType?curType.color:'#ccc'}`,
              padding:'8px 10px', resize:'none', outline:'none', minHeight:70,
              boxSizing:'border-box', width:'100%', background:'#fffcf5'}}/>
        )}
        <div style={{display:'flex', gap:6}}>
          <button onClick={save} style={{flex:1, fontFamily:'Jua', fontSize:13, padding:'7px 0',
            border:'none', background:curType?curType.color:'#888', color:'#fff', cursor:'pointer'}}>저장</button>
          <button onClick={cancel} style={{fontFamily:'Jua', fontSize:13, padding:'7px 10px',
            border:'1.5px solid #ccc', background:'#f5f0e8', cursor:'pointer'}}>취소</button>
          <button onClick={onDel} style={{fontFamily:'Jua', fontSize:13, padding:'7px 10px',
            border:'1.5px solid #e8305a', background:'#fff0f3', color:'#e8305a', cursor:'pointer'}}>삭제</button>
        </div>
        <style>{`@keyframes v2notein{from{opacity:0;transform:scale(.7)}to{opacity:1}}`}</style>
      </div>
    );
  }

  return (
    <div className="v2-note-wrap" style={{ position:'relative', width: sz.width }}>
      <div className={`v2-note-inner${isDrawNote ? ' is-draw' : ''}`} style={{
        background: type.paper, padding:'14px 16px 30px', minHeight: sz.minHeight,
        fontFamily:'Gamja Flower', fontSize: sz.fontSize, lineHeight:1.35,
        color: note.penColor && !isDrawNote ? note.penColor : '#3C2F2A',
        boxShadow:'3px 5px 10px rgba(60,47,42,.18)',
        wordBreak:'keep-all', transform:`rotate(${note.tilt}deg)`,
        clipPath:clip, position:'relative', animation:'v2notein .3s ease',
      }}>
        <span style={{display:'inline-block', fontFamily:'Jua', fontSize:10, letterSpacing:2,
          padding:'2px 8px', color:type.color, border:`1px solid ${type.color}`, marginBottom:8}}>
          {type.sub}
        </span>
        {note.drawData
          ? <img src={note.drawData} alt="손글씨 질문"
              style={{display:'block', width:'100%', height:'auto', borderRadius:2, marginTop:4}}/>
          : <div>{note.text}</div>
        }
        <button onClick={openEdit} className="qc-no-print" style={{
          position:'absolute', bottom:6, left:8, border:'none', background:'transparent',
          fontSize:13, cursor:'pointer', color:'#8A6F5E'}}>✏️</button>
        <button onClick={onDel} className="qc-no-print" style={{
          position:'absolute', bottom:6, right:8, border:'none', background:'transparent',
          fontSize:14, cursor:'pointer', color:'#8A6F5E'}}>✕</button>
      </div>
      <div className="qc-no-print" style={{
        position:'absolute', top:-6, left:'50%', transform:`translateX(-50%) rotate(${Number(note.tilt)}deg)`,
        width:50, height:16, background:`repeating-linear-gradient(45deg, rgba(0,0,0,.08) 0 2px, transparent 2px 6px), ${type.wash}`,
        boxShadow:'0 1px 2px rgba(0,0,0,.12)', opacity:.95,
      }}/>
      <style>{`@keyframes v2notein{from{opacity:0;transform:scale(.7)}to{opacity:1}}`}</style>
    </div>
  );
}

function V2Btn({children, bg, icon, onClick}){
  const [h,setH]=React.useState(false);
  return <button onClick={onClick}
    onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
    style={{
      fontFamily:'Jua', fontSize:15, padding:'12px 22px', border:'1.5px solid #3C2F2A',
      background:bg, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:8,
      boxShadow: h ? '5px 5px 0 #3C2F2A' : '3px 3px 0 #3C2F2A',
      transform: h ? 'translate(-2px,-2px)' : 'none', transition:'all .15s',
    }}>
    <span>{icon}</span>{children}
  </button>;
}

Object.assign(window, { V2 });
