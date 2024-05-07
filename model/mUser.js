// citation: https://cloud.google.com/nodejs/docs/reference/datastore/latest
const { Datastore } = require("@google-cloud/datastore");
const datastore = new Datastore();
const USER = "User";
const POST = "Post";  // Defining kind at the top for consistency

// A helper function that attempts to get the ID of an imput item
// and assign it to the new ID on the returned item
// A code snippet from CS493
function fromDatastore(item) {
  try {
      item.id = item[datastore.KEY].id;
      return item;
  } catch {
      return null; // Changed from -1 to null for better error handling
  }
}

function getUser(user) {
  if (!user || !user.user || !user.user.sub) {
      console.error("Invalid user data provided.");
      return Promise.reject(new Error("Invalid user data provided."));
  }

  const query = datastore.createQuery(USER);
  return datastore.runQuery(query).then((users) => {
      console.log("Users from Datastore:", users[0]); // Log the raw user data
      const userCheck = users[0].map(fromDatastore).filter(filteredUser => {
          // Ensure `filteredUser` and `filteredUser.user` are defined
          return filteredUser && filteredUser.user && filteredUser.user.sub === user.user.sub;
      });
      return userCheck;
  });
}

// https://auth0.com/docs/secure/tokens/json-web-tokens
function postUser(user) {
  // The datastore key associated with a USER entity
  const key = datastore.key(USER);

  // Check if User already exists in the database
  // If User exists, return the User without saving in database
  return getUser(user).then((userCheck) => {

    if (userCheck.length === 0) {
      // Save the new user in datastore, and store in this var
      return datastore.save({ "key": key, "data": user }).then((res) => {
        return user.user;
      });
    } else {
      return userCheck[0].user;
    }
  })
}

module.exports = {
  fromDatastore, getUser, postUser
}
