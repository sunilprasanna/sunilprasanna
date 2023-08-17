import fetch from "node-fetch";
import * as core from "@actions/core";
import * as github from "@actions/github";

// this is to force a PR again

try {
  const milestoneLabel = core.getInput("milestone-label")
  let labelId = null;
  const baseUrl = "https://api.trello.com/1/"
  const boardId = "64badf32182ac7d928d9304f"
  const trelloKey = core.getInput("trello-api-key");
  const trelloToken = core.getInput("trello-api-token");
  const tokenQueryStrings = `&key=${trelloKey}&token=${trelloToken}`
  const trelloAPIBoardUrl = `${baseUrl}boards/${boardId}/labels?fields=id&fields=name${tokenQueryStrings}`
  const trelloAPILabelUrl = `${baseUrl}labels?name=${milestoneLabel}&color=blue&idBoard=${boardId}${tokenQueryStrings}`
  fetch(trelloAPIBoardUrl, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  })
      .then((response) => {
          if(response.ok){
              return response.json();
          }
      })
      .then((data) => {
          console.log(data);
          if(data.some(item => item.name === milestoneLabel)){
              labelId = item.id
          }
          else
          {
              fetch(trelloAPILabelUrl, {
                  method: "POST",
                  headers: {
                      Accept: "application/json",
                  },
              })
                  .then((response) => {
                      console.log(`Response: ${response}`);
                      labelId = response.id;
                      return response.text();
                  })
                  .then((text) => console.log(text))
                  .catch((err) => console.error(err));
          }
      })
      .catch((err) => console.error(err));
  const newCardName = core.getInput("name-of-card");
  const cardDescription = core.getInput("description-of-card");
  const PRLink = core.getInput("pr-link");
  const baseCardUrl =
      `${baseUrl}cards?idList=${boardId}`;
  const trelloAPICardUrl = `${baseCardUrl}&name=${newCardName}&desc=${cardDescription}&urlSource=${PRLink}${tokenQueryStrings}`;
  console.log(`Trello API URL: ${trelloAPICardUrl}`);
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
