// controllers/usersController.js
const usersStorage = require("../storages/usersStorage");

exports.usersListGet = (req, res) => {
  res.render("index", {
    title: "User list",
    users: usersStorage.getUsers(),
  });
};

exports.usersCreateGet = (req, res) => {
  res.render("createUser", {
    title: "Create user",
  });
};

//adding validation with express-validation
const { body, validationResult } = require("express-validator");

const alphaErr = "must only contain letters.";
const lengthErr = "must be between 1 and 10 characters.";
const emailErr = "must be a valid email address.";
const ageErr = "must be a number between 0 and 120.";
const bioErr = "must be between 0 and 300 characters.";

const validateUser = [
  body("firstName")
    .trim()
    .isAlpha()
    .withMessage(`First name ${alphaErr}`)
    .isLength({ min: 1, max: 10 })
    .withMessage(`First name ${lengthErr}`),

  body("lastName")
    .trim()
    .isAlpha()
    .withMessage(`Last name ${alphaErr}`)
    .isLength({ min: 1, max: 10 })
    .withMessage(`Last name ${lengthErr}`),

  body("email").trim().isEmail().withMessage(`Email: ${emailErr}`),

  body("age").trim().isInt({ min: 18, max: 120 }).withMessage(`Age ${ageErr}`),

  body("bio").trim().isLength({ max: 200 }).withMessage(`Bio ${bioErr}`),
];

exports.usersCreatePost = [
  validateUser,
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("createUser", {
        title: "Create User",
        errors: errors.array(),
      });
    }
    const { firstName, lastName, age, email, bio } = req.body;
    usersStorage.addUser({ firstName, lastName, age, email, bio });
    res.redirect("/");
  },
];

//update
exports.usersUpdateGet = (req, res) => {
  const user = usersStorage.getUser(req.params.id);
  res.render("updateUser", {
    title: "Update user",
    user: user,
  });
};

exports.usersUpdatePost = [
  validateUser,
  (req, res) => {
    const user = usersStorage.getUser(req.params.id);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("updateUser", {
        title: "Update user",
        user: user,
        errors: errors.array(),
      });
    }
    const { firstName, lastName, email, age, bio } = req.body;
    usersStorage.updateUser(req.params.id, {
      firstName,
      lastName,
      email,
      age,
      bio,
    });
    res.redirect("/");
  },
];

exports.usersDeletePost = (req, res) => {
  usersStorage.deleteUser(req.params.id);
  res.redirect("/");
};

//search
exports.usersSearchGet = (req, res) => {
  const { firstName, lastName, email } = req.query;
  const allUsers = usersStorage.getUsers();

  const filteredUsers = allUsers.filter((user) => {
    const matchFirstName = firstName
      ? user.firstName.toLowerCase().includes(firstName.toLowerCase())
      : true;

    const matchLastName = lastName
      ? user.lastName.toLowerCase().includes(lastName.toLowerCase())
      : true;

    const matchEmail = email
      ? user.email.toLowerCase().includes(email.toLowerCase())
      : true;

    return matchFirstName && matchLastName && matchEmail;
  });

  res.render("search", {
    title: "Search Results",
    users: filteredUsers,
    query: { firstName, lastName, email },
  });
};
