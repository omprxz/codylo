import axios from 'axios';
import { extractColors } from 'extract-colors';

const ImageBgDetect = async (imagePath) => {
    try {
      const proxyUrl = `http://localhost:3300/api/proxy-image?url=${encodeURIComponent(imagePath)}`;
      const response = await axios.get(proxyUrl, {
        responseType: 'arraybuffer'
      });

      const blob = new Blob([response.data]);

      const blobUrl = URL.createObjectURL(blob);

      const colorList = await extractColors(blobUrl);

      let maxColor = null;
      colorList.forEach(color => {
        if (!maxColor || color.area > maxColor.area) {
          maxColor = color;
        }
      });
      return maxColor;
    } catch (error) {
      console.error('Error extracting colors:', error.message);
      return null;
    }
};

export default ImageBgDetect;