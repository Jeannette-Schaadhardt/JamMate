// // citation: https://cloud.google.com/nodejs/docs/reference/datastore/latest
// const { Datastore } = require("@google-cloud/datastore");
// const datastore = new Datastore();
// const { Firestore } = require("@google-cloud/firestore");
// const firestore = new Firestore();

// const COMMENT = "Comment";  // Defining kind at the top for consistency

// // A helper function that attempts to get the ID of an imput item
// // and assign it to the new ID on the returned item
// // A code snippet from CS493
// function fromFirestore(doc) {
//     try {
//         const data = doc.data();
//         data.id = doc.id;
//         return data;
//     } catch (error) {
//         console.error('Error converting Firestore document:', error);
//         throw error;
//     }
// }

// function createComment(userId, postId, commentText, repliedCommentId = null) {
//     const commentKey = datastore.key([COMMENT]);
//     // Prepare data object including file information if available
//     const timestamp = new Date().getTime();
//     const dateTime = new Date(timestamp).toLocaleString();

//     const commentData = {
//       userId: userId,
//       commentText: commentText,
//       postId: postId,
//       repliedCommentId: repliedCommentId,
//       date: dateTime,
//       likeCount: 0,
//     };

//     const commentEntity = {
//       key: commentKey,
//       data: commentData
//     };

//     return datastore.save(commentEntity).then(() => ({ id: commentKey.id, ...commentData }));
// }

// async function getComments(postId) {
//     let commentQuery = firestore.collection('comments').where('repliedCommentId', '==', null).orderBy(likeCount);
//     let replyQuery = firestore.collection('comments').where('repliedCommentId', '!=', null);
//     try {
//         const snapshot = await query.get();
//         const comments = snapshot.docs.map(doc => doc.data());
//         return comments;
//     } catch (error) {
//         console.error('Error fetching comments:', error);
//         throw error;
//     }
// }

// module.exports = {
//   fromFirestore, createComment, getComments
// }