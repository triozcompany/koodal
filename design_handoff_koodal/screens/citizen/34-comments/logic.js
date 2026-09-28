// render-vals.js line 3
    const mob=S.w<720,wide=S.w>=1100;const common={theme,toast:S.toast,ready:S.ready,isMobile:mob,isDesk:!mob,railW:wide?'232px':'76px',railLabels:wide,

// render-vals.js line 184
    const meName=me.name||CP.ME.name,meArea=me.area||CP.ME.area,meI=meName.split(' ').filter(Boolean).map(s=>s[0]).join('').slice(0,2).toUpperCase();

// render-vals.js line 200
        comment:(e)=>{e&&e.stopPropagation&&e.stopPropagation();if(mob)this.setState({commentsFor:i.id,cDraft:''});else this.open(i.id);},

// render-vals.js line 230
    const sendC=()=>{const t=S.cDraft.trim();if(!t||!cI)return;CP.act('comment',cI.id,t,me.anonDefault);this.buzz([6,20,6]);this.setState({cDraft:''});};

// render-vals.js line 262
        comment:e=>{e&&e.stopPropagation&&e.stopPropagation();this.buzz(6);if(mob)this.setState({commentsFor:i.id,cDraft:''});else this.setState({commentsFor:S.commentsFor===i.id?null:i.id,cModal:false,cDraft:''});}})),

// render-vals.js line 266
      commentsOpen:!!S.commentsFor&&(mob||S.cModal),closeComments:()=>this.setState({commentsFor:null,cModal:false}),

// render-vals.js line 478
      meName,meArea,meI,meFirst:meName.split(' ')[0],meVerified:!!me.verified,mePhone:CP.ME.phone,verifiedLine:'Aadhaar e-KYC (mock) · verified '+new Date(me.verifiedAt||now).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}),

// render-vals.js line 489
      shTop:mob?'auto':'0',shMax:mob?'88%':'100%',shR:mob?'26px 26px 0 0':'0',

// render-vals.js line 525
      commentsOpen:mob&&!!S.commentsFor,closeComments:()=>this.setState({commentsFor:null}),cTitle:cI?cI.title:'',cList:cI?cm(cI):[],cEmpty:!cI||!(cI.comments||[]).length,

// render-vals.js line 526
      cDraft:S.cDraft,onCDraft:e=>this.setState({cDraft:e.target.value}),onCKey:e=>{if(e.key==='Enter'){e.preventDefault();sendC();}},sendC,cSendO:S.cDraft.trim()?1:.45,