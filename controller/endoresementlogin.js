const Endorsement = require('../Model/endorsement');
const AppError = require('../utils/apperror');
exports.createEndorsement = async (req, res, next) => {
  try {
    // Extract and sanitize institutional support data
    const sanitizedData = {
      ...req.body,
      professional: req.user._id,
      status: 'pending',
      institutionalSupport: {
        fundingSupport: {
          required: req.body.institutionalSupport?.fundingSupport?.required || false,
          details: req.body.institutionalSupport?.fundingSupport?.details || ''
        },
        timeAllocation: {
          required: req.body.institutionalSupport?.timeAllocation?.required || false,
          details: req.body.institutionalSupport?.timeAllocation?.details || ''
        },
        resourceAccess: {
          required: req.body.institutionalSupport?.resourceAccess?.required || false,
          details: req.body.institutionalSupport?.resourceAccess?.details || ''
        }
      }
    };

    // Create endorsement with sanitized data
    const endorsement = new Endorsement(sanitizedData);

    // Save the endorsement
    await endorsement.save();

    // Populate the institution details before sending response
    await endorsement.populate('institution', 'name');

    res.status(201).json({
      status: 'success',
      data: { endorsement }
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyEndorsements = async (req, res, next) => {
  try {
    const endorsements = await Endorsement.find({ professional: req.user._id })
      .populate('institution', 'name')
      .sort({ createdAt: -1 });

    res.json({
      status: 'success',
      data: { endorsements }
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyEndorsement = async (req, res, next) => {
  try {
    const endorsement = await Endorsement.findOne({
      _id: req.params.id,
      institution: req.user._id,
    });

    if (!endorsement) {
      throw new AppError('Endorsement not found', 404);
    }

    endorsement.status = 'verified';
    endorsement.verificationDate = new Date();
    await endorsement.save();

    res.json({
      status: 'success',
      data: { endorsement }
    });
  } catch (error) {
    next(error);
  }
};

exports.getPendingEndorsements = async (req, res, next) => {
  try {
    if (req.user.userType !== 'institution') {
      throw new AppError('Not authorized', 403);
    }

    const endorsements = await Endorsement.find({
      institution: req.user._id,
      status: 'pending',
    }).populate('professional', 'name email');

    res.json({
      status: 'success',
      data: { endorsements }
    });
  } catch (error) {
    next(error);
  }
};
// Add this to your endorsement controller
exports.getVerifiedEndorsements = async (req, res, next) => {
  try {
    if (req.user.userType !== 'institution') {
      throw new AppError('Not authorized', 403);
    }

    const endorsements = await Endorsement.find({
      institution: req.user._id,
      status: 'verified',
    }).populate('professional', 'name email');

    res.json({
      status: 'success',
      data: { endorsements }
    });
  } catch (error) {
    next(error);
  }
};