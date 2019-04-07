const redis = require('./redis')

const formatDate = date => date.toISOString().split('T')[0]

const getYesterdayDate = () => {
  const date = new Date()
  date.setDate(date.getDate() - 1)
  return date
}

const padLeft = (nr, n, str) =>
  Array(n - String(nr).length + 1).join(str || '0') + nr

const getNextPostId = async () => {
  const nextId = await redis.incr('id:post')
  return padLeft(nextId, 10)
}

const addTotalFieldByDate = async (field, userId, postId) => {
  const date = formatDate(new Date())
  const key = `total:${field}:${date}`
  const value = `${userId}:${postId}`
  await redis.pfadd(key, value)
}

const getTotalFieldLastDay = async field => {
  const date = formatDate(getYesterdayDate())
  const key = `total:${field}:${date}`
  await redis.pfcount(key)
}

const updatePostScore = async postId => {
  const views = 1 + (await getPostViews(postId))
  const likes = await getPostLikes(postId)
  const reports = await getPostReports(postId)
  const post = await getPost(postId)
  const timestamp = ((post.timestamp / 1000) | 0) - 1134028003
  const viewsScore = 30000 / (views * views)
  const likesScore = 100 * likes / views
  const reportsScore = -1000 * (reports / views) * (reports / views)
  const timestampScore = timestamp / 90000
  const rawScore = viewsScore + likesScore + reportsScore + timestampScore
  const score = Math.trunc(rawScore * 1000000)
  await redis.zadd('posts:score', [score, postId])
}

const postFieldSetName = (field, postId) => `post:${field}:${postId}`

const postFieldSetter = field => async (userId, postId, value) => {
  const key = postFieldSetName(field, postId)
  const member = userId
  if (value) {
    await redis.sadd(key, [member])
    await addTotalFieldByDate(field, userId, postId)
  } else {
    await redis.srem(key, [member])
  }
  await updatePostScore(postId)
}

const postFieldGetter = field => async (userId, postId) => {
  const key = postFieldSetName(field, postId)
  return !!await redis.sismember(key, userId)
}

const postFieldCount = field => async postId => {
  const key = postFieldSetName(field, postId)
  return redis.scard(key)
}

const setPostLike = postFieldSetter('like')
const getPostLike = postFieldGetter('like')
const getPostLikes = postFieldCount('like')
const setPostReport = postFieldSetter('report')
const getPostReport = postFieldGetter('report')
const getPostReports = postFieldCount('report')
const setPostView = postFieldSetter('view')
const getPostView = postFieldGetter('view')
const getPostViews = postFieldCount('view')

const createPost = async (userId, data) => {
  const postId = await getNextPostId()
  await redis.sadd(`user:posts:${userId}`, [postId])
  const value = JSON.stringify({
    user: userId,
    timestamp: +new Date(),
    ...data,
  })
  await redis.hset('posts:value', postId, value)
  await updatePostScore(postId)
  return postId
}

const deletePost = async (userId, postId) => {
  const userPostsKey = `user:posts:${userId}`
  if (await redis.sismember(userPostsKey, postId)) {
    await redis.srem(userPostsKey, [postId])
    await redis.hdel('posts:value', [postId])
    await redis.zrem('posts:score', [postId])
    await redis.del(`post:like:${postId}`)
    await redis.del(`post:report:${postId}`)
    await redis.del(`post:view:${postId}`)
  }
}

const getPost = async rawPostId => {
  const postId = padLeft(rawPostId, 10)
  const data = JSON.parse(await redis.hget('posts:value', postId))
  return {
    id: postId,
    likes: await getPostLikes(postId),
    reports: await getPostReports(postId),
    views: await getPostViews(postId),
    score: parseInt(await redis.zscore('posts:score', postId)),
    ...data,
  }
}

const getUserFeedIds = async userId => {
  return redis.zrevrangebylex('posts:score', '+', '-')
}

const getUserPostsIds = async userId => {
  const ids = await redis.smembers(`user:posts:${userId}`)
  ids.sort((a, b) => b - a)
  return ids
}

module.exports = {
  setPostLike,
  setPostView,
  setPostReport,
  getPostLike,
  getPostReport,
  getPostView,
  deletePost,
  getUserFeedIds,
  getUserPostsIds,
  getPost,
  createPost,
}
