import { 
    BlobServiceClient, 
    generateAccountSASQueryParameters, 
    AccountSASPermissions, 
    AccountSASServices,
    AccountSASResourceTypes,
    StorageSharedKeyCredential,
    SASProtocol,
    ContainerClient,
    BlobBatch
  }  from '@azure/storage-blob';

import * as dotenv from 'dotenv'
dotenv.config();
import { readFileSync, writeFileSync, appendFileSync} from 'fs';
import { join } from 'path';

const connectionStr = 'DefaultEndpointsProtocol=https;AccountName=chickenderby;AccountKey=FVkL0F716H+m1DXHYjB7f3dkMeY5yvz+jg4/AZT2cCmnSy7gCSA0+W4s9F3eqJYZ7AUIG7y7titY+AStcZji9Q==;EndpointSuffix=core.windows.net';
const containerName = 'commentary'; // Replace with your container name
const blobName = '0_0_Travis.mp3'; // Replace with the name of the blob you want to download

async function createSasToken(){
   
    const sasOptions = {
          services: AccountSASServices.parse("btqf").toString(),          // blobs, tables, queues, files
          resourceTypes: AccountSASResourceTypes.parse("sco").toString(), // service, container, object
          permissions: AccountSASPermissions.parse("rwdlacupi"),          // permissions
          protocol: SASProtocol.Https,
          startsOn: new Date(),
          expiresOn: new Date(new Date().valueOf() + (100 * 60 * 1000)),   // 10 minutes
    };

    const accountName : string|undefined =process.env.AZURE_ACCOUNT_NAME
    const accountKey : string| undefined =process.env.AZURE_API_KEY
    
    const sharedKeyCredential = new StorageSharedKeyCredential(accountName!, accountKey!);
    const sasToken=generateAccountSASQueryParameters(sasOptions,sharedKeyCredential).toString()
    
    console.log("SAS token:",sasToken)

    return sasToken
    

}

async function downloadBlobContents(){
    const accountName = "chickenderby";
    const containerName = "commentary";
    const sasToken=await createSasToken()
    const containerUrl = `https://${accountName}.blob.core.windows.net/${containerName}?${sasToken}`;
    const containerClient = new ContainerClient(containerUrl);

    const blobItems=await listBlobsFlatWithPageMarker(containerClient)
   
    const raceBlobArray:any[]=[]

    for (let i=0;i< blobItems.length;i++){
        
        const blobName=blobItems[i]

        const blobContent=await downloadBlob(blobName)
        const fileName = blobName.replace(".mp3", "");
        const indexs=fileName.split("_")

        console.log(indexs[0],indexs[1],indexs[2])

        raceBlobArray.push({
            time:indexs[0],
            index:indexs[1],
            content:blobContent
        })

    }
   
    writeFileSync(join(__dirname, './blobContents.json'), JSON.stringify(raceBlobArray))
    console.log("Finished download!")

}

async function listBlobsFlatWithPageMarker(containerClient) {

    
    const blobArray:string[]=[]
    // some options for filtering list
    const listOptions = {
      includeMetadata: false,
      includeSnapshots: false,
      includeTags: false,
      includeVersions: false,
      prefix: ''
    };
  
    let iterator = containerClient.listBlobsFlat(listOptions);

    for await (const blob of iterator){
        console.log(blob.name)
        blobArray.push(blob.name)
    }

    return blobArray
}

async function downloadBlob(blobName:string) {
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionStr);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);
  
    // Download the blob
    const downloadResponse = await blobClient.download();
    const blobData = await streamToBuffer(downloadResponse.readableStreamBody);
  
    console.log('Blob content:', blobData);
  
    // Optionally, save the blob to a file
    // const fs = require('fs');
    // fs.writeFileSync('downloadedBlob.mp3', blobData);

    return blobData
  }
  
  async function streamToBuffer(readableStream) {
    const chunks:any[]= [];
    for await (const chunk of readableStream) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }
  
 downloadBlobContents()