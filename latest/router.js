const Router = require('koa-router')
const Promise = require('bluebird')
const path = require('path')
const sharp = require('sharp')
const { STATIC_DIR } = require('./config')
const uuidv4 = require('uuid/v4')
const fs = require('fs')
const router = new Router()
const {
  setPostLike,
  setPostView,
  setPostReport,
  deletePost,
  getUserFeedIds,
  getUserPostsIds,
  getPost,
  createPost,
  getPostLike,
  getPostReport,
  getPostView,
} = require('./api')

const populatePost = async (postId, userId) => {
  const post = await getPost(postId)
  return {
    ...post,
    liked: await getPostLike(userId, postId),
    reported: await getPostReport(userId, postId),
    viewed: await getPostView(userId, postId),
    url: `http://pishi.havaliza.ir/static/${post.id}.webp`,
  }
}

router.post('/setPostLike', async ctx => {
  const { userId, postId, value } = ctx.request.body
  await setPostLike(userId, postId, value)
  ctx.body = {}
})

router.post('/setPostReport', async ctx => {
  const { userId, postId, value } = ctx.request.body
  await setPostReport(userId, postId, value)
  ctx.body = {}
})

router.post('/setPostView', async ctx => {
  const { userId, postId, value } = ctx.request.body
  await setPostView(userId, postId, value)
  ctx.body = {}
})

router.post('/deletePost', async ctx => {
  const { userId, postId } = ctx.request.body
  await deletePost(userId, postId)
  ctx.body = {}
})

router.post('/getUserFeed', async ctx => {
  const { userId } = ctx.request.body
  const ids = await getUserFeedIds(userId)
  ctx.body = {
    posts: await Promise.map(ids, postId => populatePost(postId, userId)),
  }
})

router.post('/getUserPosts', async ctx => {
  const { userId } = ctx.request.body
  const ids = await getUserPostsIds(userId)
  ctx.body = {
    posts: await Promise.map(ids, postId => populatePost(postId, userId)),
  }
})

router.post('/getPost', async ctx => {
  const { userId, postId } = ctx.request.body
  ctx.body = {
    post: await populatePost(postId, userId),
  }
})

router.post('/createPost', async ctx => {
  const { userId } = ctx.request.body.fields
  const file = ctx.request.body.files.file
  const inputPath = file.path
  const tempPath = path.join(STATIC_DIR, `${uuidv4()}.webp`)
  await sharp(inputPath)
    .resize(640, 960)
    .max()
    .withoutEnlargement()
    .toFile(tempPath)
  const { width, height } = await sharp(tempPath).metadata()
  const postId = await createPost(userId, { width, height })
  const outputPath = path.join(STATIC_DIR, `${postId}.webp`)
  fs.renameSync(tempPath, outputPath)
  ctx.body = { id: postId }
})

module.exports = router
