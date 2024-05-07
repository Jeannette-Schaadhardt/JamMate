// citation: https://cloud.google.com/nodejs/docs/reference/datastore/latest
const { Firestore } = require("@google-cloud/firestore");
const firestore = new Firestore();
firestore.settings({ ignoreUndefinedProperties: true });
const COLLECTION_NAME = "Post";  // Defining kind at the top for consistency

async function createPost(userId, postText, file, userName,
     instrument, genre, skillLevel, location) {
    try {
        // Prepare data object including file information if available
        const timestamp = new Date().getTime();

        const postData = {
        userId: userId,
        content: postText,
        instrument: instrument,
        genre: genre,
        nickname: userName,
        skillLevel: skillLevel,
        timestamp: timestamp,
        location: location,
        likeCount: 0,
        // Include file metadata if file is uploaded
        fileName: file ? file.originalname : null,
        filePath: file ? file.path : null,
        fileType: file ? file.mimetype : null
        };
        const postQuery = await firestore.collection(COLLECTION_NAME).
            add(postData);
        return {postId: postQuery.id, ...postData };
    }catch (error) {
        console.error('Error creating post:', error);
    }
};

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
    return post = await query.get();
}
async function deletePost(postId) {
    const query = firestore.collection(COLLECTION_NAME).doc(postId);
    await query.delete();
    return;
}

module.exports = {
  createPost, getPosts, deletePost, getPost
}