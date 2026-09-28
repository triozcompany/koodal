// render-vals.js line 3
    const mob=S.w<720,wide=S.w>=1100;const common={theme,toast:S.toast,ready:S.ready,isMobile:mob,isDesk:!mob,railW:wide?'232px':'76px',railLabels:wide,

// render-vals.js line 234
    const addETag=()=>{const t=norm(S.eTag);if(t&&!S.eTags.includes(t))this.setState({eTags:[...S.eTags,t],eTag:''});else this.setState({eTag:''});};

// render-vals.js line 386
      eImgs:eI?eI.evidence.filter(e=>e.uid==='me').map(e=>({ago:CP.ago(e.ts),remove:()=>{this.buzz(10);CP.act('removePhoto',eI.id,e.ts);this.toast('Photo removed');}})):[],eImgN:eI?String(eI.evidence.filter(e=>e.uid==='me').length):'0',

// render-vals.js line 387
      addEImg:()=>{if(!eI)return;this.buzz([8,20,8]);CP.act('evidence',eI.id);this.toast('Photo added');},

// render-vals.js line 489
      shTop:mob?'auto':'0',shMax:mob?'88%':'100%',shR:mob?'26px 26px 0 0':'0',

// render-vals.js line 527
      editOpen:!!S.editFor,closeEdit:()=>this.setState({editFor:null}),eTitle:S.eTitle,eText:S.eText,onETitle:e=>this.setState({eTitle:e.target.value}),onEText:e=>this.setState({eText:e.target.value}),

// render-vals.js line 528
      eTagList:S.eTags.map(t=>({t,remove:()=>this.setState({eTags:S.eTags.filter(x=>x!==t)})})),eTag:S.eTag,onETag:e=>this.setState({eTag:e.target.value}),addETag,onETagKey:e=>{if(e.key==='Enter'){e.preventDefault();addETag();}},

// render-vals.js line 529
      saveEdit:()=>{if(!eI)return;CP.act('editReport',eI.id,{title:S.eTitle.trim()||eI.title,text:S.eText.trim(),tags:S.eTags});this.buzz([8,30,8]);this.setState({editFor:null});this.toast('Report updated');},

// render-vals.js line 530
      noDelAsk:!S.delAsk,delAsk:S.delAsk,askDelete:()=>{this.buzz(14);this.setState({delAsk:true});},cancelDelete:()=>this.setState({delAsk:false}),eSup:eI?eI.sup:0,

// render-vals.js line 531
      confirmDelete:()=>{if(!eI)return;const wasCur=S.cur===eI.id;CP.act('deleteReport',eI.id);this.buzz([20,40,20]);this.setState({editFor:null,delAsk:false});this.toast('Report deleted');if(wasCur)this.go(S.prev==='profile'?'profile':'home',{cur:'CP-2107'});},