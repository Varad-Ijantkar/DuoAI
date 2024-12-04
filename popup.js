document.addEventListener('DOMContentLoaded', () => {
    // Existing functionality for sendPrompt
    chrome.storage.local.get('sendPromptData', (data) => {
        if (data.sendPromptData) {
            const inputContainer = document.getElementById('ch-ex-input-container');
            if (inputContainer.classList.contains('ch-ex-hidden')) {
                inputContainer.classList.remove('ch-ex-hidden');
                promptInput.focus();
            }
        }
    });

    // New feature: Populate textarea based on current tab's URL
    const textArea = document.getElementById('ch-ex-user-prompt'); // Updated textarea ID

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentUrl = tabs[0].url; // Active tab's URL

        // Fetch the stored result from chrome.storage.local based on the current site
        chrome.storage.local.get([currentUrl], (data) => {
            if (data[currentUrl]) {
                // Append the data if it already contains sendPrompt content
                textArea.value += `${data[currentUrl]}`;
            }
        });
    });
});

const textArea = document.getElementById('ch-ex-user-prompt'); // Updated textarea ID
const customPromptButton = document.getElementById('ch-ex-customPrompt'); // Updated button ID
const inputContainer = document.getElementById('ch-ex-input-container'); // Updated container ID
const promptInput = document.getElementById('ch-ex-prompt-input'); // Updated input box ID
const summariseBtn = document.getElementById('ch-ex-summarize'); // Updated summarize button ID

summariseBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        const currentUrl = tabs[0].url; // Active tab's URL
        const textArea = document.getElementById('ch-ex-user-prompt'); // Updated textarea ID
        const session = await ai.languageModel.create({
            systemPrompt: "Response should be maximum of 2-3 paragraphs" +
                "Response should focus mainly on the contents of the site" +
                "Example : Page : What is an abc on xyz.com" +
                "Answer : Answer should focus more on what an abc is not on the xyz website"
        });
        const result = await session.prompt(`Summarise this website , URL : ${currentUrl}`);
        textArea.value = result;
        // Save the result in chrome.storage.local, using the URL as the key
        chrome.storage.local.set({ [currentUrl]: result }, () => {
            console.log('Summary saved to storage.');
        });
    });
});

// Toggle the input box visibility when the "Custom Prompt" button is clicked
customPromptButton.addEventListener('click', () => {
    if (inputContainer.classList.contains('ch-ex-hidden')) {
        inputContainer.classList.remove('ch-ex-hidden');
        promptInput.focus();
    } else {
        inputContainer.classList.add('ch-ex-hidden');
    }
});

// Handle the Enter key press in the input box
promptInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        e.preventDefault(); // Prevent default form submission
        const promptText = promptInput.value.trim();

        // Fetch `sendPromptData` to determine functionality
        chrome.storage.local.get('sendPromptData', async (data) => {
            if (data.sendPromptData) {
                // Case: `sendPromptData` exists
                const [selectedText, senderUrl] = data.sendPromptData;
                const session = await ai.languageModel.create({
                    systemPrompt: "answer only the question provided by user",
                });
                await session.prompt("I will provide the input in 3 parts, a url, a context and a prompt." +
                    "Answer the prompt with respect to the context and the given url " +
                    "Example : " +
                    "URL : url" +
                    "Context : context" +
                    "Prompt : prompt");
                const result = await session.prompt(`URL : ${senderUrl} \n Context : ${selectedText} \n Prompt : ${promptText} `);
                textArea.value = result;
                chrome.storage.local.remove('sendPromptData', () => {
                    console.log("Processed sendPromptData and cleared it.");
                });
            } else if (promptText) {
                // Case: `sendPromptData` does NOT exist
                const session = await ai.languageModel.create({
                    systemPrompt: "Response should be brief",
                });
                const result = await session.prompt(promptText);
                textArea.value = result;

                // Save the result in storage for the current URL
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    const currentUrl = tabs[0].url; // Active tab's URL
                    chrome.storage.local.set({ [currentUrl]: textArea.value }, () => {
                        console.log("Custom prompt saved!");
                    });
                });
            }

            // Clear the input box and hide it
            promptInput.value = '';
            inputContainer.classList.add('ch-ex-hidden');
        });
    }
});
