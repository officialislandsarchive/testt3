document.addEventListener("DOMContentLoaded", () => {
    const chatForm = document.getElementById("chat-form");
    const chatInput = document.getElementById("chat-input");
    const chatMessages = document.getElementById("chat-messages");

    if (!chatForm || !chatInput || !chatMessages) {
        console.error("Could not find chat elements.");
        return;
    }

    let isProcessing = false;

    function addMessage(message, isBot, isError = false) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message", isBot ? "bot-message" : "user-message");

        if (isError) {
            messageDiv.classList.add("error-message");
            message = `Error: ${message}`;
        }

        messageDiv.innerText = message;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function handleChatSubmit(event) {
        event.preventDefault();

        if (isProcessing) return;

        const message = chatInput.value.trim();
        if (!message) return;

        addMessage(message, false);
        chatInput.value = "";
        isProcessing = true;

        showTypingIndicator(true, "Thinking...");

        const result = await sendMessage(message);

        if (result.success) {
            setTimeout(() => {
                hideTypingIndicator(true);
                addMessage(result.response, true);
                isProcessing = false;
            }, 750);
        } else {
            hideTypingIndicator(true);
            addMessage(result.response, true, true);
            isProcessing = false;
        }
    }

    chatForm.addEventListener("submit", handleChatSubmit);
    loadMessages();

    chatInput.addEventListener("focus", () => chatInput.classList.add("focused"));
    chatInput.addEventListener("blur", () => chatInput.classList.remove("focused"));
    chatMessages.addEventListener("scroll", () => {
        chatMessages.classList.toggle("at-top", chatMessages.scrollTop < 50);
    });

    let typingTimeout;
    chatInput.addEventListener("input", () => {
        clearTimeout(typingTimeout);
        showTypingIndicator(false, "Typing...");
        typingTimeout = setTimeout(() => hideTypingIndicator(false), 1000);
    });

    function showTypingIndicator(isBot, text) {
        let typingIndicator = document.getElementById(isBot ? "bot-typing-indicator" : "user-typing-indicator");
        if (!typingIndicator) {
            typingIndicator = document.createElement("div");
            typingIndicator.id = isBot ? "bot-typing-indicator" : "user-typing-indicator";
            typingIndicator.innerHTML = `<div class='typing-indicator'>${text}</div>`;
            typingIndicator.classList.add("typing-indicator-container", isBot ? "bot-typing" : "user-typing");
            chatMessages.appendChild(typingIndicator);
        } else {
            typingIndicator.innerHTML = `<div class='typing-indicator'>${text}</div>`;
        }
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function hideTypingIndicator(isBot) {
        const typingIndicator = document.getElementById(isBot ? "bot-typing-indicator" : "user-typing-indicator");
        if (typingIndicator) typingIndicator.remove();
    }

    async function sendMessage(message) {
        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ message }),
            });

            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch {
                    throw new Error("Server error, unable to parse response.");
                }
                throw new Error(errorData.error || "Unknown error occurred.");
            }

            const data = await response.json();
            return { success: true, response: data.response };
        } catch (error) {
            return { success: false, response: error.message || "Error connecting to server. Please try again." };
        }
    }

    async function loadMessages() {
        try {
            const response = await fetch("/api/messages", { credentials: "include" });
            if (!response.ok) throw new Error("Failed to fetch messages.");
            const data = await response.json();
            data.messages.forEach((msg) => addMessage(msg.message, msg.is_bot));
        } catch (error) {
            console.error("Error loading messages:", error);
        }
    }
});