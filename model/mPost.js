const { Firestore } = require("@google-cloud/firestore");
const firestore = new Firestore();
const {Storage } = require("@google-cloud/storage");
const cloud_storage = new Storage();
firestore.settings({ ignoreUndefinedProperties: true }); // Allows us to createPosts with undefined properties.
const COLLECTION_NAME = "Post";  // Defining kind at the top for consistency

async function uploadFile(file, docRef) {
    try {
        // Get a reference to the file storage location
        const fileRef = cloud_storage.ref().child('media/${docRef.id}/${file.name}');
        // Upload file to Cloud Storage
        const snapshot = await fileRef.put(file);
        // Get download URL
        const fileURL = await snapshot.ref.getDownloadURL();
        // Update firestore document with download URL
        await docRef.update({ fileURL});

        console.log('File uploaded successfully: ', fileURL);
        return true;
    } catch (error) {
        console.error('Error uploading file:', error);
    }
}

async function createPost(userId, content, file, nickname, instrument, genre, skillLevel, location) {
    try {
        const timestamp = new Date().getTime();
        const postData = {
            userId,
            content,
            instrument,
            genre,
            nickname,
            skillLevel,
            timestamp,
            location,
            likeCount: 0,
            fileName: null,
            fileType: null,
            fileURL: null
        };
        if (file) {
            postData.fileName = file.originalname;
            postData.fileType = file.mimetype;
        }
        const postDocRef = await firestore.collection(COLLECTION_NAME).add(postData);
        if (file) {
            const success_upload = await uploadFile(file)
            if (!success_upload) throw error;
        }
        return postData;
    } catch (error) {
        // Handle error
        console.error('Error creating post:', error);
    }
}

/*
* getPosts:
*
* @param[in] postId - Optional, used to get a single post.
* @param[in] userId - Optional, used for getting posts from a specific user.
* @param[in] instrument - Optional, used for displaying only posts of a certain instrument.
* @param[in] lat - Optional, used for displaying posts located near given lat
* @param[in] lon - Optional, used for displaying posts located near given lon
* @param[in] range - Optional, used for displaying posts within range of lat, lon.
*/
async function getPosts(userId = null, postId = null,
    instrument = null, genre=null, descriptor=null,
    lat = null, lon = null, range = null,
    start_date = null, end_date = null) {
try {
    // Query Firestore to get all posts
    let query = firestore.collection(COLLECTION_NAME);

    // If userId is provided, filter posts based on userId
    if (postId) {
        query = query.where('postId', '==', postId);

    } else {
        if (userId) {
            query = query.where('userId', '==', userId);
        }
        if (instrument) {
            query = query.where('instrument', '==', instrument)
        }
        if (genre) {
            query = query.where('genre', '==', genre);
        }
        if (lat && lon && range) {
            const latRadians = centerLat * Math.PI / 180;
            const latDegreeOfOneKm = 1 / 111.32; // Approximately 111.32 kilometers per degree of latitude
            const latRange = rangeInKm * latDegreeOfOneKm;
            const minLat = centerLat - latRange;
            const maxLat = centerLat + latRange;

            // Calculate longitude boundaries
            const lonDegreeOfOneKm = 1 / (111.32 * Math.cos(latRadians)); // Approximately 111.32 kilometers per degree of longitude at equator
            const lonRange = rangeInKm * lonDegreeOfOneKm;
            const minLon = centerLon - lonRange;
            const maxLon = centerLon + lonRange;
            query = query
            .where('location', '>=', new firestore.GeoPoint(minLat, minLon))
            .where('location', '<=', new firestore.GeoPoint(maxLat, maxLon));
        }
        if (start_date) {
            query = query.where('timestamp', '>=',
            start_date);
        }
        if (end_date) {
            query = query.where('timestamp', '<=',
            end_date);
        }
    }

    // Execute the query
    const querySnapshot = await query.get();

    // Array to hold the retrieved posts
    const posts = [];

    // Iterate through the documents returned by the query
    querySnapshot.forEach(doc => {
        // Convert each document data to a JavaScript object and push it to the posts array
        const postData = doc.data();
        postData.postId = doc.id;
    posts.push(postData);
    });

    // Apply additional filter for descriptor inclusion
    if (descriptor) {
        // Filter posts to include only those where the descriptor is found in the description
        const filteredPosts = posts.filter(post => post.content.includes(descriptor));
        return filteredPosts;
        }

    // Return the posts array
    return posts;
} catch (error) {
    // Handle any errors
    console.error('Error fetching posts:', error);
    throw error; // Throw the error for the caller to handle
}
}
async function getPost(postId) {
    const query = firestore.collection(COLLECTION_NAME).doc(postId);
    const post = await query.get();
    const postData = post.data();
    if (postData) {
        postData.postId = post.id;
        return postData;
    } else {
        return null; // Or handle the case where no document exists for the given postId
    }
}
async function deletePost(postId) {
    const query = firestore.collection(COLLECTION_NAME).doc(postId);
    await query.delete();
    return;
}

async function deleteAllPosts(nickname) {
    const querySnapshot = await firestore.collection(COLLECTION_NAME)
                    .where("nickname", "==", nickname).get();
    querySnapshot.forEach(doc=> {
        doc.ref.delete();
    });
}

module.exports = {
  createPost, getPosts, deletePost, deleteAllPosts, getPost
}