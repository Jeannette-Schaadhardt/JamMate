const { Firestore } = require("@google-cloud/firestore");
const firestore = new Firestore();
const COLLECTION_NAME = "Comment";  // Defining kind at the top for consistency

async function createComment(postId, commentData) {
    try {
        // Reference to the post document
        const postRef = firestore.collection('Post').doc(postId);
        let newCommentData = commentData;
        newCommentData.timestamp = new Date().getTime();

        // Add the comment to the comments subcollection of the post
        await postRef.collection(COLLECTION_NAME).add(newCommentData);
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

module.exports = {
    getComments, createComment, deleteComment
  }