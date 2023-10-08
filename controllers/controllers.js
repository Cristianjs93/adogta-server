const User = require('../models/User');
const Foundation = require('../models/Foundation');
const jwt = require('jsonwebtoken');
const config = require('../config/index');
const Pet = require('../models/Pet');
const AdoptionRequest = require('../models/AdoptionRequest');
const crypto = require('crypto');
const sendMail = require('../utils/sendMail');
require('dotenv').config();

const healthcheck = async (_, res) => {
  res.status(200).json({ message: 'Server ok' });
};

const createUser = async (req, res, next) => {
  const { name } = req.body;
  const { email, role } = name;
  try {
    const schema = {
      user: User,
      admin: User,
      foundation: Foundation,
    };

    let newUser = await new schema[role](req.body);

    const { _id, active } = newUser;

    newUser = { _id, active, ...name };

    const hash = crypto
      .createHash('sha256')
      .update(newUser.email)
      .digest('hex');

    newUser.passwordResetToken = hash;

    const user =
      newUser.role == 'user'
        ? await User.create(newUser)
        : await Foundation.create(newUser);

    const token = jwt.sign({ userId: user._id }, config.jwtKey);

    const emailData = {
      from: 'AdminAdogta <adogta4@gmail.com>',
      to: email,
      template_id: config.senGridTemplateEmailVerification,
      dynamic_template_data: {
        name: newUser.name,
        url: `${config.adogtaPublicUrl}/verified/${hash}`,
      },
    };

    sendMail(emailData);

    res.status(201).json({ token });
  } catch (err) {
    if (err.name === 'ValidationError') {
      console.log(err);
      res.status(422).json({ error: 'Email is already taken' });
    } else {
      next(err);
    }
  }
};

const verifiedEmail = async (req, res) => {
  const { token } = req.params;

  const filter = { passwordResetToken: token };
  const update = {
    passwordResetToken: null,
    active: true,
  };

  try {
    let user = await User.findOneAndUpdate(filter, update);

    let token;

    if (user) {
      token = jwt.sign({ userId: user._id }, config.jwtKey);
    } else {
      user = await Foundation.findOneAndUpdate(filter, update);
      token = jwt.sign({ userId: user._id }, config.jwtKey);
    }

    if (!user) {
      return res.status(404).end();
    }

    return res.status(200).json({ user, token });
  } catch (error) {
    res.status(500).send(error);
  }
};

