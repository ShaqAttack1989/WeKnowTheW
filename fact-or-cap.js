(function(){
  "use strict";
  var questions=Array.isArray(window.FACT_OR_CAP_QUESTIONS)?window.FACT_OR_CAP_QUESTIONS:[];
  var sources=window.FACT_OR_CAP_SOURCES||{};
  var card=document.querySelector(".fact-cap-card");
  var finish=document.getElementById("fcFinish");
  var prompt=document.getElementById("fcPrompt");
  var category=document.getElementById("fcCategory");
  var counter=document.getElementById("fcCounter");
  var percent=document.getElementById("fcPercent");
  var progress=document.getElementById("fcProgress");
  var bar=document.querySelector(".fact-cap-progress");
  var scoreNode=document.getElementById("fcScore");
  var feedback=document.getElementById("fcFeedback");
  var next=document.getElementById("fcNext");
  var sourceList=document.getElementById("fcSourceList");
  var finishTitle=document.getElementById("fcFinishTitle");
  var finishText=document.getElementById("fcFinishText");
  var answerButtons=Array.prototype.slice.call(document.querySelectorAll(".fact-cap-answer"));
  var deck=[],index=0,score=0,answered=false;

  function escapeHtml(value){
    return String(value==null?"":value).replace(/[&<>"']/g,function(ch){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch];});
  }
  function shuffle(items){
    var result=items.slice();
    for(var i=result.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var temp=result[i];result[i]=result[j];result[j]=temp;}
    return result;
  }
  function renderSourceShelf(){
    var entries=Object.keys(sources);
    sourceList.innerHTML=entries.map(function(key){
      var item=sources[key];
      var tag=(key==="quizletStart"||key==="expoStart")?" · starting reference":"";
      return '<a href="'+escapeHtml(item.url)+'" target="_blank" rel="noopener noreferrer">'+escapeHtml(item.label)+tag+' ↗</a>';
    }).join("");
  }
  function updateProgress(){
    var total=deck.length||questions.length;
    var done=Math.min(index+(answered?1:0),total);
    var pct=total?Math.round(done/total*100):0;
    counter.textContent="Question "+(Math.min(index+1,total))+" of "+total;
    percent.textContent=pct+"%";
    progress.style.width=pct+"%";
    bar.setAttribute("aria-valuenow",String(done));
    bar.setAttribute("aria-valuemax",String(total));
    scoreNode.textContent=String(score);
  }
  function renderQuestion(){
    if(!questions.length){
      prompt.textContent="The question set could not be loaded.";
      return;
    }
    var item=deck[index];
    answered=false;
    prompt.textContent=item.claim;
    category.textContent=item.category;
    feedback.hidden=true;
    feedback.className="fact-cap-feedback";
    next.hidden=true;
    answerButtons.forEach(function(button){button.disabled=false;button.setAttribute("aria-pressed","false");});
    updateProgress();
  }
  function answer(choice){
    if(answered||!deck[index])return;
    answered=true;
    var item=deck[index];
    var isCorrect=choice===item.answer;
    if(isCorrect)score++;
    answerButtons.forEach(function(button){
      button.disabled=true;
      button.setAttribute("aria-pressed",button.getAttribute("data-answer")===choice?"true":"false");
    });
    var sourceLinks=(item.sources||[]).map(function(key){
      var source=sources[key];
      return source?'<a href="'+escapeHtml(source.url)+'" target="_blank" rel="noopener noreferrer">'+escapeHtml(source.label)+' ↗</a>':"";
    }).filter(Boolean);
    feedback.className="fact-cap-feedback "+(isCorrect?"correct":"incorrect");
    feedback.innerHTML="<strong>"+(isCorrect?"That’s "+item.answer+" — nice call.":"That’s "+item.answer+". Here’s the receipt.")+"</strong><p>"+escapeHtml(item.explanation)+"</p>"+(sourceLinks.length?'<p class="fact-cap-receipt">Source: '+sourceLinks.join(" · ")+"</p>":"");
    feedback.hidden=false;
    next.textContent=index===deck.length-1?"See your round →":"Next question →";
    next.hidden=false;
    updateProgress();
  }
  function showFinish(){
    card.hidden=true;
    finish.hidden=false;
    finishTitle.textContent=score+" of "+deck.length+" correct";
    var pct=deck.length?Math.round(score/deck.length*100):0;
    finishText.textContent="You finished all 150 Black Hair 101 questions with "+pct+"% correct. Start a fresh shuffled round whenever you’re ready.";
    document.getElementById("fcRestart").focus();
  }
  function startRound(){
    if(questions.length!==150){
      prompt.textContent="The Kitchen set is incomplete. Please reload in a moment.";
      return;
    }
    deck=shuffle(questions);
    index=0;
    score=0;
    card.hidden=false;
    finish.hidden=true;
    renderQuestion();
  }
  answerButtons.forEach(function(button){button.addEventListener("click",function(){answer(button.getAttribute("data-answer"));});});
  next.addEventListener("click",function(){if(index>=deck.length-1){showFinish();return;}index++;renderQuestion();});
  document.getElementById("fcRestart").addEventListener("click",startRound);
  document.getElementById("fcRestartTop").addEventListener("click",startRound);
  renderSourceShelf();
  startRound();
})();
