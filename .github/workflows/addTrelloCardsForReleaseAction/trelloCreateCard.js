import fetch from "node-fetch";
import * as core from "@actions/core";
import * as github from "@actions/github";

// this is to force a PR again

try {
  const milestoneLabel = core.getInput("milestone-label")
  let labelId = null;
  const baseUrl = "https://api.trello.com/1/"
  const boardId = "64badf2c41a65ee0a368f7d1"
  const listId = "64badf32182ac7d928d9304f"
  const trelloKey = core.getInput("trello-api-key");
  const trelloToken = core.getInput("trello-api-token");
  const tokenQueryStrings = `&key=${trelloKey}&token=${trelloToken}`
  const trelloAPIBoardUrl = `${baseUrl}boards/${boardId}/labels?fields=id&fields=name${tokenQueryStrings}`
  const trelloAPILabelUrl = `${baseUrl}labels?name=${milestoneLabel}&color=blue&idBoard=${boardId}${tokenQueryStrings}`
    console.log(`Trello API Board URL: ${trelloAPIBoardUrl}`);
    fetch(trelloAPIBoardUrl, {
        method: "GET",
        headers: {
            Accept: "application/json",
        },
    })
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            data.forEach(item => {
                if(item => item.name === milestoneLabel){
                    labelId = item.name;
                }
            });

            if(labelId === null)
            {
                fetch(trelloAPILabelUrl, {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                    },
                })
                    .then((response) => {
                        console.log(`Response: ${response}`);
                        labelId = response.json().id;
                    })
                    .catch((err) => console.error(err));
            }
        })
        .catch((err) => console.error(err.message));
  const newCardName = core.getInput("name-of-card");
  const cardDescription = core.getInput("description-of-card");
  const PRLink = core.getInput("pr-link");
  const labelsArray = [labelId];
  const baseCardUrl =
      `${baseUrl}cards?idList=${listId}`;
  const trelloAPICardUrl = `${baseCardUrl}&name=${newCardName}&desc=${cardDescription}&urlSource=${PRLink}${tokenQueryStrings}&idLabels=${labelId}`;
  console.log(`Trello API Card URL: ${trelloAPICardUrl}`);
  fetch(trelloAPICardUrl, {
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
} catch (error) {
  core.setFailed(error.message);
}
