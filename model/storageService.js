const projectId = "jammate-cs467";
const { Storage } = require('@google-cloud/storage');

const storage = new Storage({projectId});

async function saveProfilePicture(userId, file) {
    const bucketName = "jammate-cs467_cloudbuild";
    const bucket = storage.bucket(bucketName);
    const fileName = `profile-pictures/${userId}`;

    // Create a reference to the file to be uploaded
    const fileHandle = bucket.file(fileName);

    // Try to delete the existing file if it exists
    try {
        await fileHandle.delete();
        console.log(`Deleted old profile picture for userId: ${userId}`);
    } catch (error) {
        // Ignore errors if the file doesn't exist
        console.log(`No existing profile picture to delete for userId: ${userId}`);
    }

    // Upload the file to Google Cloud Storage
    await fileHandle.save(file.buffer);

    // Make the file publicly accessible
    await fileHandle.makePublic();

    // Return the public URL to the file
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
    return publicUrl;
}

module.exports = {
    saveProfilePicture
};
