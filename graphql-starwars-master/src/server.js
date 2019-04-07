import * as express from 'express';
import * as graphqlHTTP from 'express-graphql';
import * as morgan from 'morgan';
import * as cors from 'cors';

var path = require('path');

export default function(schema, port) {
  var app = express();
  app.use(morgan('combined'));
  app.use(express.static('public'));
  app.use('/graphql', cors()); // warning: enables all CORS requests
  app.use('/graphql', graphqlHTTP({ schema, graphiql: true }));

  app.use('/schema', function(req, res, _next) {
    var printSchema = require('graphql/utilities/schemaPrinter').printSchema;
    res.set('Content-Type', 'text/plain');
    res.send(printSchema(schema));
  });

  app.listen(port, "0.0.0.0");
  console.log(`Started on http://localhost:${port}/`);
}
