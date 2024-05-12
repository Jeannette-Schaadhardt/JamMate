const { Firestore } = require("@google-cloud/firestore");
const firestore = new Firestore();
firestore.settings({ ignoreUndefinedProperties: true });
const COLLECTION_NAME = "Ad";  // Defining kind at the top for consistency

async function createAd(userId, content, file) {
    try {
        const timestamp = new Date().getTime();
        const adData = {
            userId,
            content,
            fileName: null,
            fileData: null,
            fileType: null
        };

        if (file) {
            const fileBase64 = file.buffer.toString('base64');
            adData.fileName = file.originalname;
            adData.fileData = fileBase64;
            adData.fileType = file.mimetype;
        }

        const postDocRef = firestore.collection(COLLECTION_NAME).doc();
         return await postDocRef.set(adData).then(() => {
            console.log('Document successfully written to Firestore.');
            delete adData.fileData;
            return {
              adData
            };
          })

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
async function getAd(postId) {
    const query = firestore.collection(COLLECTION_NAME).doc(postId);
    const post = await query.get();
    const adData = post.data();
    if (adData) {
        adData.postId = post.id;
        return adData;
    } else {
        return null; // Or handle the case where no document exists for the given postId
    }
}

async function deleteAd(postId) {
    const query = firestore.collection(COLLECTION_NAME).doc(postId);
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