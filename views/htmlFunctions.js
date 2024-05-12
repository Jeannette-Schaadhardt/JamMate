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
