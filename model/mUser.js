// citation: https://cloud.google.com/nodejs/docs/reference/datastore/latest
import { Datastore } from '@google-cloud/datastore';

const datastore = new Datastore();
const USER = "User";
const POST = "Post";  // Defining kind at the top for consistency

export function postUser(jwt) {
  const key = datastore.key(USER);
  const userEntity = {
    key: key,
    data: jwt
  };
  return datastore.save(userEntity).then(() => ({ key, data: jwt }));
}

export function createPost(userId, content, file) {
  const postKey = datastore.key([POST]);
  // Prepare data object including file information if available
  const postData = {
    userId: userId,
    content: content,
    timestamp: new Date(),
    // Include file metadata if file is uploaded
    fileName: file ? file.originalname : null,
    filePath: file ? file.path : null,
    fileType: file ? file.mimetype : null
  };
  
  const postEntity = {
    key: postKey,
    data: postData
  };

  return datastore.save(postEntity).then(() => ({ id: postKey.id, ...postData }));
}

export async function getPosts() {
  const query = datastore.createQuery(POST).order('timestamp', { descending: true });
  const [posts] = await datastore.runQuery(query);
  return posts.map(post => ({ id: post[datastore.KEY].id, ...post }));
}
