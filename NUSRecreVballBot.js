var token = //<your telegram bot id>
var URL = `https://api.telegram.org/bot${token}`
var webAppURL = //<URL of your deployed web server for listening to events>
var ssId = //<your google spread sheet id>;

    function getMe () {
        var response = UrlFetchApp.fetch(URL + "/getMe")
        Logger.log(response.getContentText())
    }

function setWebHook () {
    var url = URL + "/setWebhook?url=" + webAppURL;
    var response = UrlFetchApp.fetch(url);
    Logger.log(response.getContentText())
}

function sendText (id, text, keyBoard) {
    var data = {
        method: "post",
        payload: {
            method: "sendMessage",
            chat_id: String(id),
            text: text,
            parse_mode: "HTML",
            reply_markup: JSON.stringify(keyBoard)
        }
    };
    UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/', data);
}

function sendPoll (id, text, options) {
    var data = {
        method: "post",
        payload: {
            method: "sendPoll",
            chat_id: String(id),
            question: text,
            options: JSON.stringify(options),
            is_anonymous: false,
            allows_multiple_answers: true
        }
    };
    UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/', data);
}


function doGet (e) {
    return HtmlService.createHtmlOutput('hi there')
}

var keyBoard = {
    "inline_keyboard": [
        [{
            "text": "Monday",
            'callback_data': 'monday'
        }],
        [{
            "text": "Wednesday",
            'callback_data': 'wednesday'
        }],
        [{
            "text": "Friday",
            'callback_data': 'friday'
        }],
    ]
};

var keyBoard2 = {
    "inline_keyboard": [
        [{
            "text": "Yes",
            'callback_data': 'yes'
        }],
        [{
            "text": "No",
            'callback_data': 'no'
        }],
    ]
};


var keyBoard3 = {
    "inline_keyboard": [
        [{
            "text": "Confirm",
            'callback_data': 'confirm'
        }],
        [{
            "text": "Cancel",
            'callback_data': 'cancel'
        }],
    ]
};



var option = [
    "1. Confirmed slot: Monday",
    "1. Confirmed slot: Wednesday",
    "1. Confirmed slot: Friday",
    "2. Waiting list slot: Monday",
    "2. Waiting list slot: Wednesday",
    "2. Waiting list slot: Friday",
    "3. Yes im hella experienced",
    "3. No im a newbieee"
]

function confirmer (id, arr, e) {
    doPost(e)
    sendText(id, String(arr))
}

function searchUser (username, sheet) {
    const dataRange = sheet.getDataRange()
    var lastRow = dataRange.getLastRow()
    if (lastRow < 8) {
        return -1;
    }
    var searchRange = sheet.getRange(8, 3, lastRow - 1, 1)
    var rangeValues = searchRange.getValues();
    for (i = 0; i < lastRow - 1; i++) {
        if (rangeValues[i][0] == username) {
            return i + 8;
        }
    }
    return -1;
}

//edit existing response
function responseEditor (id, sheet, editedArr, rowNum) {
    const range = "D" + rowNum + ":" + "F" + rowNum;
    sheet.getRange(range).setValues([editedArr])
    sendText(id, "Since you have an existing booking, it has been updated!")
}

//append da array
function responseAppender (id, sheet, arr) {
    sheet.appendRow(arr)
    sendText(id, "This is your first booking!")
}

//delete row
function responseDeletor (id, sheet, rowNum) {
    sheet.deleteRow(rowNum)
    sendText(id, "Booking successfully removed! Type 'start' to make a new one!")
}

//validator
function voteValidator (arr) {
    return arr.length == 3 && (arr[0] >= 0 && arr[0] <= 2) && (arr[1] >= 3 && arr[1] <= 5) && (arr[2] >= 6 && arr[2] <= 7)
}

var index2options = ["Mon", "Wed", "Fri", "Mon", "Wed", "Fri", "Yesh", "Nope"];

function doPost (e) {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.openById(ssId).getSheets()[0]
    if (data.poll_answer) {
        var poll_id = data.poll_answer.poll_id
        var id = data.poll_answer.user.id
        var answer = data.poll_answer.option_ids
        if (!voteValidator(answer)) {
            sendPoll(id, "Invalid selections!!! Please select only 1 from each category", option)
        } else {
            sendText(id, `Current selection:\nConfirmed slot: ${index2options[answer[0]]}\nWaiting list slot: ${index2options[answer[1]]}\nExperienced: ${index2options[answer[2]]}`, keyBoard3)
        }
    } else if (data.callback_query) {
        var from = data.callback_query.from
        if (data.callback_query.data == "yes") {
            const rowIndex = searchUser(from.username, sheet);
            if (rowIndex == -1) {
                sendText(from.id, "Bodoh you don't even have a booking! Type 'start' to make one!!")
            } else {
                responseDeletor(from.id, sheet, rowIndex)
            }
        } else if (data.callback_query.data == "confirm") {
            var question = data.callback_query.message.text
            var fullname = from.first_name + " " + from.last_name
            var response = [Date(), fullname, from.username];
            response.push(question.slice(35, 38))
            response.push(question.slice(58, 61))
            response.push(question.slice(75, 79))
            const rowIndex = searchUser(from.username, sheet);
            if (rowIndex == -1) {
                responseAppender(from.id, sheet, response)
            } else {
                responseEditor(from.id, sheet, response.slice(3, 6), rowIndex)
            }
        } else if (data.callback_query.data == "cancel") {
            sendText(from.id, "Type start to Make your booking!")
        } else if (data.callback_query.data == "no") {
            sendText(from.id, "Ok bai bai!")
        }
    } else if (data.message) {
        var id = data.message.chat.id;
        if (data.message.text == 'start') {

            sendPoll(id, "Pls only choose 1 option for each question, if there are multiple selection for 1 question, we will take the earliest selection", option)
        } else if (data.message.text == 'remove') {
            sendText(id, "Are you sure you want to remove your booking?", keyBoard2);
        } else if (data.message.text == 'check count') {
            var searchRange = sheet.getRange("B2:D4")
            var data = searchRange.getValues();
            var fullstring = `This is the current count:\nMonday - ${data[0][0]} confirmed, ${data[0][1]} waiting list, ${data[0][2]} total\nWednesday - ${data[1][0]} confirmed, ${data[1][1]} waiting list, ${data[1][2]} total\nFriday - ${data[2][0]} confirmed, ${data[2][1]} waiting list, ${data[2][2]} total`
            sendText(id, fullstring)
        } else if (data.message.text == 'check booking') {
            const rowIndex = searchUser(data.message.from.username, sheet);
            if (rowIndex == -1) {
                sendText(id, "You don't have a booking bro, type 'start' to make one")
            } else {
                const range = "D" + rowIndex + ":" + "F" + rowIndex;
                const data = sheet.getRange(range).getValues();
                const fullstring = `This is your current booking:\nConfirmed - ${data[0][0]}\nWaiting list - ${data[0][1]}\nExperienced - ${data[0][2]}\ntype 'start' to change or 'remove' to remove your current booking!`
                sendText(id, fullstring);
            }
        }
    }
}
