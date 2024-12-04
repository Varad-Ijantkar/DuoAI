document.addEventListener("mouseup", (event) => {
    setTimeout(() => {
        const selectedText = window.getSelection().toString().trim();
        if (selectedText) {
            let container = document.getElementById("button-container");
            if (!container) {
                container = createButtonContainer();
            }

            const range = window.getSelection().getRangeAt(0);
            const rect = range.getBoundingClientRect();
            positionContainer(container, rect);
            container.style.display = "block";

            assignButtonActions(selectedText);
        } else {
            hideButtonContainer();
        }
    }, 0);
});

document.addEventListener("mousedown", (event) => {
    const container = document.getElementById("button-container");
    if (container && !container.contains(event.target)) {
        container.style.display = "none";
    }
});

function createButtonContainer() {
    const container = document.createElement("div");
    container.id = "button-container";
    container.style.position = "absolute";
    container.style.zIndex = "9999";
    container.style.display = "none";
    container.style.background = "#eaf4fe"; // Light blue background
    container.style.border = "1px solid #0078d7"; // Blue border
    container.style.padding = "5px";
    container.style.borderRadius = "10px";
    container.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
    container.style.fontFamily = "Consolas, monospace"; // Consolas font

    // Flexbox for button layout
    container.style.display = "flex";
    container.style.justifyContent = "space-between"; // Space between buttons
    container.style.alignItems = "center"; // Vertically center align

    // Add buttons
    ["Summarize", "Send Prompt"].forEach((text) => {
        const button = document.createElement("button");
        button.textContent = text;
        button.dataset.action = text.replace(" ", "");
        button.style.cssText = `
            background-color: #0078d7;
            color: white;
            border: none;
            padding: 5px 8px;
            border-radius: 5px;
            cursor: pointer;
            font-family: Consolas, monospace;
            font-size: 14px;
            font-weight: bold;
            transition: background-color 0.3s ease, transform 0.3s ease;
            margin:2px; 
        `;
        button.addEventListener("mouseenter", () => {
            button.style.backgroundColor = "#005ea5"; // Darker blue on hover
            button.style.transform = "scale(1.05)";
        });
        button.addEventListener("mouseleave", () => {
            button.style.backgroundColor = "#0078d7";
            button.style.transform = "scale(1)";
        });

        container.appendChild(button);
    });

    document.body.appendChild(container);
    return container;
}


function positionContainer(container, rect) {
    container.style.top = `${window.scrollY + rect.bottom}px`;
    container.style.left = `${window.scrollX + rect.left}px`;
    container.style.transform = "translateY(5px)";
}

async function Summarize(selectedText) {
    const summarizer = await ai.summarizer.create();
    const result = await summarizer.summarize(selectedText);
    console.log(result);

    // After a brief delay, send the message to the popup
    await chrome.runtime.sendMessage({ action: "summarise", result: result });
}

function SendPrompt(selectedText) {
    const senderUrl = window.location.href; // Get current tab's URL
    chrome.runtime.sendMessage({
        action: "sendPrompt",
        result: [selectedText, senderUrl],
    });
}

const buttonActions = {
    Summarize,
    SendPrompt,
};

function assignButtonActions(selectedText) {
    document.querySelectorAll("#button-container button").forEach((button) => {
        const action = buttonActions[button.dataset.action];
        if (action) {
            button.onclick = () => {
                action(selectedText);
            };
        }
    });
}

function hideButtonContainer() {
    const container = document.getElementById("button-container");
    if (container) {
        container.style.display = "none";
    }
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "showResult") {
        setTimeout(() => {
            chrome.runtime.sendMessage({ action: "amazon", result: message.data });
        }, 500);
    }
});
