const projectId = "jammate-cs467"
const { Firestore } = require("@google-cloud/firestore");
const firestore = new Firestore({projectId});
const COMMENT_COLLECTION = "Comment";  // Defining kind at the top for consistency
const POST_COLLECTION = "Post";  // Defining kind at the top for consistency
const LIKE_COLLECTION = "Like";

async function updateLike(data) {
    try {
        let likeValue = null;
        let likeCount = null;
        const userId = data.userId === "" ? null : data.userId;
        const postId = data.postId === "" ? null : data.postId;
        const commentId = data.commentId === "" ? null : data.commentId;
        if (userId == null || postId == null) return
        const like = data.likeBool === "true" ? true : false;

        // We want to relate userId to commentId if the user is liking the comment, or post if they are liking the post.
        let relationalId = commentId !== undefined && commentId !== null ? commentId : postId;

        const querySnapshot = await firestore.collection(LIKE_COLLECTION)
            .where("userId", "==", userId)
            .where("relationalId", "==", relationalId)
            .get();

        if (querySnapshot.empty) {
            await firestore.collection(LIKE_COLLECTION).add({
                userId, relationalId, postId, like
            });
            likeCount = await updateLikeCount(postId, commentId, like, true);
        } else {
            const doc = querySnapshot.docs[0];
            likeValue = doc.data().like;
            if (likeValue !== like) {
                await doc.ref.update({
                    like: like
                })
                likeCount = await updateLikeCount(postId, commentId, like, false);
            }
        }
        return likeCount
    } catch (error) {
        console.error('Error updating likes:', error);
        throw error;
    }

    async function updateLikeCount(postId, commentId, like, newLike) {
        let postDocRef = await firestore.collection(POST_COLLECTION).doc(postId).get();
        if (commentId !== undefined && commentId !== null) {
            const commentDocRef = await postDocRef.ref.collection(COMMENT_COLLECTION)
                .doc(commentId).get();
            return await likeCountHelper(commentDocRef, like, newLike);
        } else {
            return await likeCountHelper(postDocRef, like, newLike);
        }
    }

    async function likeCountHelper(docRef, like, newLike) {
        let likeCount = docRef.data().likeCount;
        let incValue = 1;
        if (!newLike) incValue = 2;
        likeCount += like ? incValue : -incValue;
        await docRef.ref.update({
            likeCount
        });
        return likeCount;
    }
}

module.exports = {
    updateLike
  }