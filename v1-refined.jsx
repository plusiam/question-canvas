const V1_TYPES = [
  { key:'fact',    label:'사실 질문',  icon:'🔍', hint:['~~~~ ', '무엇', '일까?'],             placeholder:'무엇을 물어보고 싶어요?',   color:'#2E86C1', soft:'#BCE0F5', paper:'#EAF5FC',
    desc:'이야기에서 실제로 일어난 일을 묻는 질문이에요. 책에서 답을 찾을 수 있어요.' },
  { key:'think',   label:'생각 질문',  icon:'💭', hint:['', '왜', ' ~~~~ ?'],                 placeholder:'왜 그랬을지 궁금해요?',     color:'#E6A817', soft:'#FDECB6', paper:'#FFF6D9',
    desc:'인물이 왜 그렇게 했는지 그 까닭을 생각해 보는 질문이에요. 내 생각을 말해야 해요.' },
  { key:'heart',   label:'느낌 질문',  icon:'💗', hint:['~~~~ 어떤 ', '느낌', '이었을까?'],     placeholder:'어떤 느낌이었을지 물어볼까요?', color:'#D63384', soft:'#F9CEDF', paper:'#FDE4EE',
    desc:'인물의 마음이나 감정을 상상해 보는 질문이에요. 공감 능력이 필요해요!' },
  { key:'imagine', label:'상상 질문',  icon:'✨', hint:['', '만약에', ' ~~~~ ?'],             placeholder:'만약에 ~하면 어떻게 될까?',  color:'#7A4FBA', soft:'#DCCCF0', paper:'#EBDFF5',
    desc:'"만약에~"로 시작해서 이야기가 다르게 펼쳐진다면 어떨지 상상하는 질문이에요.' },
];

const V1_EXAMPLES = (c) => {
  const a = c.char1 || '이 친구';
  const b = c.char2 || '저 친구';
  return {
    fact:   [`${a}는 무엇을 했나요?`, `${b}는 그때 무엇을 하고 있었나요?`, `두 사람 사이에 어떤 일이 있었나요?`],
    think:  [`${a}는 왜 그랬을까요?`, `${b}는 왜 그런 말을 했을까요?`, `두 사람이 그렇게 한 까닭은 무엇일까요?`],
    heart:  [`${a}는 그때 어떤 느낌이었을까요?`, `${b}의 마음은 어땠을까요?`, `두 사람은 각각 어떤 기분이었을까요?`],
    imagine:[`만약에 ${a}가 다르게 행동했다면 어떻게 되었을까요?`, `만약에 내가 ${a}라면 어떻게 했을까요?`, `만약에 ${b}가 먼저 다가갔다면 어땠을까요?`],
  };
};

const V1_STORAGE_KEY = 'qc-v1-state';
const V1_MAX_CHARS = 120;

function V1Toast({toast}){
  return <div className="qc-no-print" style={{
    position:'absolute', bottom:18, left:'50%', transform:'translateX(-50%)',
    background:'#2d2a26', color:'#fff', padding:'10px 20px', borderRadius:999,
    fontFamily:'Jua', fontSize:14, zIndex:20, boxShadow:'0 4px 12px rgba(0,0,0,.2)',
    whiteSpace:'nowrap', display:'inline-flex', alignItems:'center', gap:10,
  }}>
    <span>{toast.msg}</span>
    {toast.action && (
      <button onClick={toast.action.onClick} style={{
        background:'transparent', border:'1px solid rgba(255,255,255,.45)', color:'#fff',
        fontFamily:'Jua', fontSize:13, padding:'3px 10px', borderRadius:999, cursor:'pointer',
      }}>{toast.action.label}</button>
    )}
  </div>;
}

