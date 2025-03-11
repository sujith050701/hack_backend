const User = require('../Model/user');
const Endorsement = require('../Model/endorsement');
const AppError = require('../utils/apperror');

exports.updateProfile = async (req, res, next) => {
  try {
    const allowedUpdates = ['name', 'institution', 'position', 'location', 'bio', 'skills'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      throw new AppError('Invalid updates', 400);
    }

    updates.forEach(update => req.user[update] = req.body[update]);
    await req.user.save();

    res.json({
      status: 'success',
      data: { user: req.user }
    });
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate({
        path: 'endorsements',
        populate: {
          path: 'institution',
          select: 'name'
        }
      });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

exports.getInstitutions = async (req, res, next) => {
  try {
    const { search, location, page = 1, limit = 10 } = req.query;
    const query = { userType: 'institution' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } }
      ];
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    const institutions = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ name: 1 });

    const total = await User.countDocuments(query);

    res.json({
      status: 'success',
      data: { 
        institutions,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getProfessionals = async (req, res, next) => {
  try {
    const { search, skills, page = 1, limit = 10 } = req.query;
    const query = { userType: 'professional' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } }
      ];
    }

    if (skills) {
      query.skills = { $in: skills.split(',') };
    }

    const professionals = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ name: 1 });

    const total = await User.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        professionals,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    next(error);
  }
};