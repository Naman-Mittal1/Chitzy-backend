const axios = require('axios');
class ImageService {

    async convertBlobUrlToBase64(blobUrl) {
        try {
            // Fetch the image data from the Blob URL
            const response = await axios.get(blobUrl, { responseType: 'arraybuffer' });

            // Convert the image data to Base64
            const base64Image = Buffer.from(response.data, 'binary').toString('base64');

            return base64Image;
        } catch (error) {
            console.error('Error converting Blob URL to Base64:', error);
            throw error;
        }
    }
}

module.exports = new ImageService();