function V1({width=1100, height=1400}){
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
      // 질문/설정(수업 콘텐츠)은 localStorage에서 복원
      const raw = localStorage.getItem(V1_STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (Array.isArray(s.notes)) setNotes(s.notes);
        if (typeof s.char1 === 'string') setChar1(s.char1);
        if (typeof s.char2 === 'string') setChar2(s.char2);
        if (typeof s.situation === 'string') setSituation(s.situation);
        if (Number.isFinite(s.nextId)) idRef.current = s.nextId;
      }
      // 이름/학년반은 sessionStorage에서만 복원 (탭 닫으면 자동 삭제)
      const sName = sessionStorage.getItem('qc-v1-name');
      const sClass = sessionStorage.getItem('qc-v1-class');
      if (sName) setName(sName);
      if (sClass) setClassInfo(sClass);
    } catch {}
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    try {
      // 질문/설정(수업 콘텐츠)만 localStorage에 저장
      localStorage.setItem(V1_STORAGE_KEY, JSON.stringify({
        notes, char1, char2, situation, nextId: idRef.current,
      }));
      // 이름/학년반은 sessionStorage에만 저장
      sessionStorage.setItem('qc-v1-name', name);
      sessionStorage.setItem('qc-v1-class', classInfo);
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
    if(text.length > V1_MAX_CHARS){ showToast(`질문이 너무 길어요! ${V1_MAX_CHARS}자 이내로 줄여주세요 ✂️`); return; }
    const tilt = (Math.random()*10 - 5).toFixed(1);
    setNotes(n => [...n, {id:idRef.current++, type, text, tilt}]);
    setInputs(i => ({...i, [type]:''}));
    showToast('붙였어요! 🎉');
  };
  const delNote = (id) => {
    const found = notes.find(n=>n.id===id);
    if(!found) return;
    undoStack.current.push(found);
    setNotes(n=>n.filter(x=>x.id!==id));
    showToast('삭제했어요 (Ctrl+Z로 되돌리기)', { label:'되돌리기', onClick: () => {
      const last = undoStack.current.pop();
      if(last) setNotes(n => n.some(x=>x.id===last.id) ? n : [...n, last]);
      setToast(null);
      clearTimeout(toastTimer.current);
    }});
  };
  const updateNote = (id, {text, type}) => {
    setNotes(n => n.map(x => x.id===id ? {...x, text, type} : x));
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
    const arr = V1_EXAMPLES({char1, char2})[type];
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
          localStorage.removeItem(V1_STORAGE_KEY);
          sessionStorage.removeItem('qc-v1-name');
          sessionStorage.removeItem('qc-v1-class');
        } catch {}
        setToast(null);
        clearTimeout(toastTimer.current);
        showToast('모두 지웠어요 (Ctrl+Z로 되돌리기)');
      },
    });
  };

  const counts = notes.reduce((m,n)=>{m[n.type]=(m[n.type]||0)+1; return m;}, {fact:0,think:0,heart:0,imagine:0});
  const allFour = V1_TYPES.every(t => counts[t.key] >= 1);

  return (
    <div className="v1-root" style={{
      width:'100%', maxWidth:width, minHeight:height, position:'relative',
      fontFamily:"'Noto Sans KR', sans-serif",
      background: `
        radial-gradient(circle at 8% 8%, #fff2c8 0 14%, transparent 15%),
        radial-gradient(circle at 92% 14%, #ffe1c8 0 11%, transparent 12%),
        radial-gradient(circle at 88% 88%, #d9f3d6 0 15%, transparent 16%),
        radial-gradient(circle at 10% 90%, #f7d8ea 0 10%, transparent 11%),
        #FFF6E1
      `,
      color:'#2d2a26',
      padding:'36px 44px 60px',
      boxSizing:'border-box',
    }}>
      {/* Header */}
      <div className="v1-header" style={{
        background:'#fff', border:'3px solid #2d2a26', borderRadius:28,
        boxShadow:'6px 6px 0 #2d2a26', padding:'26px 32px', position:'relative', overflow:'hidden',
      }}>
        <div style={{position:'absolute', right:-30, top:-60, fontFamily:'Jua', fontSize:240, color:'#fff2c8', zIndex:0, lineHeight:1}}>?</div>
        <div style={{position:'relative', zIndex:1}}>
          <div style={{display:'flex', alignItems:'baseline', gap:14, flexWrap:'wrap'}}>
            <a href="index.html" className="qc-no-print" style={{
              display:'inline-flex', alignItems:'center', gap:5,
              fontFamily:'Jua', fontSize:13, color:'#7a7064', textDecoration:'none',
              background:'#f5f0e8', border:'2px solid #c8bfb0', borderRadius:100,
              padding:'4px 12px', marginBottom:6, alignSelf:'flex-start',
              transition:'background 0.12s',
            }}
            onMouseOver={e=>e.currentTarget.style.background='#ede6d8'}
            onMouseOut={e=>e.currentTarget.style.background='#f5f0e8'}
            >← 홈으로</a>
            <h1 style={{fontFamily:'Jua', fontSize:46, margin:0, letterSpacing:'-0.02em', lineHeight:1.1}}>
              <span style={{display:'inline-block', transform:'rotate(-8deg)'}}>🤔</span> 질문 만들기 학습지
            </h1>
          </div>
          <p style={{color:'#7a7064', margin:'8px 0 18px', fontWeight:500, fontSize:15}}>
            두 인물의 생각과 느낌에 대해 궁금한 점을 질문으로 만들어 도화지에 붙여봐요!
          </p>
          <div style={{display:'flex', gap:16, flexWrap:'wrap', alignItems:'center'}}>
            <V1Field label="이름" value={name} onChange={setName} width={140} placeholder="여기에 써요" />
            <V1Field label="학년 반" value={classInfo} onChange={setClassInfo} width={160} placeholder="예) 4학년 2반" />
          </div>
        </div>
      </div>

      <div className="v1-story" style={{
        marginTop:22, background:'#fff', border:'3px solid #2d2a26', borderRadius:22,
        boxShadow:'0 6px 18px rgba(62,48,30,.12)', padding:'18px 24px',
      }}>
        <div style={{fontFamily:'Jua', fontSize:15, color:'#7a7064', marginBottom:10,
          display:'flex', alignItems:'center', gap:8}}>
          <span style={{fontSize:20}}>📖</span> 오늘의 이야기
          <span style={{fontFamily:'Noto Sans KR', fontSize:12, fontWeight:500}}>(선생님이 함께 정해요)</span>
        </div>
        <div style={{display:'flex', gap:10, alignItems:'center', flexWrap:'wrap',
          fontFamily:'Gaegu', fontSize:22, color:'#2d2a26', lineHeight:1.4}}>
          <input value={char1} onChange={e=>setChar1(e.target.value)} placeholder="인물 1"
            style={{fontFamily:'Gaegu', fontSize:22, width:110, border:'none',
              borderBottom:'3px dashed #2d2a26', outline:'none', padding:'2px 8px',
              background:'transparent', textAlign:'center', color:'#2d2a26'}}/>
          <span style={{color:'#7a7064'}}>와(과)</span>
          <input value={char2} onChange={e=>setChar2(e.target.value)} placeholder="인물 2"
            style={{fontFamily:'Gaegu', fontSize:22, width:110, border:'none',
              borderBottom:'3px dashed #2d2a26', outline:'none', padding:'2px 8px',
              background:'transparent', textAlign:'center', color:'#2d2a26'}}/>
          <span style={{color:'#7a7064'}}>의</span>
          <input value={situation} onChange={e=>setSituation(e.target.value)} placeholder="어떤 상황?"
            style={{fontFamily:'Gaegu', fontSize:22, flex:1, minWidth:220, border:'none',
              borderBottom:'3px dashed #2d2a26', outline:'none', padding:'2px 8px',
              background:'transparent', color:'#2d2a26'}}/>
          <span style={{color:'#7a7064'}}>이야기</span>
        </div>
      </div>

      {/* Question-type cards — 2x2 grid */}
      <div className="v1-type-grid qc-no-print" style={{marginTop:28, display:'grid', gridTemplateColumns:'1fr 1fr', gap:18}}>
        {V1_TYPES.map(t => (
          <V1TypeCard key={t.key} type={t}
            value={inputs[t.key]}
            onChange={(v)=>setInputs(i=>({...i,[t.key]:v}))}
            onAdd={()=>addNote(t.key)}
            onExample={()=>exampleFor(t.key)}
            count={counts[t.key]}
          />
        ))}
      </div>

      {/* Board */}
      <div style={{marginTop:34}}>
        <div className="v1-board-header" style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', gap:12, flexWrap:'wrap', marginBottom:12}}>
          <h2 style={{fontFamily:'Jua', fontSize:28, margin:0, display:'flex', alignItems:'center', gap:10}}>
            <span style={{fontSize:30}}>🎨</span> 내 질문 도화지
          </h2>
          <div style={{display:'flex', gap:8, flexWrap:'wrap', alignItems:'center'}}>
            {V1_TYPES.map(t => (
              <span key={t.key} style={{
                fontFamily:'Jua', fontSize:14, padding:'5px 12px', borderRadius:999,
                background:t.soft, border:'2px solid #2d2a26',
              }}>{t.icon} {t.label.replace(' 질문','')} {counts[t.key]}</span>
            ))}
            {allFour && (
              <span style={{
                fontFamily:'Jua', fontSize:14, padding:'6px 14px', borderRadius:999,
                background:'linear-gradient(135deg,#ffce5c,#ff7a3d)', color:'#fff', border:'2px solid #2d2a26',
                animation:'v1pop .4s ease',
              }}>🏆 네 가지 모두!</span>
            )}
          </div>
        </div>
        <div className="v1-board" style={{
          background:'#fffdf4', border:'3px solid #2d2a26', borderRadius:22,
          boxShadow:'0 6px 18px rgba(62,48,30,.12)', padding:'28px 24px', minHeight:280,
          backgroundImage:'linear-gradient(90deg,rgba(62,48,30,.04) 1px,transparent 1px),linear-gradient(rgba(62,48,30,.04) 1px,transparent 1px)',
          backgroundSize:'24px 24px',
          display:'flex', flexWrap:'wrap', gap:20, alignContent:'flex-start',
        }}>
          {notes.length===0 ? (
            <div style={{
              fontFamily:'Gaegu', fontSize:24, color:'#7a7064', width:'100%', textAlign:'center', padding:'40px 10px',
            }}>여기에 만든 질문이 포스트잇처럼 붙어요 🎨</div>
          ) : notes.map(n => (
            <V1Note key={n.id} note={n} onDel={()=>delNote(n.id)} onUpdate={(p)=>updateNote(n.id,p)} type={V1_TYPES.find(t=>t.key===n.type)} />
          ))}
        </div>
      </div>

      {/* Footer buttons */}
      <div className="qc-no-print" style={{marginTop:24, display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap'}}>
        <V1Btn bg="#b9e8c6" onClick={()=>window.print()}>🖨️ 도화지 인쇄하기</V1Btn>
        <V1Btn bg="#ffd7d4" onClick={clearAll}>🗑️ 모두 지우기</V1Btn>
      </div>

      <div className="v1-copyright" style={{textAlign:'center', marginTop:30, color:'#7a7064', fontSize:13, fontFamily:'Gaegu'}}>
        ⓒ 룰루랄라 한기쌤 · 질문 만들기 학습지
      </div>

      {toast && <V1Toast toast={toast} />}

      <style>{`
        @keyframes v1pop{0%{transform:scale(0)}70%{transform:scale(1.15)}100%{transform:scale(1)}}
        @keyframes v1noteIn{0%{transform:scale(.6) rotate(0);opacity:0}100%{opacity:1}}

        /* 태블릿 (≤768px): 2×2 → 1열 */
        @media(max-width:768px){
          .v1-root{padding:20px 16px 40px !important}
          .v1-type-grid{grid-template-columns:1fr !important}
          .v1-note{width:150px !important; font-size:15px !important}
        }
        /* 모바일 (≤480px) */
        @media(max-width:480px){
          .v1-root{padding:14px 10px 32px !important}
          .v1-note{width:130px !important; min-height:120px !important; font-size:13px !important}
        }

        @media print{
          @page{margin:10mm 10mm;size:A4 portrait}
          .qc-no-print{display:none !important}
          html,body{margin:0 !important;padding:0 !important;background:#fff !important;
            -webkit-print-color-adjust:exact;print-color-adjust:exact}
          #root{padding:0}

          .v1-root{
            width:100% !important;
            max-width:100% !important;
            min-height:unset !important;
            padding:4mm 4mm !important;
            background:#FFF6E1 !important;
            box-sizing:border-box !important;
          }

          /* 헤더 압축 */
          .v1-header{
            padding:8px 16px 10px !important;
            box-shadow:none !important;
            border:1px solid #c8bfb0 !important;
            border-radius:14px !important;
          }
          .v1-header h1{font-size:22px !important;margin:0 !important}
          .v1-header p{font-size:12px !important;margin:2px 0 6px !important}

          /* 이야기 영역 압축 */
          .v1-story{
            margin-top:4px !important;
            padding:8px 14px !important;
            box-shadow:none !important;
            border-radius:12px !important;
          }

          /* 입력 카드 숨김 */
          .v1-type-grid{display:none !important}

          /* copyright 숨김 */
          .v1-copyright{display:none !important}

          /* 보드 헤더 */
          .v1-board-header{margin-top:6px !important;margin-bottom:4px !important}
          .v1-board-header h2{font-size:18px !important;margin:0 !important}

          /* 도화지: flex wrap, 3열, 페이지 자유롭게 넘어감 */
          .v1-board{
            display:flex !important;
            flex-wrap:wrap !important;
            gap:3mm !important;
            align-content:flex-start !important;
            padding:3mm !important;
            min-height:unset !important;
            background:#fffdf4 !important;
            background-image:none !important;
            border:1.5px solid #2d2a26 !important;
            border-radius:12px !important;
            box-shadow:none !important;
            break-inside:auto !important;
          }

          /* 포스트잇 wrapper: 3열 */
          .v1-note{
            break-inside:avoid !important;
            page-break-inside:avoid !important;
            flex-shrink:0 !important;
            width:calc((100% - 6mm) / 3) !important;
            height:52mm !important;
            min-height:52mm !important;
            transform:none !important;
            box-shadow:1px 2px 3px rgba(0,0,0,.1) !important;
            border-radius:8px !important;
            overflow:hidden !important;
            padding:6px 8px 6px !important;
            box-sizing:border-box !important;
            font-size:14px !important;
          }
        }
      `}</style>
    </div>
  );
}

function V1Field({label, value, onChange, width, placeholder}){
  return (
    <div style={{display:'flex', alignItems:'center', gap:8}}>
      <span style={{fontWeight:700, fontSize:15}}>{label}:</span>
      <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{
          fontFamily:'Gaegu', fontSize:22, padding:'4px 10px', border:'none',
          borderBottom:'3px dashed #2d2a26', background:'transparent', width, outline:'none',
        }} />
    </div>
  );
}

