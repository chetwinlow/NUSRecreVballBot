# NUSRecreVballBot
A telegram bot that is connected to Google Sheets made for scheduling training timeslots


Steps:
1. Use BotFather on telegram to register a bot and get a bot id
2. Create or use an existing google sheet that you wish to connect your bot to
3. In the main page of the new google sheet, click on Script Editor in the Tools dropdown menu
4. Copy paste the code in the NUSRecreVballBot.js file
5. To deploy the web application, click on Deploy at the top right hand corner of the script editor page
6. Select New Deployment
7. Change the Who Has Access setting to Anyone so that anyone can write to your Google Sheet
8. After deploying the Web App, copy and paste the URL into the script under Web server URL
9. Fill in your bot's ID and your google sheet's ID in their respectively placeholders in the script
10. Search for '@yourBotsUsername'
11. Test out the bot's functionalities using Telegram!



Functionalities (typed out in a private chat with the bot):
1. 'start'
- Initialises a poll about the training dates you are able to attend
- If you have an existing booking, it overwrites the old one
- If you don not have an existing booking, it creates a new one

2. 'remove'
- Removes your Google sheet entry about your current booking

3. 'check count'
- Shows the number of people attending each training timeslot

4. 'check booking'
- Shows your current timeslot booking
