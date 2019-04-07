const app = require('./app')
const supertest = require('supertest')
const path = require('path')

const server = app.listen()
const agent = supertest(server)

const PISHI_IMAGE_PATH = path.join(__dirname, 'pishi.jpg')

beforeEach(async () => {
  const redis = require('./redis')
  await redis.flushall()
})

const createPost = async ({ userId }) =>
  agent
    .post('/createPost')
    .attach('file', PISHI_IMAGE_PATH)
    .field('userId', userId)

const createApiMethodCaller = name => async params =>
  agent.post(`/${name}`).send(params)

const getUserPosts = createApiMethodCaller('getUserPosts')
const getUserFeed = createApiMethodCaller('getUserFeed')
const deletePost = createApiMethodCaller('deletePost')
const setPostLike = createApiMethodCaller('setPostLike')
const setPostView = createApiMethodCaller('setPostView')
const setPostReport = createApiMethodCaller('setPostReport')
const getPost = createApiMethodCaller('getPost')

test('create post success', async () => {
  const response = await createPost({ userId: 'a' })
  expect(response.status).toEqual(200)
})

test('post incremental id', async () => {
  for (let i = 1; i <= 3; i++) {
    const response = await createPost({ userId: 'a' })
    expect(response.body).toEqual({ id: `000000000${i}` })
  }
})

const expectPostIdsInUserPosts = async ({ userId, postIds }) => {
  const response = await getUserPosts({ userId })
  const { posts } = response.body
  expect(posts.map(post => post.id)).toEqual(postIds)
}

const expectPostIdsInUserFeed = async ({ userId, postIds }) => {
  const response = await getUserFeed({ userId })
  const { posts } = response.body
  expect(posts.map(post => post.id)).toEqual(postIds)
}

const expectPostToHaveFields = async ({ userId, postId, fields }) => {
  const response = await getPost({ userId, postId })
  const { post } = response.body
  expect(post).toEqual(expect.objectContaining(fields))
}

test('post appearance in user feed', async () => {
  await expectPostIdsInUserPosts({
    userId: 'a',
    postIds: [],
  })
  await createPost({ userId: 'a' })
  await expectPostIdsInUserPosts({
    userId: 'a',
    postIds: ['0000000001'],
  })
  await createPost({ userId: 'b' })
  await expectPostIdsInUserPosts({
    userId: 'b',
    postIds: ['0000000002'],
  })
  await createPost({ userId: 'a' })
  await expectPostIdsInUserPosts({
    userId: 'a',
    postIds: ['0000000003', '0000000001'],
  })
})

test('delete post from user posts', async () => {
  await expectPostIdsInUserPosts({
    userId: 'a',
    postIds: [],
  })
  await createPost({ userId: 'a' })
  await createPost({ userId: 'a' })
  await expectPostIdsInUserPosts({
    userId: 'a',
    postIds: ['0000000002', '0000000001'],
  })
  await deletePost({
    userId: 'a',
    postId: '0000000001',
  })
  await expectPostIdsInUserPosts({
    userId: 'a',
    postIds: ['0000000002'],
  })
  await deletePost({
    userId: 'a',
    postId: '0000000002',
  })
  await expectPostIdsInUserPosts({
    userId: 'a',
    postIds: [],
  })
})

test('create and delete post in feed', async () => {
  await createPost({ userId: 'a' })
  await expectPostIdsInUserFeed({
    userId: 'b',
    postIds: ['0000000001'],
  })
  await deletePost({
    userId: 'a',
    postId: '0000000001',
  })
  await expectPostIdsInUserFeed({
    userId: 'b',
    postIds: [],
  })
})

test('post like', async () => {
  await createPost({ userId: 'a' })
  await setPostLike({
    userId: 'b',
    postId: '0000000001',
    value: true,
  })
  await expectPostToHaveFields({
    userId: 'a',
    postId: '0000000001',
    fields: {
      liked: false,
      likes: 1,
    },
  })
  await expectPostToHaveFields({
    userId: 'b',
    postId: '0000000001',
    fields: {
      liked: true,
      likes: 1,
    },
  })
  await setPostLike({
    userId: 'b',
    postId: '0000000001',
    value: false,
  })
  await expectPostToHaveFields({
    userId: 'b',
    postId: '0000000001',
    fields: {
      liked: false,
      likes: 0,
    },
  })
})

test('post report', async () => {
  await createPost({ userId: 'a' })
  await setPostReport({
    userId: 'b',
    postId: '0000000001',
    value: true,
  })
  await expectPostToHaveFields({
    userId: 'a',
    postId: '0000000001',
    fields: {
      reported: false,
      reports: 1,
    },
  })
  await expectPostToHaveFields({
    userId: 'b',
    postId: '0000000001',
    fields: {
      reported: true,
      reports: 1,
    },
  })
  await setPostReport({
    userId: 'b',
    postId: '0000000001',
    value: false,
  })
  await expectPostToHaveFields({
    userId: 'b',
    postId: '0000000001',
    fields: {
      reported: false,
      reports: 0,
    },
  })
})

test('post view', async () => {
  await createPost({ userId: 'a' })
  await setPostView({
    userId: 'b',
    postId: '0000000001',
    value: true,
  })
  await expectPostToHaveFields({
    userId: 'a',
    postId: '0000000001',
    fields: {
      viewed: false,
      views: 1,
    },
  })
  await expectPostToHaveFields({
    userId: 'b',
    postId: '0000000001',
    fields: {
      viewed: true,
      views: 1,
    },
  })
  await setPostView({
    userId: 'b',
    postId: '0000000001',
    value: false,
  })
  await expectPostToHaveFields({
    userId: 'b',
    postId: '0000000001',
    fields: {
      viewed: false,
      views: 0,
    },
  })
})

test('post object interface', async () => {
  await createPost({ userId: 'a' })
  const response = await getPost({
    userId: 'a',
    postId: '0000000001',
  })
  const { post } = response.body
  expect(post).toEqual(
    expect.objectContaining({
      id: '0000000001',
      likes: 0,
      reports: 0,
      views: 0,
      user: 'a',
      liked: false,
      reported: false,
      viewed: false,
      score: expect.any(Number),
      timestamp: expect.any(Number),
      url: expect.stringContaining('http://'),
    })
  )
})
