const projectId = "jammate-cs467";
const { Storage } = require('@google-cloud/storage');

const storage = new Storage({projectId});

async function saveProfilePicture(userId, file) {
    const bucketName = "jammate-cs467_cloudbuild";
    const bucket = storage.bucket(bucketName);
    const fileName = `profile-pictures/${userId}`; // Use userId for file name
    const fileHandle = bucket.file(fileName);

    try {
        await fileHandle.delete();
        console.log(`Deleted old profile picture for userId: ${userId}`);
    } catch (error) {
        console.log(`No existing profile picture to delete for userId: ${userId}`);
    }

    await fileHandle.save(file.buffer);
    await fileHandle.makePublic();

    const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}?t=${Date.now()}`;
    return publicUrl;
}

async function saveCoverPhoto(userId, file) {
    const bucketName = "jammate-cs467_cloudbuild";
    const bucket = storage.bucket(bucketName);
    const fileName = `cover-photos/${userId}`; // Use userId for file name

    const fileHandle = bucket.file(fileName);

    try {
        await fileHandle.delete();
        console.log(`Deleted old cover photo for userId: ${userId}`);
    } catch (error) {
        console.log(`No existing cover photo to delete for userId: ${userId}`);
    }

    await fileHandle.save(file.buffer);
    await fileHandle.makePublic();

    const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}?t=${Date.now()}`;
    return publicUrl;
}

module.exports = {
    saveProfilePicture,
    saveCoverPhoto
};
