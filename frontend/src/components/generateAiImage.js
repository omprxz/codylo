import axios from "axios";
import FormData from "form-data";

const GenerateAiImage = async (altPrompt) => {
    try {
        const IMGBB_API_KEYS = process.env.REACT_APP_IMGBB_API_KEYS.split(',');
        const IMGBB_API_KEY = IMGBB_API_KEYS[0].trim()
        const HUGGING_FACE_API_KEYS = process.env.REACT_APP_HUGGING_FACE_API_TOKENS
        const HUGGING_FACE_API_KEY = HUGGING_FACE_API_KEYS[0].trim()
        
        const expirationTime = 15 * 24 * 60 * 60;
        const api_baseurl =
          window.location.hostname === "localhost"
            ? process.env.REACT_APP_API_BASEURL_LOCAL
            : process.env.REACT_APP_API_BASEURL_PRODUCTION;
        
        const models_base = [
            "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-3-medium-diffusers",
            "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5",
            "https://api-inference.huggingface.co/models/stablediffusionapi/anythingv4",
            "https://api-inference.huggingface.co/models/stablediffusionapi/anything-v3",
            "https://api-inference.huggingface.co/models/stablediffusionapi/anything-midjourney",
            "https://api-inference.huggingface.co/models/stablediffusionapi/dreamshaper-v8",
            "https://api-inference.huggingface.co/models/stablediffusionapi/dreamshaper-v7",
            "https://api-inference.huggingface.co/models/stablediffusionapi/ae-sdxl-v4",
            "https://api-inference.huggingface.co/models/stablediffusionapi/realistic-stock-photo",
            "https://api-inference.huggingface.co/models/playgroundai/playground-v2.5-1024px-aesthetic",
            "https://api-inference.huggingface.co/models/goofyai/Leonardo_Ai_Style_Illustration",
            "https://api-inference.huggingface.co/models/cloudqi/cqi_text_to_image_pt_v0",
            "https://api-inference.huggingface.co/models/Melonie/text_to_image_finetuned",
            "https://api-inference.huggingface.co/models/SaiRaj03/Text_To_Image",
            
        ];
        async function uploadImageToImgBB(file, headers=null) {
            const formData = new FormData();
            formData.append("image", file);
            formData.append("key", IMGBB_API_KEY);
            formData.append("expiration", expirationTime);

            try {
              let response;
              if(headers){
               response = await axios.post(
                    "https://api.imgbb.com/1/upload",
                    formData,
                    {
                        headers: headers
                    }
                );
              }else{
                 response = await axios.post(
                    "https://api.imgbb.com/1/upload",
                    formData
                );
                }
                return response.data.data.url;
            } catch (error) {
                throw new Error(`Failed to upload image: ${error.message}`);
            }
        }
        
        async function queryModels(data, model) {
            try {
                const response = await axios.post(model, data, {
                    headers: {
                        Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,
                        "Content-Type": "application/json"
                    },
                    responseType: "blob"
                });

                if (response.status !== 200) {
                    throw new Error("HTTP error " + response.status);
                }

                const contentType = await response.headers["content-type"];
                if (!contentType || !contentType.includes("image")) {
                    throw new Error("Response is not an image");
                }

                return response.data;
            } catch (error) {
                throw error;
            }
        }

        async function convertTextToImage(testPrompt) {
            let success = false;
            let imgbbUrl;
            if(!success) {
              try{
              const replicateResponse = await axios.post(api_baseurl+'/api/text2image/replicate',
              {
                prompt: testPrompt
              },
              {
                headers: {
                  "Content-Type": "application/json"
                }
              }
              )
              if(replicateResponse.data.status == 'success'){
                imgbbUrl = await uploadImageToImgBB(replicateResponse.data.imageUrl);
                success=true
              }else{
                throw new Error("replicate not succeeded: " + replicateResponse.data.message);
              }
              }catch(e){
                console.error(
                            `Error occurred while replicate`
                        );
              }
            }
            
            if (!success) {
                for (let i = 0; i < models_base.length; i++) {
                    try {
                        const blob = await queryModels(
                            {
                                inputs: testPrompt
                            },
                            models_base[i]
                        );
                      console.log(blob)
                      imgbbUrl = await uploadImageToImgBB(blob, {"Content-Type": "multipart/form-data"});
                        success = true;
                        break;
                    } catch (error) {
                        console.error(
                            `Error occurred while querying model ${models_base[i]}:`,
                            error.message
                        );
                    }
                }
            }
            
            
            if (!success) {
                console.log("All API calls failed or did not return an image.");
                return null;
            }

            return imgbbUrl;
        }
        
        const imageUrl = await convertTextToImage(altPrompt);
        
        return imageUrl;
    } catch (e) {
        return null;
    }
};

export default GenerateAiImage;
