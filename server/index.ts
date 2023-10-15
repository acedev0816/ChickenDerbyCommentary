import * as dotenv from "dotenv";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { LLMChain, ConversationChain } from "langchain/chains";
import { ChatPromptTemplate, MessagesPlaceholder } from "langchain/prompts";
import { readFileSync, writeFileSync, appendFileSync } from "fs";
import { join } from "path";
import * as cors from "cors";
dotenv.config();
import * as express from "express";
import axios, { AxiosRequestConfig } from "axios";
import {
  BlobServiceClient,
  generateAccountSASQueryParameters,
  AccountSASPermissions,
  AccountSASServices,
  AccountSASResourceTypes,
  StorageSharedKeyCredential,
  SASProtocol,
} from "@azure/storage-blob";
import { CommentaryService } from "./services/commentaryService";
import { race } from "./data/race";
import { raceProfile } from "./data/raceProfiles";

// Read and parse chicken attributes data
const chicken_attributes_data: string = readFileSync(
  join(__dirname, "./chicken_attributes.json"),
  "utf-8"
);

// Read and parse commentary data
let commentaryString: string = readFileSync(
  join(__dirname, "./test.json"),
  "utf-8"
);
let commentaryData: any = JSON.parse(commentaryString);

// Read chicken list data
const chickenList: any = commentaryData.profiles;

const talents: any = commentaryData.talents;

const commentaryModel = new ChatOpenAI({
  openAIApiKey: "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",
  modelName: "gpt-3.5-turbo",
});

const systemPrompt =
  "I want you to act as narratories of a chicken race game.\n\
                    featuring 2 commentators, one is Tom and another one is Travis.\n\
                    Your job is to generate very short  commentary using current status.\n\
                    You must use a maxium of 60 characters per sentence.\n";

let totalInputToken = 0;

//Call the first prompt for commentation
async function commetnaryInit() {
  const comentaryInitPrompt = ChatPromptTemplate.fromMessages([
    ["system", systemPrompt],
  ]);

  const chainInit = new LLMChain({
    llm: commentaryModel,
    prompt: comentaryInitPrompt,
  });

  //calculate input token

  totalInputToken += systemPrompt.length;

  console.log("First Prompt length:", systemPrompt.length);
  await chainInit.call({});
}

//Generate commentary
async function commentary(time: number, id: number) {
  const currentStatus = await getChickenDatabyTime(time, true, id);

  const chickenName = currentStatus[0].chickenName;
  let talentAction = "";
  let talentName = "";

  // talent which is using|deploying|hitting
  const chickenTalent = currentStatus.chickenTalent;

  if (currentStatus[0].talent != undefined) {
    talentAction = currentStatus[0].talent.action;
    talentName = currentStatus[0].talent.name;
  }

  const position = currentStatus[0].position;
  const speed = currentStatus[0].speed;

  let affectChickenName = "";
  const profiles = commentaryData.profiles;

  let humanPrompt = "";
  //when the chicken has their talent
  if (chickenTalent === talentName) {
    humanPrompt =
      "These are the current status.\n\
        {chickenName} is {talentAction} {talentName} talent and Speed is {speed}, position is {position}. Please comment  this status for chicken racing game";

    const comentaryPrompt = ChatPromptTemplate.fromMessages([
      ["system", systemPrompt],
      ["human", humanPrompt],
    ]);

    const chain = new LLMChain({
      llm: commentaryModel,
      prompt: comentaryPrompt,
    });

    const result = await chain.call({
      chickenName,
      talentAction,
      talentName,
      position,
      speed,
    });

    // get length to calculate input token
    const promptStr = await comentaryPrompt.formatMessages({
      chickenName,
      talentAction,
      talentName,
      position,
      speed,
    });

    //Get prompt length
    totalInputToken += promptStr[1].content.length;
    console.log("Prompt length:", promptStr[1].content.length);
    console.log("commentary_result:", result.text);
    return result;
  } else {
    // get affective chicken name by talent
    for (const profile of profiles) {
      if (profile.talent === talentName) affectChickenName = profile.name;
    }

    humanPrompt =
      "These are the current status.\n\
                        {chickenName} is hitting from {affectChickenName} 's {talentName} and speed is  {speed}, position is {position}. Please comment  this status for chicken racing game";
    const comentaryPrompt = ChatPromptTemplate.fromMessages([
      ["system", systemPrompt],
      ["human", humanPrompt],
    ]);

    const chain = new LLMChain({
      llm: commentaryModel,
      prompt: comentaryPrompt,
    });
    const result = await chain.call({
      chickenName,
      affectChickenName,
      talentName,
      position,
      speed,
    });

    const promptStr = await comentaryPrompt.formatMessages({
      chickenName,
      affectChickenName,
      talentName,
      position,
      speed,
    });

    //Get prompt length
    totalInputToken += promptStr[1].content.length;
    console.log("prompt length", promptStr[1].content.length);
    console.log("commentary_result:", result.text);
    return result;
  }
}