function V1TypeCard({type, value, onChange, onAdd, onExample, count}){
  const [h, setH] = React.useState(false);
  const [exampleUsed, setExampleUsed] = React.useState(false);
  const [showDesc, setShowDesc] = React.useState(false);
  const composing = React.useRef(false);
  const taRef = React.useRef(null);
  const over = value.length > V1_MAX_CHARS;

  const handleExample = () => {
    onExample();
    setExampleUsed(true);
    setTimeout(()=>{ taRef.current?.focus(); taRef.current?.select(); }, 50);
  };

  const handleChange = (v) => {
    onChange(v);
    if(exampleUsed) setExampleUsed(false);
  };
  return (
    <div style={{
      background:'#fff', border:'3px solid #2d2a26', borderRadius:20, padding:'16px 18px',
      boxShadow: h ? '6px 6px 0 #2d2a26' : '4px 4px 0 #2d2a26',
      transform: h ? 'translate(-2px,-2px)' : 'none',
      transition:'all .15s', position:'relative',
      borderTop:`14px solid ${type.color}`,
      display:'flex', flexDirection:'column', gap:10,
    }}
    onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}>
      <span style={{
        position:'absolute', top:10, right:14, fontFamily:'Jua', fontSize:13,
        background:'#fff', border:'2px solid #2d2a26', borderRadius:999, padding:'2px 10px',
      }}>{count}</span>
      <div style={{display:'flex', alignItems:'center', gap:10}}>
        <div style={{
          width:42, height:42, borderRadius:'50%', background:type.color,
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, color:'#fff',
          border:'2px solid #2d2a26', flexShrink:0,
        }}>{type.icon}</div>
        <h3 style={{fontFamily:'Jua', fontSize:22, margin:0, flex:1}}>{type.label}</h3>
        <button onClick={()=>setShowDesc(v=>!v)} style={{
          width:26, height:26, borderRadius:'50%', border:`2px solid ${type.color}`,
          background: showDesc ? type.color : '#fff', color: showDesc ? '#fff' : type.color,
          cursor:'pointer', fontFamily:'Jua', fontSize:14, display:'flex',
          alignItems:'center', justifyContent:'center', flexShrink:0, padding:0,
        }}>?</button>
      </div>
      {showDesc && (
        <div style={{
          fontFamily:'Noto Sans KR', fontSize:13, color:'#2d2a26', lineHeight:1.6,
          background:type.paper, border:`1.5px solid ${type.soft}`, borderRadius:8,
          padding:'8px 12px', marginTop:-4,
        }}>{type.desc}</div>
      )}
      <p style={{fontFamily:'Gaegu', fontSize:20, color:'#7a7064', margin:0, lineHeight:1.4}}>
        {type.hint[0]}<b style={{padding:'2px 8px', borderRadius:6, background:type.soft, color:'#2d2a26'}}>{type.hint[1]}</b>{type.hint[2]}
      </p>
      <div className="qc-no-print" style={{position:'relative'}}>
        <textarea ref={taRef} value={value} onChange={e=>handleChange(e.target.value)}
          onCompositionStart={()=>{ composing.current=true; }}
          onCompositionEnd={()=>{ composing.current=false; }}
          onKeyDown={e=>{ if(e.key==='Enter' && !e.shiftKey && !composing.current){ e.preventDefault(); onAdd(); } }}
          placeholder={type.placeholder}
          style={{
            fontFamily:'Gaegu', fontSize:20, border:`2px solid ${over ? '#D63384' : '#e5ddc6'}`, borderRadius:10,
            padding:'10px 12px', resize:'none', outline:'none', width:'100%', minHeight:66,
            background: over ? '#fff0f6' : '#fffcf4', boxSizing:'border-box',
          }} />
        <span style={{
          position:'absolute', bottom:6, right:8, fontFamily:'Noto Sans KR', fontSize:11,
          color: over ? '#D63384' : '#aaa', fontWeight: over ? 700 : 400,
        }}>{value.length}/{V1_MAX_CHARS}</span>
      </div>
      <div className="qc-no-print" style={{display:'flex', gap:8, flexDirection:'column'}}>
        {exampleUsed && (
          <p style={{
            fontFamily:'Noto Sans KR', fontSize:12, color:type.color, margin:0,
            padding:'4px 8px', background:type.paper, borderRadius:6, fontWeight:500,
          }}>✏️ 예시예요! 내 말로 바꿔서 써봐요</p>
        )}
        <div style={{display:'flex', gap:8}}>
          <button onClick={handleExample} style={{
            background:'#fff', border:'2px solid #d9c9a7', borderRadius:10, padding:'8px 12px',
            fontSize:13, cursor:'pointer', color:'#7a7064', fontFamily:'Noto Sans KR', fontWeight:500,
            whiteSpace:'nowrap',
          }}>힌트 💡</button>
          <button onClick={onAdd} style={{
            flex:1, fontFamily:'Jua', padding:'10px 14px', border:'none', borderRadius:10,
            color:'#fff', cursor:'pointer', fontSize:16, background:type.color,
            opacity: over ? 0.5 : 1,
          }}>+ 도화지에 붙이기</button>
        </div>
      </div>
    </div>
  );
}

