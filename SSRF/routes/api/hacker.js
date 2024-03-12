const express = require('express');
const fs = require('fs');
const path = require('path');
const request = require('request');

const hackerRouter = express.Router();

const currentDirectory = __dirname;
const imagesDirectory = path.join(currentDirectory, '..', '..', '/public/images');

hackerRouter.use('/images', express.static(imagesDirectory));

// save user image from URL
const saveUserImage = async (username, imageURL) => {
    const imagePath = path.join(imagesDirectory, `${username}`);
    if (fs.existsSync(imagePath)) {
        return 'image with this name already exists';
    }

    try {
        await new Promise((resolve, reject) => {
            const writeStream = fs.createWriteStream(`${imagesDirectory}/${username}.jpg`);
            const imageRequest = request
                .get(imageURL)
                .on('error', reject)
                .on('response', function (res) {
                    if (res.statusCode !== 200) {
                        reject(new Error('Failed to fetch image'));
                    }
                });
            
            imageRequest.pipe(writeStream);

            writeStream.on('finish', () => {
                resolve(true);
            });
        });
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

hackerRouter.get('/hacker/create', (req, res) => {
    res.render('createUserForm');
});

hackerRouter.post('/hacker/create', async (req, res) => {
    try {
        const { username, imageUrl } = req.body;
        console.log(req.body)
        if (!username || !imageUrl) {
            res.status(400).json({ error: 'You must provide a username and an image URL' });
            return;
        }

        const saveResult = await saveUserImage(username, imageUrl);
        if (saveResult === true) {
            res.redirect(`/hacker/${username}`);
            return;
        } else if (saveResult === 'image already exists') {
            res.status(409).json({ error: 'Image already exists' });
            return;
        } else {
            res.status(500).json({ error: 'Failed to save user image' });
            return;
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// get hacker 

hackerRouter.get('/hacker/:username', (req, res) => {
    const { username } = req.params;
    
     const user = {
        username: username,
        image: `/images/${username}.jpg`
    };
    res.render('user', { user });
});

module.exports = hackerRouter;
