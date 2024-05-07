// citation: https://cloud.google.com/nodejs/docs/reference/datastore/latest
const { Datastore } = require("@google-cloud/datastore");
const fs = require('fs');
const datastore = new Datastore();
const POST = "Post";

const fromDatastore = (item) => {
    try {
        item.id = item[datastore.KEY].id;
        return item;
    } catch {
        return -1;
    }
};

function createPost(userId, nickname, content, file) {
  const postKey = datastore.key([POST]);
  const timestamp = new Date().getTime();
  const dateTime = new Date(timestamp).toLocaleString();

  const postData = {
      userId: userId,
      nickname: nickname,
      content: content,
      timestamp: dateTime,
      likeCount: 0, 
      fileName: null,
      fileData: null,
      fileType: null
  };

  if (file) {
      const fileBase64 = file.buffer.toString('base64');
      postData.fileName = file.originalname;
      postData.fileData = fileBase64;
      postData.fileType = file.mimetype;
  }

  const postEntity = {
      key: postKey,
      data: [
          { name: 'userId', value: postData.userId },
          { name: 'nickname', value: postData.nickname },
          { name: 'content', value: postData.content },
          { name: 'timestamp', value: postData.timestamp },
          { name: 'likeCount', value: postData.likeCount },
          { name: 'fileName', value: postData.fileName, excludeFromIndexes: true },
          { name: 'fileData', value: postData.fileData, excludeFromIndexes: true },
          { name: 'fileType', value: postData.fileType, excludeFromIndexes: true }
      ]
  };

  return datastore.save(postEntity).then(() => ({
      id: postKey.id.toString(),
      content: postData.content,
      nickname: postData.nickname,
      timestamp: postData.timestamp,
      likeCount: postData.likeCount,
      fileName: postData.fileName,
      fileType: postData.fileType
  }));
}


/*
* getPost:
*
* TODO: uses a postId to be used when building and displaying an individual post. The use case is for sharing a link to a post.
* @param[in] postId
*/
async function getPost(postId) {
  const query = datastore.createQuery(POST);
  return datastore.runQuery(query).then((posts) => {
      return posts[0].map(fromDatastore);
  });
}

async function getPosts(userId = null) {
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
async function searchPosts(searchTerm) {
    const query = datastore.createQuery(POST);
    return datastore.runQuery(query).then((posts) => {
        return posts[0].map(fromDatastore);
    });
}

module.exports = {
  fromDatastore, createPost, getPost, getPosts, searchPosts
}