const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLNonNull,
    GraphQLList,
    GraphQLFloat
} = require("graphql");
const {Movie, User} = require('/home/fateme/Pheebs-Internship/imdb_final/db')


const starType = new GraphQLObjectType({
    name: "UserType",
    fields: {
      name: {
        type: GraphQLString,
        async resolve(objId) {
            const starFind = await User.findOne({ _id: objId})
            return starFind.name
        }
      },
      imdbId: {
        type: GraphQLString,
        async resolve(objId) {
            const starFind = await User.findOne({ _id: objId}) 
            return starFind.imdbId
        }
      }
    }
  });

const movieType = new GraphQLObjectType({
    name: "MovieType",
    fields: {
      title: {
        type: GraphQLString,
        async resolve(objId) {
            const movieFind = await Movie.findOne({ _id: objId._id})
            return movieFind.title
        }
      },
      year: {
        type: GraphQLInt,
        async resolve(objId) {
            const movieFind = await Movie.findOne({ _id: objId._id})
            return movieFind.year
        }
      },
      rate: {
        type: GraphQLFloat,
        async resolve(objId) {
            const movieFind = await Movie.findOne({ _id: objId._id})
            return movieFind.rating
        }
      },
      // rank: {
      //   type: GraphQLInt,
      //   async resolve(objId) {
      //       const movieFind = await Movie.findOne({ _id: objId._id})
      //       return movieFind.rank
      //   }
      // },
      director: {
        type: starType,
        async resolve(objId) {
            return objId.director

            // return userFind.name
        }
      },
      stars: {
        type: GraphQLList(starType),
        async resolve(objId) {
            return objId.stars

            // return userFind.name
        }
      },
    }
  });


  const queryType = new GraphQLObjectType({
    name: 'Query',
    fields: () => ({

        users: {
          args: {
            id: {
              type: GraphQLNonNull(GraphQLInt)
            },
            
          },
            type: GraphQLList(starType),
            async resolve() {
              
              const allStar = await User.find({})
              return  allStar._id
            }
          },

      movies: {
        type: GraphQLList(movieType),
        async resolve() {
              
            const allMovie = await Movie.find({})
            return  allMovie
          } 
        },
    })
  });

  const schema = new GraphQLSchema({
    query: queryType
  });
  
  module.exports = schema;
  