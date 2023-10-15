import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob';
import { SpeechSynthesizer, AudioConfig, SpeechConfig , ResultReason} from 'microsoft-cognitiveservices-speech-sdk';
import { readFileSync, writeFileSync, appendFileSync} from 'fs';
import * as dotenv from 'dotenv';
import axios from 'axios'
import { join } from 'path';
import  * as voice from "elevenlabs-node"
import fs from "fs-extra";
dotenv.config()
let commentaryString: string = readFileSync(join(__dirname, './result.json'), 'utf-8')
let commentaryData: any = JSON.parse(commentaryString)
console.log(commentaryData)

const tomVoiceId = 'TX3LPaxmHKxFdv7VOQHJ';
const travisVoiceID='bVMeCyTHy58xNoL34h3p'


async function uploadData(text:string, time:number, msgIndex:number,voiceId:string,name:string) {
  
    // Define your Azure Storage credentials
    const accountName = 'chickenderby';
    const accountKey = 'FVkL0F716H+m1DXHYjB7f3dkMeY5yvz+jg4/AZT2cCmnSy7gCSA0+W4s9F3eqJYZ7AUIG7y7titY+AStcZji9Q==';

    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

    //Create a BlobServiceClient
    const blobServiceClient = new BlobServiceClient(`https://${accountName}.blob.core.windows.net`, sharedKeyCredential);

    // Define your container name and Blob name
    const containerName = 'commentary';
    const blobName = `${time}_${msgIndex}_${name}.mp3`;

    const content = await textToSpeech(text,voiceId)


    // Get the container client
    const containerClient = blobServiceClient.getContainerClient(containerName);
    
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const res= await blockBlobClient.upload(content, content.length);
    
    // console.log("result",res)
}


async function textToSpeech(inputText:string,voiceId:string)  {
  // Set the ID of the voice to be used.
  
  // Set options for the API request.
  const options:any = {
    method: 'POST',
    url: `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    headers: {
      accept: 'audio/mpeg', // Set the expected response type to audio/mpeg.
      'content-type': 'application/json', // Set the content type to application/json.
      'xi-api-key': process.env.ELEVEN_API_KEY, // Set the API key in the headers.
    },
    data: {
      text: inputText, // Pass in the inputText as the text to be converted to speech.
    },
    responseType: 'arraybuffer', // Set the responseType to arraybuffer to receive binary data as a response.
  };

  // Send the API request using Axios and wait for the response.
  const response = await axios.request<Uint8Array>(options);

  // Return the binary audio data received from the API response.
//   console.log(response.data);
  return response.data;
  
};

//Upload commentary audio file to azure container
async function uploadCommentaryStream(){
    for(let i =0; i < commentaryData.length; i +=1){
        //Get message list at certain time
        const msgList= commentaryData[i].msgList

        for(let j =0; j < msgList.length; j +=1){
            const data=msgList[j]
            const text=data.msg
            if(data.who=='Travis'){
                console.log("Tom:",text)
                await uploadData(text,i,j,tomVoiceId,"Tom")
            }
            else {
                console.log("Travis:",text)
                await uploadData(text,i,j,travisVoiceID,"Travis")
            }
        }

       
    }

    console.log("Finished upload")
}

uploadCommentaryStream()