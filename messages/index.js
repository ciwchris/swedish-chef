/*-----------------------------------------------------------------------------
To learn more about this template please visit
https://aka.ms/abs-node-proactive
-----------------------------------------------------------------------------*/
"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var azure = require('azure-storage');
var path = require('path');
var got = require('got');

var useEmulator = (process.env.NODE_ENV == 'development');
var giphyApiKey = process.env.GiphyApiKey;

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);
bot.localePath(path.join(__dirname, './locale'));

// Intercept trigger event (ActivityTypes.Trigger)
bot.on('trigger', function (message) {
    var [tag, messageText] = message.value.text.split(':');
    got('https://api.giphy.com/v1/gifs/random?tag=' + encodeURIComponent(tag) + '&rating=g&api_key=' + giphyApiKey, { json: true }).then(response => {
      sendMessage(message.value, messageText, response.body.data.fixed_height_downsampled_url)
    }).catch(error => {
      sendMessage(message.value, messageText, 'https://media0.giphy.com/media/demgpwJ6rs2DS%2Fgiphy-downsized.gif')
    });
});

function sendMessage(queuedMessage, messageText, imageUrl) {
    var msg = new builder.Message()
        .address(queuedMessage.address)
        .text("This week's dinner is " + messageText);
    msg.attachmentLayout(builder.AttachmentLayout.carousel)
    msg.attachments([
        new builder.AnimationCard()
            .title('Bork bork bork!')
            .media([ { url: imageUrl } ])
    ]);

    bot.send(msg);
}

// Handle message from user
bot.dialog('/', function (session) {
    if (/^@swedishchef id/.test(session.message.text)) {
        var reply = new builder.Message()
            .address(session.message.address)
            .text(session.message.address.conversation.id + ' ' + session.message.address.bot.id);
        bot.send(reply);
    } else if (/^@swedishchef /.test(session.message.text)) {
        var reply = new builder.Message()
            .address(session.message.address);
        reply.attachmentLayout(builder.AttachmentLayout.carousel)
        reply.attachments([
            new builder.AnimationCard()
                .title('Bork bork bork!')
                .media([ { url: 'https://media0.giphy.com/media/demgpwJ6rs2DS%2Fgiphy-downsized.gif' } ])
        ]);
    }
});

if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());    
} else {
    module.exports = { default: connector.listen() }
}
