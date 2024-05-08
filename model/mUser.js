const { Firestore } = require("@google-cloud/firestore");
const firestore = new Firestore();
const COLLECTION_NAME = "User";

async function getUsers(userEntity = null, username=null, userId=null) {
    try {
      // Query Firestore to find the user
      let query = firestore.collection(COLLECTION_NAME);
      if (userEntity != null) {
        query = query.where('user.sub', '==', userEntity.user.sub);
      } else if (username != null) {
        query = query.where('user.name', '==', username);
      } else if (userId != null) {
        query = query.where('user.sub', '==', userId);
      }
      let query_result = await query.get();

      // Array to hold found users
      const users = [];

      // Iterate through the documents returned by the query
      query_result.forEach(doc => {
        // Convert each document data to a JavaScript object and push it to the userCheck array
        users.push(doc.data());
      });

      // Return the users array
      return users;
    } catch (error) {
      // Handle any errors
      console.error('Error fetching user:', error);
      throw error; // Throw the error for the caller to handle
    }
  }

// https://auth0.com/docs/secure/tokens/json-web-tokens
async function postUser(userEntity) {
    const query = firestore.collection(COLLECTION_NAME)
    try {
        const userExists = await query.
        where('user.email', '==', userEntity.user.email).
        get();
        if (userExists.empty) {
            await query.add(userEntity);
            return userEntity.user;
        } else {
            const existingUser = userExists.docs[0].data();
            return existingUser.user;
        }
    } catch (error) {
        console.error('Error posting user:'.error);
        throw error;
    }
}

module.exports = {
  getUsers, postUser
}

