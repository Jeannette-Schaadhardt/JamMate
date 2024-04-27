// citation: https://cloud.google.com/nodejs/docs/reference/datastore/latest
import { Datastore } from '@google-cloud/datastore';
const datastore = new Datastore();

const POST = "Post";  // Defining kind at the top for consistency

// A helper function that attempts to get the ID of an imput item
// and assign it to the new ID on the returned item
// A code snippet from CS493
function fromDatastore(item) {
    try {
        item.id = item[datastore.KEY].id;
        return item;
    } catch {
        return -1;
    }
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

  export async function getPublicPosts() {
    const query = datastore.createQuery(POST).order('timestamp', { descending: true });
    const [posts] = await datastore.runQuery(query);
    return posts.map(ds.fromDatastore);
  }