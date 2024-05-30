const projectId = "jammate-cs467"
const { Firestore } = require("@google-cloud/firestore");
const firestore = new Firestore({projectId});
const COLLECTION_NAME = "Comment";  // Defining kind at the top for consistency
const POST_COLLECTION = "Post";  // Defining kind at the top for consistency

async function createComment(postId, commentData) {
    try {
        // Reference to the post document
        const postRef = firestore.collection('Post').doc(postId);
        let newCommentData = commentData;
        newCommentData.timestamp = new Date().getTime();
        newCommentData.likeCount = 0;
        // Add the comment to the comments subcollection of the post
        await postRef.collection(COLLECTION_NAME).add(newCommentData);
        updateCommentCount(postId, true)
    } catch (error) {
        console.error('Error creating comment:', error);
        throw error;
    }
}

async function deleteComment(postId, commentId) {
    try {
        // Reference to the post document
        const postRef = firestore.collection('posts').doc(postId);

        // Reference to the comment document
        const commentRef = postRef.collection('comments').doc(commentId);

        // Delete the comment document
        await commentRef.delete();

        return true; // Indicate successful deletion
    } catch (error) {
        console.error('Error deleting comment:', error);
        throw error;
    }
}


async function getComments(doc){
    // Fetch comments for the current post
    const commentsSnapshot = await doc.ref.collection(COLLECTION_NAME).get();
    const comments = [];
    commentsSnapshot.forEach(commentDoc => {
        const commentData = commentDoc.data();
        commentData.commentId = commentDoc.id;
        comments.push(commentData);
    });
    // Attach comments to the post object
    return comments;
}

async function updateCommentCount(postId, newComment) {
    let postDocRef = await firestore.collection(POST_COLLECTION).doc(postId).get();
    let commentCount = postDocRef.data().commentCount || 0; // Ensure commentCount is initialized
    commentCount += newComment ? 1 : -1;
    await postDocRef.ref.update({
        commentCount
    });
    return commentCount;
}


module.exports = {
    getComments, createComment, deleteComment
  }