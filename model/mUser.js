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
        let querySnapshot = await query.get();

        let users = [];
        querySnapshot.forEach(doc => {
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
    try {
        const query = firestore.collection(COLLECTION_NAME);
        const queryResult = await query.where("user.sub", "==", userId).get();
        const users = [];
        queryResult.forEach(doc => {
            users.push(doc.data());
        });
        if (users.length === 0) {
            console.log(`No user found with ID: ${userId}`);
            return null;  // Return null if no user is found
        }
        return users[0];
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
}

async function updateUserInfo(userId, updateData) {
    try {
        const query = await firestore.collection(COLLECTION_NAME).where("user.sub", "==", userId).get();
        // We only want to update the fields that are filled in.
        const updatedUserData = {};
        for (const field in updateData) {
            if (updateData[field]) {
                updatedUserData[`user.${field}`] = updateData[field];
            }
        }
        query.forEach(async doc => {
                await doc.ref.update(updatedUserData)
        })
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
}

module.exports = {
    getUsers, postUser, getUserInfo, updateUserInfo
};

