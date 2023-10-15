import { chain } from "lodash";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { LLMChain } from "langchain/chains";
import { ChatPromptTemplate } from "langchain/prompts";

import { Race } from "../types/race";
import { RaceProfile } from "../types/raceProfile";
import { Segment } from "../types/segment";
import { talentByAnimations, talentMeta } from "../constants";
import {
  CommentaryChickenSpeed,
  CommentaryData,
  CommentaryRaceData,
  CommentaryTalent,
  TalentType,
} from "../types/commentary";

export class CommentaryService {
  public totalInputToken = 0;
  private chatOpenAI = new ChatOpenAI({
    openAIApiKey: "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",
    modelName: "gpt-3.5-turbo",
  });
  private systemPrompt =
    "I want you to act as narratories of a chicken race game.\n\
    featuring 2 commentators, one is Tom and another one is Travis.\n\
    Your job is to generate very short  commentary using current status.\n\
    You must use a maxium of 60 characters per sentence.\n";

  private commentaryInitPrompt = ChatPromptTemplate.fromMessages([
    ["system", this.systemPrompt],
  ]);

  private chainInit = new LLMChain({
    llm: this.chatOpenAI,
    prompt: this.commentaryInitPrompt,
  });

  private get raceName() {
    return this.race.name;
  }

  private get peckingOrder() {
    return this.race.peckingOrder;
  }

  private get distance() {
    return this.race.distance;
  }

  private get terrain() {
    return this.race.terrain?.name;
  }

  private get prizePool() {
    return this.race.prizePoolUSD;
  }

  private get talents() {
    return this.getTalents();
  }

  private get profiles() {
    return this.getProfiles();
  }

  private get raceData() {
    return this.getRaceData();
  }

  private get times() {
    /*
    At time {elapsed}: commentator speaks like this.
    "chickenName's position has changed from {startPosition} to {endPosition}
    in {duration} seconds by using(due to) {talent}."
    */
    //data for final result

    const data: CommentaryData[] = []
    this.raceData.map((entry) => {
      let startIndex: number = -1; // start index of deploying talent
      let endIndex: number; // end index of talent
      let duration: number = 0; // duration of item
      let elapsed: number = 0; // total elapsed time
      let talentType: TalentType;
      entry.segments.map((segment, index) => {
        // console.log(index);
        // if (index <= 10)
        //   console.log("test", segment);
        
        if (startIndex === -1 &&
          (segment.talent?.action === 'deploying' || segment.talent?.action === 'hitting'))
        // action newly starts here, deploying means active, htting means passive
        {
          startIndex = index;
          duration = segment.duration;
          talentType = segment.talent?.action === 'deploying' ? TalentType.deploying : TalentType.hitting;
        }
        if (startIndex >= 0 && segment.talent?.action === 'using') {
          // using action now
          duration += segment.duration;
        }
        if (startIndex >= 0 && !segment.talent)
        // no action, which means previous action is ended in previous segment
        {
          const startPosition = entry.segments[startIndex].startPosition;
          const endPosition = entry.segments[index].startPosition;
          let chickenName : string = ""
          this.profiles.map(lane => {
            if (lane.id === entry.chickenId)
              chickenName = lane.name;
          });
          if (Math.abs(startPosition - endPosition) > 1) {
            data.push(
              {
                chickenId: entry.chickenId,
                chickenName,
                type: talentType,
                duration,
                startPosition,
                endPosition,
                talent: entry.segments[startIndex].talent?.name!,
                elapsed
              }
            )
          }
          // reset variables
          startIndex = -1

        }
        // update elapsed time, duration
        elapsed += segment.duration;
      })
    }
    );
    return data.sort((a, b) => a.elapsed - b.elapsed);
  }

  constructor(private race: Race, private raceProfiles: RaceProfile[]) { }

  private getProfiles() {
    return this.race.lanes.map((lane) => ({
      id: lane.chicken.id,
      name: lane.chicken.name,
      stock: lane.chicken.stock,
      talent: lane.chicken.talent,
      perfection: lane.chicken.perfection,
      heritage: lane.chicken.heritage,
      laneNumber: lane.laneNumber,
    }));
  }

