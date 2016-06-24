var TelegramBot = require('node-telegram-bot-api');
var token = 'yourtokenhere';
// Setup polling way
var bot = new TelegramBot(token, {
    polling: true
});
const fs = require('fs');
var arregex = /\/.*/;
var data = fs.readFileSync('file.json');
var groupList = [];
var inlineKb = [];
const botId = 'yourbotidhere'




//start
console.log('started....' + getTime());
groupList = JSON.parse(data);
updateInline();

function updateJson() {
    var data = JSON.stringify(groupList);

    fs.writeFile('file.json', data, function(err) {
        if (err) {
            console.log('There has been an error saving your configuration data.');
            console.log(err.message);
            return;
        }

        console.log('Group list updated');
    });

}
function updateInline() {
    inlineKb = {
        "inline_keyboard": []
    };

    for (var key in groupList.list) {
        var newGroup = [{
            'text': groupList.list[key].name,
            'callback_data': String(groupList.list[key].id)
        }];
        inlineKb.inline_keyboard.push(newGroup);
    }

}



function getTime() {
    var da = new Date().toLocaleString();;
    return da;
}
//before regex commands














//after regex commands
bot.onText(/zxc/, function(msg, match) {
    bot.sendMessage(msg.chat.id, 'Change group to..', {
        reply_markup: inlineKb
    });
});
bot.on('message', function(msg) {
    //console.log(JSON.stringify(msg));
    if (msg.hasOwnProperty('new_chat_participant')) {
      if (msg.new_chat_participant.id == botId) {
        if (groupList.list[msg.chat.id] == undefined) {
            var newGroup = {
                'id': msg.chat.id,
                'name': msg.chat.title
            }
            groupList.list[msg.chat.id] = newGroup;
            console.log('Added to ' + msg.chat.title + 'by ' + msg.from.first_name + msg.from.last_name);
            console.log(JSON.stringify(groupList));
            updateJson();
            updateInline();
        }


        }
    }
    if (msg.chat.id < 0) {
        if (groupList.list[msg.chat.id] == undefined) {
            var newGroup = {
                'id': msg.chat.id,
                'name': msg.chat.title
            }
            groupList.list[msg.chat.id] = newGroup;
            console.log('Added to ' + msg.chat.title);
            console.log(JSON.stringify(groupList));
            updateJson();
            updateInline();
        }
    }


    if (msg.hasOwnProperty('left_chat_participant')) {
      if (msg.left_chat_participant.id == botId) {
            console.log('Kicked from ' + msg.chat.title + 'by ' + msg.from.first_name + msg.from.last_name);
            delete groupList.list[msg.chat.id];
            updateJson();
            updateInline();

        }
    } else if (msg.from.id == msg.chat.id) {
        if ((groupList.now[msg.from.id] !== undefined) && msg.hasOwnProperty('sticker')) {
            bot.sendSticker(groupList.now[msg.from.id].grpid, msg.sticker.file_id);
            bot.sendMessage(msg.from.id, 'Sticker has been sent to ' + groupList.now[msg.from.id].grpname);
            console.log('Sticker sent to '+ groupList.now[msg.from.id].grpname+ ' by '+groupList.now[msg.from.id].username )
        } else {
            if ((groupList.now[msg.from.id] !== undefined) && (!arregex.test(msg.text)) && (msg.text != 'zxc')) {
                bot.sendMessage(groupList.now[msg.from.id].grpid, msg.text);
                bot.sendMessage(msg.from.id, 'Message has been sent to ' + groupList.now[msg.from.id].grpname);
                console.log('Message:' + msg.text+'\nsent to '+ groupList.now[msg.from.id].grpname+ ' by '+groupList.now[msg.from.id].usrname )
            }
        }
    }
});
bot.on('callback_query', function(callback) {
    //console.log(JSON.stringify(callback));
    if (groupList.list[callback.data] == undefined) {
        bot.sendMessage(callback.from.id, 'Group does not exist');

    } else {
        var newUser = {
            'grpid': groupList.list[callback.data].id,
            'grpname': groupList.list[callback.data].name,
            'usrid': callback.from.id,
            'usrname': callback.from.first_name + callback.from.last_name
        }
        groupList.now[callback.from.id] = newUser;
        console.log('Added ' + callback.from.first_name + callback.from.last_name);
        updateJson();

        bot.sendMessage(callback.from.id, 'Group changed to ' + groupList.now[callback.from.id].grpname + '\n id: ' + groupList.now[callback.from.id].grpid);
    }

});
