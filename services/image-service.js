const axios = require('axios');
// const fetch = require('node-fetch');
const fs = require('fs');
const { Readable } = require('stream');
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







}

module.exports = new ImageService();