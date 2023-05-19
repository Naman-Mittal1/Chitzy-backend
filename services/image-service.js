const fs = require('fs');
const path = require('path');
const axios = require('axios');
// const { fetchBlob } = require('fetch-blob');
const http = require('http');
// const request = require('request');
// const fetch = require('node-fetch');
class ImageService {

    async convertBlobUrlToBase64(blobUrl) {
        try {
            // Fetch the image data from the Blob URL
            const response = await axios.get(blobUrl, { responseType: 'blob' });

            console.log(response);
            // Convert the image data to Base64
            const base64Image = Buffer.from(response.data, 'binary').toString('base64');
            console.log(base64Image);
            return base64Image;
        } catch (error) {
            console.error('Error converting Blob URL to Base64:', error);
            throw error;
        }
    }

    // async convertBlobUrlToBase64(blobUrl) {
    //     try {
    //         // Fetch the Blob data using the fetch API
    //         const response = await fetch(blobUrl.replace('blob:', 'file:'));
    //         const blob = await response.blob();

    //         // Convert the Blob to Base64
    //         return new Promise((resolve, reject) => {
    //             const reader = new FileReader();
    //             reader.onloadend = () => resolve(reader.result);
    //             reader.onerror = reject;
    //             reader.readAsDataURL(blob);
    //         });
    //     } catch (error) {
    //         console.error('Error converting Blob URL to Base64:', error);
    //         throw error;
    //     }
    // }


    // async convertBlobUrlToBase64(blobUrl) {
    //     try {
    //         // Create a custom adapter for Axios to handle Blob URLs
    //         const adapter = (config) => {
    //             return new Promise((resolve, reject) => {
    //                 const url = new URL(config.url);
    //                 if (url.protocol === 'blob:') {
    //                     // Read the Blob data as a stream
    //                     const readable = fs.createReadStream(url.pathname);
    //                     const chunks = [];
    //                     readable.on('data', (chunk) => chunks.push(chunk));
    //                     readable.on('end', () => {
    //                         const buffer = Buffer.concat(chunks);
    //                         const response = { data: buffer };
    //                         resolve(response);
    //                     });
    //                     readable.on('error', reject);
    //                 } else {
    //                     reject(new Error('Unsupported protocol'));
    //                 }
    //             });
    //         };

    //         // Create a custom Axios instance with the adapter
    //         const instance = axios.create({ adapter });

    //         // Fetch the Blob data using the custom Axios instance

    //         const response = await instance.get(blobUrl);
    //         const arrayBuffer = response.data;

    //         // Convert the array buffer to Base64
    //         const base64Image = Buffer.from(arrayBuffer).toString('base64');

    //         return base64Image;
    //     } catch (error) {
    //         console.error('Error converting Blob URL to Base64:', error);
    //         throw error;
    //     }
    // }


    // saveBlobToFile(blobUrl, storagePath) {
    //     return new Promise((resolve, reject) => {
    //         const writeStream = fs.createWriteStream(storagePath);
    //         const requestOptions = {
    //             url: blobUrl,
    //             encoding: null // Preserve response as a buffer
    //         };

    //         const req = request(requestOptions);
    //         req.on('response', (response) => {
    //             if (response.statusCode !== 200) {
    //                 reject(new Error(`Failed to download Blob. Status code: ${response.statusCode}`));
    //                 return;
    //             }

    //             response.pipe(writeStream);
    //             writeStream.on('finish', () => {
    //                 writeStream.close();
    //                 resolve();
    //             });
    //         });

    //         req.on('error', (error) => {
    //             reject(error);
    //         });
    //     });
    // }







}

module.exports = new ImageService();