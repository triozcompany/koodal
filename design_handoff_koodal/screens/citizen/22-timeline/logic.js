// render-vals.js line 18
    const d=d0,dst=CP.step(d.stage),[dpc,dpfg,dpl]=PILL[d.stage];const supported=!!my.support[d.id];

// render-vals.js line 41
    const events=d.events.map((e,k)=>{const isLast=k===d.events.length-1;const live=isLast&&!['closed','rejected'].includes(d.stage);const fix=e.kind==='fix';

// render-vals.js line 70
      isHome:mob&&scr==='home',isSearch:mob&&scr==='search',isDetail:mob&&scr==='detail',isReport:scr==='report',isAi:scr==='ai',isSimilar:scr==='similar',isValidate:scr==='validate',isCase:scr==='case',isTimeline:mob&&scr==='timeline',isVerify:scr==='verify',isCases:mob&&scr==='cases',isProfile:mob&&scr==='profile',

// render-vals.js line 72
      goHome:()=>this.go('home'),goSearch:()=>this.go('search'),goReport:()=>this.go('report'),goCase:()=>this.go('case'),goTimeline:()=>this.go('timeline'),goVerify:()=>this.go('verify'),goDetail:()=>{const hs=this.state.hist||[];const t=hs[hs.length-1];if(t&&t.s==='detail')this.goBack();else this.go('detail');},goCases:()=>this.go('cases'),

// render-vals.js line 91
      d:dv,threshold:S.threshold,thDeg:(S.thP/100*360)+'deg',thNum:Math.round(S.thP),sparks:SPARKS,closeThreshold:()=>{this.setState({threshold:false});this.go('case');},

// render-vals.js line 129
      vSummary:S.vres.map((r,i)=>{const it=CP.find(r.id);return {icon:CP.CATS[it.cat].icon,title:it.title,d:(i*0.08)+'s',open:()=>this.open(r.id),

// render-vals.js line 132
      stamp:S.stamp,toggleNotify:()=>{this.buzz(8);this.setState({notify:!S.notify});},notifyBg:S.notify?'var(--cp-leaf)':'var(--cp-surface-2)',notifyT:S.notify?'translateX(20px)':'none',events,

// render-vals.js line 158
    const __d=this.deskVals({S,D,list,qMatch,qt,mob,scr,needConfirm});return {...__o,dfGroups:__o.fGroups.slice(1),...__d,...this.v4Vals({S,D,list,qt,mob,scr,dv,events,an,needConfirm,o:__o,dk:__d})};