const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Foundation = require('../models/Foundation');
const config = require('../config/index');
const busboy = require('busboy');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: config.cloudName,
  api_key: config.cloudinaryKey,
  api_secret: config.cloudinarySecret,
});

const authAdmin = async (req, res, next) => {
  try {
    const token = req.get('Authorization');
    const data = jwt.verify(token, config.jwtKey);

    let user = await User.findOne({ _id: data.userId });
    if (user && user.role === 'admin') {
      res.locals.user = user;
      next();
    } else {
      res.status(401).json({ error: 'User not found' });
      return;
    }
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      res.status(401).json({ error: 'Invalid Token' });
      return;
    }
    next(err);
  }
};

const auth = async (req, res, next) => {
  try {
    const token = req.get('Authorization');
    const data = jwt.verify(token, config.jwtKey);

    let user = await User.findOne({ _id: data.userId });

    if (user) {
      res.locals.user = user;
      next();
    } else {
      user = await Foundation.findOne({ _id: data.userId });
      if (user) {
        res.locals.user = user;
        next();
      } else {
        res.status(401).json({ error: 'User not found' });
        return;
      }
    }
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      res.status(401).json({ error: 'Invalid Token' });
      return;
    }
    next(err);
  }
};

const formData = (req, _, next) => {
  let uploadingFile = false;
  let countFiles = 0;

  const bb = busboy({ headers: req.headers });
  req.body = {};

  const done = () => {
    if (uploadingFile) return;
    if (countFiles > 0) return;

    next();
  };

  bb.on('field', (key, val) => {
    req.body[key] = val;
  });

  bb.on('file', (key, stream) => {
    uploadingFile = true;
    countFiles++;
    const cloud = cloudinary.uploader.upload_stream(
      { upload_preset: 'adogta-preset' },
      (err, res) => {
        if (err) {
          throw new Error('something went wrong uploading to Cloudinary');
        }

        req.body[key] = res.secure_url;

        uploadingFile = false;
        countFiles--;

        done();
      }
    );

    stream.on('data', (data) => {
      cloud.write(data);
    });

    stream.on('end', () => {
      cloud.end();
    });
  });

  bb.on('finish', () => {
    done();
  });

  req.pipe(bb);
};

module.exports = { auth, authAdmin, formData };
