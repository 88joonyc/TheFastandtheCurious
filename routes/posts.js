
const express = require('express');
const router = express.Router();
const db = require('../db/models');
const { check, validationResult } = require('express-validator');
const { csrfProtection, asyncHandler } = require('./utils');
const { requireAuth } = require('../auth');

router.get('/create', csrfProtection,
    asyncHandler(async (req, res) => {
        const posts = await db.Post.build()
        const newTag = db.Tag.build();
        const tagList = await db.Tag.findAll();

        res.render('create-post', {posts, newTag, tagList, csrfToken: req.csrfToken()})
}))


const postValidators = [
    check('title')
        .exists({ checkFalsy: true })
        .withMessage('Please add a title!')
        .isLength({ max: 100 })
        .withMessage('Title has to be less than 100 characters'),
    check('description')
        .exists({ checkFalsy: true })
        .withMessage('DESCRIBE so your post isn\'t plain and boring')
        .isLength({ max: 100000 })
        .withMessage('What are you writing a book, clean it up'),
    check('image')
        .isLength({ max: 500 })
        .withMessage('Your pic URL is too long'),
];

router.post('/create', csrfProtection, postValidators,
    asyncHandler(async (req, res, next) => {
        // console.log(req.body)
        const {
            title,
            description,
            image,
            tagList,
        } = req.body;

        const post = db.Post.build({
            title,
            description,
            image,
            tagId: tagList,
            userId: res.locals.user.id
        });
        const validatorErrors = validationResult(req);

        if (validatorErrors.isEmpty()) {

            await post.save()
            return res.redirect('/')
        } else {
            const errors = validatorErrors.array().map((error) => error.msg);
            const tagList = await db.Tag.findAll();
            res.render('create-post', {
                post,
                errors,
                tagList,
                csrfToken: req.csrfToken(),
            })
        }

    }));

// router.get('/delete/:id(\\d+)', csrfProtection, asyncHandler(async (req, res) => {
//   const postId = parseInt(req.params.id, 10);
//   const post = await db.Post.findByPk(postId);
//   res.render('book-delete', {
//     title: 'Delete Book',
//     post,
//     csrfToken: req.csrfToken(),
//   });
// }));

// router.post('/delete/:id(\\d+)', requireAuth, asyncHandler(async (req, res) => {
//   const postId = parseInt(req.params.id, 10);
//   const post = await db.Post.findByPk(postId);

router.post('/delete/:id(\\d+)', requireAuth, asyncHandler(async (req, res) => {
  const postId = parseInt(req.params.id, 10);
  const post = await db.Post.findByPk(postId);

  if (res.locals.user.id === post.userId) {
      await post.destroy()
      res.redirect('/');
    }

}));


router.get('/edit/:id(\\d+)', csrfProtection,
  asyncHandler(async (req, res) => {
    const postId = parseInt(req.params.id, 10);
    const post = await db.Post.findByPk(postId);
    const tagList = await db.Tag.findAll();

    if (res.locals.user.id === post.userId) {
        res.render('post-edit', {
          title: 'Edit meee',
          post,
          tagList,
          csrfToken: req.csrfToken(),
        });

    }
  }));


const postValidatorss = []

router.post('/edit/:id(\\d+)', csrfProtection,
  asyncHandler(async (req, res) => {
    const postId = parseInt(req.params.id, 10);
    const postUpdate = await db.Post.findByPk(postId);


    const {
        id,
        title,
        description,
        tagList

    } = req.body;

    const post = {
        id,
        title,
        description,
        tagId: tagList

    };
        await postUpdate.update(post);
        res.redirect('/');
}));

router.post('/like/:id(\\d+)', requireAuth, asyncHandler(async (req, res) => {
  const postId = parseInt(req.params.id, 10);
  const postUpdate = await db.Post.findByPk(postId);
    const newLike = postUpdate.postLikes + 1
    const likey = {
        postLikes: newLike
    }
    await postUpdate.update(likey)
    res.redirect('/');
}));

router.post('/hate/:id(\\d+)', requireAuth, asyncHandler(async (req, res) => {
  const postId = parseInt(req.params.id, 10);
  const postUpdate = await db.Post.findByPk(postId);
    const newLike = postUpdate.postLikes - 1
    const hatey = {
        postLikes: newLike
    }
    await postUpdate.update(hatey)
    res.redirect('/');
}));




module.exports = router
