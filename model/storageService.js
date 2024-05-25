const projectId = "jammate-cs467"
// storageService.js
const { Storage } = require('@google-cloud/storage');

const storage = new Storage({projectId});

async function saveProfilePicture(file) {
    const bucketName = "jammate-cs467_cloudbuild"; // Replace 'your-bucket-name' with your actual bucket name
    const bucket = storage.bucket(bucketName);
    const fileName = `profile-pictures/${Date.now()}-${file.originalname}`;
    const fileHandle = bucket.file(fileName);

    // Upload the file to Google Cloud Storage
    await fileHandle.save(file.buffer);

    // Optionally make the file publicly accessible
    await fileHandle.makePublic();

    // Return the public URL to the file
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
    return publicUrl;
}

module.exports = {
    saveProfilePicture
};