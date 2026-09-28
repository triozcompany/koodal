// render-vals.js line 184
    const meName=me.name||CP.ME.name,meArea=me.area||CP.ME.area,meI=meName.split(' ').filter(Boolean).map(s=>s[0]).join('').slice(0,2).toUpperCase();

// render-vals.js line 200
        comment:(e)=>{e&&e.stopPropagation&&e.stopPropagation();if(mob)this.setState({commentsFor:i.id,cDraft:''});else this.open(i.id);},

// render-vals.js line 210
    const topTags=Object.entries(tc).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([t,n])=>({t,n,pick:()=>{this.setState({q:t});if(!(scr==='search'||view==='search'))this.go('search');}}));

// render-vals.js line 230
    const sendC=()=>{const t=S.cDraft.trim();if(!t||!cI)return;CP.act('comment',cI.id,t,me.anonDefault);this.buzz([6,20,6]);this.setState({cDraft:''});};

// render-vals.js line 238
    const trending=D.issues.filter(i=>i.city==='Chennai'&&i.km<6&&['community','review'].includes(i.stage)).sort((a,b)=>heat(b)-heat(a)).slice(0,5).map((i,k)=>({n:k+1,title:i.title,sup:i.sup,area:i.area,open:()=>this.open(i.id)}));

// render-vals.js line 261
      feedPosts:feed.map(i=>({...post(i),why:trendSet.has(i.id)?(i.city==='Chennai'&&i.km<=6?'Trending near you':'Trending in '+i.city):'',cOpen:!mob&&S.commentsFor===i.id&&!S.cModal,cmts:cm(i).slice(-3),cMore:(i.comments||[]).length>3?'View all '+(i.comments||[]).length+' comments':'',

// render-vals.js line 262
        comment:e=>{e&&e.stopPropagation&&e.stopPropagation();this.buzz(6);if(mob)this.setState({commentsFor:i.id,cDraft:''});else this.setState({commentsFor:S.commentsFor===i.id?null:i.id,cModal:false,cDraft:''});}})),

// render-vals.js line 263
      stop:e=>e.stopPropagation(),

// render-vals.js line 340
      topTags:topTags.map(x=>({...x,pick:()=>{this.buzz(5);this.setState({fTag:S.fTag===x.t?null:x.t});if(!(scr==='search'||view==='search'))this.go('search');}})),

// render-vals.js line 385
      feedPosts:X5.feedPosts.map(p=>({...p,notMine:!p.mine})),

// render-vals.js line 478
      meName,meArea,meI,meFirst:meName.split(' ')[0],meVerified:!!me.verified,mePhone:CP.ME.phone,verifiedLine:'Aadhaar e-KYC (mock) · verified '+new Date(me.verifiedAt||now).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}),

// render-vals.js line 485
      deskFeed:!mob&&view==='feed',deskSearch:!mob&&view==='search',deskSettings:!mob&&view==='settings',

// render-vals.js line 498
      feedPosts:feed.map(post),feedEmpty:!feed.length,postR:mob?'0':'22px',postB:mob?'none':'2px solid var(--cp-edge)',postSh:mob?'none':'0 4px 0 var(--cp-edge)',postGap:mob?'8px':'16px',

// render-vals.js line 499
      feedCols:W>=1100?'minmax(0,1fr) 300px':'minmax(0,1fr)',feedSide:W>=1100,trending,topTags,

// render-vals.js line 526
      cDraft:S.cDraft,onCDraft:e=>this.setState({cDraft:e.target.value}),onCKey:e=>{if(e.key==='Enter'){e.preventDefault();sendC();}},sendC,cSendO:S.cDraft.trim()?1:.45,