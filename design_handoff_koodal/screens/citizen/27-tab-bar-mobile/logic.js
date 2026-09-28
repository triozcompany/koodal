// render-vals.js line 71
      showTabs:mob&&['home','cases','validate','profile'].includes(scr)&&!S.filterOpen,

// render-vals.js line 72
      goHome:()=>this.go('home'),goSearch:()=>this.go('search'),goReport:()=>this.go('report'),goCase:()=>this.go('case'),goTimeline:()=>this.go('timeline'),goVerify:()=>this.go('verify'),goDetail:()=>{const hs=this.state.hist||[];const t=hs[hs.length-1];if(t&&t.s==='detail')this.goBack();else this.go('detail');},goCases:()=>this.go('cases'),

// render-vals.js line 86
      tabsL:[tab('home','ph-map-trifold','Nearby'),tab('cases','ph-briefcase','Cases',needConfirm?String(needConfirm):'')],tabsR:[tab('validate','ph-cards','Validate'),tab('profile','ph-user','You')],

// render-vals.js line 480
      goReport:()=>this.go('report',{desc:'',tags:[],tagDraft:'',descMode:'text',voice:'idle',an:null}),

// render-vals.js line 482
      tabsL:[tab('home','ph-map-trifold','Nearby'),tab('feed','ph-newspaper','Feed')],tabsR:[tab('search','ph-magnifying-glass','Search'),tab('cases','ph-briefcase','Cases',needConfirm?String(needConfirm):'')],

// render-vals.js line 483
      showTabs:mob&&['home','feed','search','cases'].includes(scr)&&!S.filterOpen&&!S.commentsFor,