/*-----------------------------------------------------------------------------
To learn more about this template please visit
https://aka.ms/abs-node-proactive
-----------------------------------------------------------------------------*/
"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var azure = require('azure-storage');
var path = require('path');

var useEmulator = (process.env.NODE_ENV == 'development');

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
    var queuedMessage = message.value;

    var msg = new builder.Message()
        .address(queuedMessage.address)
    msg.attachmentLayout(builder.AttachmentLayout.carousel)
    msg.attachments([
        new builder.AnimationCard()
            .title('*' + queuedMessage.text + '*')
            .subtitle('Bork bork bork!')
            .media([ { url: 'https://media0.giphy.com/media/demgpwJ6rs2DS%2Fgiphy-downsized.gif' } ])
    ]);

    bot.send(msg);
});

// Handle message from user
bot.dialog('/', function (session) {

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

