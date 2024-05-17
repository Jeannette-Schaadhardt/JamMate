const { Firestore } = require("@google-cloud/firestore");
const firestore = new Firestore();
const {Storage } = require("@google-cloud/storage");
const storage = new Storage();
firestore.settings({ ignoreUndefinedProperties: true }); // Allows us to createPosts with undefined properties.
const COLLECTION_NAME = "Post";  // Defining kind at the top for consistency
const BUCKET_NAME = "jammate-cs467_cloudbuild"
const GOOGLE_CLOUD_API = "https://storage.googleapis.com"
const { getComments } = require('./mComment.js');

async function uploadFile(file, postId, fileType) {
    try {
        // We set up the bucket and file based on the post's Id
        const bucket = storage.bucket(BUCKET_NAME);
        const blob = bucket.file(`postMedia/${postId}`);
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

async function createPost(userId, content, file, nickname, instrument, genre, skillLevel, location) {
    try {
        if (nickname != null) nickname = nickname.toLowerCase();
        if (instrument != null) instrument = instrument.toLowerCase();
        if (genre != null) genre = genre.toLowerCase();
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
        // We add the new firestore document.
        const postDocRef = await firestore.collection(COLLECTION_NAME).add(postData);
        if (file) {
            // If there is a file then we attempt to upload the file to GCS (google cloud storage)
            successUpload = await uploadFile(file, postDocRef.id, postData.fileType);
            // Update firestore document with download URL
            const fileURL = {fileURL: `${GOOGLE_CLOUD_API}/${BUCKET_NAME}/postMedia/${postDocRef.id}`};
            await postDocRef.update(fileURL);
            postData.fileURL = fileURL;
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
async function getPosts(queryData) {
try {
    // Query Firestore to get all posts
    let query = firestore.collection(COLLECTION_NAME);

    // If userId is provided, filter posts based on userId
    if (queryData.postId) {
        query = query.where('postId', '==', queryData.postId);

    } else {
        if (queryData.userId) {
            query = query.where('userId', '==', queryData.userId);
        }
        if (queryData.instrument) {
            query = query.where('instrument', '==', queryData.instrument)
        }
        if (queryData.genre) {
            query = query.where('genre', '==', queryData.genre);
        }
        if (queryData.skillLevel) {
            query = query.where('skillLevel', '==', queryData.skillLevel);
        }
        // The lat and lon here is based off the user performing the search.
        if (queryData.lat && queryData.lon && queryData.rangeInMiles) {
            // Calculate the boundaries of our Coordinate Box based on range.
            query = FilterOnRangeBoundaries(query);
        }
        if (queryData.start_date) {
            query = query.where('timestamp', '>=',
            queryData.start_date);
        }
        if (queryData.end_date) {
            query = query.where('timestamp', '<=',
            queryData.end_date);
        }
    }

    // Execute the query
    const querySnapshot = await query.get();

    // Array to hold the retrieved posts
    let posts = [];
    // Map each document to a promise that resolves when comments are fetched
    const promises = querySnapshot.docs.map(async doc => {
        // Convert each document data to a JavaScript object and push it to the posts array
        const postData = doc.data();
        postData.postId = doc.id;
        postData.comments = await getComments(doc);
        return postData;
    });
    // Wait for all promises to resolve
    const postDataArray = await Promise.all(promises);
    // Push resolution into the posts array.
    posts.push(...postDataArray);

    // Apply additional filter for descriptor inclusion
    if (queryData.descriptor != null) {
        // Filter posts to include only those where the descriptor is found in the description
        const filteredPosts = posts.filter(post => {
            const lowerCaseContent = post.content?.toLowerCase() ?? null;
            return lowerCaseContent.includes(queryData.descriptor);
        });
        return filteredPosts;
    }
    // Return the posts array
    return posts;
} catch (error) {
    // Handle any errors
    console.error('Error fetching posts:', error);
    throw error; // Throw the error for the caller to handle
}
// Helper function to handle setting the boundaries for the location filtering.
    function FilterOnRangeBoundaries(query) {
        const latRadians = queryData.lat * Math.PI / 180;
        const latDegreeOfOneMile = 1 / 69.;
        const latRange = queryData.rangeInMiles * latDegreeOfOneMile;
        const minLat = queryData.lat - latRange;
        const maxLat = queryData.lat + latRange;

        // Calculate the Longitude Min and Max (range in degrees changes based off of the latitude);
        const lonDegreeOfOneMile = 1 / (69. * Math.cos(latRadians));
        const lonRange = queryData.rangeInMiles * lonDegreeOfOneMile;
        const minLon = queryData.lon - lonRange;
        const maxLon = queryData.lon + lonRange;
        query = query
            .where('location', '>=', new firestore.GeoPoint(minLat, minLon))
            .where('location', '<=', new firestore.GeoPoint(maxLat, maxLon));
        return query;
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

    await deleteAssociatedReferences(query, postId);

    //TODO: refresh if required!
    await query.delete();
    const bucket = storage.bucket(BUCKET_NAME);
    const blob = bucket.file("postMedia/"+postId);
    await blob.delete()                 // Delete from Google Cloud Storage
    return;
}

async function deleteAssociatedReferences(query, postId) {
    const commentsSnapshot = await query
        .collection('Comment')
        .get();
    commentsSnapshot.forEach(commentDoc => {
        commentDoc.ref.delete();
    });
    const likesSnapshot = await firestore
        .collection('Like')
        .where("postId", "==", postId)
        .get();
    likesSnapshot.forEach(likeDoc => {
        likeDoc.ref.delete();
    });
}

async function deleteAllPosts(userId) {
    const bucket = storage.bucket(BUCKET_NAME);
    const querySnapshot = await firestore
                    .collection(COLLECTION_NAME)
                    .where("userId", "==", userId)
                    .get();

    querySnapshot.forEach(async doc=> {
        await deleteAssociatedReferences(doc.ref, doc.id);
        await bucket.file("postMedia/"+doc.id).delete();   // Delete the media from the Google Cloud Storage (I don't think await is necessary.)
        await doc.ref.delete();               // Delete the firestore document
    });
}

module.exports = {
  createPost, getPosts, deletePost, deleteAllPosts, getPost
}