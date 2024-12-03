document.addEventListener('DOMContentLoaded', () => {
    const textArea = document.getElementById('user-prompt'); // Assuming your textarea ID is 'user-prompt'

    // Fetch the stored result from chrome.storage.local
    chrome.storage.local.get('result', (data) => {
        if (data.result) {
            textArea.value = data.result; // Set the result in the textarea
        } else {
            textArea.value = 'No result available.';
        }
    });
});
