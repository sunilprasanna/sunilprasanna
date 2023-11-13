import fetch from "node-fetch";
import { google } from 'googleapis';
import * as core from "@actions/core";

// Trello information
const originalListId = "6552578a661340b63a168cf0"
const destinationListId = "6552578f468213b532111581";
const trelloKey = core.getInput("trello-api-key");
const trelloToken = core.getInput("trello-api-token");

// Google Sheets information
const SPREADSHEET_ID = '1_8vJIbdLqSy65mSHR2sGCGXhzBfT_z0ZwIQ8fuqUR9k';
const SHEET_NAME = 'Sheet1';

// Slack information
const SLACK_WEBHOOK_URL = core.getInput("slack-webhook");

let trelloMembers = [];

async function getCards(listId) {
    const url = `https://api.trello.com/1/lists/${listId}/cards?key=${trelloKey}&token=${trelloToken}`;
    const response = await fetch(url);
    if (response.ok) {
        console.log("Got cards")
        return await response.json();
    } else {
        throw new Error(`Failed to fetch cards: ${await response.text()}`);
    }
}

// Function to move a card to another list and set the due date
async function moveCard(cardId, destinationListId) {
    const url = `https://api.trello.com/1/cards/${cardId}?key=${trelloKey}&token=${trelloToken}`;
    const data = new URLSearchParams({
        idList: destinationListId
    });
    const response = await fetch(url, {
        method: 'PUT',
        body: data,
    });
    if (response.ok) {
        console.log(`Card ${cardId} moved successfully.`);
    } else {
        console.error(`Error moving card ${cardId}: ${await response.text()}`);
    }
}

// Move all cards from the source list to the destination list with a due date
async function moveAllCards() {
    try {
        const cards = await getCards(originalListId);
        for (const card of cards) {
            trelloMembers.push(card.idMembers);
            await moveCard(card.id, destinationListId);
        }
    } catch (error) {
        console.error(error);
    }
}
async function getAssignedUsers() {
    // Set up the Google API client
    const auth = new google.auth.GoogleAuth({
        keyFile: '.github/workflows/configurations/googleCloudGithubActionsCredentials.json', // Path to your Google service account key file
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const range = `${SHEET_NAME}!C2:D`; // Adjust range accordingly

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range,
        });

        const rows = response.data.values;
        const mapping = rows.reduce((acc, [trelloUsername, slackMemberId]) => {
            acc[trelloUsername] = slackMemberId;
            return acc;
        }, {});

        return mapping;
    } catch (err) {
        console.error('The API returned an error: ' + err);
        throw err;
    }
}

function getValuesFromKeys(object, keysArray) {
    return keysArray.map(key => object[key]).filter(value => value !== undefined);
}

async function notifyOnSlack(assignedUsers) {
    const message = 'The release has been cut, the following engineers please complete your testing!'; // Modify with actual message content
    // Here you would format the message to include the tags for the assigned users
    const slackIds = getValuesFromKeys(assignedUsers, trelloMembers);
    slackIds.forEach(id => message.concat(`<!@${id}>,`))
    const response = await fetch(SLACK_WEBHOOK_URL, {
        method: 'POST',
        body: JSON.stringify({ text: message }),
        headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
        throw new Error(`Error in Slack API: ${response.statusText}`);
    }
}

async function main() {
    try {
        const movedCards = await moveAllCards();
        const assignedUsers = await getAssignedUsers();
        await notifyOnSlack(assignedUsers, movedCards);
        console.log('Trello cards moved and notifications sent.');
    } catch (error) {
        console.error(error);
    }
}

main();
