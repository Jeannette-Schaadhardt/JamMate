
// citation: https://cloud.google.com/nodejs/docs/reference/datastore/latest
// Imports the Google Cloud client library
import { Datastore } from '@google-cloud/datastore';
// Creates a client
const datastore = new Datastore();
// Creates a user
const USER = "User";

// https://auth0.com/docs/secure/tokens/json-web-tokens
export function postUser(jwt) {
  // The datastore key associated with a USER entity
  const key = datastore.key(USER);

  // Save the new user in datastore, and store in this var
  const res = datastore.save({ "key": key, "data": jwt })
      .then(() => {
          return { key, data: jwt }
      });
  return res;
}