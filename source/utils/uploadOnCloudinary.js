
import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"
cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET,
})

const uploadOnCloudinary = async(localePath)=> {
   try {
     if(!localePath) return null;
     const response = await cloudinary.uploader.upload(localePath,{
         resource_type : "auto"
     })
     fs.unlinkSync(localePath);
     return response;
   } catch (error) {
        fs.unlinkSync(localePath);
        return null
   }
}

const deleteFromCloudinary = async(url) => {
    const publicId = url?.split('/').pop().split('.')[0]
    await cloudinary.uploader.destroy(publicId)
}
 
export {uploadOnCloudinary,deleteFromCloudinary}


