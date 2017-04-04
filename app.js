
var restify = require('restify');
var builder = require('botbuilder');
var questionsRepository = require('./questions.js');
var config = require('./config');

// Create bot and add dialogs
var connector = new builder.ChatConnector({
    appId: config.get('botFramework:appId'),
    appPassword: config.get('botFramework:appPassword')
});

var bot = new builder.UniversalBot(connector);
bot.dialog('/', [
    function (session) {
        delayedMessage(session,"Hey Tony, it's Jarvis CLI here! 🤖", 2000, function(){
         session.send("If I may, I want to ask you a few questions..");
         session.send("for identification of course 😈");
        session.beginDialog('/questionsDialog');
        });

    }
]);

bot.dialog('/questionsDialog', createQuestionsWaterfall(questionsRepository.questionList[0].questions));

function delayedMessage(session,message, delay, next){
    session.sendTyping();
    setTimeout(function(){
        session.send(message);
        next();
    }, delay || 1000);
}

function createQuestionsWaterfall(questionCollection) {
    var waterfall = [];
    waterfall.push(function (session) {
        session.sendTyping();
        setTimeout(function(){
        builder.Prompts.text(session, 'Are you ready?');

        }, 1000);
        
    });

    waterfall.push(function (session, results, next) {
        session.send("Great, let's start! 💪");
        next();
    });

    questionCollection.forEach(function (q, index) {
        waterfall.push(
            function (session, results) {
                session.sendTyping();
                setTimeout(function(){
                var question = questionCollection[index];
                if (results && results.response) {
                    if (results.response.index == questionCollection[index - 1].correctAnswer) {
                        session.send(GetRandomSuccessAnswer());
                         session.dialogData.correct=session.dialogData.correct+1;
                    }
                    else {
                        session.send(GetRandomFailAnswer());
                        session.dialogData.incorrect=session.dialogData.incorrect+1;
                    }
                    if(questionCollection.length - 1==index) {
                        session.sendTyping();
                        session.send("Ok, Last question");
                    }
                    else if(Math.random()<0.3)
                    {
                        session.sendTyping();
                        session.send("Ok, Next question");
                    }
                }
                session.sendTyping();
                setTimeout(function(){
                builder.Prompts.choice(session, question.text, question.answers);},3000);
            },1500);}
        );
    });

    waterfall.push(
        function (session, results) {
            var question = questionCollection[questionCollection.length - 1];
            if (results && results.response) {
                if (results.response.index == question.correctAnswer) {
                    session.send(GetRandomSuccessAnswer());
                    session.dialogData.correct=session.dialogData.correct+1;
                }
                else {
                    session.send(GetRandomFailAnswer());
                    session.dialogData.incorrect=session.dialogData.incorrect+1;
                }
            }
            if(session.dialogData.correct >= 1)
            {
                session.sendTyping();
                session.send("I knew all time it was you Tony!");
                session.send("The password to turn the suit on is 1234. Good luck!");
            } else{
                session.sendTyping();
                session.send("Too bad.. I thought it was you Tony...");
                session.sendTyping();
                session.send("Want to try again? I hope this time it'll be you, Tony.");
                session.beginDialog('/questionsDialog');         
           }
        }
    );

    return waterfall;
}



function GetRandomSuccessAnswer(){
    var answers = [
    "✔️ Yes! you got it right, Tony!",
    "✔️ Way the go, Tony! :-)"];
    return answers[Math.floor(Math.random()*answers.length)];


}

function GetRandomFailAnswer(){
var answers =[
    "❌ Nope.. comeon, even the Hulk knows that...",
    "❌ Wrong, are you feeling well today, Tony?"];
return answers[Math.floor(Math.random()*answers.length)];
}

// Setup Restify Server
var server = restify.createServer();
server.post('/api/messages', connector.listen());
server.listen(process.env.PORT || 3978, function () {
    console.log('%s listening to you at %s', server.name, server.url);
});
