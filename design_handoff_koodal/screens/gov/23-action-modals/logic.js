// render-vals.js line 274
    let mc={};const mi=S.modal&&CP.find(S.m.id);

// render-vals.js line 284
        mc={...common,title:ap?'Approve & assign':'Edit assignment',dept:true,combos:[combo('a-dept','Department','ph-buildings',DEPTS.map(([dn,tm,icon])=>({k:dn,l:dn,sub:tm,icon})),m.dept?[m.dept]:[],v=>{const r=DEPTS.find(x=>x[0]===v[0]);this.mset(r?{dept:r[0],team:r[1]}:{dept:null,team:null});},{panel:true,abs:true,single:true}),combo('a-team','Team','ph-users-three',DEPTS.map(([dn,tm])=>({k:tm,l:tm,sub:dn,icon:'ph-users-three'})),m.team?[m.team]:[],v=>this.mset({team:v[0]||null}),{panel:true,abs:true,single:true})],

// render-vals.js line 292
        mc={...common,title:'Reject this case',reasons:true,reasonL:REASONS.map(([l,icon])=>({l,icon,on:m.reason===l,bd:m.reason===l?'var(--cp-ink)':'var(--cp-line)',bg:m.reason===l?'var(--cp-surface-2)':'var(--cp-surface)',pick:()=>this.mset({reason:l})})),

// render-vals.js line 324
      openCF:()=>this.setState({cfOpen:true,fsBig:false}),fsHt:mob?(S.fsBig?'92vh':'70vh'):'auto',fsScroll:e=>{if(mob&&!this.state.fsBig&&e.currentTarget.scrollTop>6)this.setState({fsBig:true});},mScroll:e=>{if(mob&&!this.state.mBig&&e.currentTarget.scrollTop>6)this.setState({mBig:true});},cfN:cfN?String(cfN):'',cfBd:cfN?'var(--cp-ink)':'var(--cp-line)',cfBg:cfN?'var(--cp-ink)':'var(--cp-surface)',cfFg:cfN?'var(--cp-bg)':'var(--cp-ink)',activeF,hasActiveF:activeF.length>0,

// render-vals.js line 334
      mapRows,mapEmpty:!mapRows.length,toggleList:()=>mob?this.setState(s=>({mListOpen:!s.mListOpen,mMax:false,mapSel:null})):this.setState(s=>s.mapFull?{mapFull:false,mapList:true}:{mapList:s.mapList===false}),listHidden:!mob&&!listOn,

// render-vals.js line 335
      mobListBtn:mob&&!S.mListOpen&&!msI&&!full,listBtnL:`Show list · ${mapL.length}`,mobListOpen:mob&&!!S.mListOpen&&!full,sheetH:`calc(${S.mMax?'100%':'70%'} - ${S.sheetDrag||0}px)`,sheetTr:S.sheetDrag?'none':'height .38s cubic-bezier(.2,.9,.3,1),border-radius .3s',sheetR:S.mMax&&!S.sheetDrag?'0':'26px 26px 0 0',sheetBd:S.mMax?'var(--cp-line)':'transparent',sheetDown:this.sheetDown,sheetScroll:e=>{if(!this.state.mMax&&e.currentTarget.scrollTop>6)this.setState({mMax:true});},sheetWheel:e=>{if(this.state.mMax&&e.currentTarget.scrollTop<=0&&e.deltaY<-4)this.setState({mMax:false});},

// render-vals.js line 357
      modalOpen:!!mi,closeModal:()=>this.setState({modal:null}),stop:e=>e.stopPropagation(),mAlign:mob?'flex-end':'stretch',mJust:mob?'center':'flex-end',mMaxW:mob?'100%':'440px',mPad:mob?'0':'12px',mMax:mob?(S.mBig?'92vh':'70vh'):'calc(100vh - 24px)',mR:mob?'26px 26px 0 0':'26px',mAnim:mob?'cp-sheet .4s cubic-bezier(.2,.9,.3,1.1) both':'cp-side .42s cubic-bezier(.2,.9,.3,1.05) both',mc};