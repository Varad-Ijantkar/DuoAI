document.addEventListener('DOMContentLoaded', () => {
    const textArea = document.getElementById('user-prompt'); // Assuming your textarea ID is 'user-prompt'

    // Get the current active tab URL
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentUrl = tabs[0].url; // Active tab's URL

        // Fetch the stored result from chrome.storage.local based on the current site
        chrome.storage.local.get([currentUrl], (data) => {
            if (data[currentUrl]) {
                textArea.value = data[currentUrl]; // Set the result in the textarea for this site
            }
        });
    });
});
