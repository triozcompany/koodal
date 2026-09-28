// render-vals.js line 18
    const d=d0,dst=CP.step(d.stage),[dpc,dpfg,dpl]=PILL[d.stage];const supported=!!my.support[d.id];

// render-vals.js line 70
      isHome:mob&&scr==='home',isSearch:mob&&scr==='search',isDetail:mob&&scr==='detail',isReport:scr==='report',isAi:scr==='ai',isSimilar:scr==='similar',isValidate:scr==='validate',isCase:scr==='case',isTimeline:mob&&scr==='timeline',isVerify:scr==='verify',isCases:mob&&scr==='cases',isProfile:mob&&scr==='profile',

// render-vals.js line 72
      goHome:()=>this.go('home'),goSearch:()=>this.go('search'),goReport:()=>this.go('report'),goCase:()=>this.go('case'),goTimeline:()=>this.go('timeline'),goVerify:()=>this.go('verify'),goDetail:()=>{const hs=this.state.hist||[];const t=hs[hs.length-1];if(t&&t.s==='detail')this.goBack();else this.go('detail');},goCases:()=>this.go('cases'),

// render-vals.js line 91
      d:dv,threshold:S.threshold,thDeg:(S.thP/100*360)+'deg',thNum:Math.round(S.thP),sparks:SPARKS,closeThreshold:()=>{this.setState({threshold:false});this.go('case');},

// render-vals.js line 129
      vSummary:S.vres.map((r,i)=>{const it=CP.find(r.id);return {icon:CP.CATS[it.cat].icon,title:it.title,d:(i*0.08)+'s',open:()=>this.open(r.id),

// render-vals.js line 134
      splitDown:this.splitDown,splitW:S.split+'%',

// render-vals.js line 135
      verifyOpen:d.stage==='resolved'&&!confirmedMine&&!S.verdict,verifyClosed:!(d.stage==='resolved'&&!confirmedMine)&&!S.verdict,

// render-vals.js line 136
      verifyMsg:d.stage==='closed'?'Case closed — thanks to neighbours':confirmedMine?'You already responded':'Not marked fixed yet — use “Govt” steps in the rail',

// render-vals.js line 137
      confirmDots:Array.from({length:d.needed},(_,i)=>({c:i<d.confirms?'var(--cp-leaf)':'var(--cp-surface-2)',w:i<d.confirms?'#fff':'rgba(255,255,255,.28)'})),

// render-vals.js line 138
      fixed:()=>{this.buzz([10,40,10,40,60]);const r=CP.act('confirm',d.id,true);this.setState({verdict:'fixed',closedNow:!!r.closed});},notFixed:()=>{this.buzz(14);this.setState({verdict:'not'});},

// render-vals.js line 139
      fixedTitle:S.closedNow?'Case closed!':'Confirmed.',vFixed:S.verdict==='fixed',vNot:S.verdict==='not',cancelNot:()=>this.setState({verdict:null,reason:null}),

// render-vals.js line 140
      reasons:REASONS.map(([label,icon])=>{const on=S.reason===label;return {label,icon,bg:on?'var(--cp-pulse)':'var(--cp-surface)',fg:on?'#fff':'var(--cp-ink)',sh:on?'0 1px 0 var(--cp-edge)':'0 4px 0 var(--cp-edge)',t:on?'translateY(3px)':'none',pick:()=>{this.buzz(8);this.setState({reason:label});}};}),

// render-vals.js line 141
      reopenO:S.reason?1:.45,sendReopen:()=>{if(!S.reason)return;CP.act('confirm',d.id,false,S.reason);this.buzz([10,30,10]);this.toast(`Sent to ${d.assignee||'department'}`);this.go('detail');},

// render-vals.js line 252
    const STL={new:'New',gathering:'Gathering',govt:'With govt',case:'Official case',progress:'In progress',fixed:'Fixed'};

// render-vals.js line 353
      vbLine:'Reported by '+(i0.anon?'Anonymous':i0.by)+' · '+CP.date(i0.created)+' · '+ev0.length+' citizen photos',vbSel:(vb+1)+' / '+ev0.length,

// render-vals.js line 354
      vbThumbs:ev0.slice(0,8).map((e,k)=>({bd:k===vb?'var(--cp-ink)':'transparent',pick:()=>{this.buzz(5);this.setState({vbIdx:k});}})),

// render-vals.js line 355
      vaLine:'Posted by '+(i0.assignee||'department')+' · geo-tagged at the same spot',vaSel:'1 / 3',vaThumbs:[0,1,2].map(k=>({bd:k===0?'var(--cp-leaf)':'transparent'}))

// render-vals.js line 378
      flowBackIcon:mob?'ph-arrow-left':'ph-x',goAiBack:mob?(()=>this.go('report')):X7.closeFlow,

// render-vals.js line 532
      verifyMsg:d.stage==='closed'?'Case closed — thanks, neighbours':my.confirmed[d.id]?'You already responded':'Not marked fixed yet — we\'ll notify you',