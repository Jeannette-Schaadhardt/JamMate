// Function used to toggle forms opened or closed.
function toggleElement(elementId) {
    var element = document.getElementById(elementId);
    var style = window.getComputedStyle(element);
    if (style.display === 'block' || style.display === '') {
        element.style.display = 'none';
    } else {
        element.style.display = 'block';
    }
}

function deletePost(postId) {
    if (confirm('Are you sure you want to delete this post?')) {
        $.ajax({
            url: '/post/' + postId,
            type: 'DELETE',
            success: function(result) {
                var buttonElement = document.getElementById('deleteButton-'+postId);
                if (buttonElement) {
                    document.getElementById('deleteButton-'+postId).innerText = "Deleted";
                } else {
                    console.error("deleteButton not found: deleteButton-" + postId);
                }
                var postElement = document.getElementById('post-'+postId);
                if (buttonElement) {
                    document.getElementById('post-'+postId).innerHTML = " ";
                } else {
                    console.error("post not found: post-" + postId);
                }
                $('#post-' + postId).remove();
            },
            error: function(xhr, status, error) {
                alert("Error deleting post: " + xhr.responseText);
            }
        });
    }
}

function deleteAllPosts(userId) {
    if (confirm('Are you sure you want to delete this post?')) {
        $.ajax({
            url: '/post/all/' + userId,
            type: 'DELETE',
            success: function(result) {

            },
            error: function(xhr, status, error) {
                alert("Error deleting post: " + xhr.responseText);
            }
        });
    }
}

function deleteAd(adId) {
    if (confirm('Are you sure you want to delete this Ad?')) {
        $.ajax({
            url: '/ad/' + adId,
            type: 'DELETE',
            success: function(result) {
                var buttonElement = document.getElementById('deleteButton-'+adId);
                if (buttonElement) {
                    document.getElementById('deleteButton-'+adId).innerText = "Deleted";
                } else {
                    console.error("deleteButton not found: deleteButton-" + adId);
                }
                var adElement = document.getElementById('ad-'+adId);
                if (buttonElement) {
                    document.getElementById('ad-'+adId).innerHTML = " ";
                } else {
                    console.error("ad not found: ad-" + adId);
                }
                $('#ad-' + adId).remove();
            },
            error: function(xhr, status, error) {
                alert("Error deleting ad: " + xhr.responseText);
            }
        });
    }
}

function controlLikeCount(userId, likeBool, postId, commentId=null) {
    var data = {
        userId, likeBool, postId, commentId
    }
    $.ajax({
        url: '/post/like',
        type: 'POST',
        data: data,
        success: function(result) {
            // Exit if the likeCount didn't change
            if (result.likeCount == null) {return true}
            // Get the right id for a comment or post
            let relationalId = commentId !== "" && commentId !== null ? commentId : postId;
            var postLikeElement = document.getElementById(`likeCount-`+relationalId);
            if (postLikeElement) {
                document.getElementById(`likeCount-`+relationalId).innerText = result.likeCount;
            } else {
                console.error(`likeCount element not found: likeCount-`+relationalId);
            }
        },
        error: function(xhr, status, error) {
            alert("Error liking post: " + xhr.responseText);
        }
    });
}

function makeComment(userId, postId, nickname, commentText) {
    var data = {
        userId, postId, nickname, commentText
    }
    $.ajax({
        url: '/comment/'+postId,
        type: 'POST',
        data: data,
        success: function(result) {
            console.log("Post success:", data);
            document.getElementById('commentForm-'+postId).reset(); // Reset the form after submission
            document.getElementById('commentForm-'+postId).style.display = 'none'; // Hide the form again
        },
        error: function(xhr, status, error) {
            alert("Error liking post: " + xhr.responseText);
        }
    });
}

// Attach event listeners to like buttons
document.querySelectorAll('.likeButton').forEach(function(likeButton) {
    likeButton.addEventListener('click', function() {
        // Extract post ID from the button's data attribute
        var userId = this.getAttribute('data-user-id');
        var postId = this.getAttribute('data-post-id');
        var commentId = this.getAttribute('data-comment-id');
        // Call controlLikeCount function with postId
        controlLikeCount(userId, true, postId, commentId);
    });
});

// Attach event listeners to dislike buttons
document.querySelectorAll('.dislikeButton').forEach(function(dislikeButton) {
    dislikeButton.addEventListener('click', function() {
        // Extract ID from the button's data attribute
        var userId = this.getAttribute('data-user-id');
        var postId = this.getAttribute('data-post-id');
        var commentId = this.getAttribute('data-comment-id');
        // Call controlLikeCount function with postId
        controlLikeCount(userId, false, postId, commentId);
    });
});

// Attach event listeners to comment form buttons
document.querySelectorAll('.commentForm').forEach(function(commentForm) {
    commentForm.addEventListener('submit', function(event) {
        event.preventDefault();
        var formData = new FormData(commentForm);
        var postId = formData.get('postId');
        var userId = formData.get('userId');
        var nickname = formData.get('nickname');
        var commentText = formData.get('commentText');
        if (nickname !=="" && nickname !== null) {
            makeComment(userId, postId, nickname, commentText);
        } else {
            return
        }
    });
});