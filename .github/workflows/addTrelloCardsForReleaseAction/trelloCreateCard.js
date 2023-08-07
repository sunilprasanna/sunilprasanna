import fetch from "node-fetch";
import * as core from "@actions/core";
import * as github from "@actions/github";

try {
  const newCardName = core.getInput("name-of-card");
  console.log(`New Card Name: ${newCardName}`);
  const cardDescription = core.getInput("description-of-card");
  const PRLink = core.getInput("pr-link");
  const trelloKey = core.getInput("trello-api-key");
  const trelloToken = core.getInput("trello-api-token");
  const baseUrl =
    "https://api.trello.com/1/cards?idList=64badf32182ac7d928d9304f";
  const trelloAPIUrl =
    "${baseUrl}&name=${newCardName}&desc=${cardDescription}&urlSource=${PRLink}&key=${trelloKey}&token=${trelloToken}";
  console.log(`Trello API URL: ${trelloAPIUrl}`);
  fetch(trelloAPIUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  })
    .then((response) => {
      console.log(`Response: ${response.status} ${response.statusText}`);
      return response.text();
    })
    .then((text) => console.log(text))
    .catch((err) => console.error(err));

  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2);
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}
