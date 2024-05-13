const { Firestore } = require("@google-cloud/firestore");
const firestore = new Firestore();
const COLLECTION_NAME = "User";

async function getUsers(userEntity = null, username=null, userId=null) {
    try {
        let query = firestore.collection(COLLECTION_NAME);
        if (userEntity != null) {
            query = query.where('user.sub', '==', userEntity.user.sub);
        } else if (username != null) {
            query = query.where('user.nickname', '==', username);
        } else if (userId != null) {
            query = query.where('user.sub', '==', userId);
        }
        let query_result = await query.get();

        const users = [];
        query_result.forEach(doc => {
            users.push(doc.data());
        });
        return users;
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
}

async function postUser(userEntity) {
    const query = firestore.collection(COLLECTION_NAME);
    try {
        const userExists = await query.where('user.email', '==', userEntity.user.email).get();
        if (userExists.empty) {
            await query.add(userEntity);
            return userEntity.user;
        } else {
            return userExists.docs[0].data().user;
        }
    } catch (error) {
        console.error('Error posting user:', error);
        throw error;
    }
}

async function getUserInfo(userId) {
    const userRef = firestore.collection(COLLECTION_NAME).doc(userId);
    const doc = await userRef.get();
    if (!doc.exists) {
        console.log(`No user found with ID: ${userId}`);
        return null;  // Return null if no user is found
    }
    return doc.data();
}

async function updateUserInfo(userId, updateData) {
    const userRef = firestore.collection(COLLECTION_NAME).doc(userId);
    await userRef.update(updateData);
}

module.exports = {
    getUsers, postUser, getUserInfo, updateUserInfo
};

