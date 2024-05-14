const { Firestore } = require("@google-cloud/firestore");
const firestore = new Firestore();
const {Storage } = require("@google-cloud/storage");
const storage = new Storage();
firestore.settings({ ignoreUndefinedProperties: true }); // Allows us to createPosts with undefined properties.
const COLLECTION_NAME = "Ad";  // Defining kind at the top for consistency
const BUCKET_NAME = "jammate-cs467_cloudbuild"
const GOOGLE_CLOUD_API = "https://storage.googleapis.com"

async function uploadFile(file, adId, fileType) {
    try {
        // We set up the bucket and file based on the ad's Id
        const bucket = storage.bucket(BUCKET_NAME);
        const blob = bucket.file(adId);
        // Somehow this knows that we are grabbing the file due to some code magic.
        const blobStream = blob.createWriteStream({
            metadata: {
                contentType: fileType   // We set the type to audio or video for GCS's sake.
            }
        })
        blobStream.on('error', (err) => {
            console.error('Error uploading file:', err);
        });

        // Once finished then we want to make the file public because I don't quite understand
        // yet how to access the URL based soley off of credentials.
        blobStream.on('finish', async () => {
            try {
                await blob.makePublic();
                // Get a reference to the file storage location
                console.log('File uploaded successfully');
                return true;
            } catch (error) {
                console.error('Error making file public:', error);
            }
        });
    // Stop writing so other functions don't write to our File.
    blobStream.end(file.buffer);
    } catch (error) {
        console.error('Error uploading file:', error);
    }
}

async function createAd(userId, content, file) {
    try {
        const timestamp = new Date().getTime();
        const adData = {
            userId,
            content,
            fileName: null,
            fileData: null,
            fileType: null,
            fileURL: null
        };

        if (file) {
            const fileBase64 = file.buffer.toString('base64');
            adData.fileName = file.originalname;
            adData.fileData = fileBase64;
            adData.fileType = file.mimetype;
        }

        // We add the new firestore document.
        const postDocRef = await firestore.collection(COLLECTION_NAME).add(adData);
        if (file) {
            // If there is a file then we attempt to upload the file to GCS (google cloud storage)
            successUpload = await uploadFile(file, postDocRef.id, adData.fileType);
            // Update firestore document with download URL
            const fileURL = {fileURL: `${GOOGLE_CLOUD_API}/${BUCKET_NAME}/${postDocRef.id}`};
            await postDocRef.update(fileURL);
            adData.fileURL = fileURL;
        }
        return adData;
    } catch (error) {
        // Handle error
        console.error('Error creating ad:', error);
    }
}

/*
* getAds:
*/
async function getAds() {
try {
    // Query Firestore to get all ads
    let query = firestore.collection(COLLECTION_NAME);

    // Execute the query
    const querySnapshot = await query.get();

    // Array to hold the retrieved ads
    const ads = [];

    // Iterate through the documents returned by the query
    querySnapshot.forEach(doc => {
        // Convert each document data to a JavaScript object and push it to the ads array
        const adData = doc.data();
        adData.adId = doc.id;
    ads.push(adData);
    });

    // Return the ads array
    return ads;
} catch (error) {
    // Handle any errors
    console.error('Error fetching ads:', error);
    throw error; // Throw the error for the caller to handle
}
}

async function getAd(adId) {
    const query = firestore.collection(COLLECTION_NAME).doc(adId);
    const ad = await query.get();
    const adData = ad.data();
    if (adData) {
        adData.adId = ad.id;
        return adData;
    } else {
        return null; // Or handle the case where no document exists for the given adId
    }
}

async function deleteAd(adId) {
    const query = firestore.collection(COLLECTION_NAME).doc(adId);

    await query.delete();
    return;
}

async function deleteAllAds(nickname) {
    const querySnapshot = await firestore.collection(COLLECTION_NAME)
                    .where("nickname", "==", nickname).get();
    querySnapshot.forEach(doc=> {
        doc.ref.delete();
    });
}

module.exports = {
  createAd, getAd, getAds, deleteAllAds, deleteAd
}