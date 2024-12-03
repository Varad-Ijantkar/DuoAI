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
    container.style.background = "#f0f0f0";
    container.style.border = "1px solid #ccc";
    container.style.padding = "5px";
    container.style.borderRadius = "5px";
    container.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";

    // Add buttons
    ["Summarize", "Send Prompt"].forEach((text, index) => {
        const button = document.createElement("button");
        button.textContent = text;
        button.style.margin = "0 5px";
        button.dataset.action = text.replace(" ", "");
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
    alert(result);
}

async function SendPrompt(selectedText) {
    const url = window.location.href;  // Get current tab's URL
    const userPrompt = prompt("Enter prompt : ");
    const session = await ai.languageModel.create({
        systemPrompt: "answer only the question provided by user",
    })
    await session.prompt("I will provide the input in 3 parts, a url, a context and a prompt." +
        "Answer the prompt with respect to the context and the given url " +
        "Example : " +
        "URL : url" +
        "Context : context" +
        "Prompt : prompt");
    const result = await session.prompt(`URL : ${url} \n Context : ${selectedText} \n Prompt : ${userPrompt} `);
    console.log(result);
    alert(result);
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
