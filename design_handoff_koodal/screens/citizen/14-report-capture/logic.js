// render-vals.js line 3
    const mob=S.w<720,wide=S.w>=1100;const common={theme,toast:S.toast,ready:S.ready,isMobile:mob,isDesk:!mob,railW:wide?'232px':'76px',railLabels:wide,

// render-vals.js line 45
    const an=S.an||CP.analyze(S.scene);

// render-vals.js line 67
      resetDemo:()=>{CP.act('reset');this.setState({f:{region:'near',cat:[],stage:[],sev:[]},q:'',an:null,mountTs:Date.now()});this.go('home',{cur:SHOW});this.toast('Demo reset');},

// render-vals.js line 69
        go:()=>{if(k==='ai'||k==='similar'){this.setState({scene:'sewage',an:CP.analyze('sewage'),anon:false});this.go(k,k==='ai'?{}:{});}else if(['detail','case','timeline','verify'].includes(k))this.go(k,{cur:SHOW});else this.go(k);}};}),

// render-vals.js line 70
      isHome:mob&&scr==='home',isSearch:mob&&scr==='search',isDetail:mob&&scr==='detail',isReport:scr==='report',isAi:scr==='ai',isSimilar:scr==='similar',isValidate:scr==='validate',isCase:scr==='case',isTimeline:mob&&scr==='timeline',isVerify:scr==='verify',isCases:mob&&scr==='cases',isProfile:mob&&scr==='profile',

// render-vals.js line 100
      notCaptured:!S.captured,captured:S.captured,flash:S.flash,camH:S.captured?'52%':'64%',

// render-vals.js line 101
      capture:()=>{this.buzz(20);this.setState(s=>({flash:true,captured:true,shots:Math.min(10,(s.captured?s.shots||1:0)+1)}));this.later(()=>this.setState({flash:false}),300);},

// render-vals.js line 102
      camLabel:S.captured?`your photo · ${CP.SCENES[S.scene].label.toLowerCase()}`:'live camera',camHint:S.captured?`${CP.SCENES[S.scene].label} spotted`:'Point at the issue',camDot:S.captured?'oklch(0.63 0.19 32)':'oklch(0.8 0.155 75)',

// render-vals.js line 103
      sceneStreet:CP.SCENES[S.scene].street,meName:CP.ME.name,meArea:CP.ME.area,mePhone:CP.ME.phone,

// render-vals.js line 104
      setNamed:()=>this.setState({anon:false}),setAnon:()=>{this.buzz(6);this.setState({anon:true});},namedBg:S.anon?'transparent':'rgba(255,255,255,.16)',anonBg:S.anon?'oklch(0.58 0.2 32)':'transparent',

// render-vals.js line 105
      voiceTap:()=>{if(S.voice!=='idle')return;this.setState({voice:'rec'});this.buzz(10);this.later(()=>{this.setState({voice:'done'});this.buzz([6,20,6]);},1800);},

// render-vals.js line 106
      voiceIdle:S.voice==='idle',voiceNotIdle:S.voice!=='idle',voiceBg:S.voice==='rec'?'oklch(0.58 0.2 32)':'#1a1c21',voiceIcon:S.voice==='done'?'ph-fill ph-check-circle':'ph-bold ph-microphone',

// render-vals.js line 107
      voiceTag:S.voice==='rec'?'0:03':S.voice==='done'?'0:04 · '+CP.SCENES[S.scene].voice.lang:'optional',

// render-vals.js line 108
      wave:WAVE.map((h,i)=>({h:h+'px',anim:S.voice==='rec'?`cp-wave .7s ${(i%6)*0.08}s ease-in-out infinite`:'none'})),

// render-vals.js line 109
      slideDown:this.slideDown,slideXpx:S.slideX+'px',slideFillW:(S.slideX+64)+'px',slideTextO:Math.max(0,1-S.slideX/160),slideTrans:S.sliding?'none':'transform .4s cubic-bezier(.3,1.4,.5,1)',

// render-vals.js line 161
    if(mob)return {showStage:(true)||(!mob&&!!S.locOpen),stL:'0',stT:'0',stW:'100%',stH:'100%',stTf:'none',stR:'0',stShadow:'none',closeFlow:()=>this.go('home')};

// render-vals.js line 166
      closeFlow:()=>{this.clearT();this.setState({threshold:false,idOpen:false});this.go(S.base||'home');},

