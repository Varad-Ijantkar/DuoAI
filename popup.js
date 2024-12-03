document.addEventListener('DOMContentLoaded', () => {
    // Get the current active tab URL
    const textArea = document.getElementById('user-prompt'); // Assuming your textarea ID is 'user-prompt'

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

const textArea = document.getElementById('user-prompt'); // Assuming your textarea ID is 'user-prompt'
const customPromptButton = document.getElementById('customPrompt'); // Button for custom prompts
const inputContainer = document.getElementById('input-container'); // Container for the input box
const promptInput = document.getElementById('prompt-input'); // Input box for custom prompt
const summariseBtn = document.getElementById('summarize');

summariseBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, async(tabs) => {
        const currentUrl = tabs[0].url; // Active tab's URL
        const textArea = document.getElementById('user-prompt');
        const session = await ai.languageModel.create({
            systemPrompt: "Response should be maximum of 2-3 paragraphs" +
                "Response should focus mainly on the contents of the site" +
                "Example : Page : What is an abc on xyz.com" +
                "Answer : Answer should focus more on what an abc is not on the xyz website"
        })
        const result = await session.prompt(`Summarise this website , URL : ${currentUrl}`);
        textArea.value = result;
        // Save the result in chrome.storage.local, using the URL as the key
        chrome.storage.local.set({ [currentUrl]: result }, () => {
            console.log('Summary saved to storage.');
        });
    })
})


// Toggle the input box visibility when the "Custom Prompt" button is clicked
customPromptButton.addEventListener('click', () => {
    if (inputContainer.classList.contains('hidden')) {
        inputContainer.classList.remove('hidden');
        promptInput.focus();
    } else {
        inputContainer.classList.add('hidden');
    }
});

// Handle the Enter key press in the input box
promptInput.addEventListener('keypress', async(e) => {
    if (e.key === 'Enter') {
        e.preventDefault(); // Prevent default form submission
        const promptText = promptInput.value.trim();

        if (promptText) {
            const session = await ai.languageModel.create({
                systemPrompt: "Response should be brief"
            })
            const result = await session.prompt(promptText);
            textArea.value = result;
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                const currentUrl = tabs[0].url; // Active tab's URL
                chrome.storage.local.set({ [currentUrl]: textArea.value }, () => {
                    console.log("Custom prompt saved!");
                });
            });

            // Clear the input box and hide it
            promptInput.value = '';
            inputContainer.classList.add('hidden');
        }
    }
});
