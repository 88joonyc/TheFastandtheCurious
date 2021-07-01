var express = require('express');
var router = express.Router();
const db = require('../db/models');

const { asyncHandler, csrfProtection } = require('./utils');

/* GET home page. */
router.get('/', csrfProtection, asyncHandler(async (req, res, next) => {

  const posts = await db.Post.findAll({include: Users})
  const tags = await db.Tag.findAll();

  // console.log(posts)

  // console.log('helloooooooooooooooo');
  res.render('index', { title: 'The Fast and the Curious  --  A webpage designed for speed freaks!', posts, tags });

}));

module.exports = router;
