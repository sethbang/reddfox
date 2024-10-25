browser.action.onClicked.addListener((tab) => {
    if (tab.url.includes("reddit.com")) {
        chrome.tabs.sendMessage(tab.id, { action: "archive" })
            .catch((error) => {
                console.error("Error sending message:", error);
                // If the content script is not loaded, inject and execute it
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['content.js']
                }).then(() => {
                    // After injection, send the message again
                    return chrome.tabs.sendMessage(tab.id, { action: "archive" });
                }).catch((error) => {
                    console.error("Error executing script:", error);
                });
            });
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "download") {
        fetch(request.url)
            .then(response => response.blob())
            .then(blob => {
                const url = URL.createObjectURL(blob);
                const downloads = browser.downloads || chrome.downloads;
                downloads.download({
                    url: url,
                    filename: request.filename,
                    conflictAction: 'overwrite',
                    saveAs: false
                }, (downloadId) => {
                    if (browser.runtime.lastError) {
                        console.error("Error downloading file:", browser.runtime.lastError);
                    } else {
                        console.log("Download started with ID:", downloadId);
                        URL.revokeObjectURL(url);
                    }
                });
            })
            .catch(error => {
                console.error("Error fetching the data URL:", error);
            });
    } else if (request.action === "downloadImages") {
        const imagePromises = request.images.map((imageUrl, index) => {
            return fetch(imageUrl)
                .then(response => response.blob())
                .then(blob => {
                    const url = URL.createObjectURL(blob);
                    const imageFilename = `${request.filename}_image_${index}.jpg`;
                    return new Promise((resolve, reject) => {
                        const downloads = browser.downloads || chrome.downloads;
                        downloads.download({
                            url: url,
                            filename: imageFilename,
                            conflictAction: 'overwrite',
                            saveAs: false
                        }, (downloadId) => {
                            if (browser.runtime.lastError) {
                                console.error("Error downloading image:", browser.runtime.lastError);
                                reject(browser.runtime.lastError);
                            } else {
                                console.log("Image download started with ID:", downloadId);
                                URL.revokeObjectURL(url);
                                resolve(imageFilename);
                            }
                        });
                    });
                });
        });

        Promise.all(imagePromises)
            .then(localImagePaths => {
                sendResponse(localImagePaths);
            })
            .catch(error => {
                console.error("Error downloading images:", error);
                sendResponse([]);
            });

        // Return true to indicate that the response will be sent asynchronously
        return true;
    }
});