chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed and service worker running.");
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "logSelection") {
        console.log("Selected text:", message.text);
        sendResponse({ status: "Received" });
    }
});
