// render-vals.js line 3
    const mob=S.w<720,wide=S.w>=1100;const common={theme,toast:S.toast,ready:S.ready,isMobile:mob,isDesk:!mob,railW:wide?'232px':'76px',railLabels:wide,

// render-vals.js line 18
    const d=d0,dst=CP.step(d.stage),[dpc,dpfg,dpl]=PILL[d.stage];const supported=!!my.support[d.id];

// render-vals.js line 41
    const events=d.events.map((e,k)=>{const isLast=k===d.events.length-1;const live=isLast&&!['closed','rejected'].includes(d.stage);const fix=e.kind==='fix';

// render-vals.js line 72
      goHome:()=>this.go('home'),goSearch:()=>this.go('search'),goReport:()=>this.go('report'),goCase:()=>this.go('case'),goTimeline:()=>this.go('timeline'),goVerify:()=>this.go('verify'),goDetail:()=>{const hs=this.state.hist||[];const t=hs[hs.length-1];if(t&&t.s==='detail')this.goBack();else this.go('detail');},goCases:()=>this.go('cases'),

// render-vals.js line 73
      back:()=>this.goBack(),

// render-vals.js line 91
      d:dv,threshold:S.threshold,thDeg:(S.thP/100*360)+'deg',thNum:Math.round(S.thP),sparks:SPARKS,closeThreshold:()=>{this.setState({threshold:false});this.go('case');},

// render-vals.js line 92
      holdStart:this.holdStart,holdEnd:this.holdEnd,holdW:holdSup?'0%':(S.holdP*100)+'%',holdBg:holdSup?'var(--cp-surface-2)':'var(--cp-ink)',holdFg:holdSup?'var(--cp-ink)':'var(--cp-bg)',

// render-vals.js line 93
      holdShadow:S.holdP>0&&!holdSup?'0 1px 0 var(--cp-edge)':'0 4px 0 var(--cp-edge)',holdT:S.holdP>0&&!holdSup?'translateY(3px) scale(.985)':'none',

// render-vals.js line 94
      holdIcon:holdSup?'ph-fill ph-check-circle':'ph-bold ph-hand-pointing',holdLabel:holdSup?`You + ${d.sup-1} support this`:S.holdP>0?'Keep holding…':'Hold to support',

// render-vals.js line 95
      addEvidence:()=>{this.buzz([10,20,10]);const r=CP.act('evidence',d.id);this.toast('Photo added as evidence');if(r.crossed)this.later(()=>this.fireThreshold(),700);},

// render-vals.js line 129
      vSummary:S.vres.map((r,i)=>{const it=CP.find(r.id);return {icon:CP.CATS[it.cat].icon,title:it.title,d:(i*0.08)+'s',open:()=>this.open(r.id),

// render-vals.js line 132
      stamp:S.stamp,toggleNotify:()=>{this.buzz(8);this.setState({notify:!S.notify});},notifyBg:S.notify?'var(--cp-leaf)':'var(--cp-surface-2)',notifyT:S.notify?'translateX(20px)':'none',events,

// render-vals.js line 158
    const __d=this.deskVals({S,D,list,qMatch,qt,mob,scr,needConfirm});return {...__o,dfGroups:__o.fGroups.slice(1),...__d,...this.v4Vals({S,D,list,qt,mob,scr,dv,events,an,needConfirm,o:__o,dk:__d})};

// render-vals.js line 167
      deskHome:view==='home',deskDetail:view==='detail',deskCases:view==='cases',deskProfile:view==='profile',

// render-vals.js line 168
      listW:W>=1280?'420px':'350px',detailCols:W>=1040?'minmax(0,1fr) 380px':'minmax(0,1fr)',asidePos:W>=1040?'sticky':'static',

// render-vals.js line 178
      backLabel:S.prev==='cases'?'Cases':S.prev==='profile'?'You':'Nearby',

// render-vals.js line 184
    const meName=me.name||CP.ME.name,meArea=me.area||CP.ME.area,meI=meName.split(' ').filter(Boolean).map(s=>s[0]).join('').slice(0,2).toUpperCase();

// render-vals.js line 200
        comment:(e)=>{e&&e.stopPropagation&&e.stopPropagation();if(mob)this.setState({commentsFor:i.id,cDraft:''});else this.open(i.id);},

// render-vals.js line 230
    const sendC=()=>{const t=S.cDraft.trim();if(!t||!cI)return;CP.act('comment',cI.id,t,me.anonDefault);this.buzz([6,20,6]);this.setState({cDraft:''});};

// render-vals.js line 262
        comment:e=>{e&&e.stopPropagation&&e.stopPropagation();this.buzz(6);if(mob)this.setState({commentsFor:i.id,cDraft:''});else this.setState({commentsFor:S.commentsFor===i.id?null:i.id,cModal:false,cDraft:''});}})),

// render-vals.js line 265
      openComments:()=>this.setState({commentsFor:i0.id,cModal:!mob,cDraft:''}),

// render-vals.js line 400
      oppFlex:mob?'1 1 0':'3 1 0',holdFlex:mob?'6 1 0':'7 1 0',editFlex:mob?'6 1 0':'7 1 0',shareFlex:mob?'1 1 0':'3 1 0'

// render-vals.js line 455
      mosaic:[0,1,2,3,4].map(k=>({gc:k===0?'1':k===1||k===3?'2':'3',gr:k===0?'1 / span 2':k<3?'1':'2',cap:k<evH.length?'photo '+(k+1):'',ang:ANG2(k)})),galH:S.w>=1100?'420px':'320px',

// render-vals.js line 456
      openTour:()=>{this.buzz(6);this.setState({tourFor:i0.id});},closeTour:()=>this.setState({tourFor:null}),tourOpen:tourOn,tourT:i0.title,tourRef:i0.caseId||i0.id,tourSub:`${evH.length} photos from ${new Set(evH.map(x=>x.uid||x.by)).size} people · ${i0.street}, ${i0.area}`,

// render-vals.js line 478
      meName,meArea,meI,meFirst:meName.split(' ')[0],meVerified:!!me.verified,mePhone:CP.ME.phone,verifiedLine:'Aadhaar e-KYC (mock) · verified '+new Date(me.verifiedAt||now).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}),

// render-vals.js line 490
      backLabel:{feed:'Feed',search:'Search',cases:'Cases',profile:'Profile'}[S.prev]||'Nearby',

// render-vals.js line 522
      d,holdLabel:my.support[i0.id]?(i0.sup>1?'You + '+(i0.sup-1)+' citizens':'You support this'):S.holdP>0?'Keep holding…':'Hold to support',

// render-vals.js line 523
      addEvidence:()=>{this.buzz([10,20,10]);const r=CP.act('evidence',i0.id);this.toast(r.first?'Photo added · you\'re now a contributor':'Photo added · support counts people, not photos');if(r.crossed)this.later(()=>this.fireThreshold(),700);},

// render-vals.js line 524
      openComments:()=>this.setState({commentsFor:i0.id,cDraft:''}),

// render-vals.js line 526
      cDraft:S.cDraft,onCDraft:e=>this.setState({cDraft:e.target.value}),onCKey:e=>{if(e.key==='Enter'){e.preventDefault();sendC();}},sendC,cSendO:S.cDraft.trim()?1:.45,