const createRequest = async (req, res, next) => {
  try {
    const { _id, email, name } = res.locals.user;

    const sameAdoptions = await AdoptionRequest.find({
      userId: _id,
      petId: req.body.petId,
    });

    if (sameAdoptions.length >= 1) {
      return res
        .status(422)
        .json({ error: 'You have already sent a request to adopt this pet' });
    } else {
      const request = await AdoptionRequest.create({
        userId: _id,
        petId: req.body.petId,
        description: req.body.description,
      });

      await User.updateOne(
        { _id: _id },
        {
          phoneNumber: req.body.phoneNumber,
          address: req.body.address,
        }
      );

      const emailData = {
        from: 'AdminAdogta <adogta4@gmail.com>',
        to: email,
        template_id: config.templateAdoptionRequest,
        dynamic_template_data: {
          name: name,
        },
      };

      sendMail(emailData);

      res.status(200).json({ request });
    }
  } catch (err) {
    if (err.name === 'ValidationError') {
      res.status(422).json(err.errors);
    } else {
      next(err);
    }
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.authenticate(email, password);
    if (user) {
      const token = jwt.sign({ userId: user._id }, config.jwtKey);
      const { _id, name, email, role, address, phoneNumber, photoUrl } = user;
      res.json({
        token,
        _id,
        name,
        email,
        role,
        address,
        phoneNumber,
        photoUrl,
      });
    }
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const listFoundationsAdmin = async (req, res, next) => {
  try {
    const page = req.query.page || 1;
    const foundations = await Foundation.find(
      {},
      { password: 0, __v: 0, role: 0 },
      {
        skip: (page - 1) * 5,
        limit: 5,
      }
    )
      .collation({ locale: 'en' })
      .sort({ name: 1 });
    res.status(200).json(foundations);
  } catch (e) {
    return next(e);
  }
};

const listFoundations = async (req, res, next) => {
  try {
    const page = req.query.page || 1;
    const foundations = await Foundation.find(
      {},
      { password: 0, __v: 0, role: 0 },
      {
        skip: (page - 1) * 10,
        limit: 10,
      }
    )
      .collation({ locale: 'en' })
      .sort({ name: 1 });
    res.status(200).json(foundations);
  } catch (e) {
    return next(e);
  }
};

const listUsers = async (req, res, next) => {
  try {
    const page = req.query.page || 1;
    const users = await User.find(
      {},
      { password: 0, __v: 0, role: 0 },
      { skip: (page - 1) * 5, limit: 5 }
    )
      .collation({ locale: 'en' })
      .sort({ name: 1 });
    res.status(200).json(users);
  } catch (e) {
    return next(e);
  }
};

const loadUser = async (req, res) => {
  const { _id, name, email, address, phoneNumber, role, photoUrl } =
    res.locals.user;
  res.json({ _id, name, email, address, phoneNumber, role, photoUrl });
};

const listPets = async (req, res, next) => {
  try {
    const page = req.query.page || 1;
    const count = await Pet.count({ foundationId: req.params.foundationId });
    const pets = await Pet.find(
      { foundationId: req.params.foundationId },
      null,
      {
        skip: (page - 1) * 10,
        limit: 10,
      }
    ).sort({ createdAt: -1 });
    res.status(200).json({ page, count, pets });
  } catch (e) {
    next(e);
  }
};

const destroyPet = async (req, res, next) => {
  try {
    await Pet.deleteOne({ _id: req.params.petId });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
};

const createPet = async (req, res) => {
  try {
    const { name, age, description } = req.body;
    const foundationId = req.params.foundationId;

    let photoUrl = [];

    const values = Object.values(req.body);

    values.forEach(
      (value) => value.includes('https://') && photoUrl.push(value)
    );

    const newPet = {
      name,
      age,
      description,
      photoUrl,
      adopted: false,
      foundationId,
    };

    const pet = await Pet.create(newPet);

    res.status(201).json(pet);
  } catch (error) {
    res
      .status(400)
      .json({ error: '*Please fill in all the fields of the form' });
  }
};

const updateProfile = async (req, res) => {
  const { name, address, email, phoneNumber, photoUrl, _id, role } = req.body;
  const updatedProfile = {
    name,
    address,
    phoneNumber,
    email,
    _id,
    role,
    photoUrl,
  };
  const schemas = { user: User, foundation: Foundation };
  try {
    await schemas[role].findByIdAndUpdate(_id, {
      ...updatedProfile,
    });

    res.status(200).json({
      name,
      email,
      address,
      phoneNumber,
      role,
      photoUrl,
      _id,
    });
  } catch (error) {
    res.status(401).json({ error: 'User not found' });
  }
};

const getPet = async (req, res, next) => {
  try {
    if (req.params.petId.length === 24) {
      const pet = await Pet.findOne({ _id: req.params.petId });
      if (pet) {
        res.status(200).json(pet);
      } else {
        res.status(404).json({ error: 'Pet not found' });
      }
    } else {
      res.status(400).json({ error: 'Invalid Pet id' });
    }
  } catch (e) {
    next(e);
  }
};

const deleteFoundation = async (req, res, next) => {
  try {
    await Foundation.deleteMany(req.body);
    res.status(204).end();
  } catch (e) {
    next(e);
  }
};

const listRequests = async (req, res, next) => {
  try {
    response = await AdoptionRequest.find({
      petId: req.params.petId,
    }).populate('userId');
    res.status(200).json(response);
  } catch (e) {
    next(e);
  }
};

const updateRequest = async (req, res, next) => {
  try {
    const request = await AdoptionRequest.findOneAndUpdate(
      {
        _id: req.params.requestId,
      },
      {
        responseStatus: req.body.responseStatus,
      },
      { new: true }
    )
      .populate('userId')
      .populate('petId');

    if (req.body.responseStatus === 'approved') {
      const pet = await Pet.findOneAndUpdate(
        {
          _id: request.petId,
        },
        {
          adopted: true,
        }
      );
      let varPhoto = '';
      if (pet.photoUrl) varPhoto = pet.photoUrl[0];
      const emailData = {
        from: 'AdminAdogta <adogta4@gmail.com>',
        to: request['userId'].email,
        template_id: config.templateApproved,
        dynamic_template_data: {
          name: request['petId'].name,
          photoUrl: varPhoto,
        },
      };

      sendMail(emailData);
    } else {
      let varPhoto = '';
      if (request['petId'].photoUrl) varPhoto = request['petId'].photoUrl[0];

      const emailData = {
        from: 'AdminAdogta <adogta4@gmail.com>',
        to: request['userId'].email,
        template_id: config.templateRejected,
        dynamic_template_data: {
          name: request['petId'].name,
          photoUrl: varPhoto,
        },
      };

      sendMail(emailData);
    }

    let { _id, userId, petId, description, responseStatus, updatedAt } =
      request;

    petId = request['petId']._id;
    userId = request['userId']._id;

    res
      .status(200)
      .json({ _id, userId, petId, description, responseStatus, updatedAt });
  } catch (e) {
    console.error(e);
    next(e);
  }
};

const bulkReject = async (req, res, next) => {
  try {
    await AdoptionRequest.updateMany(
      {
        petId: req.params.petId,
        _id: { $ne: req.body.requestId },
      },
      {
        responseStatus: 'rejected',
      },
      { new: true }
    );

    // There is no method to update multiple documents and return all updated documents in mongoose.
    const request = await AdoptionRequest.find({
      petId: req.params.petId,
      _id: { $ne: req.body.requestId },
    })
      .populate('userId')
      .populate('petId');

    for (const adoption of request) {
      const userMail = adoption['userId'].email;
      let varPhoto = '';
      if (adoption['petId'].photoUrl) varPhoto = adoption['petId'].photoUrl[0];

      const emailData = {
        from: 'AdminAdogta <adogta4@gmail.com>',
        to: userMail,
        template_id: config.templateRejected,
        dynamic_template_data: {
          name: adoption['petId'].name,
          photoUrl: varPhoto,
        },
      };

      sendMail(emailData);
    }

    res.status(200).json(req.body.requestId);
  } catch (e) {
    console.error(e);
    next(e);
  }
};

const getFoundationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const response = await Foundation.findById(id);

    const foundation = {
      id: response._id,
      name: response.name,
      email: response.email,
      address: response.address,
      phone: response.phoneNumber,
      photo_url: response.photoUrl,
    };

    res.status(200).json(foundation);
  } catch (e) {
    next(e);
  }
};

const listFoundationRequests = async (req, res, next) => {
  try {
    const response = await AdoptionRequest.find().populate({
      path: 'petId',
      model: Pet,
    });

    const reqs = response.filter(
      (request) => request.petId.foundationId.toString() === req.params.id
    );
    res.status(200).json(reqs);
  } catch (e) {
    next(e);
  }
};

const deleteUsers = async (req, res, next) => {
  try {
    await User.deleteMany(req.body);
    res.status(204).end();
  } catch (e) {
    next(e);
  }
};

const listUserRequests = async (req, res, next) => {
  try {
    response = await AdoptionRequest.find({
      userId: req.params.userId,
    }).populate({
      path: 'petId',
      model: Pet,
    });
    res.status(200).json(response);
  } catch (e) {
    next(e);
  }
};
const adminSearch = async (req, res, next) => {
  try {
    let toSearch = {};
    toSearch[req.body.field] = req.body.value;
    const page = req.query.page || 1;

    // _id needs to have length 24 to be valid
    if (req.body.field === '_id' && req.body.value.length !== 24) {
      res.status(200).json([]);
      return;
    }

    if (req.body.isUser) {
      let users = await User.find(
        toSearch,
        { password: 0, __v: 0, role: 0 },
        { skip: (page - 1) * 5, limit: 5 }
      );
      res.status(200).json(users);
    } else {
      let foundation = await Foundation.find(
        toSearch,
        { password: 0, __v: 0, role: 0 },
        { skip: (page - 1) * 5, limit: 5 }
      );
      res.status(200).json(foundation);
    }
  } catch (e) {
    console.error(e);
    next(e);
  }
};

module.exports = {
  healthcheck,
  listFoundations,
  destroyPet,
  listPets,
  createPet,
  listRequests,
  updateRequest,
  getPet,
  getFoundationById,
  listFoundationRequests,
  createUser,
  login,
  loadUser,
  updateProfile,
  deleteFoundation,
  listUsers,
  deleteUsers,
  bulkReject,
  createRequest,
  listUserRequests,
  adminSearch,
  verifiedEmail,
  listFoundationsAdmin,
};