// Get information of chicken list at a certain time
// isStart: is the time near to start?
function getChickenDatabyTime(time: number, isStart = true, id: number) {
  const raceData = commentaryData.raceData;
  const ret: any = [];
  for (const row of raceData) {
    // console.log("reactData row", row);
    const chickenId = row.chickenId;

    //Get chickenName, chickenTalent by Id
    let chickenName: string = "";
    let chickenTalent: string = "";
    for (const chicken of chickenList) {
      if (chicken.id == chickenId) {
        chickenName = chicken.name;
        chickenTalent = chicken.talent;
      }
    }

    const segments = row.segments;
    for (const data of segments) {
      if (time < data.time + data.duration && id == chickenId) {
        ret.push({
          chickenId,
          chickenName,
          chickenTalent,
          time,
          speed: data.speed,
          position: isStart ? data.startPosition : data.endPosition,
          talent: data.talent,
        });
        break;
      }
    }
  }
  console.log(`chicken data at time ${time}`, ret);
  return ret;
}

// Get list of time that change is detected, add start time for each segments

function getChangeTime(): any {
  const raceData = commentaryData.raceData;

  const timeArray: any[] = [];
  const idArray: number[] = [];
  const totalArray: any[] = [];
  for (const data of raceData) {
    const segments = data.segments;
    const chickenId = data.chickenId;

    let changeDetectedTime = 0;
    for (const segment of segments) {
      // add time, duration
      segment.duration = segment.time;
      segment.time = changeDetectedTime;
      // add current time to array
      changeDetectedTime += segment.duration;
      if (
        segment.startPosition != segment.endPosition &&
        segment.hasOwnProperty("talent")
      ) {
        timeArray.push(changeDetectedTime);
        idArray.push(chickenId);
        totalArray.push({ id: chickenId, time: changeDetectedTime });
      }
    }
  }

  totalArray.sort((a, b) => a.time - b.time);

  //Remove some element which duration is samller than 3s for text-to-speech
  const cleanedTimeArray: any = [];
  for (let i = 1; i < totalArray.length; i++) {
    const duration = totalArray[i].time - totalArray[i - 1].time;
    if (duration >= 3) {
      cleanedTimeArray.push(totalArray[i - 1]);
    }
  }
  // Include the last element from the original array
  cleanedTimeArray.push(totalArray[totalArray.length - 1]);

  console.log("cleaned time array", cleanedTimeArray);
  return cleanedTimeArray;
}

async function introduction() {
  const generatingRule: string =
    "Make the commentary exciting and animated.\
                                Use short sentence and short words. Never use jargon.\
                                You must always write numbers fully in letters.\
                                Write the way people talk, naturally.\
                                You must never say that you are an AI language model.\
                                You must comment only 2 attributes of a chicken among 'laneNumber', 'name', 'talent' and 'perfection' of each chicken.\n";

  const systemPromptTemplate =
    "I want you to act as narratories of a chicken race game.\n\
                                  featuring 2 commentators, one is Tom and another one is Travis.\n\
                                  Your job is to generate very short  introduction conversation for chickens based on chickens list data, talents data and output rules.\n\
                                  You must introduce 1 sentence per chicken.\n\
                                  Each sentence must be 15 words max.\n\
                                  This is list of chickens:\n\
                                  {chickenListData}\
                                  These are talents data:\n{talents}\n\
                                  These are the output rules:\n {generatingRule}";

  const introductionPrompt = ChatPromptTemplate.fromMessages([
    ["system", systemPromptTemplate],
  ]);

  const chain = new LLMChain({
    llm: commentaryModel,
    prompt: introductionPrompt,
  });
  const promptStr = await introductionPrompt.formatMessages({
    chickenListData: JSON.stringify(chickenList),
    talents: talents,
    generatingRule,
  });

  //Get prompt length
  totalInputToken += promptStr[0].content.length;

  console.log("Introduction Prompt length:", promptStr[0].content.length);

  const result = await chain.call({
    chickenListData: JSON.stringify(chickenList),
    talents: talents,
    generatingRule,
  });

  console.log("Introduction result:\n", result.text);

  return result;
}

function parseComments(comment_obj: any) {
  let comment_list: string[] = comment_obj.text.split("\n");
  const msgList: any[] = [];
  for (const one of comment_list) {
    if (one.trim() == "") continue;
    const values = one.split(":");
    const row = {
      who: values[0],
      msg: values[1],
    };
    msgList.push(row);
  }
  return msgList;
}

// (async () => {
// const tl = getChangeTime();
// console.log("change time list", tl.length);
// let ret: any[] = []; // whole result

// //const introductionObj = await introduction();

// // Init chatmodel using system message.
// await commetnaryInit()

// for (let i =0; i < tl.length; i +=1) {
//     const time = tl[i].time
//     const id= tl[i].id
//     let comment_obj = await commentary(time,id);

//         const msgList = parseComments(comment_obj);
//         ret.push({
//             time,
//             msgList
//         })

// }

// writeFileSync(join(__dirname, './result.json'), JSON.stringify(ret))
// // Finished generating data
// console.log("Finished")
// console.log("total input token:", totalInputToken/4)

// })()

(async () => {
  const commentaryService = new CommentaryService(race, raceProfile);
  const result = await commentaryService.generateRaceCommentaries();

  writeFileSync(join(__dirname, "./result.json"), JSON.stringify(result));
  // Finished generating data
  console.log("Finished");
  console.log("total input token:", commentaryService.totalInputToken / 4);
})();
