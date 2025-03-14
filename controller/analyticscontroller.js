const User = require('../Model/user');
const Endorsement = require('../Model/endorsement');
const AppError = require('../utils/apperror');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const stats = {
      totalEndorsements: 0,
      pendingEndorsements: 0,
      verifiedEndorsements: 0,
      topSkills: [],
      recentActivity: [],
      monthlyGrowth: []
    }; 

    // Get endorsement counts
    if (req.user.userType === 'professional') {
      stats.totalEndorsements = await Endorsement.countDocuments({ 
        professional: req.user._id 
      });
      stats.pendingEndorsements = await Endorsement.countDocuments({ 
        professional: req.user._id,
        status: 'pending'
      });
      stats.verifiedEndorsements = await Endorsement.countDocuments({ 
        professional: req.user._id,
        status: 'verified'
      });
    } else {
      stats.totalEndorsements = await Endorsement.countDocuments({ 
        institution: req.user._id 
      });
      stats.pendingEndorsements = await Endorsement.countDocuments({ 
        institution: req.user._id,
        status: 'pending'
      });
      stats.verifiedEndorsements = await Endorsement.countDocuments({ 
        institution: req.user._id,
        status: 'verified'
      });
    }

    // Get top skills
    const topSkills = await Endorsement.aggregate([
      {
        $match: {
          [req.user.userType === 'professional' ? 'professional' : 'institution']: req.user._id,
          status: 'verified'
        }
      },
      {
        $group: {
          _id: '$skill',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      }
    ]);

    stats.topSkills = topSkills;

    // Get recent activity
    stats.recentActivity = await Endorsement.find({
      [req.user.userType === 'professional' ? 'professional' : 'institution']: req.user._id
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('professional institution', 'name');

    // Get monthly growth
    const monthlyGrowth = await Endorsement.aggregate([
      {
        $match: {
          [req.user.userType === 'professional' ? 'professional' : 'institution']: req.user._id,
          createdAt: { 
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) 
          }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    stats.monthlyGrowth = monthlyGrowth;

    res.json({
      status: 'success',
      data: { stats }
    });
  } catch (error) {
    next(error);
  }
};

exports.getSkillsAnalytics = async (req, res, next) => {
  try {
    const skillStats = await Endorsement.aggregate([
      {
        $match: {
          status: 'verified'
        }
      },
      {
        $group: {
          _id: '$skill',
          count: { $sum: 1 },
          institutions: { $addToSet: '$institution' }
        }
      },
      {
        $project: {
          skill: '$_id',
          count: 1,
          institutionCount: { $size: '$institutions' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      status: 'success',
      data: { skillStats }
    });
  } catch (error) {
    next(error);
  }
};

exports.getInstitutionAnalytics = async (req, res, next) => {
  try {
    if (req.user.userType !== 'institution') {
      throw new AppError('Not authorized', 403);
    }

    const analytics = {
      endorsementTrends: [],
      professionalDistribution: [],
      verificationRate: 0
    };

    // Get endorsement trends
    analytics.endorsementTrends = await Endorsement.aggregate([
      {
        $match: {
          institution: req.user._id
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Get professional distribution
    analytics.professionalDistribution = await Endorsement.aggregate([
      {
        $match: {
          institution: req.user._id,
          status: 'verified'
        }
      },
      {
        $group: {
          _id: '$professional',
          endorsementCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'professional'
        }
      },
      {
        $unwind: '$professional'
      },
      {
        $project: {
          name: '$professional.name',
          endorsementCount: 1
        }
      }
    ]);

    // Calculate verification rate
    const totalEndorsements = await Endorsement.countDocuments({
      institution: req.user._id
    });
    const verifiedEndorsements = await Endorsement.countDocuments({
      institution: req.user._id,
      status: 'verified'
    });
    analytics.verificationRate = totalEndorsements > 0 
      ? (verifiedEndorsements / totalEndorsements) * 100 
      : 0;

    res.json({
      status: 'success',
      data: { analytics }
    });
  } catch (error) {
    next(error);
  }
};