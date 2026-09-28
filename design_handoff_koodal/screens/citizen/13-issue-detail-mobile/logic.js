// render-vals.js line 3
    const mob=S.w<720,wide=S.w>=1100;const common={theme,toast:S.toast,ready:S.ready,isMobile:mob,isDesk:!mob,railW:wide?'232px':'76px',railLabels:wide,

// render-vals.js line 18
    const d=d0,dst=CP.step(d.stage),[dpc,dpfg,dpl]=PILL[d.stage];const supported=!!my.support[d.id];

// render-vals.js line 70
      isHome:mob&&scr==='home',isSearch:mob&&scr==='search',isDetail:mob&&scr==='detail',isReport:scr==='report',isAi:scr==='ai',isSimilar:scr==='similar',isValidate:scr==='validate',isCase:scr==='case',isTimeline:mob&&scr==='timeline',isVerify:scr==='verify',isCases:mob&&scr==='cases',isProfile:mob&&scr==='profile',

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

// render-vals.js line 400
      oppFlex:mob?'1 1 0':'3 1 0',holdFlex:mob?'6 1 0':'7 1 0',editFlex:mob?'6 1 0':'7 1 0',shareFlex:mob?'1 1 0':'3 1 0'

// render-vals.js line 454
      heroSlides:Array.from({length:Math.min(12,hN)},(_,k)=>({cap:'photo '+(k+1),ang:ANG2(k)})),carN:String(carI+1),carScroll:e=>{const el=e.currentTarget;const ix=Math.round(el.scrollLeft/Math.max(1,el.clientWidth));if(ix!==carI)this.setState({carFor:i0.id,carI:ix});},

// render-vals.js line 456
      openTour:()=>{this.buzz(6);this.setState({tourFor:i0.id});},closeTour:()=>this.setState({tourFor:null}),tourOpen:tourOn,tourT:i0.title,tourRef:i0.caseId||i0.id,tourSub:`${evH.length} photos from ${new Set(evH.map(x=>x.uid||x.by)).size} people · ${i0.street}, ${i0.area}`,

// render-vals.js line 522
      d,holdLabel:my.support[i0.id]?(i0.sup>1?'You + '+(i0.sup-1)+' citizens':'You support this'):S.holdP>0?'Keep holding…':'Hold to support',

// render-vals.js line 523
      addEvidence:()=>{this.buzz([10,20,10]);const r=CP.act('evidence',i0.id);this.toast(r.first?'Photo added · you\'re now a contributor':'Photo added · support counts people, not photos');if(r.crossed)this.later(()=>this.fireThreshold(),700);},