  private getTalents() {
    return [...new Set(this.race.lanes.map((lane) => lane.chicken.talent))].map(
      (talent) => talentMeta[talent]
    );
  }

  private getRaceData(): CommentaryRaceData[] {
    return this.raceProfiles.map((profile: RaceProfile, index) => ({
      chickenId: profile.chickenId,
      segments: this.parseSegments(profile),
    }));
  }

  private parseSegments(profile: RaceProfile) {
    const regularAnimations = [
      "chicken_tired",
      "chicken_run",
      "chicken_fast_run",
      "chicken_sprint_1",
    ];
    let previousTalent: CommentaryTalent | null;

    return profile.segments.map((segment: Segment, index) => {
      let speed = this.getSpeed(segment);
      let talent = this.getTalent(segment);
      let talentAction = talent?.action as "deploying" | "hitting" | "using";

      if (talent) {
        if (previousTalent?.name === talent.name) {
          talentAction = "using";

          speed =
            previousTalent.action === "deploying"
              ? CommentaryChickenSpeed.veryFast
              : CommentaryChickenSpeed.slow;
        } else {
          talentAction = talent.action;
          previousTalent = talent;
          speed =
            talent.action === "deploying"
              ? CommentaryChickenSpeed.veryFast
              : CommentaryChickenSpeed.slow;
        }
      } else if (previousTalent) {
        if (
          segment.segmentChickenAnimation &&
          regularAnimations.includes(segment.segmentChickenAnimation)
        ) {
          previousTalent = null;
        } else {
          speed =
            previousTalent.action === "hitting"
              ? CommentaryChickenSpeed.slow
              : CommentaryChickenSpeed.veryFast;

          talentAction = "using";
          talent = previousTalent;
        }
      }

      return {
        time: segment.cumulativeSegmentSize - segment.segmentSize,
        speed,
        startPosition: this.getPosition(
          profile.chickenId,
          segment.cumulativeSegmentSize - segment.segmentSize
        ),
        endPosition: this.getPosition(
          profile.chickenId,
          segment.cumulativeSegmentSize
        ),
        talent: talent
          ? {
            ...talent,
            action: talentAction,
          }
          : undefined,
        duration: segment.segmentSize,
      };
    });
  }

  private getPositionByTime(segments: Segment[], elapsedTime: number) {
    let position = 0; // in meters
    let segIndex = 0;

    // position until full segments
    for (let i = 0; i < segments.length; i += 1) {
      const segment = segments[i];
      const { segmentSize, cumulativeSegmentSize, startSpeed, endSpeed } =
        segment;

      if (cumulativeSegmentSize < elapsedTime) {
        const avgSpeed = (startSpeed + endSpeed) / 2;
        position += avgSpeed * segmentSize;
        segIndex = i + 1;
      }
    }

    // position for the last segment passed partially
    if (segIndex < segments.length) {
      const segment = segments[segIndex];
      const { segmentSize, cumulativeSegmentSize, startSpeed, endSpeed } =
        segment;

      const timeInSeg = segmentSize - (cumulativeSegmentSize - elapsedTime);
      const f = timeInSeg / segmentSize;
      const currentSpeed = (endSpeed - startSpeed) * f + startSpeed;
      const avgSpeed = (startSpeed + currentSpeed) / 2;
      position += avgSpeed * timeInSeg;
    }

    return position;
  }

  private getPosition(chicken: number, time: number) {
    const finishedChickens = this.raceProfiles.filter(
      ({ segments }) =>
        segments[segments.length - 1].cumulativeSegmentSize < time
    );
    return (
      this.raceProfiles
        .filter(
          ({ segments }) =>
            segments[segments.length - 1].cumulativeSegmentSize >= time
        )
        .map(({ chickenId, segments }) => ({
          chickenId,
          distance: this.getPositionByTime(segments, time),
        }))
        .sort((a, b) => b.distance - a.distance)
        .findIndex(({ chickenId }) => chickenId === chicken) +
      1 +
      finishedChickens.length
    );
  }

  private getSpeed(segment: Segment) {
    switch (segment.segmentChickenAnimation) {
      case "chicken_tired":
        return CommentaryChickenSpeed.slow;
      case "chicken_run":
        return CommentaryChickenSpeed.medium;
      case "chicken_fast_run":
        return CommentaryChickenSpeed.fast;
      case "chicken_sprint_1":
        return CommentaryChickenSpeed.veryFast;
      default:
        return CommentaryChickenSpeed.medium;
    }
  }

