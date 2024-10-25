# reddfox

**reddfox** is a tool for creating searchable snapshots of Reddit posts, capturing essential metadata such as author, title, keywords, and dates. This project aims to make it easier to index and search through Reddit content for research, archival, or personal use.

## Features

- **Snapshot Creation**: Capture Reddit posts, including the title, author, date, and other relevant metadata.
- **Searchable Database**: Store snapshots in a database that can be queried based on various parameters like author, title, keyword, and date.
- **Keyword Tagging**: Automatically tags posts for easier search and retrieval.
- **User-Friendly Interface**: Simple command-line interface for interacting with the database.

## Getting Started

### Prerequisites

- [Python 3.8+](https://www.python.org/downloads/)
- [SQLite](https://www.sqlite.org/index.html) or another preferred database system.
- [Reddit API credentials](https://www.reddit.com/prefs/apps) for accessing Reddit's data through the API.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/sethbang/reddfox.git
   cd reddfox
2.	Install the required dependencies:
    ```bash
    pip install -r requirements.txt
3.	Set up your Reddit API credentials by creating a .env file in the root directory with the following:
    ```bash
    CLIENT_ID=your_client_id
    CLIENT_SECRET=your_client_secret
    USER_AGENT=your_user_agent
### Usage

1.	Create Snapshots:
Capture a snapshot of a specific Reddit post or a list of posts:
    ```bash
    python reddfox.py snapshot --subreddit <subreddit_name> --limit <number_of_posts>
2.	Search Snapshots:
Search through the database using different filters:
    ```bash
    python reddfox.py search --author <author_name>
    python reddfox.py search --keyword <keyword>
    python reddfox.py search --date <YYYY-MM-DD>


3.	Export Data:
Export your snapshots into a JSON or CSV file:
    ```bash
    python reddfox.py export --format json --output snapshots.json
### Contributing

Contributions are welcome! Please follow these steps:

1.	Fork the repository.
2.	Create a new branch (git checkout -b feature/your-feature).
3.	Commit your changes (git commit -m 'Add some feature').
4.	Push to the branch (git push origin feature/your-feature).
5.	Open a pull request.

### License

This project is licensed under the MIT License - see the LICENSE file for details.