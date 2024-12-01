document.getElementById("send-prompt-btn").addEventListener("click", async () => {
    // Get the active tab's URL
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        if (tabs.length > 0) {
            const currentTab = tabs[0];
            const url = currentTab.url;

            // Display the current page URL
            document.getElementById("url").textContent = `URL: ${url}`;

            // Get the user's custom prompt
            const userPrompt = document.getElementById("user-prompt").value;

            // Ensure the user entered a prompt
            if (!userPrompt.trim()) {
                alert("Please enter a prompt before sending.");
                return;
            }

            try {
                // Replace this with your actual LLM integration
                const session = await ai.languageModel.create();
                const result = await session.prompt(`${url} : ${userPrompt}`);

                // Clear the summary box
                document.getElementById("summary-box").value = result;

            } catch (error) {
                console.error("Error during summarization:", error);
                document.getElementById("summary-box").value = "Failed to fetch summary. Please try again.";
            }
        } else {
            console.error("No active tabs found.");
        }
    });
});
