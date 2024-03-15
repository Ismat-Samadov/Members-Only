const passport = require("passport");
require("dotenv").config();
const bcrypt = require("bcryptjs");

const User = require("../models/users");
const Message = require("../models/messages");

const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

exports.index = asyncHandler(async (req, res, next) => {
  const allMessages = await Message.find({})
    .populate("user", "firstName lastName")
    .sort({ timestamp: -1 })
    .exec();

  res.render("index", {
    title: "Clubhouse",
    allMessages: allMessages,
  });
});

exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
};

exports.signUp_create_get = (req, res) => {
  res.render("signup", {
    title: "Sign Up",
  });
};

exports.signUp_create_post = [
  body("firstname")
    .trim()
    .isLength({ min: 1 })
    .withMessage("First name must not be empty")
    .escape(),
  body("lastname")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Last name must not be empty")
    .escape(),
  body("email").trim().isEmail().withMessage("Invalid email address").escape(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .escape(),
  body("passwordconfirm")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const salt = 10;
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const user = new User({
      firstName: req.body.firstname,
      lastName: req.body.lastname,
      email: req.body.email,
      password: hashedPassword,
      isMember: false,
      isAdmin: false,
    });

    if (!errors.isEmpty()) {
      res.render("signup", {
        title: "Sign Up",
        user: user,
        errors: errors.array(),
      });
    } else {
      await user.save();
      res.redirect("/login");
    }
  }),
];

exports.login_create_get = (req, res) => {
  res.render("login", {
    title: "Login",
  });
};

exports.login_create_post = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.render("login", {
        title: "Login",
        errors: [info],
      });
    }
    req.logIn(user, (err) => {
      req.session.currentUser = user;
      if (err) {
        return next(err);
      }

      return res.redirect("/");
    });
  })(req, res, next);
};

exports.member_create_get = (req, res) => {
  res.render("member-join", {
    title: "Become a Member",
  });
};

exports.member_create_post = [
  body("memberkey")
    .custom((value, { req }) => {
      if (value !== process.env.MEMBERSHIP_KEY) {
        throw new Error("Incorrect Answer");
      }
      return true;
    })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("member-join", {
        title: "Membership",
        errors: errors.array(),
      });
    } else {
      if (!req.user) {
        return res.redirect("/login");
      }

      const currentUser = await User.findById(req.user._id);

      if (!currentUser) {
        return res.status(404).json({ error: "User not found" });
      }

      currentUser.isMember = true;
      await currentUser.save();

      res.redirect("/");
    }
  }),
];

exports.admin_create_get = (req, res) => {
  res.render("admin-join", {
    title: "Admin",
  });
};

exports.admin_create_post = [
  body("adminkey")
    .custom((value, { req }) => {
      if (value !== process.env.ADMIN_KEY) {
        throw new Error("Incorrect Password");
      }
      return true;
    })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("admin-join", {
        title: "Admin",
        errors: errors.array(),
      });
    } else {
      if (!req.user) {
        return res.redirect("/login");
      }

      const currentUser = await User.findById(req.user._id);

      if (!currentUser) {
        return res.status(404).json({ error: "User not found" });
      }

      currentUser.isAdmin = true;
      await currentUser.save();

      res.redirect("/");
    }
  }),
];

exports.message_create_get = (req, res) => {
  res.render("new-message", {
    title: "Message",
  });
};

exports.message_create_post = [
  body("title")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Message must have a title"),
  body("messagetext")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Message must not be empty"),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("new-message", {
        title: "Create Message",
        errors: errors.array(),
      });
    } else {
      if (!req.user) {
        return res.redirect("/login");
      }
      const currentUser = await User.findById(req.user._id);
      const currentTime = new Date();

      const message = new Message({
        title: req.body.title,
        text: req.body.messagetext,
        user: currentUser,
        timestamp: currentTime,
      });

      await message.save();
      res.redirect("/");
    }
  }),
];

exports.delete = asyncHandler(async (req, res, next) => {
  const messageId = req.params.id;

  await Message.findByIdAndDelete(messageId);

  res.redirect("/");
});
