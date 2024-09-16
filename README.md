# Firebase Storage Uploader

This project is a web base uploader built with Node.JS, express, firebase storage and firebase realtime database.

## Fearures

-  File upload with size 10MB (set default on [`.env`](/.env.example#L5))
-  File Storage on Firebase Storage
-  Save file using md5 by buffer file, to prevent duplicates
-  Deleted file by hash id

## Installation

1. Clone the repository

```sh
git clone https://github.com/chiya-project/fireup.git
```

2. go to the folder and install dependencies

```sh
cd fireup && npm install
```

3. Create `.env` file, Example on [`.env.example`](/.env.example)

## How to get private key

1. go to [`firebase console`](https://console.firebase.google.com/) and select your project. if it doesn't already exist, create one.
2. Click Project Overview > Project Settings > Service Accounts > Generate New Private Key.
3. don't forget to start firebase storage and realtime database, they are in the menu.

## Author
- [`Github`](https://github.com/DikaArdnt)
- [`Website`](https://dikaardnt.com)