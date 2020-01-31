const express = require('express');
const request = require('request');
const config = require('config');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');

const Profile = require('../models/Profile');
const User = require('../models/user');

// @route       GET api/profile/me
// @desc        Get current users profile
// @access      Private

router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id
    }).populate('user', ['name', 'avatar']);

    if (!profile) {
      return res.status(400).json({ msg: 'There is no profile for this user' });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route       POST api/profile/me
// @desc        Create or update a user profile
// @access      Private
router.post(
  '/',
  [
    auth,
    [
      check('age', 'Age is required')
        .not()
        .isEmpty(),
      check('gender', 'Gender is required')
        .not()
        .isEmpty(),
      check('current_city', 'Current city is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      age,
      current_city,
      from_city,
      // birthday,
      interests,
      gender,
      about_me
    } = req.body;

    // Build profile Object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (age) profileFields.age = age;
    if (current_city) profileFields.current_city = current_city;
    if (from_city) profileFields.from_city = from_city;
    if (about_me) profileFields.about_me = about_me;
    if (gender) profileFields.gender = gender;
    if (githubusername) profileFields.githubusername = githubusername;
    if (intersts) {
      console.log(123);
      profileFields.interests = interests
        .split(',')
        .map(interests => interests.trim());
    }

    // // Build social object
    // profileFields.social = {};
    // if (youtube) profileFields.social.youtube = youtube;
    // if (twitter) profileFields.social.twitter = twitter;
    // if (facebook) profileFields.social.facebook = facebook;
    // if (linkedin) profileFields.social.linkedin = linkedin;
    // if (instagram) profileFields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        // Update profile if exists
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }

      //   Create Profile if does not exist
      profile = new Profile(profileFields);

      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route       GET api/profile
// @desc        Create all profiles
// @access      Public

router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route       GET api/profile/user/:user_id
// @desc        Create profile by user ID
// @access      Public

router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id
    }).populate('user', ['name', 'avatar']);
    if (!profile) return res.status(400).json({ msg: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Profile not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route       DELETE api/profile
// @desc        Delete profile, user, & posts
// @access      Private

router.delete('/', auth, async (req, res) => {
  try {
    //   @remove users posts
    // remove profile
    await Profile.findOneAndRemove({ user: req.user.id });
    // remove user
    await User.findOneAndRemove({ _id: req.user.id });

    res.json({ msg: 'User deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// // @route       PUT api/profile/experience
// // @desc        Add profile experience
// // @access      Private
// router.put(
//   '/experience',
//   [
//     auth,
//     [
//       check('title', 'Title is required')
//         .not()
//         .isEmpty(),
//       check('company', 'Company is required')
//         .not()
//         .isEmpty(),
//       check('title', 'Title is required')
//         .not()
//         .isEmpty(),
//       check('from', 'From date is required')
//         .not()
//         .isEmpty()
//     ]
//   ],
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     const {
//       title,
//       company,
//       location,
//       from,
//       to,
//       current,
//       description
//     } = req.body;

//     const newExp = {
//       title,
//       company,
//       location,
//       from,
//       to,
//       current,
//       description
//     };

//     try {
//       const profile = await Profile.findOne({ user: req.user.id });

//       //   unshift() pushes to beginning of array instead of end, putting most recently added experinces to the top.
//       profile.experience.unshift(newExp);

//       await profile.save();

//       res.json(profile);
//     } catch (err) {
//       console.error(err.message);
//       res.status(500).send('Server Error');
//     }
//   }
// );

// // @route       DELETE api/profile/experience/:exp_id
// // @desc        Delete experience from profile
// // @access      Private
// router.delete('/experience/:exp_id', auth, async (req, res) => {
//   try {
//     const profile = await Profile.findOne({ user: req.user.id });
//     // get remove index
//     const removeIndex = profile.experience
//       .map(item => item.id)
//       .indexOf(req.params.exp_id);

//     profile.experience.splice(removeIndex, 1);

//     await profile.save();
//     res.json(profile);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server Error');
//   }
// });

// // @route       PUT api/profile/education
// // @desc        Add profile education
// // @access      Private
// router.put(
//   '/education',
//   [
//     auth,
//     [
//       check('school', 'School is required')
//         .not()
//         .isEmpty(),
//       check('degree', 'Degree is required')
//         .not()
//         .isEmpty(),
//       check('fieldofstudy', 'Field of study is required')
//         .not()
//         .isEmpty(),
//       check('from', 'From date is required')
//         .not()
//         .isEmpty()
//     ]
//   ],
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     const {
//       school,
//       degree,
//       fieldofstudy,
//       from,
//       to,
//       current,
//       description
//     } = req.body;

//     const newEdu = {
//       school,
//       degree,
//       fieldofstudy,
//       from,
//       to,
//       current,
//       description
//     };

//     try {
//       const profile = await Profile.findOne({ user: req.user.id });

//       //   unshift() pushes to beginning of array instead of end, putting most recently added experinces to the top.
//       profile.education.unshift(newEdu);

//       await profile.save();

//       res.json(profile);
//     } catch (err) {
//       console.error(err.message);
//       res.status(500).send('Server Error');
//     }
//   }
// );

// // @route       DELETE api/profile/education/:exp_id
// // @desc        Delete education from profile
// // @access      Private
// router.delete('/education/:edu_id', auth, async (req, res) => {
//   try {
//     const profile = await Profile.findOne({ user: req.user.id });
//     // get remove index
//     const removeIndex = profile.education
//       .map(item => item.id)
//       .indexOf(req.params.edu_id);

//     profile.education.splice(removeIndex, 1);

//     await profile.save();
//     res.json(profile);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server Error');
//   }
// });

// // @route       GET api/profile/github/:username
// // @desc        Get user repos from github
// // @access      Public
// // THIS SHIT DOESN'T WORK

// router.get('/github/:username', (req, res) => {
//   try {
//     const options = {
//       uri: `https://github.com/users/${
//         req.params.username
//       }/repos?per_page=5&sort=created:asc&client_id=${config.get(
//         'githubClientId'
//       )}&client_secret=${config.get('githubSecret')}`,
//       method: 'GET',
//       headers: { 'user-agent': 'node.js' }
//     };

//     request(options, (error, response, body) => {
//       if (error) console.error(error);

//       if (response.statusCode !== 200) {
//         return res.status(404).json({ msg: 'No github portfolio found' });
//       }
//       res.json(JSON.parse(body));
//     });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server Error');
//   }
// });

module.exports = router;