  private getTalent(segment: Segment) {
    if (!segment.segmentChickenAnimation) {
      return;
    }

    return talentByAnimations[segment.segmentChickenAnimation];
  }

  private async commentaryInit() {
    this.totalInputToken += this.systemPrompt.length;

    await this.chainInit.call({});
  }

  //Generate commentary
  private async generateCommentary(data: CommentaryData) {
    console.log("data", data);
    try {

      let chickenName = '';
      this.profiles.map(lane => {
        if (lane.id === data.chickenId)
          chickenName = lane.name;
      });


      let humanPrompt = "";
      //when the chicken has their talent
      if (data.type === TalentType.deploying) {
        humanPrompt =
          "These are the current status.\n\
          {chickenName} is deployed {talent} talent and its position is changed from {startPosition} to {endPosition} in the last {duration} seconds.\n\
          Please comment  this status for chicken racing game";
      } else {
        humanPrompt =
          "These are the current status.\n\
        {chickenName} is hit by {talent} talent and its position is changed from {startPosition} to {endPosition} in the last {duration} seconds.\n\
        Please comment  this status for chicken racing game";
      }
      const commentaryPrompt = ChatPromptTemplate.fromMessages([
        ["system", this.systemPrompt],
        ["human", humanPrompt],
      ]);

      const chain = new LLMChain({
        llm: this.chatOpenAI,
        prompt: commentaryPrompt,
      });

      const result = await chain.call(data);

      // get length to calculate input token
      const promptStr = await commentaryPrompt.formatMessages(data);

      //Get prompt length
      this.totalInputToken += promptStr[1].content.length;
      console.log("Prompt length:", promptStr[1].content.length);
      console.log("commentary_result:", result.text);
      return result;
    } catch (err) {
      err;
    }
  }

  // Get information of chicken list at a certain time
  // isStart: is the time near to start?
  private getChickenDataTime(time: number, isStart = true, id: number) {
    const ret: any = [];

    for (const row of this.raceData) {
      const chickenId = row.chickenId;

      //Get chickenName, chickenTalent by Id
      let chickenName: string = "";
      let chickenTalent: string = "";
      for (const chicken of this.profiles) {
        if (chicken.id == chickenId) {
          chickenName = chicken.name;
          chickenTalent = chicken.talent;
        }
      }

      const segments = row.segments;
      for (const data of segments) {
        if (time < data.duration + data.time && id == chickenId) {
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

    return ret;
  }

  private async generateIntroduction() {
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
      llm: this.chatOpenAI,
      prompt: introductionPrompt,
    });
    const promptStr = await introductionPrompt.formatMessages({
      chickenListData: JSON.stringify(this.profiles),
      talents: this.talents,
      generatingRule,
    });

    //Get prompt length
    this.totalInputToken += promptStr[0].content.length;

    console.log("Introduction Prompt length:", promptStr[0].content.length);

    const result = await chain.call({
      chickenListData: JSON.stringify(this.profiles),
      talents: this.talents,
      generatingRule,
    });

    console.log("Introduction result:\n", result.text);

    return result;
  }

  private parseComments(comments: any) {
    const commentList: string[] = comments.text.split("\n");
    const msgList: any[] = [];
    for (const one of commentList) {
      if (one.trim() == "") continue;
      const values = one.split(":");
      const row = {
        who: values[0].trim().replace(/\"/gi, ""),
        msg: values[1].trim().replace(/\"/gi, ""),
      };
      msgList.push(row);
    }
    return msgList;
  }

  public async generateRaceCommentaries() {
    try {
      await this.commentaryInit();
      const raceCommentaries: any = [];
      console.log("times", this.times);
      this.times;
      for (const time of this.times) {
        const commentary = await this.generateCommentary(time);

        if (!commentary) {
          continue;
        }

        const msgList = this.parseComments(commentary);
        raceCommentaries.push({
          time,
          msgList,
        });
      }

      return { raceCommentaries };
    } catch (err) {
      throw err;
    }
  }
}
