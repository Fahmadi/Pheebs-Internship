import graphqlServer from './server';
import { StarWarsSchema } from './thirdparty/starWarsSchema.js';

graphqlServer(StarWarsSchema, 8080);