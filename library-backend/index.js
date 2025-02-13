import { useServer } from 'graphql-ws/use/ws';
import { WebSocketServer } from 'ws';

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';
import cors from 'cors';
import express from 'express';
import http from 'http';
import DataLoader from 'dataloader';

import mongoose from 'mongoose';
import User from './models/user.js';
import Book from './models/book.js';
import resolvers from './resolvers.js';
import typeDefs from './schema.js';

mongoose.set('strictQuery', false);

import 'dotenv/config';
import jwt from 'jsonwebtoken';

const MONGODB_URI = process.env.MONGODB_URI;

console.log('connecting to', MONGODB_URI);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB');
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message);
  });

const batchBookCounts = async (authorIds) => {
  const books = await Book.find({ author: { $in: authorIds } });
  const bookCounts = new Map();

  books.forEach((book) => {
    const authorId = book.author.toString();
    if (!bookCounts.has(authorId)) {
      bookCounts.set(authorId, 0);
    }
    bookCounts.set(authorId, bookCounts.get(authorId) + 1);
  });

  return authorIds.map((authorId) => bookCounts.get(authorId.toString()) || 0);
};

const start = async () => {
  const app = express();
  const httpServer = http.createServer(app);

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/',
  });

  const schema = makeExecutableSchema({ typeDefs, resolvers });
  const serverCleanup = useServer({ schema }, wsServer);

  const server = new ApolloServer({
    schema: makeExecutableSchema({ typeDefs, resolvers }),
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });
  await server.start();
  app.use(
    '/',
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const auth = req ? req.headers.authorization : null;
        if (auth && auth.startsWith('Bearer ')) {
          const decodedToken = jwt.verify(
            auth.substring(7),
            process.env.JWT_SECRET
          );
          const currentUser = await User.findById(decodedToken.id);
          return {
            currentUser,
            loaders: { bookCount: new DataLoader(batchBookCounts) },
          };
        }
      },
    })
  );
  const PORT = 4000;
  httpServer.listen(PORT, () =>
    console.log(`Server is now running on http://localhost:${PORT}`)
  );
};
start();
