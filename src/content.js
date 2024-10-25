function archiveRedditPage() {
    console.log("archiveRedditPage called");
    const posts = [];

    function waitForPosts() {
        return new Promise((resolve) => {
            const checkPosts = () => {
                const postElements = document.querySelectorAll('shreddit-post');
                if (postElements.length > 0) {
                    resolve(postElements);
                } else {
                    setTimeout(checkPosts, 100);
                }
            };
            checkPosts();
        });
    }

    waitForPosts().then((postElements) => {
        console.log("Posts found:", postElements.length);
        postElements.forEach(post => {
            const title = post.querySelector('h1[slot="title"]')?.innerText;
            const author = post.getAttribute('author');
            const content = post.querySelector('div[slot="text-body"]')?.innerHTML;
            const timestamp = post.querySelector('faceplate-timeago time')?.getAttribute('datetime');
            const commentCount = post.getAttribute('comment-count');
            const score = post.getAttribute('score');
            const images = Array.from(post.querySelectorAll('ul li figure img')).map(img => img.src);

            if (title && author) {
                posts.push({ title, author, content: content || 'No text content', timestamp, commentCount, score, images });
            }
        });

        if (posts.length === 0) {
            alert("No posts found on this page. Please make sure you're on a Reddit page with posts.");
            return;
        }

        posts.forEach(post => {
            const date = new Date(post.timestamp).toISOString().split('T')[0];
            const filename = `${post.author}_${date}_${post.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;

            // Send a message to the background script to download images
            browser.runtime.sendMessage({
                action: "downloadImages",
                images: post.images,
                filename: filename
            }, (localImagePaths) => {
                const imagesHtml = localImagePaths.map(src => `<img src="${src}" style="max-width: 100%; margin-top: 10px;">`).join('');
                const htmlContent = `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>${post.title}</title>
                        <style>
                            body { font-family: Arial, sans-serif; margin: 20px; }
                            .post { border: 1px solid #ccc; padding: 10px; margin-bottom: 10px; }
                            .title { font-size: 1.2em; font-weight: bold; }
                            .author { color: #555; }
                            .content { margin-top: 10px; }
                            .timestamp, .comment-count, .score { font-size: 0.9em; color: #777; }
                        </style>
                    </head>
                    <body>
                        <h1>${post.title}</h1>
                        <div class="post">
                            <div class="title">${post.title}</div>
                            <div class="author">by ${post.author}</div>
                            <div class="timestamp">Posted on: ${new Date(post.timestamp).toLocaleString()}</div>
                            <div class="comment-count">Comments: ${post.commentCount}</div>
                            <div class="score">Score: ${post.score}</div>
                            <div class="content">${post.content}</div>
                            ${imagesHtml}
                        </div>
                    </body>
                    </html>
                `;

                const blob = new Blob([htmlContent], { type: 'text/html' });
                const reader = new FileReader();
                reader.onload = function (event) {
                    const url = event.target.result;

                    console.log("Sending download request for file:", filename);

                    // Send a message to the background script to handle the download
                    browser.runtime.sendMessage({
                        action: "download",
                        url: url,
                        filename: filename
                    });
                };
                reader.readAsDataURL(blob);
            });
        });
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "archive") {
        console.log("Received archive message");
        archiveRedditPage();
        sendResponse({ status: "Archiving started" });
    }
    return true;
});