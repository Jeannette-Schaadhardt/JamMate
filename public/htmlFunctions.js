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