/* 질문 만들기 학습지 — v1/v2/v3 공유 컴포넌트
 * window.QCShared 네임스페이스에 컴포넌트를 등록해 각 버전에서 재사용한다.
 * 테마 차이는 theme prop으로 주입받고, 구조적으로 동일한 부분만 공유한다.
 */
(function() {
  const QR_ENDPOINT = 'https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=';

  /* 공유 QR 모달 — v1/v2/v3 공통. 테마로 외형 조정. */
  function QRModal({ open, onClose, url, title, theme }) {
    if (!open) return null;
    const t = theme || {};
    const boxDefault = {
      background:'#fff', borderRadius:24, border:'4px solid #2d2a26',
      boxShadow:'0 8px 0 #2d2a26', padding:'28px 32px', position:'relative',
      display:'flex', flexDirection:'column', alignItems:'center', gap:16,
      maxWidth:'90vw',
    };
    const closeBtnDefault = {
      fontFamily:'Jua', fontSize:14, padding:'4px 14px', borderRadius:999,
      border:'2px solid #ddd', background:'#f5f5f5', cursor:'pointer',
    };
    const imgDefault = { border:'2px solid #e5ddc6', borderRadius:12 };

    return (
      <div className="qc-no-print" onClick={onClose} style={{
        position:'fixed', inset:0, zIndex:2000,
        background:'rgba(0,0,0,.6)', display:'flex', alignItems:'center', justifyContent:'center',
      }}>
        <div onClick={e=>e.stopPropagation()} style={{...boxDefault, ...(t.boxStyle||{})}}>
          {t.decoration}
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%', gap:20}}>
            <span style={{fontFamily:'Jua', fontSize:20, color: t.titleColor || '#2d2a26'}}>📱 {title}</span>
            <button onClick={onClose} style={{...closeBtnDefault, ...(t.closeBtnStyle||{})}}>닫기</button>
          </div>
          <img
            src={QR_ENDPOINT + encodeURIComponent(url)}
            alt="QR 코드"
            width={280} height={280}
            style={{...imgDefault, ...(t.imgStyle||{})}}
          />
          <p style={{fontFamily:'Gaegu', fontSize:17, color: t.hintColor || '#7a7064', margin:0, textAlign:'center'}}>
            카메라로 QR을 찍으면 바로 접속돼요!
          </p>
          <a href={url} style={{fontFamily:'Noto Sans KR', fontSize:12, color:'#aaa', wordBreak:'break-all', textDecoration:'none'}}>
            {url}
          </a>
        </div>
      </div>
    );
  }

  window.QCShared = Object.assign(window.QCShared || {}, { QRModal });
})();
