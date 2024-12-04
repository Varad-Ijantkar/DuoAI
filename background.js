chrome.runtime.onStartup.addListener(() => {
    chrome.storage.local.clear(() => {
        console.log('Storage cleared on browser startup.');
    });
});

// Function to check if the URL is an Amazon product page for any domain
function isAmazonProductPage(url) {
    try {
        const urlObject = new URL(url);  // Parse the URL
        const hostname = urlObject.hostname;  // Get the domain
        const pathname = urlObject.pathname;  // Get the path

        // Check if the domain includes 'amazon' and the path contains '/dp/'
        return hostname.includes("amazon") && pathname.includes("/dp/");
    } catch (e) {
        console.error("Invalid URL:", e);
        return false;
    }
}

function formatLLMOutput(inputText) {
    return inputText.replace(/\*\*?|##/g, '');
}

// Listener to detect when the user navigates to a new page
chrome.webNavigation.onCompleted.addListener(async function (details) {
    const url = details.url;

    // If the page is an Amazon product page, store the URL
    if (isAmazonProductPage(url)) {
        const session = await ai.languageModel.create({
            systemPrompt: "Answer in easily understandable language by looking through customer review ," +
                "output should be divided in two parts of the product" +
                "Pros : Pros of product along with the no. of people and total customer reviews you looked up" +
                "Cons : Problems most customers are getting with the product with its  no. of people and total " +
                "customer reviews you looked up"
        })
        const result = await session.prompt(`Amazon Product URL : ${url}`);
        const formattedText = formatLLMOutput(result);
        console.log(formattedText);
        await chrome.tabs.sendMessage(details.tabId, {action: "showResult", data: formattedText});
    }
}, { url: [{ hostContains: 'amazon.' }] });

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === 'summarise' || message.action === 'amazon') {
        const resultText = formatLLMOutput(message.result);

        const currentUrl = sender.tab.url; // Get the current URL of the site
        if (currentUrl) {
            chrome.storage.local.set({ [currentUrl]: resultText }, () => {
                chrome.action.openPopup().catch((error) => {
                    console.error("Failed to open popup:", error);
                });
            });
        }
    } else if (message.action === 'sendPrompt') {
        // Store the message in storage
        chrome.storage.local.set({ sendPromptData: message.result }, () => {
            chrome.action.openPopup().catch((error) => {
                console.error("Failed to open popup:", error);
            });
        });
    }
});

