// Add listeners for text selection and interaction
document.addEventListener("mouseup", (event) => {
    setTimeout(() => {
        const selectedText = window.getSelection().toString().trim();
        if (selectedText) {
            // Ensure the container exists
            let container = document.getElementById("button-container");
            if (!container) {
                container = createButtonContainer();
            }

            // Position and display the button container
            const range = window.getSelection().getRangeAt(0);
            const rect = range.getBoundingClientRect();
            positionContainer(container, rect);
            container.style.display = "block";

            // Assign functionality to buttons
            assignButtonActions(selectedText);
        } else {
            hideButtonContainer();
        }
    }, 0); // Small delay to ensure selection is finalized
});

document.addEventListener("mousedown", (event) => {
    const container = document.getElementById("button-container");
    if (container && !container.contains(event.target)) {
        container.style.display = "none";
    }
});

// Helper: Create the button container
function createButtonContainer() {
    const container = document.createElement("div");
    container.id = "button-container";
    container.style.position = "absolute";
    container.style.zIndex = "9999";
    container.style.display = "none";
    container.style.background = "#f0f0f0";
    container.style.border = "1px solid #ccc";
    container.style.padding = "5px";
    container.style.borderRadius = "5px";
    container.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";

    // Add buttons
    ["Summerise", "Send Prompt"].forEach((text, index) => {
        const button = document.createElement("button");
        button.textContent = text;
        button.style.margin = "0 5px";
        button.dataset.action = `action${index + 1}`;
        container.appendChild(button);
    });

    document.body.appendChild(container);
    return container;
}

// Helper: Position the button container
function positionContainer(container, rect) {
    container.style.top = `${window.scrollY + rect.bottom}px`;
    container.style.left = `${window.scrollX + rect.left}px`;

    // Adjust position slightly to avoid overlapping
    container.style.transform = "translateY(5px)";
}


async function Summerize(selectedText) {
    summarizer = await ai.summarizer.create();
    const result = await summarizer.summarize(selectedText);
    console.log(result);
    alert(result);
}

const buttonActions = {
    "Summerise":Summerize,
    "Send Prompt":Summerize,
};


// Helper: Assign actions to buttons
function assignButtonActions(selectedText) {
    document.querySelectorAll("#button-container button").forEach((button) => {
        const action = buttonActions[button.textContent];
        if (action) {
            button.onclick = () => {
                action(selectedText);
            }
        }
    });
}
// Helper: Hide the button container
function hideButtonContainer() {
    const container = document.getElementById("button-container");
    if (container) {
        container.style.display = "none";
    }
}