function V1Note({note, type, onDel, onUpdate}){
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(note.text);
  const [draftType, setDraftType] = React.useState(note.type);
  const taRef = React.useRef(null);
  const composing = React.useRef(false);

  const openEdit = () => {
    setDraft(note.text);
    setDraftType(note.type);
    setEditing(true);
    setTimeout(()=>{ taRef.current?.focus(); taRef.current?.select(); }, 30);
  };
  const save = () => {
    const t = draft.trim();
    if(t) onUpdate({text:t, type:draftType});
    setEditing(false);
  };
  const cancel = () => setEditing(false);
  const curType = V1_TYPES.find(t=>t.key===draftType);

  if(editing){
    return (
      <div className="v1-note qc-no-print" style={{
        width:200, padding:'12px 14px', borderRadius:10,
        background:'#fff', border:`3px solid ${type.color}`,
        boxShadow:'4px 4px 0 #2d2a26', display:'flex', flexDirection:'column', gap:8,
        animation:'v1noteIn .2s ease',
      }}>
        <div style={{display:'flex', gap:4, flexWrap:'wrap'}}>
          {V1_TYPES.map(t=>(
            <button key={t.key} onClick={()=>setDraftType(t.key)} style={{
              fontFamily:'Jua', fontSize:11, padding:'2px 8px', borderRadius:999,
              border:`2px solid ${t.color}`,
              background: draftType===t.key ? t.color : '#fff',
              color: draftType===t.key ? '#fff' : t.color,
              cursor:'pointer',
            }}>{t.icon} {t.label.replace(' 질문','')}</button>
          ))}
        </div>
        <textarea ref={taRef} value={draft} onChange={e=>setDraft(e.target.value)}
          onCompositionStart={()=>{ composing.current=true; }}
          onCompositionEnd={()=>{ composing.current=false; }}
          onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey&&!composing.current){e.preventDefault();save();} if(e.key==='Escape') cancel(); }}
          style={{
            fontFamily:'Gaegu', fontSize:18, border:`2px solid ${curType.soft}`,
            borderRadius:8, padding:'8px 10px', resize:'none', outline:'none',
            minHeight:70, boxSizing:'border-box', width:'100%',
          }}/>
        <div style={{display:'flex', gap:6}}>
          <button onClick={save} style={{
            flex:1, fontFamily:'Jua', fontSize:14, padding:'7px 0', borderRadius:8,
            border:'none', background:curType.color, color:'#fff', cursor:'pointer',
          }}>저장</button>
          <button onClick={cancel} style={{
            fontFamily:'Jua', fontSize:14, padding:'7px 12px', borderRadius:8,
            border:'2px solid #ddd', background:'#f5f5f5', cursor:'pointer',
          }}>취소</button>
          <button onClick={onDel} style={{
            fontFamily:'Jua', fontSize:14, padding:'7px 12px', borderRadius:8,
            border:'2px solid #ffb3b3', background:'#fff0f0', color:'#c0392b', cursor:'pointer',
          }}>삭제</button>
        </div>
      </div>
    );
  }

  return (
    <div className="v1-note" style={{
      width:180, minHeight:150, padding:'14px 16px 30px',
      fontFamily:'Gamja Flower, Gaegu, sans-serif', fontSize:18, lineHeight:1.35,
      color:'#2d2a26', boxShadow:'3px 6px 12px rgba(62,48,30,.18)',
      position:'relative', wordBreak:'keep-all', overflowWrap:'anywhere', borderRadius:2,
      background:type.soft, transform:`rotate(${note.tilt}deg)`,
      animation:'v1noteIn .3s ease', overflow:'hidden', cursor:'default',
    }}>
      <span style={{
        position:'absolute', top:-6, left:'50%', transform:'translateX(-50%)',
        width:14, height:14, borderRadius:'50%',
        background:'radial-gradient(circle at 30% 30%, #ff9a7a, #b3361f)',
        boxShadow:'0 2px 4px rgba(0,0,0,.3)',
      }} />
      <span style={{
        display:'inline-block', fontFamily:'Jua', fontSize:11, padding:'2px 8px',
        borderRadius:999, color:'#fff', marginBottom:8, background:type.color,
      }}>{type.label}</span>
      <div style={{fontSize: note.text.length > 60 ? 15 : 18, lineHeight:1.4}}>{note.text}</div>
      <button onClick={openEdit} className="qc-no-print" style={{
        position:'absolute', bottom:6, left:8, border:'none', background:'transparent',
        fontSize:14, cursor:'pointer', color:'#7a7064', padding:'2px 6px', borderRadius:6,
      }}>✏️</button>
      <button onClick={onDel} className="qc-no-print" style={{
        position:'absolute', bottom:6, right:8, border:'none', background:'transparent',
        fontSize:16, cursor:'pointer', color:'#7a7064', padding:'2px 6px', borderRadius:6,
      }}>✕</button>
    </div>
  );
}

function V1Btn({children, bg, onClick}){
  const [h, setH] = React.useState(false);
  return <button onClick={onClick}
    onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
    style={{
      fontFamily:'Jua', fontSize:15, padding:'12px 22px', borderRadius:14,
      border:'3px solid #2d2a26', background:bg, cursor:'pointer',
      boxShadow: h ? '4px 4px 0 #2d2a26' : '3px 3px 0 #2d2a26',
      transform: h ? 'translate(-1px,-1px)' : 'none', transition:'all .15s',
    }}>{children}</button>;
}

Object.assign(window, { V1 });
