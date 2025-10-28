const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: 'dankquy0f',
    api_key: '241731221424233',
    api_secret: '1DSYWPNamnLDmGpe1hgvK_I4kB0'
});

module.exports = cloudinary;