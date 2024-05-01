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

export async function createPost(userId, nickname, content, file) {
    const postKey = datastore.key([POST]);
    // Prepare data object including file information if available
    const timestamp = new Date().getTime();
    const dateTime = new Date(timestamp).toLocaleString();

    const postData = {
      userId: userId,
      nickname: nickname,
      content: content,
      timestamp: dateTime,
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

  export async function getPosts(userId = null) {
    const query = datastore.createQuery(POST);
    return datastore.runQuery(query).then((results) => {
      const posts = results[0];
      // Filter posts if userId is provided
      if (userId) {
        return posts.filter(post => post.userId === userId).map(fromDatastore);
      } else {
        return posts.map(fromDatastore);
      }
    });
  }

/*
* searchPosts:
*
* TODO: takes a term, and ideally filters as well that can be applied after the initial search when you refresh the search.
* It uses these to run a query on the datastore and attempts to sort based on relevance to the search term or the chosen sort method.
* @param[in] searchTerm
*/
export async function searchPosts(searchTerm) {
    const query = datastore.createQuery(POST);
    return datastore.runQuery(query).then((posts) => {
        return posts[0].map(fromDatastore);
    });
}

/*
* getPost:
*
* TODO: uses a postID to be used when building and displaying an individual post. The use case is for sharing a link to a post.
* @param[in] postID
*/
export async function getPost(postID) {
    const query = datastore.createQuery(POST);
    return datastore.runQuery(query).then((posts) => {
        return posts[0].map(fromDatastore);
    });
}