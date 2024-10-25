document.getElementById('archiveButton').addEventListener('click', () => {
    browser.tabs.query({ active: true, currentWindow: true })
        .then((tabs) => {
            if (tabs[0].url.includes("reddit.com")) {
                return browser.tabs.sendMessage(tabs[0].id, { action: "archive" });
            } else {
                console.error("Not on a Reddit page.");
            }
        })
        .catch((error) => {
            console.error("Error:", error);
        });
});

document.getElementById('archiveAllButton').addEventListener('click', () => {
    browser.tabs.query({ currentWindow: true })
        .then((tabs) => {
            const redditTabs = tabs.filter(tab => tab.url.includes("reddit.com"));
            redditTabs.forEach(tab => {
                browser.tabs.sendMessage(tab.id, { action: "archive" })
                    .catch((error) => {
                        console.error("Error sending message to tab:", tab.id, error);
                        // If the content script is not loaded, inject and execute it
                        chrome.scripting.executeScript({
                            target: { tabId: tab.id },
                            files: ['content.js']
                        }).then(() => {
                            // After injection, send the message again
                            return browser.tabs.sendMessage(tab.id, { action: "archive" });
                        }).catch((error) => {
                            console.error("Error executing script in tab:", tab.id, error);
                        });
                    });
            });
        })
        .catch((error) => {
            console.error("Error querying tabs:", error);
        });
});