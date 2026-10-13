(function(global){
  "use strict";
  const coachGradeLetter=score=>score>=95?'A+':score>=90?'A':score>=87?'A-':score>=84?'B+':score>=80?'B':score>=77?'B-':score>=74?'C+':score>=70?'C':score>=67?'C-':score>=64?'D+':score>=60?'D':'F';
  const rankPercentile=(value,values,higher=true)=>{
    if(!Number.isFinite(value))return null;
    const clean=values.filter(Number.isFinite).map(number=>higher?number:-number).sort((a,b)=>a-b);
    const candidate=higher?value:-value;
    if(!clean.length)return null;
    if(clean.length===1)return .5;
    const below=clean.filter(number=>number<candidate).length;
    const equal=clean.filter(number=>number===candidate).length;
    return Math.max(0,Math.min(1,(below+(equal-1)/2)/(clean.length-1)));
  };
  const peerGrade=(value,values)=>{
    const percentile=rankPercentile(value,values);
    return percentile===null?null:Math.round(55+44*percentile);
  };
  const calculateCoachScores=(item,pool=global.COURTSIDE_COACH_STATS||[])=>{
    const games=record=>(record?.wins||0)+(record?.losses||0);
    const winRate=record=>games(record)?record.wins/games(record):null;
    const beforeSeason=(career,season)=>({
      wins:Math.max(0,(career?.wins||0)-(season?.wins||0)),
      losses:Math.max(0,(career?.losses||0)-(season?.losses||0))
    });
    const rankPercentile=(value,values,higher=true)=>{
      if(!Number.isFinite(value))return null;
      const clean=values.filter(Number.isFinite).map(number=>higher?number:-number).sort((a,b)=>a-b);
      const candidate=higher?value:-value;
      if(!clean.length)return null;
      if(clean.length===1)return .5;
      const below=clean.filter(number=>number<candidate).length;
      const equal=clean.filter(number=>number===candidate).length;
      return Math.max(0,Math.min(1,(below+(equal-1)/2)/(clean.length-1)));
    };
    const makeGrade=(components,provisional=false)=>{
      const points=components.map(component=>{
        const eligible=component.enabled!==false&&Number.isFinite(component.value);
        return {...component,percentile:eligible?rankPercentile(component.value,component.values,component.higher!==false):null};
      });
      const eligible=points.filter(component=>Number.isFinite(component.percentile));
      const weight=eligible.reduce((sum,component)=>sum+component.weight,0);
      const weighted=eligible.reduce((sum,component)=>sum+component.percentile*component.weight,0);
      const total=weight?Math.round(55+44*weighted/weight):null;
      return {total,letter:total===null?'NR':coachGradeLetter(total),provisional:total!==null&&provisional,points};
    };
    const careerProfile=coach=>{
      const regular=beforeSeason(coach.careerRegular,coach.season2026);
      const playoffs=beforeSeason(coach.careerPlayoffs,coach.seasonPlayoffs2026);
      const finals=(coach.finalsYears||[]).filter(year=>year<2026);
      const titles=(coach.titles||[]).filter(year=>year<2026);
      return {
        regularGames:games(regular),
        regularRate:winRate(regular),
        playoffGames:games(playoffs),
        playoffRate:winRate(playoffs),
        finalsCount:finals.length,
        titleConversion:finals.length?titles.length/finals.length:null,
        finalsPace:finals.length&&Number.isFinite(coach.seasonsToFirstFinal)?coach.seasonsToFirstFinal:null
      };
    };
    const profiles=pool.map(coach=>({coach,profile:careerProfile(coach)}));
    const career=careerProfile(item);
    const pctLabel=value=>Number.isFinite(value)?(value*100).toFixed(1)+'%':'no eligible sample';
    const careerGrade=makeGrade([
      {label:'Career WNBA regular-season win rate · through 2025',value:career.regularRate,valueText:pctLabel(career.regularRate),values:profiles.filter(row=>row.profile.regularGames>=44).map(row=>row.profile.regularRate),weight:.45,enabled:career.regularGames>=44,missingReason:career.regularGames<44?'Fewer than 44 prior WNBA games':'Not eligible'},
      {label:'Career WNBA playoff win rate · through 2025',value:career.playoffRate,valueText:pctLabel(career.playoffRate),values:profiles.filter(row=>row.profile.playoffGames>=8).map(row=>row.profile.playoffRate),weight:.25,enabled:career.playoffGames>=8,missingReason:'Requires at least 8 prior WNBA playoff games'},
      {label:'WNBA title conversion among Finals trips',value:career.titleConversion,valueText:career.finalsCount?Math.round(career.titleConversion*100)+'% · '+career.finalsCount+' Finals trip'+(career.finalsCount===1?'':'s'):'no prior Finals',values:profiles.filter(row=>row.profile.finalsCount>0).map(row=>row.profile.titleConversion),weight:.20,enabled:career.finalsCount>0,missingReason:'No WNBA Finals sample through 2025'},
      {label:'Time to first WNBA Finals',value:career.finalsPace,valueText:career.finalsPace?'season '+career.finalsPace:'no prior Finals',values:profiles.filter(row=>row.profile.finalsCount>0&&Number.isFinite(row.profile.finalsPace)).map(row=>row.profile.finalsPace),weight:.10,higher:false,enabled:career.finalsCount>0,missingReason:'No WNBA Finals sample through 2025'}
    ],career.regularGames>0&&(career.regularGames<88||career.playoffGames<8));
    const stagePoints={missed:0,quarterfinal:1,semifinal:2,finalist:3,champion:4};
    const formProfile=coach=>{
      const currentTeam=coach.team2026,priorTeam=coach.team2025;
      const finals=(coach.finalsYears||[]);
      const priorFinals=finals.some(year=>year<2026);
      return {
        regularRate:winRate(coach.season2026),
        playoffStage:stagePoints[coach.playoffStage2026]??null,
        improvement:priorTeam&&currentTeam?winRate(currentTeam)-winRate(priorTeam):null,
        impact:coach.impactNote&&coach.impactSource?Number(coach.impactPoints||0):null,
        coty:(coach.coyYears||[]).includes(2026)?1:0,
        firstFinal:finals.includes(2026)&&!priorFinals?1:0
      };
    };
    const form=formProfile(item);
    const formProfiles=pool.map(coach=>formProfile(coach));
    const formGrade=makeGrade([
      {label:'2026 regular-season win percentage',value:form.regularRate,valueText:pctLabel(form.regularRate),values:formProfiles.map(profile=>profile.regularRate),weight:.35},
      {label:'2026 playoff stage reached',value:form.playoffStage,valueText:['missed playoffs','quarterfinal','semifinal','Finals','champion'][form.playoffStage]||'no playoff sample',values:formProfiles.map(profile=>profile.playoffStage),weight:.30},
      {label:'2025–26 team win-rate change',value:form.improvement,valueText:Number.isFinite(form.improvement)?(form.improvement>=0?'+':'')+(form.improvement*100).toFixed(1)+' percentage points':'no comparable 2025 team record',values:formProfiles.map(profile=>profile.improvement),weight:.15,enabled:Number.isFinite(form.improvement),missingReason:'No comparable 2025 team record'},
      {label:'Documented program or culture impact',value:form.impact,valueText:Number.isFinite(form.impact)?'evidence score '+form.impact+'/2.5':'no source-coded evidence',values:formProfiles.map(profile=>profile.impact),weight:.10,enabled:Number.isFinite(form.impact),missingReason:'No source-coded impact note; this category is omitted, not scored zero'},
      {label:'2026 Coach of the Year',value:form.coty,valueText:form.coty?'Awarded':'Not awarded',values:formProfiles.map(profile=>profile.coty),weight:.05},
      {label:'First WNBA Finals appearance in 2026',value:form.firstFinal,valueText:form.firstFinal?'First-ever Finals trip':'No first Finals trip this season',values:formProfiles.map(profile=>profile.firstFinal),weight:.05}
    ]);
    return {legacy:careerGrade,form:formGrade};
  };
  global.WKNBCoachGrades={coachGradeLetter,peerGrade,calculateCoachScores};
})(window);
