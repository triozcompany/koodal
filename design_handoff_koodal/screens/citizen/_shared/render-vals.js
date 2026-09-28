  renderVals(){
    const S=this.state,theme=S.theme||this.props.theme||'light',scr=S.screen;
    const mob=S.w<720,wide=S.w>=1100;const common={theme,toast:S.toast,ready:S.ready,isMobile:mob,isDesk:!mob,railW:wide?'232px':'76px',railLabels:wide,
      setLight:()=>this.setState({theme:'light'}),setDark:()=>this.setState({theme:'dark'}),lightBg:theme==='light'?'var(--cp-surface)':'transparent',darkBg:theme==='dark'?'var(--cp-surface)':'transparent'};
    if(!S.ready||!window.CP)return {...common,statusC:'var(--cp-ink)',rail:[],showPill:{},advO:1};
    const D=CP.get(),my=D.my,me=D.me;
    const d0=CP.find(S.cur)||CP.find(SHOW),show=CP.find(SHOW);
    // filtered list
    const f=S.f;const inRegion=i=>f.region==='near'?(i.city==='Chennai'&&i.km<=1.5):i.city===f.region;
    const list=D.issues.filter(i=>i.stage!=='rejected'&&inRegion(i)&&(!f.cat.length||f.cat.includes(i.cat))&&(!f.sev.length||f.sev.includes(i.sev))&&(!f.stage.length||f.stage.some(k=>STG[k].includes(i.stage))));
    const cards=list.map(i=>this.card(i,D));
    const fCount=f.cat.length+f.stage.length+f.sev.length+(f.region!=='near'?1:0);
    const toggleIn=(k,v)=>this.setState(s=>({f:{...s.f,[k]:s.f[k].includes(v)?s.f[k].filter(x=>x!==v):[...s.f[k],v]}}));
    const chipOpt=(on,l,pick,dot)=>({l,pick,dot:dot||'',bg:on?'var(--cp-ink)':'var(--cp-surface)',fg:on?'var(--cp-bg)':'var(--cp-ink)',bd:on?'var(--cp-edge)':'var(--cp-line)',sh:on?'0 1px 0 var(--cp-edge)':'none',t:on?'translateY(1px)':'none'});
    // search
    const qt=S.q.trim().toLowerCase();const qMatch=qt?D.issues.filter(i=>{const hay=`${i.title} ${i.area} ${i.street} ${i.city} ${CP.CATS[i.cat].l} ${i.id} ${i.caseId||''} ${i.dept}`.toLowerCase();return qt.split(/\s+/).every(w=>hay.includes(w));}):[];
    // detail
    const d=d0,dst=CP.step(d.stage),[dpc,dpfg,dpl]=PILL[d.stage];const supported=!!my.support[d.id];
    const isCase=!!d.caseId&&!['rejected'].includes(d.stage);const preCase=['reported','community','review'].includes(d.stage);
    const last=d.events[d.events.length-1];
    const dv={...d,icon:CP.CATS[d.cat].icon,cat:CP.CATS[d.cat].l,pc:dpc,pfg:dpfg,pl:dpl,ago:CP.ago(d.created),place:`${d.street}, ${d.area}, ${d.city}`,corp:CP.corp(d),
      byIcon:d.anon?'ph-bold ph-detective':'ph-bold ph-user',byLine:d.mine?(d.anon?'You · posted anonymously':'Reported by you'):`Reported by ${d.by}`,
      track:TRACK.map(([label,icon],j)=>{const done=j<dst,cur=j===dst&&d.stage!=='rejected';return {label,icon,cur:cur&&d.stage!=='closed',bg:done?'var(--cp-ink)':cur?SEGC[dst]:'var(--cp-surface)',bd:j<=dst?'var(--cp-edge)':'var(--cp-line)',fg:done?'var(--cp-bg)':cur?(dst===1?'var(--cp-on-marigold)':'#fff'):'var(--cp-ink-3)',lc:j<=dst?'var(--cp-ink)':'var(--cp-ink-3)'};}),
      trackW:(dst*20)+'%',preCase,isCase,noCase:!d.caseId,rejected:d.stage==='rejected',reject:d.reject||'',
      confW:d.conf+'%',confC:d.conf>=80?'var(--cp-peacock)':'var(--cp-marigold)',confNote:d.stage==='review'?'with govt now':'govt review at 80',
      avatars:d.evidence.slice(0,5).map((e,k)=>({i:e.by,bg:AVB[k%5]})),
      sevL:SEVL[d.sev][0],sevBg:SEVL[d.sev][1],voice:!!d.voice,voiceText:d.voice?d.voice.text:'',voiceLang:d.voice?d.voice.lang:'',voiceEn:d.voice?d.voice.en:'',
      mergedN:d.merged.length||'',merged:d.merged.map(m=>({i:m.by==='Anonymous'?'AN':m.by.split(' ').map(s=>s[0]).join(''),by:m.me?(m.by==='Anonymous'?'You · anonymous':'You'):m.by,ago:m.h?m.h+'h ago':'just now',text:m.text,sim:m.sim})),
      canValidate:['community','review'].includes(d.stage)&&!d.mine&&!my.validated[d.id],canAdd:!['closed','rejected'].includes(d.stage),
      evN:d.evidence.length,ev:d.evidence.slice(-7).map((e,k,arr)=>({by:e.by,ago:CP.ago(e.ts),mine:e.uid==='me'&&!d.caseId&&['reported','community'].includes(d.stage),rm:ev=>{ev&&ev.stopPropagation&&ev.stopPropagation();this.buzz([8,20,8]);CP.act('removeEvidence',d.id,d.evidence.length-arr.length+k);this.toast('Photo removed');},anim:e.ts>S.mountTs?'cp-pop .4s cubic-bezier(.3,1.6,.5,1) both':'none'})),
      hasTimeline:true,evCount:d.events.length,
      actSupport:preCase,actCase:['verified','assigned','progress'].includes(d.stage),actVerify:d.stage==='resolved'&&!my.confirmed[d.id],
      actDone:(d.stage==='resolved'&&!!my.confirmed[d.id])||d.stage==='closed'||d.stage==='rejected',
      doneLabel:d.stage==='closed'?`Closed · ${d.confirms} confirmed`:d.stage==='rejected'?'Not accepted':`You responded · ${d.confirms}/${d.needed}`,
      caseId:d.caseId||'',assignee:d.assignee||'—',prio:d.prio||'—',sla:d.stage==='closed'?'Closed':d.stage==='resolved'?'Fixed':CP.slaLeft(d),slaC:CP.slaRisk(d)===2?'var(--cp-pulse)':'var(--cp-ink)',
      caseOrId:d.caseId||d.id,
      pendTitle:d.stage==='review'?`With ${CP.corp(d)}`:d.stage==='rejected'?'Not accepted':'Not an official case yet',
      pendSub:d.stage==='review'?'Community verified. An engineer is reviewing the evidence — you\'ll be notified when it becomes an official case.':d.stage==='rejected'?`Reason: ${d.reject}`:`Needs 80% community confidence (now ${d.conf}%). Support it or add evidence.`,
      nowTitle:last.title,nowAgo:CP.ago(last.ts),nowIcon:last.icon,nowC:d.stage==='resolved'||d.stage==='closed'?'var(--cp-leaf)':d.stage==='progress'?'var(--cp-pulse)':'var(--cp-peacock)',nowBg:d.stage==='resolved'||d.stage==='closed'?'var(--cp-leaf-soft)':d.stage==='progress'?'var(--cp-pulse-soft)':'var(--cp-peacock-soft)',
      bar:[0,1,2,3,4].map(j=>({c:j<dst?'var(--cp-ink)':j===dst?SEGC[dst]:'var(--cp-line)'})),confirms:d.confirms,needed:d.needed};
    const events=d.events.map((e,k)=>{const isLast=k===d.events.length-1;const live=isLast&&!['closed','rejected'].includes(d.stage);const fix=e.kind==='fix';
      return {t:CP.date(e.ts),title:e.title,sub:e.sub,photo:e.photo,icon:e.icon,line:!isLast,live,bg:fix?'var(--cp-leaf)':live?'var(--cp-pulse)':e.kind==='gov'?'var(--cp-peacock)':'var(--cp-ink)',fg:fix||live||e.kind==='gov'?'#fff':'var(--cp-bg)',
        cardBg:live?(fix?'var(--cp-leaf-soft)':'var(--cp-pulse-soft)'):'transparent',pad:live?'12px':'2px 0 0',anim:e.ts>S.mountTs?'cp-row .5s cubic-bezier(.2,.9,.3,1.3) both':'none'};});
    // AI
    const an=S.an||CP.analyze(S.scene);
    const matchTxt=an.strong?`1 strong match · ${an.strong.dist} m away`:an.matches.length?`Similar issue ${an.matches[0].dist} m away · maybe different`:'No similar issue nearby';
    const aiAll=[{icon:CP.CATS[an.cat].icon,bg:'var(--cp-pulse-soft)',k:'Classified',v:`${an.label} · ${an.catLabel}`},{icon:'ph-waveform',bg:'var(--cp-surface-2)',k:`Heard · ${an.voice.lang}`,v:an.voice.text,sub:an.voice.en},
      {icon:'ph-warning',bg:'var(--cp-marigold-soft)',k:'Severity',v:`${SEVL[an.sev][0]} · ${an.size}`,sub:an.risk},{icon:'ph-buildings',bg:'var(--cp-peacock-soft)',k:'Goes to',v:`${an.dept} · ${an.corp}`},
      {icon:'ph-intersect',bg:'var(--cp-surface-2)',k:'Similar issues',v:S.aiStep>=6?matchTxt:`Checking ${D.issues.length} reports nearby`}];
    const m=an.strong||an.matches[0]||{title:'',by:'',h:0,score:0,dist:0,sup:0,id:null};const mIssue=m.id?CP.find(m.id):null;
    // validate
    const deck=S.deck.map(id=>CP.find(id)).filter(Boolean);const vc=deck[S.vi]||deck[0]||{title:'',cat:'road',conf:0,km:0};
    const vT=S.vout?`translateX(${(S.vout===2?0:S.vout)*520}px) translateY(${S.vout===2?-600:0}px) rotate(${(S.vout===2?0:S.vout)*24}deg)`:`translateX(${S.vdrag}px) rotate(${S.vdrag/16}deg)`;
    // cases/profile
    const mine=D.issues.filter(i=>i.mine),comm=D.issues.filter(i=>!i.mine&&my.support[i.id]);
    const caseSrc=S.casesTab==='mine'?mine:comm;
    const tab=(k,icon,label,badge)=>({label,badge,icon:(scr===k?'ph-fill ':'ph-bold ')+icon,c:scr===k?'var(--cp-ink)':'var(--cp-ink-3)',go:()=>this.go(k)});
    const needConfirm=D.issues.filter(i=>(i.mine||my.support[i.id])&&i.stage==='resolved'&&!my.confirmed[i.id]).length;
    const holdSup=supported;
    const advNext={reported:'Boost support',community:'Push to 80%',review:'Govt: verify',verified:'Govt: assign',assigned:'Govt: start work',progress:'Govt: mark fixed'}[show.stage];
    const confirmedMine=my.confirmed[d.id];
    const otpDigits='4821';
    const __o={...common,
      statusC:scr==='report'||(scr==='detail'&&S.threshold)||(scr==='verify'&&S.verdict==='fixed')?'#fff':'var(--cp-ink)',
      showPill:{pc:PILL[show.stage][0],pfg:PILL[show.stage][1],pl:PILL[show.stage][2]},showConf:show.conf,showSup:show.sup,
      advLabel:advNext?advNext+' →':'Awaiting citizens',advO:advNext?1:.45,advanceGov:()=>{const r=CP.act('govAdvance',SHOW);if(r){this.toast(`CP-2107 → ${PILL[r][2]}`);this.buzz(10);}},
      resetDemo:()=>{CP.act('reset');this.setState({f:{region:'near',cat:[],stage:[],sev:[]},q:'',an:null,mountTs:Date.now()});this.go('home',{cur:SHOW});this.toast('Demo reset');},
      rail:RAIL.map(([k,label,hint],i)=>{const on=scr===k&&(!['detail','case','timeline','verify'].includes(k)||S.cur===SHOW);return {n:String(i+1).padStart(2,'0'),label,hint,bg:on?'var(--cp-surface)':'transparent',numC:on?'var(--cp-pulse)':'var(--cp-ink-3)',
        go:()=>{if(k==='ai'||k==='similar'){this.setState({scene:'sewage',an:CP.analyze('sewage'),anon:false});this.go(k,k==='ai'?{}:{});}else if(['detail','case','timeline','verify'].includes(k))this.go(k,{cur:SHOW});else this.go(k);}};}),
      isHome:mob&&scr==='home',isSearch:mob&&scr==='search',isDetail:mob&&scr==='detail',isReport:scr==='report',isAi:scr==='ai',isSimilar:scr==='similar',isValidate:scr==='validate',isCase:scr==='case',isTimeline:mob&&scr==='timeline',isVerify:scr==='verify',isCases:mob&&scr==='cases',isProfile:mob&&scr==='profile',
      showTabs:mob&&['home','cases','validate','profile'].includes(scr)&&!S.filterOpen,
      goHome:()=>this.go('home'),goSearch:()=>this.go('search'),goReport:()=>this.go('report'),goCase:()=>this.go('case'),goTimeline:()=>this.go('timeline'),goVerify:()=>this.go('verify'),goDetail:()=>{const hs=this.state.hist||[];const t=hs[hs.length-1];if(t&&t.s==='detail')this.goBack();else this.go('detail');},goCases:()=>this.go('cases'),
      back:()=>this.goBack(),
      // home
      pins:list.map(i=>({x:i.x+'%',y:(i.y*0.62+8)+'%',icon:CP.CATS[i.cat].icon,c:PIN[i.stage][0],fg:PIN[i.stage][1],hot:i.stage==='community'&&i.conf>=70||i.stage==='review',open:()=>this.open(i.id)})),
      list:cards,listCount:list.length,listEmpty:!list.length,regionTitle:f.region==='near'?'Nearby':f.region,fCount:fCount||'',
      chips:[['all','All','ph-squares-four'],...Object.entries(CP.CATS).map(([k,c])=>[k,c.l,c.icon])].map(([k,label,icon])=>{const on=k==='all'?!f.cat.length:(f.cat.length===1&&f.cat[0]===k);return {label,icon,bg:on?'var(--cp-ink)':'var(--cp-surface)',fg:on?'var(--cp-bg)':'var(--cp-ink)',bd:on?'var(--cp-ink)':'var(--cp-line)',pick:()=>{this.buzz(5);this.setState(s=>({f:{...s.f,cat:k==='all'?[]:[k]}}));}};}),
      sheetTopPx:(S.sheetTop??Math.round(S.h*0.3))+'px',mapH:'100%',noop:()=>{},sheetTrans:S.sheetDrag?'none':'top .45s cubic-bezier(.2,.9,.3,1.15)',sheetDown:this.sheetDown,
      filterOpen:S.filterOpen,openFilter:()=>this.setState({filterOpen:true}),closeFilter:()=>this.setState({filterOpen:false}),clearFilters:()=>this.setState({f:{region:'near',cat:[],stage:[],sev:[]}}),
      fGroups:[
        {title:'REGION',nice:'Where',chips:true,opts:[['near','Near me'],['Chennai','Chennai'],['Coimbatore','Coimbatore'],['Madurai','Madurai']].map(([k,l])=>chipOpt(f.region===k,l,()=>this.setState(s=>({f:{...s.f,region:k}}))))},
        {title:'CATEGORY',nice:'Problem type',chips:false,tiles:true,opts:Object.entries(CP.CATS).map(([k,c])=>({...chipOpt(f.cat.includes(k),c.l,()=>toggleIn('cat',k)),icon:c.icon,tb:f.cat.includes(k)?'2px solid var(--cp-ink)':'1px solid var(--cp-line)',tbg:f.cat.includes(k)?'var(--cp-surface-2)':'var(--cp-surface)'}))},
        {title:'STATUS',nice:'Status',chips:true,opts:[['new','New','var(--cp-ink-3)'],['gathering','Gathering','var(--cp-marigold)'],['govt','With govt','var(--cp-peacock-soft)'],['case','Official case','var(--cp-peacock)'],['progress','In progress','var(--cp-pulse)'],['fixed','Fixed','var(--cp-leaf)']].map(([k,l,dot])=>chipOpt(f.stage.includes(k),l,()=>toggleIn('stage',k),dot))},
        {title:'SEVERITY',nice:'Severity',chips:true,opts:[['critical','Critical'],['high','High'],['medium','Medium'],['low','Low']].map(([k,l])=>chipOpt(f.sev.includes(k),l,()=>toggleIn('sev',k)))}
      ],
      tabsL:[tab('home','ph-map-trifold','Nearby'),tab('cases','ph-briefcase','Cases',needConfirm?String(needConfirm):'')],tabsR:[tab('validate','ph-cards','Validate'),tab('profile','ph-user','You')],
      // search
      qRef:this.qRef,q:S.q,onQ:(e)=>this.setState({q:e.target.value}),clearQ:()=>this.setState({q:''}),qEmpty:!qt,qCount:qMatch.length,qNone:!!qt&&!qMatch.length,
      qResults:qMatch.slice(0,40).map(i=>this.card(i,D)),qSuggest:['Velachery','sewage','pothole','Coimbatore','streetlight','Madurai','CP-2107'].map(l=>({l,pick:()=>this.setState({q:l})})),
      // detail
      d:dv,threshold:S.threshold,thDeg:(S.thP/100*360)+'deg',thNum:Math.round(S.thP),sparks:SPARKS,closeThreshold:()=>{this.setState({threshold:false});this.go('case');},
      holdStart:this.holdStart,holdEnd:this.holdEnd,holdW:holdSup?'0%':(S.holdP*100)+'%',holdBg:holdSup?'var(--cp-surface-2)':'var(--cp-ink)',holdFg:holdSup?'var(--cp-ink)':'var(--cp-bg)',
      holdShadow:S.holdP>0&&!holdSup?'0 1px 0 var(--cp-edge)':'0 4px 0 var(--cp-edge)',holdT:S.holdP>0&&!holdSup?'translateY(3px) scale(.985)':'none',
      holdIcon:holdSup?'ph-fill ph-check-circle':'ph-bold ph-hand-pointing',holdLabel:holdSup?`You + ${d.sup-1} support this`:S.holdP>0?'Keep holding…':'Hold to support',
      addEvidence:()=>{this.buzz([10,20,10]);const r=CP.act('evidence',d.id);this.toast('Photo added as evidence');if(r.crossed)this.later(()=>this.fireThreshold(),700);},
      valYes:()=>{this.buzz([10,30,20]);const r=CP.act('validate',d.id,true);this.toast('Thanks — confidence +1');if(r.crossed)this.later(()=>this.fireThreshold(),600);},
      valNo:()=>{this.buzz(14);CP.act('validate',d.id,false);this.toast('Noted — marked as maybe gone');},
      // report
      scenes:Object.entries(CP.SCENES).map(([k,s])=>{const on=S.scene===k;return {l:s.label.split(' ')[0],icon:CP.CATS[s.cat].icon,bg:on?'#fff':'transparent',fg:on?'#0c0d10':'#fff',bd:on?'#fff':'#3a3c44',pick:()=>this.setState({scene:k})};}),
      notCaptured:!S.captured,captured:S.captured,flash:S.flash,camH:S.captured?'52%':'64%',
      capture:()=>{this.buzz(20);this.setState(s=>({flash:true,captured:true,shots:Math.min(10,(s.captured?s.shots||1:0)+1)}));this.later(()=>this.setState({flash:false}),300);},
      camLabel:S.captured?`your photo · ${CP.SCENES[S.scene].label.toLowerCase()}`:'live camera',camHint:S.captured?`${CP.SCENES[S.scene].label} spotted`:'Point at the issue',camDot:S.captured?'oklch(0.63 0.19 32)':'oklch(0.8 0.155 75)',
      sceneStreet:CP.SCENES[S.scene].street,meName:CP.ME.name,meArea:CP.ME.area,mePhone:CP.ME.phone,
      setNamed:()=>this.setState({anon:false}),setAnon:()=>{this.buzz(6);this.setState({anon:true});},namedBg:S.anon?'transparent':'rgba(255,255,255,.16)',anonBg:S.anon?'oklch(0.58 0.2 32)':'transparent',
      voiceTap:()=>{if(S.voice!=='idle')return;this.setState({voice:'rec'});this.buzz(10);this.later(()=>{this.setState({voice:'done'});this.buzz([6,20,6]);},1800);},
      voiceIdle:S.voice==='idle',voiceNotIdle:S.voice!=='idle',voiceBg:S.voice==='rec'?'oklch(0.58 0.2 32)':'#1a1c21',voiceIcon:S.voice==='done'?'ph-fill ph-check-circle':'ph-bold ph-microphone',
      voiceTag:S.voice==='rec'?'0:03':S.voice==='done'?'0:04 · '+CP.SCENES[S.scene].voice.lang:'optional',
      wave:WAVE.map((h,i)=>({h:h+'px',anim:S.voice==='rec'?`cp-wave .7s ${(i%6)*0.08}s ease-in-out infinite`:'none'})),
      slideDown:this.slideDown,slideXpx:S.slideX+'px',slideFillW:(S.slideX+64)+'px',slideTextO:Math.max(0,1-S.slideX/160),slideTrans:S.sliding?'none':'transform .4s cubic-bezier(.3,1.4,.5,1)',
      // ai
      an,aiTitle:S.aiStep>=6?'Got it.':'Understanding…',aiScanning:S.aiStep<2,aiBox:S.aiStep>=1,aiRows:aiAll.slice(0,Math.min(5,S.aiStep)).map(r=>({...r,sub:r.sub||''})),aiThinking:S.aiStep<6,aiDone:S.aiStep>=6,
      aiBtnLabel:an.strong?'1 match nearby · See it':an.matches.length?'Similar nearby · Compare':'Post as new issue',aiBtnIcon:an.matches.length?'ph-intersect':'ph-paper-plane-tilt',
      aiBtnBg:an.matches.length?'var(--cp-marigold)':'var(--cp-pulse)',aiBtnFg:an.matches.length?'var(--cp-on-marigold)':'#fff',aiNext:()=>an.matches.length?this.go('similar'):this.postNew(),
      // similar
      m,simTitle:an.strong?'Already on the map.':'Same issue?',joining:S.joining,simOthers:mIssue&&mIssue.merged.length?mIssue.merged.length:'',
      mineTag:S.anon?'Anonymous · now':'You · now',badgeBg:an.strong?'var(--cp-marigold)':'var(--cp-surface-2)',
      mineT:S.joining?'translate(150px,-8px) rotate(4deg) scale(.5)':'rotate(-6deg)',mineO:S.joining?0:1,theirsT:S.joining?'rotate(0deg) scale(1.05)':'rotate(5deg)',badgeO:S.joining?0:1,
      simPLabel:an.strong?(S.joining?`Joined · ${m.sup+1} neighbours`:`Join ${m.sup} neighbours`):'Post as new issue',simPIcon:an.strong?'ph-arrow-fat-up':'ph-paper-plane-tilt',
      simSLabel:an.strong?'Mine is different':'Join this one instead',
      simPrimary:()=>an.strong?this.join(m.id):this.postNew(),simSecondary:()=>an.strong?this.postNew():this.join(m.id),goAiBack:()=>this.go('report'),
      // validate
      vProg:(deck.length?deck:[0]).map((c,i)=>({c:i<S.vi?'var(--cp-leaf)':i===S.vi?'var(--cp-ink)':'var(--cp-line)'})),
      vActive:S.vi<deck.length,vDone:S.vi>=deck.length,vHasNext:S.vi<deck.length-1,
      vCur:{title:vc.title,icon:CP.CATS[vc.cat].icon,cat:CP.CATS[vc.cat].l.toLowerCase(),conf:vc.conf,w:vc.conf+'%',dist:vc.km<1?Math.round(vc.km*1000)+' m':vc.km+' km'},vT,
      vTrans:S.vdragging?'none':S.vout?'transform .34s cubic-bezier(.5,0,.8,.6)':'transform .45s cubic-bezier(.3,1.5,.5,1)',
      vYesO:S.vout===1?1:Math.max(0,Math.min(1,S.vdrag/90)),vNoO:S.vout===-1?1:Math.max(0,Math.min(1,-S.vdrag/90)),
      vDown:this.vDown,voteYes:()=>this.vote(1),voteNo:()=>this.vote(-1),voteSkip:()=>this.vote(0),
      vDoneTitle:S.vres.length?'Your street, a little clearer.':'All caught up nearby.',
      vSummary:S.vres.map((r,i)=>{const it=CP.find(r.id);return {icon:CP.CATS[it.cat].icon,title:it.title,d:(i*0.08)+'s',open:()=>this.open(r.id),
        tag:r.crossed?'→ govt':r.dir>0?`${it.conf}% ↑`:r.dir<0?`${it.conf}% ↓`:'skipped',bg:r.crossed?'var(--cp-peacock)':r.dir>0?'var(--cp-leaf-soft)':r.dir<0?'var(--cp-pulse-soft)':'var(--cp-surface-2)',fg:r.crossed?'#fff':'var(--cp-ink)'};}),
      // case / timeline
      stamp:S.stamp,toggleNotify:()=>{this.buzz(8);this.setState({notify:!S.notify});},notifyBg:S.notify?'var(--cp-leaf)':'var(--cp-surface-2)',notifyT:S.notify?'translateX(20px)':'none',events,
      // verify
      splitDown:this.splitDown,splitW:S.split+'%',
      verifyOpen:d.stage==='resolved'&&!confirmedMine&&!S.verdict,verifyClosed:!(d.stage==='resolved'&&!confirmedMine)&&!S.verdict,
      verifyMsg:d.stage==='closed'?'Case closed — thanks to neighbours':confirmedMine?'You already responded':'Not marked fixed yet — use “Govt” steps in the rail',
      confirmDots:Array.from({length:d.needed},(_,i)=>({c:i<d.confirms?'var(--cp-leaf)':'var(--cp-surface-2)',w:i<d.confirms?'#fff':'rgba(255,255,255,.28)'})),
      fixed:()=>{this.buzz([10,40,10,40,60]);const r=CP.act('confirm',d.id,true);this.setState({verdict:'fixed',closedNow:!!r.closed});},notFixed:()=>{this.buzz(14);this.setState({verdict:'not'});},
      fixedTitle:S.closedNow?'Case closed!':'Confirmed.',vFixed:S.verdict==='fixed',vNot:S.verdict==='not',cancelNot:()=>this.setState({verdict:null,reason:null}),
      reasons:REASONS.map(([label,icon])=>{const on=S.reason===label;return {label,icon,bg:on?'var(--cp-pulse)':'var(--cp-surface)',fg:on?'#fff':'var(--cp-ink)',sh:on?'0 1px 0 var(--cp-edge)':'0 4px 0 var(--cp-edge)',t:on?'translateY(3px)':'none',pick:()=>{this.buzz(8);this.setState({reason:label});}};}),
      reopenO:S.reason?1:.45,sendReopen:()=>{if(!S.reason)return;CP.act('confirm',d.id,false,S.reason);this.buzz([10,30,10]);this.toast(`Sent to ${d.assignee||'department'}`);this.go('detail');},
      // cases
      tabMine:()=>this.setState({casesTab:'mine'}),tabComm:()=>this.setState({casesTab:'comm'}),myN:mine.length,commN:comm.length,
      mineTabBg:S.casesTab==='mine'?'var(--cp-surface)':'transparent',commTabBg:S.casesTab==='comm'?'var(--cp-surface)':'transparent',
      mineTabSh:S.casesTab==='mine'?'0 1px 2px rgba(0,0,0,.1)':'none',commTabSh:S.casesTab==='comm'?'0 1px 2px rgba(0,0,0,.1)':'none',
      caseList:caseSrc.map(i=>this.card(i,D)),caseEmpty:!caseSrc.length,
      // profile
      meVerified:me.verified,meUnverified:!me.verified,openId:()=>this.setState({idOpen:true,idStep:0,otp:0,afterId:null}),
      stats:[{v:mine.length,l:'Reported'},{v:Object.keys(my.support).length,l:'Supported'},{v:Object.keys(my.validated).length,l:'Validated'},{v:Object.values(my.confirmed).filter(x=>x>0).length,l:'Fixes confirmed'}],
      toggleAnonDefault:()=>{this.buzz(8);CP.act('setMe',{anonDefault:!me.anonDefault});},anonDefBg:me.anonDefault?'var(--cp-leaf)':'var(--cp-surface-2)',anonDefT:me.anonDefault?'translateX(20px)':'none',
      fixedList:D.issues.filter(i=>(i.mine||my.support[i.id])&&['resolved','closed'].includes(i.stage)).map(i=>({title:i.title,area:i.area,open:()=>this.open(i.id)})),
      // id sheet
      idOpen:S.idOpen,idOtp:S.idStep>=1,otpBoxes:[0,1,2,3].map(k=>({v:k<S.otp?otpDigits[k]:'',bd:k<S.otp?'var(--cp-edge)':'var(--cp-line)',bg:k<S.otp?'var(--cp-surface-2)':'transparent'})),
      idBtnLabel:S.idStep===0?'Send OTP':S.idStep===1?(S.otp<4?'Reading OTP…':'Verify'):'Verified',idBtnIcon:S.idStep===2?'ph-check-circle':'ph-arrow-right',idBtnBg:S.idStep===2?'var(--cp-leaf)':'var(--cp-peacock)',
      idNext:()=>{if(S.idStep===0){this.setState({idStep:1,otp:0});[1,2,3,4].forEach(k=>this.later(()=>{this.setState({otp:k});this.buzz(5);},300+k*220));}
        else if(S.idStep===1&&S.otp>=4){this.setState({idStep:2});this.buzz([10,40,20]);CP.act('setMe',{verified:true});this.later(()=>{const nx=this.state.afterId;this.setState({idOpen:false});if(nx)this.go(nx);else this.toast('Identity verified');},700);}}
    };
    const __d=this.deskVals({S,D,list,qMatch,qt,mob,scr,needConfirm});return {...__o,dfGroups:__o.fGroups.slice(1),...__d,...this.v4Vals({S,D,list,qt,mob,scr,dv,events,an,needConfirm,o:__o,dk:__d})};
  }
  deskVals(o){const {S,D,list,qMatch,qt,mob,scr,needConfirm}=o;
    if(mob)return {showStage:(true)||(!mob&&!!S.locOpen),stL:'0',stT:'0',stW:'100%',stH:'100%',stTf:'none',stR:'0',stShadow:'none',closeFlow:()=>this.go('home')};
    const view=FLOW.includes(scr)?(S.base||'home'):scr,W=S.w,me=D.me;
    const src=list;const sel=src.find(i=>i.id===S.selId);
    const flow=FLOW.includes(scr)||S.threshold||S.idOpen;
    return {showStage:(flow)||(!mob&&!!S.locOpen),stL:'50%',stT:'50%',stW:'min(440px, calc(100vw - 32px))',stH:'min(860px, calc(100vh - 40px))',stTf:'translate(-50%,-50%)',stR:'28px',stShadow:'0 40px 100px -30px rgba(0,0,0,.55)',
      closeFlow:()=>{this.clearT();this.setState({threshold:false,idOpen:false});this.go(S.base||'home');},
      deskHome:view==='home',deskDetail:view==='detail',deskCases:view==='cases',deskProfile:view==='profile',
      listW:W>=1280?'420px':'350px',detailCols:W>=1040?'minmax(0,1fr) 380px':'minmax(0,1fr)',asidePos:W>=1040?'sticky':'static',
      dnav:[['home','Nearby','ph-map-trifold',''],['cases','Cases','ph-briefcase',needConfirm?String(needConfirm):''],['validate','Validate','ph-cards',''],['profile','You','ph-user','']].map(([k,l,icon,badge])=>{const on=k==='validate'?scr==='validate':(!FLOW.includes(scr)||k!=='validate')&&(view===k||(k==='home'&&view==='detail'&&S.prev!=='cases'&&S.prev!=='profile')||(k==='cases'&&view==='detail'&&S.prev==='cases'));return {l,badge,bp:W>=1100?'static':'absolute',icon:(on?'ph-fill ':'ph-bold ')+icon,bg:on?'var(--cp-surface-2)':'transparent',c:on?'var(--cp-ink)':'var(--cp-ink-3)',go:()=>this.go(k)};}),
      goProfile:()=>this.go('profile'),meStatus:me.verified?'Verified citizen':'Not verified',meStatusC:me.verified?'var(--cp-leaf)':'var(--cp-ink-3)',
      dqRef:this.dqRef,dTitle:S.f.region==='near'?'Nearby':S.f.region,dCount:src.length+' issues',
      regions:[['near','Near me'],['Chennai','Chennai'],['Coimbatore','Coimbatore'],['Madurai','Madurai']].map(([k,l])=>{const on=S.f.region===k&&!qt;return {l,bg:on?'var(--cp-surface)':'transparent',fg:on?'var(--cp-ink)':'var(--cp-ink-2)',sh:on?'0 1px 2px rgba(0,0,0,.1)':'none',pick:()=>this.setState(s=>({f:{...s.f,region:k},q:'',selId:null}))};}),
      dFiltersOpen:S.dFilters,toggleDFilters:()=>this.setState({dFilters:!S.dFilters}),dfBg:S.dFilters?'var(--cp-ink)':'var(--cp-surface)',dfFg:S.dFilters?'var(--cp-bg)':'var(--cp-ink)',dfBd:S.dFilters?'var(--cp-ink)':'var(--cp-line)',
      dlist:src.map(i=>{const on=S.selId===i.id;return {...this.card(i,D),rowBg:on?'var(--cp-bg)':'transparent',bar:on?'var(--cp-pulse)':'transparent',hover:()=>{if(this.state.selId!==i.id)this.setState({selId:i.id});}};}),
      dEmpty:!src.length,showMe:S.f.region==='near'&&!qt,mapCity:qt?'TAMIL NADU':S.f.region==='near'?'VELACHERY':S.f.region.toUpperCase(),
      dpins:src.map(i=>{const on=S.selId===i.id;return {x:i.x+'%',y:(i.y*0.8+10)+'%',icon:CP.CATS[i.cat].icon,c:PIN[i.stage][0],fg:PIN[i.stage][1],hot:i.stage==='review'||(i.stage==='community'&&i.conf>=70),n:i.sup,pb:on?'var(--cp-ink)':'var(--cp-surface)',pf:on?'var(--cp-bg)':'var(--cp-ink)',sc:on?1.12:1,s:on?'46px':'36px',is:on?'21px':'17px',z:on?6:1,pick:()=>this.setState({selId:i.id})};}),
      hasSel:!!sel,sel:sel?(()=>{const c=this.card(sel,D);return {...c,conf:sel.conf,sbD:D.my.support[sel.id]?'var(--cp-pulse)':'#1e1e1e'};})():{},closeSel:()=>this.setState({selId:null}),
      backLabel:S.prev==='cases'?'Cases':S.prev==='profile'?'You':'Nearby',
      legend:[['Gathering','var(--cp-marigold)'],['Official','var(--cp-peacock)'],['In progress','var(--cp-pulse)'],['Fixed','var(--cp-leaf)']].map(([l,c])=>({l,c}))};
  }

  v4Vals({S,D,list,qt,mob,scr,dv,events,an,needConfirm,o,dk}){
    const my=D.my,me=D.me,W=S.w,f=S.f,view=FLOW.includes(scr)?(S.base||'home'):scr,OP=my.opposed||{};
    const meName=me.name||CP.ME.name,meArea=me.area||CP.ME.area,meI=meName.split(' ').filter(Boolean).map(s=>s[0]).join('').slice(0,2).toUpperCase();
    const ini=n=>n==='Anonymous'?'':n.split(' ').map(s=>s[0]).join('').slice(0,2);
    const hash=s=>{let h=7;for(const c of s)h=(h*31+c.charCodeAt(0))|0;return Math.abs(h);};
    const AB=['var(--cp-marigold-soft)','var(--cp-peacock-soft)','var(--cp-pulse-soft)','var(--cp-leaf-soft)'];
    const lastAct=i=>i.events.length?i.events[i.events.length-1].ts:i.created;
    const post=i=>{const c=this.card(i,D),st=CP.stats(i),on=!!my.support[i.id],op=!!OP[i.id],pre=['reported','community','review'].includes(i.stage);
      return {...c,ai:i.anon?'':ini(i.by),anon:i.anon,abg:AB[hash(i.by)%4],name:i.mine?(i.anon?'You · anonymous':meName):i.by,verified:!i.anon,ago:CP.ago(i.created),place:i.street+', '+i.area,
        text:i.text||'',hasText:!!i.text,hasVoice:!!i.voice,voiceText:i.voice?i.voice.text:'',photoN:st.photos,contribN:st.contributors,citN:i.sup,
        tags:(i.tags||[]).map(t=>({t})),hasTags:!!(i.tags||[]).length,preCase:pre,conf:i.conf,confW:i.conf+'%',confC:i.conf>=80?'var(--cp-peacock)':'var(--cp-marigold)',
        isCase:!!i.caseId&&i.stage!=='rejected',caseId:i.caseId||'',caseLine:i.caseId?PILL[i.stage][2]+' · '+(i.stage==='closed'?'Closed':i.stage==='resolved'?'Fix posted':CP.slaLeft(i)):'',
        supBg:on?'var(--cp-pulse)':'var(--cp-surface)',supFg:on?'#fff':'var(--cp-ink)',supIcon:on?'ph-fill ph-arrow-fat-up':'ph-bold ph-arrow-fat-up',
        oppN:i.opp||0,oppBg:op?'var(--cp-ink)':'var(--cp-surface)',oppFg:op?'var(--cp-bg)':'var(--cp-ink)',oppIcon:op?'ph-fill ph-arrow-fat-down':'ph-bold ph-arrow-fat-down',
        cmtN:(i.comments||[]).length,shareN:i.shares||0,catL:CP.CATS[i.cat].l,mine:i.mine,canEdit:i.mine&&['reported','community'].includes(i.stage),
        dept:i.dept,assignee:i.assignee||'Unassigned',sla:i.stage==='closed'?'Closed':i.stage==='resolved'?(i.confirms+'/'+i.needed+' confirmed'):CP.slaLeft(i),
        slaBg:CP.slaRisk(i)===2?'var(--cp-pulse)':i.stage==='resolved'?'var(--cp-leaf-soft)':'var(--cp-surface-2)',slaFg:CP.slaRisk(i)===2?'#fff':'var(--cp-ink)',
        oppose:(e)=>{e&&e.stopPropagation&&e.stopPropagation();if(i.mine){this.toast("You can't dispute your own report");return;}this.buzz(12);CP.act('oppose',i.id);if(!op)this.toast('Marked as not an issue');},
        comment:(e)=>{e&&e.stopPropagation&&e.stopPropagation();if(mob)this.setState({commentsFor:i.id,cDraft:''});else this.open(i.id);},
        share:(e)=>{e&&e.stopPropagation&&e.stopPropagation();CP.act('share',i.id);this.buzz(6);this.toast('Link copied · share it on WhatsApp');},
        edit:(e)=>{e&&e.stopPropagation&&e.stopPropagation();this.openEdit(i.id);}};};
    const pass=i=>i.stage!=='rejected'&&(!f.cat.length||f.cat.includes(i.cat))&&(!f.sev.length||f.sev.includes(i.sev))&&(!f.stage.length||f.stage.some(k=>STG[k].includes(i.stage)));
    const inR=(i,r)=>f.region==='near'?(i.city==='Chennai'&&i.km<=r):i.city===f.region;
    const now=Date.now(),heat=i=>(i.sup+(i.comments||[]).length*2)/Math.pow((now-i.created)/36e5+2,.35);
    const pool=D.issues.filter(i=>i.stage!=='rejected'),nearP=pool.filter(i=>i.city==='Chennai'&&i.km<=6);const latestL=[...nearP].sort((a,b)=>lastAct(b)-lastAct(a)),trendL=[...pool].sort((a,b)=>heat(b)-heat(a));const trendSet=new Set(trendL.slice(0,6).map(i=>i.id));const fseen=new Set(),feed=[];let li=0,ti=0;while(feed.length<Math.min(pool.length,24)){const pk=(feed.length%3===2)?(trendL[ti++]||latestL[li++]):(latestL[li++]||trendL[ti++]);if(!pk)break;if(!fseen.has(pk.id)){fseen.add(pk.id);feed.push(pk);}}
    const pass2=i=>(!S.fArea||i.area===S.fArea)&&(!S.fDept||i.dept===S.fDept);const toks=qt?qt.split(/\s+/).map(w=>w.replace(/^#/,'')).filter(Boolean):[];
    const sRes=toks.length?D.issues.filter(i=>{const hay=(i.title+' '+(i.text||'')+' '+i.area+' '+i.street+' '+i.city+' '+CP.CATS[i.cat].l+' '+i.id+' '+(i.caseId||'')+' '+i.dept+' '+(i.tags||[]).join(' ')).toLowerCase();return toks.every(w=>hay.includes(w));}).filter(i=>pass(i)&&pass2(i)&&(f.region==='near'||i.city===f.region)):[];
    const SV={critical:4,high:3,medium:2,low:1};const sortBy=(arr,k)=>k==='recent'?arr.sort((a,b)=>lastAct(b)-lastAct(a)):k==='support'?arr.sort((a,b)=>b.sup-a.sup):k==='severity'?arr.sort((a,b)=>SV[b.sev]-SV[a.sev]):k==='sla'?arr.sort((a,b)=>(a.due||9e15)-(b.due||9e15)):arr;sortBy(sRes,S.sSort||'relevant');const tc={};D.issues.forEach(i=>(i.tags||[]).forEach(t=>tc[t]=(tc[t]||0)+1));
    const topTags=Object.entries(tc).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([t,n])=>({t,n,pick:()=>{this.setState({q:t});if(!(scr==='search'||view==='search'))this.go('search');}}));
    const regL={near:'Near me',Chennai:'Chennai',Coimbatore:'Coimbatore',Madurai:'Madurai'}[f.region];
    const pill=(key,icon,l,act)=>({l,icon,open:()=>this.setState(s=>({filterOpen:mob?true:!(s.filterOpen&&s.sheetGroup===key),sheetGroup:key})),bg:act?'var(--cp-ink)':'var(--cp-surface)',fg:act?'var(--cp-bg)':'var(--cp-ink)',bd:act?'var(--cp-ink)':'var(--cp-line)'});
    const fpills=[pill('REGION','ph-map-pin',regL,f.region!=='near'),pill('STATUS','ph-circle-half',f.stage.length?'Status · '+f.stage.length:'Status',!!f.stage.length),pill('SEVERITY','ph-warning',f.sev.length?'Severity · '+f.sev.length:'Severity',!!f.sev.length)];
    const at=k=>scr===k||view===k;const resN=at('feed')?feed.length:at('search')?sRes.length:list.length;
    const seg=(items,cur,key)=>items.map(([k,l,n])=>({l,n:n===undefined?'':String(n),bg:cur===k?'var(--cp-surface)':'transparent',sh:cur===k?'0 1px 2px rgba(0,0,0,.1)':'none',pick:()=>{this.buzz(5);this.setState({[key]:k});}}));
    const byAct=(a,b)=>lastAct(b)-lastAct(a);
    const followed=D.issues.filter(i=>i.caseId&&(i.mine||my.support[i.id])).sort(byAct);
    const allCases=D.issues.filter(i=>i.caseId&&i.stage!=='rejected'&&(f.region==='near'?i.city==='Chennai':i.city===f.region)).sort(byAct);
    const cq0=(S.cQ||'').trim().toLowerCase();const cSrc=sortBy((S.casesTab==='all'?allCases:followed).filter(i=>pass(i)&&pass2(i)&&(!cq0||[i.id,i.caseId,i.title,i.street,i.area,i.city,i.dept].join(' ').toLowerCase().includes(cq0))),S.cSort||'recent');
    const myReports=D.issues.filter(i=>i.mine),supported=D.issues.filter(i=>!i.mine&&my.support[i.id]),myCases=followed;
    const pSrc=S.profTab==='supported'?supported:S.profTab==='cases'?myCases:myReports;
    const tabT=(k,icon,l,n)=>({l,n:String(n),icon:((S.profTab===k||(k==='reports'&&!['reports','supported'].includes(S.profTab)))?'ph-fill ':'ph-bold ')+icon,c:(S.profTab===k||(k==='reports'&&!['reports','supported'].includes(S.profTab)))?'var(--cp-ink)':'var(--cp-ink-3)',bar:(S.profTab===k||(k==='reports'&&!['reports','supported'].includes(S.profTab)))?'var(--cp-ink)':'transparent',pick:()=>this.setState({profTab:k})});
    const i0=CP.find(S.cur)||CP.find('CP-2107');const P0=post(i0);
    const cm=i=>(i.comments||[]).map(c=>({ai:ini(c.by),anon:c.by==='Anonymous',abg:AB[hash(c.by)%4],name:c.me?(c.by==='Anonymous'?'You · anonymous':'You'):c.by,text:c.text,ago:CP.ago(c.ts)}));
    const cm0=cm(i0),seen=new Set(),uq=[];i0.evidence.forEach(e=>{const k=e.uid||e.by;if(!seen.has(k)){seen.add(k);uq.push(e.by);}});
    const d={...P0,...dv,place:dv.place,avatars:uq.slice(0,5).map((x,k)=>({i:x,bg:AB[k%4]})),comments:mob?cm0.slice(0,2):cm0,noCmts:!cm0.length,cmtMore:mob&&cm0.length>2?'View all '+cm0.length+' comments':'',
      confNote:i0.stage==='review'?'Community verified · with government for review':(80-i0.conf>0?(80-i0.conf)+'% more confidence sends it to government':'Sending to government')};
    const tab=(k,icon,label,badge)=>({label,badge,icon:(scr===k?'ph-fill ':'ph-bold ')+icon,c:scr===k?'var(--cp-ink)':'var(--cp-ink-3)',go:()=>this.go(k)});
    const cId=S.commentsFor||S.cur;const cI=CP.find(cId);
    const sendC=()=>{const t=S.cDraft.trim();if(!t||!cI)return;CP.act('comment',cI.id,t,me.anonDefault);this.buzz([6,20,6]);this.setState({cDraft:''});};
    const SCENE_TAGS={sewage:['sewage','health-hazard','bus-stop','monsoon'],pothole:['pothole','two-wheeler','night-hazard'],garbage:['garbage','stray-dogs','smell'],light:['streetlight','women-safety','night']};
    const norm=t=>t.trim().toLowerCase().replace(/^#/,'').replace(/[^a-z0-9\u0B80-\u0BFF]+/g,'-').replace(/^-|-$/g,'');
    const addTag=()=>{const t=norm(S.tagDraft);if(t&&!S.tags.includes(t))this.setState({tags:[...S.tags,t],tagDraft:''});else this.setState({tagDraft:''});};
    const addETag=()=>{const t=norm(S.eTag);if(t&&!S.eTags.includes(t))this.setState({eTags:[...S.eTags,t],eTag:''});else this.setState({eTag:''});};
    const eI=S.editFor?CP.find(S.editFor):null;
    const deskFlow=FLOW.includes(scr)||S.threshold||!!S.editFor;
    const descRow=S.descMode==='voice'&&S.voice==='done'?{icon:'ph-waveform',bg:'var(--cp-surface-2)',k:'Heard · '+an.voice.lang,v:an.voice.text,sub:an.voice.en}:S.desc.trim()?{icon:'ph-text-align-left',bg:'var(--cp-surface-2)',k:'You wrote',v:S.desc.trim(),sub:S.tags.length?'#'+S.tags.join(' #'):''}:{icon:'ph-text-align-left',bg:'var(--cp-surface-2)',k:'Summary',v:an.summary,sub:'Written by AI from your photo'};
    const trending=D.issues.filter(i=>i.city==='Chennai'&&i.km<6&&['community','review'].includes(i.stage)).sort((a,b)=>heat(b)-heat(a)).slice(0,5).map((i,k)=>({n:k+1,title:i.title,sup:i.sup,area:i.area,open:()=>this.open(i.id)}));

    const SO={search:[['relevant','Relevant'],['recent','Latest'],['support','Most supported'],['severity','Severity']],cases:[['recent','Recently updated'],['sla','SLA due'],['support','Most supported'],['severity','Severity']]};
    const ctx=S.fCtx||'search',sk=ctx==='cases'?(S.cSort||'recent'):(S.sSort||'relevant');
    const uniqN=key=>[...new Set(D.issues.map(i=>i[key]))].sort().map(a=>({a,n:D.issues.filter(i=>i[key]===a).length}));
    const cb=(k,list,label)=>{const sel=S[k],q=S[k+'Q']||'';const opts=list.filter(x=>!q||x.a.toLowerCase().includes(q.toLowerCase()));const open=!!S[k+'Open'];return {label,sel:sel||'',ph:sel||('Any '+label.toLowerCase()),q,open,none:!opts.length,bd:open?'var(--cp-ink-3)':'var(--cp-line)',rot:open?'rotate(180deg)':'none',
      onQ:e=>this.setState({[k+'Q']:e.target.value,[k+'Open']:true}),openIt:()=>this.setState({[k+'Open']:true}),toggle:()=>this.setState({[k+'Open']:!open}),clear:e=>{e&&e.stopPropagation&&e.stopPropagation();this.setState({[k]:null,[k+'Q']:''});},
      opts:opts.map(x=>({l:x.a,n:x.n,on:sel===x.a,bg:sel===x.a?'var(--cp-surface-2)':'transparent',pick:()=>{this.buzz(5);this.setState({[k]:x.a,[k+'Q']:'',[k+'Open']:false});}}))};};
    const lab=(k,list)=>(list.find(x=>x[0]===k)||list[0])[1];
    const cyc=(list,cur,key)=>()=>{const i=list.findIndex(x=>x[0]===cur);this.buzz(5);this.setState({[key]:list[(i+1)%list.length][0]});};
    const act=[];const RL={Chennai:'Chennai',Coimbatore:'Coimbatore',Madurai:'Madurai'};
    if(f.region!=='near')act.push({l:RL[f.region],remove:()=>this.setState(s=>({f:{...s.f,region:'near'}}))});
    if(S.fArea)act.push({l:S.fArea,remove:()=>this.setState({fArea:null})});if(S.fDept)act.push({l:S.fDept,remove:()=>this.setState({fDept:null})});
    f.cat.forEach(c=>act.push({l:CP.CATS[c].l,remove:()=>this.setState(s=>({f:{...s.f,cat:s.f.cat.filter(x=>x!==c)}}))}));
    const STL={new:'New',gathering:'Gathering',govt:'With govt',case:'Official case',progress:'In progress',fixed:'Fixed'};
    f.stage.forEach(c=>act.push({l:STL[c]||c,remove:()=>this.setState(s=>({f:{...s.f,stage:s.f.stage.filter(x=>x!==c)}}))}));
    f.sev.forEach(c=>act.push({l:c[0].toUpperCase()+c.slice(1),remove:()=>this.setState(s=>({f:{...s.f,sev:s.f.sev.filter(x=>x!==c)}}))}));
    const acts=[];D.issues.forEach(i=>{if(i.mine)acts.push({icon:'ph-camera',bg:'var(--cp-pulse-soft)',fg:'var(--cp-pulse)',t:'You reported'+(i.anon?' anonymously':''),sub:i.title,ts:i.created,id:i.id});
      else if(my.support[i.id])acts.push({icon:'ph-arrow-fat-up',bg:'var(--cp-marigold-soft)',fg:'var(--cp-ink)',t:'You supported',sub:i.title,ts:i.created+36e5,id:i.id});
      (i.comments||[]).filter(c=>c.me).forEach(c=>acts.push({icon:'ph-chat-circle',bg:'var(--cp-surface-2)',fg:'var(--cp-ink)',t:'You commented',sub:'“'+c.text+'” · '+i.title,ts:c.ts,id:i.id}));
      if(i.caseId&&(i.mine||my.support[i.id])){const ce=i.events.find(e=>e.icon==='ph-bank');if(ce)acts.push({icon:'ph-bank',bg:'var(--cp-peacock-soft)',fg:'var(--cp-peacock)',t:'Became official case '+i.caseId,sub:i.title,ts:ce.ts,id:i.id});}});
    acts.sort((a,b)=>b.ts-a.ts);
    const X5={
      feedPosts:feed.map(i=>({...post(i),why:trendSet.has(i.id)?(i.city==='Chennai'&&i.km<=6?'Trending near you':'Trending in '+i.city):'',cOpen:!mob&&S.commentsFor===i.id&&!S.cModal,cmts:cm(i).slice(-3),cMore:(i.comments||[]).length>3?'View all '+(i.comments||[]).length+' comments':'',
        comment:e=>{e&&e.stopPropagation&&e.stopPropagation();this.buzz(6);if(mob)this.setState({commentsFor:i.id,cDraft:''});else this.setState({commentsFor:S.commentsFor===i.id?null:i.id,cModal:false,cDraft:''});}})),
      stop:e=>e.stopPropagation(),
      d:{...d,cmtN:(i0.comments||[]).length,commentBtn:()=>{this.buzz(6);this.setState({commentsFor:i0.id,cModal:!mob,cDraft:''});}},
      openComments:()=>this.setState({commentsFor:i0.id,cModal:!mob,cDraft:''}),
      commentsOpen:!!S.commentsFor&&(mob||S.cModal),closeComments:()=>this.setState({commentsFor:null,cModal:false}),
      mFilterOpen:!!S.filterOpen,openFilters:()=>this.setState({filterOpen:true,sheetGroup:null,fCtx:'search'}),openCaseFilters:()=>this.setState({filterOpen:true,sheetGroup:null,fCtx:'cases'}),
      closeFilter:()=>this.setState({filterOpen:false,fAreaOpen:false,fDeptOpen:false}),
      clearFilters:()=>{this.buzz(8);this.setState({f:{region:'near',cat:[],stage:[],sev:[]},fArea:null,fDept:null,fAreaQ:'',fDeptQ:''});},
      sheetGroups:o.fGroups,combos:[cb('fArea',uniqN('area'),'AREA'),cb('fDept',uniqN('dept'),'DEPARTMENT')],
      fSorts:SO[ctx].map(([k,l])=>({l,n:'',bg:sk===k?'var(--cp-surface)':'transparent',sh:sk===k?'0 1px 2px rgb(0 0 0 / .1)':'none',pick:()=>{this.buzz(5);this.setState(ctx==='cases'?{cSort:k}:{sSort:k});}})),
      fN:act.length?String(act.length):'',activeF:act,resN:ctx==='cases'?cSrc.length:sRes.length,fBtnL:ctx==='cases'||qt?'Show '+(ctx==='cases'?cSrc.length:sRes.length)+' results':'Apply filters',
      sortL:lab(S.sSort||'relevant',SO.search),cycleSort:cyc(SO.search,S.sSort||'relevant','sSort'),cSortL:lab(S.cSort||'recent',SO.cases),cycleCSort:cyc(SO.cases,S.cSort||'recent','cSort'),
      showStage:(mob?true:(FLOW.includes(scr)||S.threshold||!!S.editFor||!!S.filterOpen||(S.cModal&&!!S.commentsFor)))||(!mob&&!!S.locOpen),
      stH:mob?'100%':(FLOW.includes(scr)?'min(860px, calc(100vh - 40px))':'min(720px, calc(100vh - 40px))'),
      closeFlow:()=>{this.clearT();this.setState({threshold:false,idOpen:false,editFor:null,filterOpen:false,commentsFor:null,cModal:false});if(FLOW.includes(scr))this.go(S.base||'home');},
      pDrawer:S.pDrawer,openDrawer:()=>{this.buzz(8);this.setState({pDrawer:!S.pDrawer});},closeDrawer:()=>this.setState({pDrawer:false}),
      goProfilePage:()=>{this.setState({pDrawer:false});this.go('profile');},
      drTop:mob?'0':'72px',drLeft:mob?'0':'auto',drRight:mob?'0':'22px',drW:mob?'auto':'360px',drR:mob?'0 0 28px 28px':'22px',drPad:mob?'18px 16px 14px':'14px',drAnim:mob?'cp-drop .38s cubic-bezier(.2,.9,.3,1.05) both':'cp-pop2 .2s ease-out both',drScrim:mob?'var(--cp-scrim)':'transparent',drBlur:mob?'blur(6px) saturate(120%)':'none',
      drawerRows:[['ph-camera','My reports','Posts you created',myReports.length,'reports'],['ph-arrow-fat-up','Supported','Reports you back',supported.length,'supported'],['ph-bank','My cases','In the government workflow',myCases.length,'cases'],['ph-clock-counter-clockwise','Activity','Comments, support, updates','','activity'],['ph-gear-six','Settings & theme','Profile, privacy, appearance','','settings']].map(([icon,l,sub,n,k],j)=>({icon,l,sub,n:n===''?'':String(n),d:(j*0.04)+'s',go:()=>{this.buzz(6);this.setState({pDrawer:false});if(k==='settings')this.go('settings',{pName:meName,pArea:meArea});else this.go('profile',{profTab:k});}})),
      pTabs:[tabT('reports','ph-camera','Reports',myReports.length),tabT('supported','ph-arrow-fat-up','Backed',supported.length),tabT('cases','ph-bank','Cases',myCases.length),{...tabT('activity','ph-clock-counter-clockwise','Activity',acts.length),n:''}],
      pShowRows:['reports','supported'].includes(S.profTab),pShowCases:S.profTab==='cases',pShowAct:S.profTab==='activity',
      pActs:acts.slice(0,20).map(a=>({...a,ago:CP.ago(a.ts),open:()=>this.open(a.id)})),
      pEmpty:S.profTab==='activity'?!acts.length:!pSrc.length,
      showFab:false
    };
    const RG=[['near','Near me','Velachery, Chennai','ph-navigation-arrow'],['Chennai','Chennai','Greater Chennai Corp.','ph-map-pin'],['Coimbatore','Coimbatore','Coimbatore City Corp.','ph-map-pin'],['Madurai','Madurai','Madurai Corporation','ph-map-pin']];
    const rOpen=!!S.fRegionOpen,rq=S.fRegionQ||'',rOpts=RG.filter(x=>!rq||x[1].toLowerCase().includes(rq.toLowerCase()));
    const closeOthers=k=>e=>{e.stopPropagation();const o={fRegionOpen:false,fAreaOpen:false,fDeptOpen:false};delete o[k+'Open'];if(Object.keys(o).some(x=>S[x]))this.setState(o);};
    const regionCb={label:'REGION',sel:f.region!=='near'?f.region:'',ph:f.region==='near'?'Near me · Velachery':f.region,q:rq,open:rOpen,none:!rOpts.length,bd:rOpen?'var(--cp-ink-3)':'var(--cp-line)',rot:rOpen?'rotate(180deg)':'none',stopClose:closeOthers('fRegion'),
      onQ:e=>this.setState({fRegionQ:e.target.value,fRegionOpen:true}),openIt:()=>this.setState({fRegionOpen:true}),toggle:()=>this.setState({fRegionOpen:!rOpen}),clear:e=>{e&&e.stopPropagation&&e.stopPropagation();this.setState(s=>({f:{...s.f,region:'near'},fRegionQ:''}));},
      opts:rOpts.map(x=>({l:x[1],n:x[2],on:f.region===x[0],bg:f.region===x[0]?'var(--cp-surface-2)':'transparent',pick:()=>{this.buzz(5);this.setState(s=>({f:{...s.f,region:x[0]},fRegionQ:'',fRegionOpen:false}));}}))};
    const CST=[['verified','Verified','var(--cp-peacock)'],['assigned','Assigned','var(--cp-marigold)'],['progress','Working','var(--cp-pulse)'],['resolved','Fixed','var(--cp-leaf)'],['closed','Closed','var(--cp-ink-3)']];
    const stIdx=st=>Math.max(0,CST.findIndex(x=>x[0]===st));
    const wideR=!mob&&!S.railCollapsed;
    const X6={combos:[regionCb,...X5.combos.map((c,k)=>({...c,stopClose:closeOthers(k?'fDept':'fArea')}))],sheetGroups:o.fGroups.filter(g=>g.title!=='REGION'),
      closeCombos:()=>{if(S.fRegionOpen||S.fAreaOpen||S.fDeptOpen)this.setState({fRegionOpen:false,fAreaOpen:false,fDeptOpen:false});},
      closeFilter:()=>this.setState({filterOpen:false,fAreaOpen:false,fDeptOpen:false,fRegionOpen:false}),
      regionPill:{l:f.region==='near'?'Velachery':f.region,open:()=>{this.buzz(6);this.setState({locOpen:true});}},locOpen:!!S.locOpen,locOpenM:mob&&!!S.locOpen,locOpenD:!mob&&!!S.locOpen,locScrim:mob?'var(--cp-scrim)':'transparent',closeLoc:()=>this.setState({locOpen:false}),
      locRows:RG.map(x=>{const on=f.region===x[0];const n=D.issues.filter(i=>x[0]==='near'?(i.city==='Chennai'&&i.km<=1.5):i.city===x[0]).length;return {l:x[1],sub:x[2]+' · '+n+' issues',icon:x[3],on,bg:on?'var(--cp-surface-2)':'transparent',bd:on?'2px solid var(--cp-ink)':'1px solid var(--cp-line)',ibg:on?'var(--cp-pulse)':'var(--cp-surface-2)',ifg:on?'#fff':'var(--cp-ink)',pick:()=>{this.buzz([6,20,6]);this.setState(s=>({f:{...s.f,region:x[0]},locOpen:false}));}};}),
      railW:wideR?'232px':'76px',railLabels:wideR,wideRail:W>=1100,railIcon:S.railCollapsed?'ph-caret-double-right':'ph-caret-double-left',railTip:S.railCollapsed?'Expand sidebar':'Collapse sidebar',toggleRail:()=>{this.buzz(5);this.setState({railCollapsed:!S.railCollapsed});},
      profNavBg:view==='profile'?'var(--cp-surface-2)':'transparent',profRing:view==='profile'?'var(--cp-ink)':'transparent',
      goProfilePage:()=>{this.setState({pDrawer:false});this.go('profile',{profTab:['reports','supported'].includes(S.profTab)?S.profTab:'reports'});},
      caseStats:CST.map(([k,l,c])=>{const on=S.cStage===k;return {l,c,n:cSrc.filter(i=>i.stage===k).length,bg:on?'var(--cp-surface-2)':'var(--cp-surface)',bd:on?'var(--cp-ink-3)':'var(--cp-line)',pick:()=>{this.buzz(5);this.setState({cStage:on?null:k});}};}),
      caseRows:cSrc.filter(i=>!S.cStage||i.stage===S.cStage).map(i=>{const p=post(i),ix=stIdx(i.stage),col=CST[ix][2];return {photoN:CP.stats(i).photos,...p,area:i.area+', '+i.city,oi:(i.assignee||'—').replace(/^(JE|AE) /,'').split(' ').map(s=>s[0]).join('').slice(0,2),stBg:col,stFg:ix===1?'var(--cp-on-marigold)':'#fff',
        steps:CST.map(([k,l,c],j)=>({l,c:j<=ix?col:'var(--cp-line)',lc:j===ix?'var(--cp-ink)':'var(--cp-ink-3)'}))};}),
      casesEmpty:!cSrc.filter(i=>!S.cStage||i.stage===S.cStage).length,cShownN:String(cSrc.filter(i=>!S.cStage||i.stage===S.cStage).length),cQ:S.cQ||'',onCQ:e=>this.setState({cQ:e.target.value}),clearCQ:()=>this.setState({cQ:''}),
      cTabs:[['following','Following',followed.length],['all','All in '+(f.region==='near'?'Chennai':f.region),allCases.length]].map(([k,l,n])=>{const on=(S.casesTab==='all'?'all':'following')===k;return {l,n:String(n),bg:on?'var(--cp-surface)':'transparent',fg:on?'var(--cp-ink)':'var(--cp-ink-2)',sh:on?'0 2px 6px -2px rgb(0 0 0 / .2)':'none',pick:()=>{this.buzz(5);this.setState({casesTab:k});}};}),
      cViews:[['list','List','ph-rows'],['grid','Grid','ph-squares-four']].map(([k,l,icon])=>{const on=(S.cView||'list')===k;return {l,icon,bg:on?'var(--cp-surface)':'transparent',fg:on?'var(--cp-ink)':'var(--cp-ink-2)',sh:on?'0 2px 6px -2px rgb(0 0 0 / .2)':'none',pick:()=>{this.buzz(5);this.setState({cView:k});}};}),cvList:(S.cView||'list')==='list',cvGrid:S.cView==='grid',gridCols:mob?'minmax(0,1fr)':'repeat(auto-fill,minmax(360px,1fr))',
      pTabs:X5.pTabs.slice(0,2),pShowCases:false,pShowAct:false,pShowRows:true,pEmpty:!(S.profTab==='supported'?supported:myReports).length,
      pRows:(S.profTab==='supported'?supported:myReports).map(post),pStats:[{v:myReports.length,l:'Reports'},{v:supported.length,l:'Supported'},{v:D.issues.filter(i=>(i.mine||my.support[i.id])&&['resolved','closed'].includes(i.stage)).length,l:'Fixed'}],
      drawerRows:X5.drawerRows.filter(r=>!['My cases','Activity'].includes(r.l))
    };
    const tile=i=>{const p=post(i);return {...p,meta:i.area+' · '+CP.ago(i.created)+' ago',locked:!!i.caseId,lockedMine:i.mine&&!p.canEdit};};
    const caseCard=i=>{const p=post(i),ix=stIdx(i.stage),col=CST[ix][2];return {...p,area:i.area+', '+i.city,oi:(i.assignee||'—').replace(/^(JE|AE) /,'').split(' ').map(s=>s[0]).join('').slice(0,2),stBg:col,stFg:ix===1?'var(--cp-on-marigold)':'#fff',steps:CST.map(([k,l,c],j)=>({l,c:j<=ix?col:'var(--cp-line)',lc:j===ix?'var(--cp-ink)':'var(--cp-ink-3)'}))};};
    const scope=S.cScope||'all';
    const caseBase=D.issues.filter(i=>i.caseId&&i.stage!=='rejected'&&(scope==='mine'?i.mine:scope==='supported'?(!i.mine&&my.support[i.id]):(f.region==='near'?i.city==='Chennai':i.city===f.region))&&pass(i)&&pass2(i));
    sortBy(caseBase,S.cSort||'recent');const caseList=caseBase.filter(i=>!S.cStage||i.stage===S.cStage);
    const showRes=toks.length>0||!!S.fTag;
    const sAll=showRes?sortBy(D.issues.filter(i=>{if(i.stage==='rejected')return false;if(S.fTag&&!(i.tags||[]).includes(S.fTag))return false;if(toks.length){const hay=(i.title+' '+(i.text||'')+' '+i.area+' '+i.street+' '+i.city+' '+CP.CATS[i.cat].l+' '+i.id+' '+(i.caseId||'')+' '+i.dept+' '+(i.tags||[]).join(' ')).toLowerCase();if(!toks.every(w=>hay.includes(w)))return false;}return pass(i)&&pass2(i)&&(f.region==='near'||i.city===f.region);}),S.sSort||'relevant'):[];
    const sC=sAll.filter(i=>i.caseId),sR=sAll.filter(i=>!i.caseId);
    const actX=[...X5.activeF];if(S.fTag)actX.unshift({l:'#'+S.fTag,remove:()=>this.setState({fTag:null})});if(ctx==='cases'&&scope!=='all')actX.unshift({l:scope==='mine'?'Reported by me':'I support',remove:()=>this.setState({cScope:'all'})});
    const SCO=[['all','All cases'],['mine','Reported by me'],['supported','I support']];
    const scopeG={title:'SHOW',nice:'Show',chips:true,opts:SCO.map(([k,l])=>{const on=scope===k;return {l,dot:'',pick:()=>{this.buzz(5);this.setState({cScope:k});},bg:on?'var(--cp-ink)':'var(--cp-surface)',fg:on?'var(--cp-bg)':'var(--cp-ink)',bd:on?'var(--cp-ink)':'var(--cp-line)'};})};
    const actFeedIds=new Set();const actFeed=D.issues.filter(i=>(!i.mine&&my.support[i.id])||(i.caseId&&(i.mine||my.support[i.id]))).sort((a,b)=>lastAct(b)-lastAct(a)).filter(i=>!actFeedIds.has(i.id)&&actFeedIds.add(i.id));
    const lk0=[{by:i0.anon?'Anonymous':i0.by,ago:CP.ago(i0.created)+' ago',text:i0.text||i0.summary,tag:'Original report',photos:CP.stats(i0).photos},...(i0.merged||[]).map(m=>({by:m.by,ago:m.h?m.h+'h ago':'just now',text:m.text,tag:m.sim+'% match',photos:1+(m.text.length%4)}))];
    const rpI=S.rpIdx==null?-1:S.rpIdx,rpC=lk0[rpI]||lk0[0];
    const big=S.editFor||S.rpIdx!=null||(S.cModal&&S.commentsFor)||scr==='report'||scr==='verify'||scr==='ai'||scr==='similar'||!!S.threshold||!!S.locOpen;const mid=S.filterOpen&&!big;
    const ev0=i0.evidence;const vb=Math.min(S.vbIdx||0,ev0.length-1);
    const X7={
      tileCols:mob?'repeat(2,minmax(0,1fr))':'repeat(auto-fill,minmax(220px,1fr))',
      pTabs:[['reports','ph-squares-four','Reports',myReports.length],['activity','ph-lightning','Activity',actFeed.length]].map(([k,icon,l,n])=>{const on=(S.profTab==='activity')===(k==='activity');return {l,n:String(n),icon:(on?'ph-fill ':'ph-bold ')+icon,c:on?'var(--cp-ink)':'var(--cp-ink-3)',bar:on?'var(--cp-ink)':'transparent',pick:()=>{this.buzz(5);this.setState({profTab:k});}};}),
      pShowTiles:S.profTab!=='activity',pShowFeed:S.profTab==='activity',pTiles:myReports.map(tile),
      pFeed:actFeed.map(i=>({...post(i),why:i.caseId?(i.mine?'Your report became official case '+i.caseId:'You follow official case '+i.caseId):'You supported this',cOpen:!mob&&S.commentsFor===i.id&&!S.cModal,cmts:[],cMore:''})),
      pEmpty:S.profTab==='activity'?!actFeed.length:!myReports.length,pEmptyTxt:S.profTab==='activity'?'Reports you support and cases you follow show up here.':'You haven\'t reported anything yet.',
      drawerRows:X6.drawerRows.map(r=>r.l==='Supported'?{...r,l:'Activity',sub:'Backed reports & followed cases',n:String(actFeed.length),go:()=>{this.setState({pDrawer:false});this.go('profile',{profTab:'activity'});}}:r.l==='My reports'?{...r,go:()=>{this.setState({pDrawer:false});this.go('profile',{profTab:'reports'});}}:r),
      goProfilePage:()=>{this.setState({pDrawer:false});this.go('profile',{profTab:S.profTab==='activity'?'activity':'reports'});},
      showIdle:!showRes,showRes,qCount:sAll.length,qNone:showRes&&!sAll.length,sCases:sC.map(caseCard),sReports:sR.map(tile),hasSC:!!sC.length,hasSR:!!sR.length,sCN:String(sC.length),sRN:String(sR.length),
      latestNear:D.issues.filter(i=>i.city==='Chennai'&&i.km<3&&i.stage!=='rejected').sort((a,b)=>lastAct(b)-lastAct(a)).slice(0,mob?4:8).map(tile),
      topTags:topTags.map(x=>({...x,pick:()=>{this.buzz(5);this.setState({fTag:S.fTag===x.t?null:x.t});if(!(scr==='search'||view==='search'))this.go('search');}})),
      activeF:actX,fN:actX.length?String(actX.length):'',resN:ctx==='cases'?caseBase.length:sAll.length,fBtnL:ctx==='cases'||showRes?'Show '+(ctx==='cases'?caseBase.length:sAll.length)+' results':'Apply filters',
      sheetGroups:ctx==='cases'?[scopeG,...X6.sheetGroups]:X6.sheetGroups,
      clearFilters:()=>{this.buzz(8);this.setState({f:{region:'near',cat:[],stage:[],sev:[]},fArea:null,fDept:null,fAreaQ:'',fDeptQ:'',fTag:null,cScope:'all'});},
      caseRows:caseList.map(caseCard),casesEmpty:!caseList.length,casesEmptyTxt:'No cases match these filters.',
      caseStats:CST.map(([k,l,c])=>{const on=S.cStage===k;return {l,c,n:caseBase.filter(i=>i.stage===k).length,bg:on?'var(--cp-surface-2)':'var(--cp-surface)',bd:on?'var(--cp-ink-3)':'var(--cp-line)',pick:()=>{this.buzz(5);this.setState({cStage:on?null:k});}};}),
      d:{...X5.d,hasLinked:!!i0.caseId&&lk0.length>1,linkN:String(lk0.length),linked:lk0.map((x,k)=>({...x,open:()=>{this.buzz(6);this.setState({rpIdx:k});}}))},
      rpOpen:S.rpIdx!=null,closeRp:()=>this.setState({rpIdx:null}),rp:{...rpC,n:rpI+1,total:lk0.length,ai:rpC.by==='Anonymous'?'AN':rpC.by.split(' ').map(s=>s[0]).join('').slice(0,2)},
      rpPrev:()=>{if(rpI>0)this.setState({rpIdx:rpI-1});},rpNext:()=>{if(rpI<lk0.length-1)this.setState({rpIdx:rpI+1});},rpPrevO:rpI>0?1:.4,rpNextO:rpI<lk0.length-1?1:.4,
      showStage:(mob?true:(FLOW.includes(scr)||S.threshold||!!S.editFor||!!S.filterOpen||(S.cModal&&!!S.commentsFor)||S.rpIdx!=null))||(!mob&&!!S.locOpen),
      stW:mob?'100%':big?'min(1100px, 80vw)':mid?'min(560px, calc(100vw - 32px))':'min(460px, calc(100vw - 32px))',stH:mob?'100%':big?'min(88vh, 920px)':mid?'min(760px, 88vh)':'min(860px, calc(100vh - 40px))',
      closeFlow:()=>{this.clearT();this.setState({threshold:false,idOpen:false,editFor:null,filterOpen:false,commentsFor:null,cModal:false,rpIdx:null});if(FLOW.includes(scr))this.go(S.base||'home');},
      camMode:mob&&!S.captured,uploadMode:!mob&&!S.captured,camH:!mob&&!S.captured?'0%':(S.captured?'30%':'70%'),cPadX:mob?'16px':'max(24px, calc((100% - 760px) / 2))',
      vbLine:'Reported by '+(i0.anon?'Anonymous':i0.by)+' · '+CP.date(i0.created)+' · '+ev0.length+' citizen photos',vbSel:(vb+1)+' / '+ev0.length,
      vbThumbs:ev0.slice(0,8).map((e,k)=>({bd:k===vb?'var(--cp-ink)':'transparent',pick:()=>{this.buzz(5);this.setState({vbIdx:k});}})),
      vaLine:'Posted by '+(i0.assignee||'department')+' · geo-tagged at the same spot',vaSel:'1 / 3',vaThumbs:[0,1,2].map(k=>({bd:k===0?'var(--cp-leaf)':'transparent'}))
    };
    const areaOk=i=>!!i&&(!S.fArea||i.area===S.fArea);
    const wrapPick=fn=>()=>{if(this.mapMoved)return;fn&&fn();};
    const lq=(S.locQ||'').toLowerCase();const cities=['Chennai','Coimbatore','Madurai'];
    const areaRows=[...new Set(D.issues.map(i=>i.area+'|'+i.city))].sort().map(s=>{const [a,c]=s.split('|');return {k:'a:'+a,l:a,sub:c+' · '+D.issues.filter(i=>i.area===a).length+' issues',icon:'ph-map-pin-simple',region:c,area:a};});
    const locAll=[{k:'near',l:'Near me',sub:'Velachery, Chennai · within 1.5 km',icon:'ph-navigation-arrow',region:'near',area:null},...cities.map(c=>({k:'c:'+c,l:c,sub:CP.CITY[c].corp+' · '+D.issues.filter(i=>i.city===c).length+' issues',icon:'ph-buildings',region:c,area:null})),...areaRows];
    const locF=locAll.filter(x=>!lq||(x.l+' '+x.sub).toLowerCase().includes(lq));
    const curK=S.fArea?'a:'+S.fArea:f.region==='near'?'near':'c:'+f.region;
    const relOf=i=>i.mine?'You reported':(i.merged||[]).some(m=>m.me)?'Your report was merged':'You supported';
    const actAll=D.issues.filter(i=>(!i.mine&&my.support[i.id])||(i.caseId&&(i.mine||my.support[i.id]))).sort((a,b)=>lastAct(b)-lastAct(a));
    const actCases=actAll.filter(i=>i.caseId),actReps=actAll.filter(i=>!i.caseId);const af=S.pActF||'all';
    const actShown=af==='cases'?actCases:af==='reports'?actReps:actAll;const mineRep=D.issues.filter(i=>i.mine);
    const listA=o.list.filter(c=>areaOk(CP.find(c.id)));
    const X8={
      locQ:S.locQ||'',onLocQ:e=>this.setState({locQ:e.target.value}),clearLocQ:()=>this.setState({locQ:''}),locNone:!locF.length,
      locRows:locF.slice(0,40).map(x=>{const on=curK===x.k;return {l:x.l,sub:x.sub,icon:x.icon,on,bg:on?'var(--cp-surface-2)':'transparent',bd:on?'2px solid var(--cp-ink)':'1px solid var(--cp-line)',ibg:on?'var(--cp-pulse)':'var(--cp-surface-2)',ifg:on?'#fff':'var(--cp-ink)',pick:()=>{this.buzz([6,20,6]);this.setState(s=>({f:{...s.f,region:x.region},fArea:x.area,locOpen:false,locQ:'',panX:0,panY:0}));}};}),
      regionPill:{l:S.fArea||(f.region==='near'?'Velachery':f.region),open:()=>{this.buzz(6);this.setState({locOpen:true});}},isAiM:mob&&S.screen==='ai',isAiD:!mob&&S.screen==='ai',isSimM:mob&&S.screen==='similar',isSimD:!mob&&S.screen==='similar',thM:mob&&!!S.threshold,thD:!mob&&!!S.threshold,hasMSel:mob&&!!S.sheetHidden&&!!S.mSelId&&!!CP.find(S.mSelId),msel:S.mSelId&&CP.find(S.mSelId)?{...this.card(CP.find(S.mSelId),D),n:CP.find(S.mSelId).sup}:{},closeMSel:e=>{e&&e.stopPropagation&&e.stopPropagation();this.setState({mSelId:null});},regionName:S.fArea||(f.region==='near'?'Velachery':f.region),
      list:listA,listCount:listA.length,listEmpty:!listA.length,
      mpins:list.filter(areaOk).map(i=>({x:i.x+'%',y:(i.y*0.62+10)+'%',icon:CP.CATS[i.cat].icon,c:PIN[i.stage][0],fg:PIN[i.stage][1],hot:i.stage==='review'||(i.stage==='community'&&i.conf>=70),n:i.sup,pb:S.mSelId===i.id&&S.sheetHidden?'var(--cp-ink)':'var(--cp-surface)',pf:S.mSelId===i.id&&S.sheetHidden?'var(--cp-bg)':'var(--cp-ink)',sc:S.mSelId===i.id&&S.sheetHidden?1.12:1,s:'36px',is:'17px',z:1,pick:wrapPick(()=>{if(mob&&S.sheetHidden){this.buzz(8);this.setState({mSelId:i.id});}else this.open(i.id);})})),
      dlist:mob?[]:(dk.dlist||[]).filter(c=>areaOk(CP.find(c.id))),dpins:mob?[]:(dk.dpins||[]).map((p,k)=>({...p,id:dk.dlist[k]&&dk.dlist[k].id,pick:wrapPick(p.pick)})).filter(p=>areaOk(CP.find(p.id))),
      panX:(S.panX||0)+'px',panY:(S.panY||0)+'px',zoom:S.zoom||1,pinInv:(1/(S.zoom||1)).toFixed(3),mapTr:S.mapDrag?'none':'transform .35s cubic-bezier(.2,.9,.3,1)',mapCur:S.mapDrag?'grabbing':'grab',
      mapDown:this.mapDown,mapWheel:this.mapWheel,zoomIn:()=>{this.buzz(5);this.setState({zoom:Math.min(3,(S.zoom||1)*1.3)});},zoomOut:()=>{this.buzz(5);this.setState({zoom:Math.max(.7,(S.zoom||1)/1.3)});},recenter:()=>{this.buzz([6,20,6]);this.setState({zoom:1,panX:0,panY:0});},
      flowBackIcon:mob?'ph-arrow-left':'ph-x',goAiBack:mob?(()=>this.go('report')):X7.closeFlow,
      d:{...X7.d,actSupport:X7.d.actSupport&&!i0.mine,actMine:!!i0.mine&&['reported','community','review'].includes(i0.stage),lockedMine:!!i0.mine&&!X7.d.canEdit},
      pCols:mob?'minmax(0,1fr)':((S.railCollapsed||S.railHidden)&&(S.w||0)>=1100?'repeat(3,minmax(0,1fr))':'repeat(2,minmax(0,1fr))'),pShowMine:S.profTab!=='activity',pShowFeed:S.profTab==='activity',
      pMine:mineRep.map(i=>({...post(i),notMine:false,why:i.caseId?'Your report is now official case '+i.caseId:(i.anon?'Posted anonymously':''),cOpen:!mob&&S.commentsFor===i.id&&!S.cModal,cmts:[],cMore:''})),
      pFeed:actShown.map(i=>({...post(i),notMine:!i.mine,why:i.caseId?relOf(i)+' · official case '+i.caseId+' · '+((i.merged||[]).length+1)+' reports combined':'You supported this report',cOpen:!mob&&S.commentsFor===i.id&&!S.cModal,cmts:[],cMore:''})),
      pActF:[['all','All','ph-lightning',actAll.length],['cases','Official cases','ph-bank',actCases.length],['reports','Supported reports','ph-arrow-fat-up',actReps.length]].map(([k,l,icon,n])=>{const on=af===k;return {l,icon,n:String(n),bg:on?'var(--cp-ink)':'var(--cp-surface)',fg:on?'var(--cp-bg)':'var(--cp-ink)',bd:on?'var(--cp-ink)':'var(--cp-line)',pick:()=>{this.buzz(5);this.setState({pActF:k});}};}),
      pEmpty:S.profTab==='activity'?!actShown.length:!mineRep.length,
      feedPosts:X5.feedPosts.map(p=>({...p,notMine:!p.mine})),
      eImgs:eI?eI.evidence.filter(e=>e.uid==='me').map(e=>({ago:CP.ago(e.ts),remove:()=>{this.buzz(10);CP.act('removePhoto',eI.id,e.ts);this.toast('Photo removed');}})):[],eImgN:eI?String(eI.evidence.filter(e=>e.uid==='me').length):'0',
      addEImg:()=>{if(!eI)return;this.buzz([8,20,8]);CP.act('evidence',eI.id);this.toast('Photo added');},
      stW:mob?'100%':scr==='case'?'min(640px, calc(100vw - 32px))':X7.stW,stH:mob?'100%':scr==='case'?'min(860px, 90vh)':X7.stH
    };
    const SOI={relevant:'ph-sparkle',recent:'ph-clock',support:'ph-arrow-fat-up',severity:'ph-warning'};
    const allCasesL=D.issues.filter(i=>i.caseId&&i.stage!=='rejected').sort((a,b)=>lastAct(b)-lastAct(a));
    const X9={
      sortOpen:!!S.sortOpen,toggleSort:()=>{this.buzz(5);this.setState({sortOpen:!S.sortOpen});},closeSort:()=>this.setState({sortOpen:false}),sortRot:S.sortOpen?'rotate(180deg)':'none',sddL:mob?'16px':'0',
      sortOpts:SO.search.map(([k,l])=>{const on=(S.sSort||'relevant')===k;return {l,icon:SOI[k]||'ph-sort-ascending',on,bg:on?'var(--cp-surface-2)':'transparent',pick:()=>{this.buzz(5);this.setState({sSort:k,sortOpen:false});}};}),
      combos:[{label:'SORT BY',sel:'',ph:(SO[ctx].find(x=>x[0]===sk)||SO[ctx][0])[1],q:'',open:!!S.fSortOpen,none:false,bd:S.fSortOpen?'var(--cp-ink-3)':'var(--cp-line)',rot:S.fSortOpen?'rotate(180deg)':'none',
        stopClose:e=>{e.stopPropagation();if(S.fRegionOpen||S.fAreaOpen||S.fDeptOpen)this.setState({fRegionOpen:false,fAreaOpen:false,fDeptOpen:false});},onQ:()=>{},openIt:()=>this.setState({fSortOpen:true}),toggle:()=>this.setState({fSortOpen:!S.fSortOpen}),clear:()=>{},
        opts:SO[ctx].map(([k,l])=>({l,n:'',on:sk===k,bg:sk===k?'var(--cp-surface-2)':'transparent',pick:()=>{this.buzz(5);this.setState(ctx==='cases'?{cSort:k,fSortOpen:false}:{sSort:k,fSortOpen:false});}}))},...X8.combos||X6.combos],
      closeCombos:()=>{if(S.fRegionOpen||S.fAreaOpen||S.fDeptOpen||S.fSortOpen)this.setState({fRegionOpen:false,fAreaOpen:false,fDeptOpen:false,fSortOpen:false});},
      caseRows:allCasesL.map(caseCard),casesEmpty:!allCasesL.length,
      oppFlex:mob?'1 1 0':'3 1 0',holdFlex:mob?'6 1 0':'7 1 0',editFlex:mob?'6 1 0':'7 1 0',shareFlex:mob?'1 1 0':'3 1 0'
    };
    const SL=[{icon:'ph-camera',k:'01 · REPORT',t:'Spot it. Snap it.',s:'Report potholes, garbage, dark streets or sewage in seconds — type or speak in Tamil or English.',c:'#ea580c'},{icon:'ph-users-three',k:'02 · COMMUNITY',t:'Neighbours back it up',s:'People nearby support it and add evidence. Support counts people, not photos.',c:'#d97706'},{icon:'ph-seal-check',k:'03 · GOVERNMENT',t:'Government acts. You confirm.',s:'At 80% community confidence it becomes an official case you can track until it is fixed.',c:'#0d9488'}];
    const au=S.authStep||'intro',mode=S.authMode||'signup',sl=S.auSlide||0,ph=(S.auPh||'').replace(/\D/g,'').slice(0,10),ad=(S.auAd||'').replace(/\D/g,'').slice(0,12);
    const steps=mode==='login'?['phone','otp']:['phone','otp','aadhaar','profile','perm'];const si=steps.indexOf(au);
    const finish=()=>{CP.act('setMe',{signedIn:true,verified:true,verifiedAt:Date.now(),...(mode==='signup'?{name:(S.auName||'').trim()||CP.ME.name,area:(S.auArea||'').trim()||CP.ME.area,anonDefault:!!S.auAnon}:{})});this.buzz([10,40,20]);this.setState({authStep:'intro',auSlide:0,otpN:0,auAdOk:false});this.go('feed');this.toast(mode==='login'?'Welcome back':'Welcome to Koodal');};
    const toOtp=()=>{this.setState({authStep:'otp',otpN:0});[1,2,3,4,5,6].forEach(k=>this.later(()=>{this.setState({otpN:k});this.buzz(4);},500+k*170));};
    const areasA=[...new Set(D.issues.map(i=>i.area+', '+i.city))];const aq=(S.auArea||'').toLowerCase();
    const OTPD='482917';
    let pri,priL,priO=1,secL='',sec=()=>{};
    if(au==='intro'){priL=sl<2?'Next':'Get started';pri=()=>{this.buzz(6);if(sl<2)this.setState({auSlide:sl+1});else this.setState({authStep:'phone',authMode:'signup'});};secL='Log in';sec=()=>{this.buzz(5);this.setState({authStep:'phone',authMode:'login'});};}
    else if(au==='phone'){priL='Send code';priO=ph.length===10?1:.4;pri=()=>{if(ph.length!==10){this.buzz(14);return;}this.buzz(8);toOtp();};}
    else if(au==='otp'){const ok=(S.otpN||0)>=6;priL=ok?'Verify':'Waiting for SMS…';priO=ok?1:.4;pri=()=>{if(!ok)return;this.buzz([8,30,8]);if(mode==='login')finish();else this.setState({authStep:'aadhaar'});};}
    else if(au==='aadhaar'){const ok=ad.length===12&&S.auConsent;priL=S.auAdOk?'Continue':S.auBusy?'Verifying…':'Verify identity';priO=(ok||S.auAdOk)?1:.4;pri=()=>{if(S.auAdOk){this.setState({authStep:'profile'});return;}if(!ok||S.auBusy){this.buzz(14);return;}this.setState({auBusy:true});this.later(()=>{this.setState({auBusy:false,auAdOk:true});this.buzz([10,40,20]);},1100);};}
    else if(au==='profile'){const ok=(S.auName||'').trim().length>1;priL='Continue';priO=ok?1:.4;pri=()=>{if(!ok){this.buzz(14);return;}this.buzz(6);this.setState({authStep:'perm'});};}
    else {priL='Allow location';pri=()=>{this.buzz(8);finish();};secL='Not now';sec=()=>finish();}
    const ini2=(S.auName||'').trim().split(/\s+/).filter(Boolean).map(s=>s[0]).join('').slice(0,2).toUpperCase()||'?';
    const sysDark=typeof window!=='undefined'&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;
    const tmode=S.theme||'light';
    const tg=(on,k,l,sub,icon,fn)=>({l,sub,icon,tbg:on?'var(--cp-leaf)':'var(--cp-line)',tx:on?'translateX(18px)':'none',pick:()=>{this.buzz(6);fn();}});
    const X10={
      authOpen:!me.signedIn,auCols:mob?'minmax(0,1fr)':'minmax(0,1.1fr) minmax(0,1fr)',auPad:mob?'16px 20px 24px':'40px 48px',
      auIntro:au==='intro',auPhone:au==='phone',auOtp:au==='otp',auAad:au==='aadhaar',auProf:au==='profile',auPerm:au==='perm',
      auCanBack:au!=='intro',auBack:()=>{this.buzz(5);const pv=si<=0?'intro':steps[si-1];this.setState({authStep:pv});},auSkip:()=>this.setState({authStep:'phone',authMode:'signup'}),
      auProg:au==='intro'?SL.map((x,k)=>({c:k<=sl?'var(--cp-ink)':'var(--cp-line)'})):steps.map((x,k)=>({c:k<=si?'var(--cp-ink)':'var(--cp-line)'})),
      auSlides:SL.map((x,k)=>({...x,o:au==='intro'?(k===sl?1:.45):1})),auS:SL[sl],auSlideK:'s'+sl,auArt:mob?'4/4':'16/11',
      auPhoneT:mode==='login'?'Welcome back':'What\'s your number?',auPh:ph,onAuPh:e=>this.setState({auPh:e.target.value.replace(/\D/g,'').slice(0,10)}),auPhOk:ph.length===10,auPhBd:ph.length===10?'var(--cp-leaf)':'var(--cp-line)',auFillPh:()=>this.setState({auPh:'9840123456'}),
      auPhF:ph.slice(0,5)+' '+ph.slice(5),otpBoxes6:OTPD.split('').map((v,k)=>{const on=k<(S.otpN||0);return {v:on?v:'',bd:on?'var(--cp-ink)':(k===(S.otpN||0)?'var(--cp-pulse)':'var(--cp-line)'),bg:on?'var(--cp-surface-2)':'var(--cp-surface)',an:on?'cp-pop .25s both':'none'};}),
      auOtpNote:(S.otpN||0)>=6?'Code auto-filled from SMS':'Reading code from SMS… · Resend in 0:24',
      auAdF:ad.replace(/(\d{4})(?=\d)/g,'$1 '),onAuAd:e=>this.setState({auAd:e.target.value.replace(/\D/g,'').slice(0,12),auAdOk:false}),auAdBd:ad.length===12?'var(--cp-leaf)':'var(--cp-line)',auFillAd:()=>this.setState({auAd:'234567891234',auAdOk:false}),
      auToggleConsent:()=>{this.buzz(5);this.setState({auConsent:!S.auConsent});},auCBd:S.auConsent?'var(--cp-ink)':'var(--cp-ink-3)',auCBg:S.auConsent?'var(--cp-ink)':'transparent',auCO:S.auConsent?1:0,auAdOk:!!S.auAdOk,
      auName:S.auName||'',onAuName:e=>this.setState({auName:e.target.value}),auInit:ini2,auArea:S.auArea||'',onAuArea:e=>this.setState({auArea:e.target.value}),
      auAreas:areasA.filter(a=>!aq||a.toLowerCase().includes(aq)).slice(0,12).map(a=>{const on=S.auArea===a;return {l:a,bg:on?'var(--cp-ink)':'var(--cp-surface)',fg:on?'var(--cp-bg)':'var(--cp-ink)',bd:on?'var(--cp-ink)':'var(--cp-line)',pick:()=>{this.buzz(5);this.setState({auArea:a});}};}),
      auToggleAnon:()=>{this.buzz(6);this.setState({auAnon:!S.auAnon});},auAnonBg:S.auAnon?'var(--cp-leaf)':'var(--cp-line)',auAnonT:S.auAnon?'translateX(18px)':'none',
      auPri:pri,auPriL:priL,auPriO:priO,auSecL:secL,auSec:sec,auBusy:!!S.auBusy,auLegal:au==='phone'||au==='intro',
      theme:tmode==='system'?(sysDark?'dark':'light'):tmode,
      themeTiles:[['light','Light','ph-sun'],['system','System','ph-circle-half'],['dark','Dark','ph-moon']].map(([k,l,icon])=>{const on=tmode===k;return {l,icon,bg:on?'var(--cp-surface-2)':'var(--cp-surface)',bd:on?'var(--cp-ink-3)':'var(--cp-line)',bar:on?'var(--cp-pulse)':'var(--cp-line)',pick:()=>{this.buzz(6);this.setState({theme:k});}};}),
      setToggles:[tg(!!me.anonDefault,'anon','Post anonymously by default','Neighbours won\'t see your name','ph-detective',()=>CP.act('setMe',{anonDefault:!me.anonDefault})),
        tg(!S.hapticsOff,'hap','Haptic feedback','A slight vibration on taps and holds','ph-vibrate',()=>this.setState({hapticsOff:!S.hapticsOff})),
        tg(S.pushOn!==false,'push','Case updates','Notify me when a case I follow changes status','ph-bell-ringing',()=>this.setState({pushOn:S.pushOn===false})),
        tg(S.waOn!==false,'wa','WhatsApp updates','Status messages on +91 WhatsApp','ph-whatsapp-logo',()=>this.setState({waOn:S.waOn===false})),
        tg(S.preciseOn!==false,'loc','Precise location','Pin reports to within ±10 m','ph-crosshair',()=>this.setState({preciseOn:S.preciseOn===false}))],
      langSeg:[['en','English'],['ta','தமிழ்']].map(([k,l])=>{const on=(S.lang||'en')===k;return {l,bg:on?'var(--cp-surface)':'transparent',sh:on?'0 1px 2px rgb(0 0 0 / .1)':'none',pick:()=>{this.buzz(5);this.setState({lang:k});if(k==='ta')this.toast('Tamil interface coming soon');}};}),
      pEditOpen:!!S.pEdit,togglePEdit:()=>{this.buzz(5);this.setState({pEdit:!S.pEdit,pName:meName,pArea:meArea});},pEditL:S.pEdit?'Close':'Edit',pEditIcon:S.pEdit?'ph-x':'ph-pencil-simple',
      saveProfile:()=>{CP.act('setMe',{name:S.pName.trim()||meName,area:S.pArea.trim()||meArea});this.buzz([8,30,8]);this.setState({pEdit:false});this.toast('Profile saved');},
      logout:()=>{this.buzz([10,30,10]);CP.act('setMe',{signedIn:false});this.setState({authStep:'intro',auSlide:0,authMode:'login',pDrawer:false});},
      deleteAcct:()=>{this.buzz(14);this.toast('Demo: account deletion needs OTP confirmation');},helpT:()=>this.toast('Help centre · support@koodal.in'),aboutT:()=>this.toast('Koodal v1.0 · made in Tamil Nadu'),
      simSLabel:an.strong?'Different':'Same issue'
    };
    const evH=i0.evidence;const hN=Math.max(1,evH.length);const hi=S.heroFor===i0.id?Math.min(S.heroIdx||0,hN-1):0;const ANG=['135deg','120deg','150deg','105deg','165deg','90deg'];
    const setH=k=>{this.buzz(5);this.setState({heroFor:i0.id,heroIdx:Math.max(0,Math.min(hN-1,k))});};
    const e0=evH[hi]||{by:'',ts:i0.created};
    const ANG2=k=>((135+k*27)%360)+'deg';const carI=S.carFor===i0.id?(S.carI||0):0;const tourOn=!!S.tourFor&&S.tourFor===i0.id;
    const X11={
      heroSlides:Array.from({length:Math.min(12,hN)},(_,k)=>({cap:'photo '+(k+1),ang:ANG2(k)})),carN:String(carI+1),carScroll:e=>{const el=e.currentTarget;const ix=Math.round(el.scrollLeft/Math.max(1,el.clientWidth));if(ix!==carI)this.setState({carFor:i0.id,carI:ix});},
      mosaic:[0,1,2,3,4].map(k=>({gc:k===0?'1':k===1||k===3?'2':'3',gr:k===0?'1 / span 2':k<3?'1':'2',cap:k<evH.length?'photo '+(k+1):'',ang:ANG2(k)})),galH:S.w>=1100?'420px':'320px',
      openTour:()=>{this.buzz(6);this.setState({tourFor:i0.id});},closeTour:()=>this.setState({tourFor:null}),tourOpen:tourOn,tourT:i0.title,tourRef:i0.caseId||i0.id,tourSub:`${evH.length} photos from ${new Set(evH.map(x=>x.uid||x.by)).size} people · ${i0.street}, ${i0.area}`,
      tourPhotos:evH.map((ev,k)=>({span:k%3===0?'1 / -1':'auto',ar:k%3===0?'16 / 10':'1 / 1',cap:'photo '+(k+1),meta:(ev.by||'AN')+' · '+CP.ago(ev.ts)+' ago',ang:ANG2(k)})),
      sheetScroll:e=>{const t=this.state.sheetTop??Math.round(this.state.h*0.3);if(t>110&&e.currentTarget.scrollTop>6){this.buzz(5);this.setState({sheetTop:96});}},sheetWheel:e=>{const t=this.state.sheetTop??Math.round(this.state.h*0.3);if(t<=110&&e.currentTarget.scrollTop<=0&&e.deltaY<-4)this.setState({sheetTop:Math.round(this.state.h*0.3)});},
      heroN:String(hi+1),heroAng:ANG[hi%ANG.length],heroMulti:hN>1,heroCap:'photo '+(hi+1)+' · by '+(e0.by||'AN')+' · '+CP.ago(e0.ts)+' ago',
      heroPrev:e=>{e&&e.stopPropagation&&e.stopPropagation();setH(hi-1);},heroNext:e=>{e&&e.stopPropagation&&e.stopPropagation();setH(hi+1);},heroPrevO:hi>0?1:.4,heroNextO:hi<hN-1?1:.4,
      heroDots:Array.from({length:Math.min(hN,8)},(_,k)=>{const on=hN<=8?k===hi:k===Math.round(hi/(hN-1)*7);return {w:on?'16px':'6px',c:on?'#fff':'rgb(255 255 255 / .5)'};}),
      heroDown:e=>{if(e.target.closest&&e.target.closest('button'))return;const x0=e.clientX;const up=ev=>{window.removeEventListener('pointerup',up);const dx=ev.clientX-x0;if(dx<-40)setH(hi+1);else if(dx>40)setH(hi-1);};window.addEventListener('pointerup',up);},
      sheetHidden:mob&&!!S.sheetHidden,hideSheet:e=>{e&&e.stopPropagation&&e.stopPropagation();this.buzz(6);this.setState({sheetHidden:true});},showSheet:()=>{this.buzz(6);this.setState({sheetHidden:false,sheetTop:null});},
      sheetTopPx:S.sheetHidden?(S.h+40)+'px':(S.sheetTop??Math.round(S.h*0.3))+'px',sheetTrans:S.sheetDrag?'none':'top .45s cubic-bezier(.2,.9,.3,1.1)',
      listHidden:!mob&&!!S.listHidden,mapFull:mob?!!S.sheetHidden:!!S.listHidden,mapFullIcon:(mob?S.sheetHidden:S.listHidden)?'ph-arrows-in-simple':'ph-arrows-out-simple',mapFullTip:(mob?S.sheetHidden:S.listHidden)?'Exit full screen':'Full screen map',toggleMapFull:()=>{this.buzz([6,20,6]);if(mob)this.setState({sheetHidden:!S.sheetHidden});else{const v=!S.listHidden;this.setState({listHidden:v,railHidden:v});}},toggleList:()=>{this.buzz(6);this.setState({listHidden:!S.listHidden});},listW:S.listHidden?'0px':(W>=1280?'420px':'350px'),
      railShown:!S.railHidden,railHid:!mob&&!!S.railHidden,hideRail:()=>{this.buzz(6);this.setState({railHidden:true});},showRail:()=>{this.buzz(6);this.setState({railHidden:false});}
    };
    const lh=!!S.logoHover&&W>=1100;
    const X12={
      sheetGone:S.w<720&&!!S.sheetHidden&&S.screen==='home',sheetHidden:false,sheetTopPx:S.sheetHidden?(S.h+40)+'px':(S.sheetTop??Math.round(S.h*0.3))+'px',railShown:!(S.screen==='home'&&S.railHidden),railHid:false,
      toggleRail:()=>{this.buzz(6);this.setState({railCollapsed:!S.railCollapsed});},
      logoIn:()=>this.setState({logoHover:true}),logoOut:()=>this.setState({logoHover:false}),
      logoBg:lh?'var(--cp-surface-2)':'transparent',logoCur:'pointer',logoMark:lh?'var(--cp-surface)':'var(--cp-pulse)',logoScale:lh?'scale(1.06)':'none',
      dotO:lh?0:1,dotS:lh?.4:1,icoO:lh?1:0,icoT:lh?'rotate(0deg) scale(1)':'rotate(-90deg) scale(.5)',sideX:lh?'0':'-6px',
      railIcon:S.railCollapsed?'ph-caret-double-right':'ph-caret-double-left',railTip:W>=1100?(S.railCollapsed?'Expand sidebar':'Collapse sidebar'):'Koodal'
    };
    const __o={
      meName,meArea,meI,meFirst:meName.split(' ')[0],meVerified:!!me.verified,mePhone:CP.ME.phone,verifiedLine:'Aadhaar e-KYC (mock) · verified '+new Date(me.verifiedAt||now).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}),
      goProfile:()=>this.go('profile'),goSettings:()=>this.go('settings',{pName:meName,pArea:meArea}),profBack:()=>this.goBack(),
      goReport:()=>this.go('report',{desc:'',tags:[],tagDraft:'',descMode:'text',voice:'idle',an:null}),
      closeFlow:()=>{this.clearT();this.setState({threshold:false,idOpen:false,editFor:null});if(FLOW.includes(scr))this.go(S.base||'home');},
      tabsL:[tab('home','ph-map-trifold','Nearby'),tab('feed','ph-newspaper','Feed')],tabsR:[tab('search','ph-magnifying-glass','Search'),tab('cases','ph-briefcase','Cases',needConfirm?String(needConfirm):'')],
      showTabs:mob&&['home','feed','search','cases'].includes(scr)&&!S.filterOpen&&!S.commentsFor,
      isFeed:mob&&scr==='feed',isSettings:mob&&scr==='settings',isValidate:false,
      deskFeed:!mob&&view==='feed',deskSearch:!mob&&view==='search',deskSettings:!mob&&view==='settings',
      dnav:[['home','Nearby','ph-map-trifold'],['feed','Feed','ph-newspaper'],['search','Search','ph-magnifying-glass'],['cases','Cases','ph-briefcase']].map(([k,l,icon])=>{const on=view===k||(view==='detail'&&S.prev===k);return {l,badge:k==='cases'&&needConfirm?String(needConfirm):'',bp:W>=1100?'static':'absolute',icon:(on?'ph-fill ':'ph-bold ')+icon,bg:on?'var(--cp-surface-2)':'transparent',c:on?'var(--cp-ink)':'var(--cp-ink-3)',go:()=>this.go(k)};}),
      setNavBg:view==='settings'?'var(--cp-surface-2)':'transparent',
      showStage:(mob?true:deskFlow)||(!mob&&!!S.locOpen),stH:!mob&&S.editFor&&!FLOW.includes(scr)?'min(680px, calc(100vh - 40px))':(mob?'100%':'min(860px, calc(100vh - 40px))'),
      shTop:mob?'auto':'0',shMax:mob?'88%':'100%',shR:mob?'26px 26px 0 0':'0',
      backLabel:{feed:'Feed',search:'Search',cases:'Cases',profile:'Profile'}[S.prev]||'Nearby',
      fpills,regionPill:fpills[0],regionName:f.region==='near'?'Velachery':f.region,sheetGroups:o.fGroups.filter(g=>!S.sheetGroup||g.title===S.sheetGroup),
      sheetTitle:{REGION:'Where',STATUS:'Status',SEVERITY:'Severity',CATEGORY:'Category'}[S.sheetGroup]||'Filters',
      fpanel:!mob&&S.filterOpen,mFilterOpen:mob&&S.filterOpen,resN,
      openAllFilters:()=>this.setState({filterOpen:true,sheetGroup:null}),closeFilter:()=>this.setState({filterOpen:false,sheetGroup:null}),
      mpins:list.map(i=>({x:i.x+'%',y:(i.y*0.62+10)+'%',icon:CP.CATS[i.cat].icon,c:PIN[i.stage][0],fg:PIN[i.stage][1],hot:i.stage==='review'||(i.stage==='community'&&i.conf>=70),n:i.sup,pb:S.mSelId===i.id&&S.sheetHidden?'var(--cp-ink)':'var(--cp-surface)',pf:S.mSelId===i.id&&S.sheetHidden?'var(--cp-bg)':'var(--cp-ink)',sc:S.mSelId===i.id&&S.sheetHidden?1.12:1,s:'36px',is:'17px',z:1,pick:()=>this.open(i.id)})),
      showMe:f.region==='near',
      fsorts:seg([['nearby','Nearby'],['trending','Trending'],['latest','Latest']],S.feedSort,'feedSort'),
      feedPosts:feed.map(post),feedEmpty:!feed.length,postR:mob?'0':'22px',postB:mob?'none':'2px solid var(--cp-edge)',postSh:mob?'none':'0 4px 0 var(--cp-edge)',postGap:mob?'8px':'16px',
      feedCols:W>=1100?'minmax(0,1fr) 300px':'minmax(0,1fr)',feedSide:W>=1100,trending,topTags,
      sResults:sRes.map(i=>this.card(i,D)),qCount:sRes.length,qNone:!!qt&&!sRes.length,sPad:mob?'8px 16px':'4px 0',
      latestNear:D.issues.filter(i=>i.city==='Chennai'&&i.km<3&&i.stage!=='rejected').sort(byAct).slice(0,5).map(i=>this.card(i,D)),
      qSuggest:['Velachery','sewage','pothole','Madurai garbage','streetlight','CP-2107'].map(l=>({l,pick:()=>this.setState({q:l})})),
      cTabs:seg([['following','Following',followed.length],['all','All cases',allCases.length]],S.casesTab==='all'?'all':'following','casesTab'),
      caseRows:cSrc.map(post),casesEmpty:!cSrc.length,casesEmptyTxt:S.casesTab==='all'?'No official cases in this region yet.':'Support a report — when it becomes an official case, you\'ll follow it here.',
      gridCols:mob?'minmax(0,1fr)':'repeat(auto-fill,minmax(320px,1fr))',
      pStats:[{v:myReports.length,l:'Reports'},{v:supported.length,l:'Supported'},{v:myCases.length,l:'Cases'},{v:D.issues.filter(i=>(i.mine||my.support[i.id])&&['resolved','closed'].includes(i.stage)).length,l:'Fixed'}],
      pTabs:[tabT('reports','ph-camera','Reports',myReports.length),tabT('supported','ph-arrow-fat-up','Supported',supported.length),tabT('cases','ph-bank','Cases',myCases.length)],
      pRows:S.profTab!=='cases'?pSrc.map(post):[],pCases:S.profTab==='cases'?pSrc.map(post):[],pShowRows:S.profTab!=='cases',pShowCases:S.profTab==='cases',pEmpty:!pSrc.length,
      pEmptyTxt:{reports:'You haven\'t reported anything yet.',supported:'Reports you support show up here.',cases:'No official cases yet.'}[S.profTab],
      pName:S.pName,pArea:S.pArea,onPName:e=>this.setState({pName:e.target.value}),onPArea:e=>this.setState({pArea:e.target.value}),
      saveProfile:()=>{CP.act('setMe',{name:S.pName.trim()||meName,area:S.pArea.trim()||meArea});this.buzz([8,30,8]);this.toast('Profile saved');},
      camH:S.captured?'30%':'70%',
      gallery:Object.entries(CP.SCENES).map(([k,s])=>({icon:CP.CATS[s.cat].icon,pick:()=>{this.buzz(14);this.setState(s=>({scene:s.captured?s.scene:k,flash:true,captured:true,an:null,shots:Math.min(10,(s.captured?s.shots||1:0)+1)}));this.later(()=>this.setState({flash:false}),300);}})),
      retake:()=>this.setState({captured:false,voice:'idle',shots:0}),addShot:()=>{this.buzz(12);this.setState(s=>({flash:true,shots:Math.min(10,(s.shots||1)+1)}));this.later(()=>this.setState({flash:false}),250);},shotList:Array.from({length:S.captured?Math.max(1,S.shots||1):0},(_,k)=>({n:k+1,icon:CP.CATS[CP.SCENES[S.scene].cat].icon,rm:e=>{e&&e.stopPropagation&&e.stopPropagation();this.buzz(8);const n=Math.max(1,S.shots||1)-1;this.setState(n?{shots:n}:{captured:false,shots:0,voice:'idle'});}})),shotN:Math.max(1,S.shots||1),canAddShot:(S.shots||1)<10,
      isText:S.descMode==='text',isVoice:S.descMode==='voice',setText:()=>this.setState({descMode:'text'}),setVoice:()=>this.setState({descMode:'voice'}),
      textBg:S.descMode==='text'?'rgba(255,255,255,.16)':'transparent',voiceModeBg:S.descMode==='voice'?'rgba(255,255,255,.16)':'transparent',
      desc:S.desc,onDesc:e=>this.setState({desc:e.target.value}),voiceDone:S.voice==='done',an:CP.analyze(S.scene),
      selTags:S.tags.map(t=>({t,remove:()=>this.setState({tags:S.tags.filter(x=>x!==t)})})),
      sugTags:(SCENE_TAGS[S.scene]||[]).filter(t=>!S.tags.includes(t)).map(t=>({t,add:()=>{this.buzz(5);this.setState({tags:[...S.tags,t]});}})),
      tagDraft:S.tagDraft,onTagDraft:e=>this.setState({tagDraft:e.target.value}),addTag,onTagKey:e=>{if(e.key==='Enter'){e.preventDefault();addTag();}},
      aiRows:o.aiRows.map((r,k)=>k===1?descRow:r),
      d,holdLabel:my.support[i0.id]?(i0.sup>1?'You + '+(i0.sup-1)+' citizens':'You support this'):S.holdP>0?'Keep holding…':'Hold to support',
      addEvidence:()=>{this.buzz([10,20,10]);const r=CP.act('evidence',i0.id);this.toast(r.first?'Photo added · you\'re now a contributor':'Photo added · support counts people, not photos');if(r.crossed)this.later(()=>this.fireThreshold(),700);},
      openComments:()=>this.setState({commentsFor:i0.id,cDraft:''}),
      commentsOpen:mob&&!!S.commentsFor,closeComments:()=>this.setState({commentsFor:null}),cTitle:cI?cI.title:'',cList:cI?cm(cI):[],cEmpty:!cI||!(cI.comments||[]).length,
      cDraft:S.cDraft,onCDraft:e=>this.setState({cDraft:e.target.value}),onCKey:e=>{if(e.key==='Enter'){e.preventDefault();sendC();}},sendC,cSendO:S.cDraft.trim()?1:.45,
      editOpen:!!S.editFor,closeEdit:()=>this.setState({editFor:null}),eTitle:S.eTitle,eText:S.eText,onETitle:e=>this.setState({eTitle:e.target.value}),onEText:e=>this.setState({eText:e.target.value}),
      eTagList:S.eTags.map(t=>({t,remove:()=>this.setState({eTags:S.eTags.filter(x=>x!==t)})})),eTag:S.eTag,onETag:e=>this.setState({eTag:e.target.value}),addETag,onETagKey:e=>{if(e.key==='Enter'){e.preventDefault();addETag();}},
      saveEdit:()=>{if(!eI)return;CP.act('editReport',eI.id,{title:S.eTitle.trim()||eI.title,text:S.eText.trim(),tags:S.eTags});this.buzz([8,30,8]);this.setState({editFor:null});this.toast('Report updated');},
      noDelAsk:!S.delAsk,delAsk:S.delAsk,askDelete:()=>{this.buzz(14);this.setState({delAsk:true});},cancelDelete:()=>this.setState({delAsk:false}),eSup:eI?eI.sup:0,
      confirmDelete:()=>{if(!eI)return;const wasCur=S.cur===eI.id;CP.act('deleteReport',eI.id);this.buzz([20,40,20]);this.setState({editFor:null,delAsk:false});this.toast('Report deleted');if(wasCur)this.go(S.prev==='profile'?'profile':'home',{cur:'CP-2107'});},
      verifyMsg:d.stage==='closed'?'Case closed — thanks, neighbours':my.confirmed[d.id]?'You already responded':'Not marked fixed yet — we\'ll notify you',
      ...X5,...X6,...X7,...X8,...X9,...X10,...X11,...X12,
      stAnim:'none'
    };
    if(S.w>=720&&__o.showStage){const onlyF=S.filterOpen&&!S.editFor&&!S.threshold&&!S.idOpen&&S.rpIdx==null&&!(S.cModal&&S.commentsFor)&&!FLOW.includes(S.screen);const W0='min(460px, calc(100vw - 24px))';if(!onlyF)Object.assign(__o,{isAiM:__o.isAiM||__o.isAiD,isAiD:false,isSimM:__o.isSimM||__o.isSimD,isSimD:false,thM:__o.thM||__o.thD,thD:false,cPadX:'16px',camH:S.captured?'30%':__o.camH});
      Object.assign(__o,{stW:W0,stL:`calc(100vw - ${W0} - 12px)`,stT:'12px',stH:'calc(100vh - 24px)',stTf:'none',stR:'26px',stShadow:'0 30px 80px -24px rgb(0 0 0 / .45)',stAnim:'cp-side .42s cubic-bezier(.2,.9,.3,1.05) both'});}
    return __o;
  }
}