// render-vals.js line 184
    const meName=me.name||CP.ME.name,meArea=me.area||CP.ME.area,meI=meName.split(' ').filter(Boolean).map(s=>s[0]).join('').slice(0,2).toUpperCase();

// render-vals.js line 233
    const addTag=()=>{const t=norm(S.tagDraft);if(t&&!S.tags.includes(t))this.setState({tags:[...S.tags,t],tagDraft:''});else this.setState({tagDraft:''});};

// render-vals.js line 276
      closeFlow:()=>{this.clearT();this.setState({threshold:false,idOpen:false,editFor:null,filterOpen:false,commentsFor:null,cModal:false});if(FLOW.includes(scr))this.go(S.base||'home');},

// render-vals.js line 352
      camMode:mob&&!S.captured,uploadMode:!mob&&!S.captured,camH:!mob&&!S.captured?'0%':(S.captured?'30%':'70%'),cPadX:mob?'16px':'max(24px, calc((100% - 760px) / 2))',

// render-vals.js line 478
      meName,meArea,meI,meFirst:meName.split(' ')[0],meVerified:!!me.verified,mePhone:CP.ME.phone,verifiedLine:'Aadhaar e-KYC (mock) · verified '+new Date(me.verifiedAt||now).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}),

// render-vals.js line 480
      goReport:()=>this.go('report',{desc:'',tags:[],tagDraft:'',descMode:'text',voice:'idle',an:null}),

// render-vals.js line 512
      camH:S.captured?'30%':'70%',

// render-vals.js line 513
      gallery:Object.entries(CP.SCENES).map(([k,s])=>({icon:CP.CATS[s.cat].icon,pick:()=>{this.buzz(14);this.setState(s=>({scene:s.captured?s.scene:k,flash:true,captured:true,an:null,shots:Math.min(10,(s.captured?s.shots||1:0)+1)}));this.later(()=>this.setState({flash:false}),300);}})),

// render-vals.js line 514
      retake:()=>this.setState({captured:false,voice:'idle',shots:0}),addShot:()=>{this.buzz(12);this.setState(s=>({flash:true,shots:Math.min(10,(s.shots||1)+1)}));this.later(()=>this.setState({flash:false}),250);},shotList:Array.from({length:S.captured?Math.max(1,S.shots||1):0},(_,k)=>({n:k+1,icon:CP.CATS[CP.SCENES[S.scene].cat].icon,rm:e=>{e&&e.stopPropagation&&e.stopPropagation();this.buzz(8);const n=Math.max(1,S.shots||1)-1;this.setState(n?{shots:n}:{captured:false,shots:0,voice:'idle'});}})),shotN:Math.max(1,S.shots||1),canAddShot:(S.shots||1)<10,

// render-vals.js line 515
      isText:S.descMode==='text',isVoice:S.descMode==='voice',setText:()=>this.setState({descMode:'text'}),setVoice:()=>this.setState({descMode:'voice'}),

// render-vals.js line 516
      textBg:S.descMode==='text'?'rgba(255,255,255,.16)':'transparent',voiceModeBg:S.descMode==='voice'?'rgba(255,255,255,.16)':'transparent',

// render-vals.js line 517
      desc:S.desc,onDesc:e=>this.setState({desc:e.target.value}),voiceDone:S.voice==='done',an:CP.analyze(S.scene),

// render-vals.js line 518
      selTags:S.tags.map(t=>({t,remove:()=>this.setState({tags:S.tags.filter(x=>x!==t)})})),

// render-vals.js line 520
      tagDraft:S.tagDraft,onTagDraft:e=>this.setState({tagDraft:e.target.value}),addTag,onTagKey:e=>{if(e.key==='Enter'){e.preventDefault();addTag();}},

// render-vals.js line 536
    if(S.w>=720&&__o.showStage){const onlyF=S.filterOpen&&!S.editFor&&!S.threshold&&!S.idOpen&&S.rpIdx==null&&!(S.cModal&&S.commentsFor)&&!FLOW.includes(S.screen);const W0='min(460px, calc(100vw - 24px))';if(!onlyF)Object.assign(__o,{isAiM:__o.isAiM||__o.isAiD,isAiD:false,isSimM:__o.isSimM||__o.isSimD,isSimD:false,thM:__o.thM||__o.thD,thD:false,cPadX:'16px',camH:S.captured?'30%':__o.camH});