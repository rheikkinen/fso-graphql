import { GraphQLError } from 'graphql';
import Author from './models/author.js';
import Book from './models/book.js';
import User from './models/user.js';
import jwt from 'jsonwebtoken';

import { PubSub } from 'graphql-subscriptions';

const pubsub = new PubSub();

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      if (!args.author && !args.genre) return Book.find({}).populate('author');

      const { author, genre } = args;

      const books = await Book.find({
        genres: {
          $in: genre ? [genre] : [],
        },
      }).populate('author');

      return books;
    },
    allAuthors: async () => {
      const authors = await Author.find({});

      return authors;
    },
    me: async (root, args, context) => context.currentUser,
  },
  Author: {
    bookCount: async (root, args, { loaders }) => {
      return loaders.bookCount.load(root._id);
    },
  },
  Mutation: {
    addBook: async (root, args, { currentUser }) => {
      if (!currentUser) {
        // Not logged in
        throw new GraphQLError('Not authenticated', {
          extensions: {
            code: 'BAD_USER_INPUT',
          },
        });
      }

      let author = await Author.findOne({ name: args.author });

      if (!author) {
        author = new Author({ name: args.author, born: null });
        try {
          await author.save();
        } catch (error) {
          if (error.name === 'ValidationError') {
            throw new GraphQLError(error.message, {
              extensions: { code: 'BAD_USER_INPUT', invalidArgs: args.author },
            });
          } else {
            throw new GraphQLError('Saving author failed', {
              extensions: {
                code: 'BAD_USER_INPUT',
                invalidArgs: args.author,
              },
            });
          }
        }
      }

      const book = new Book({ ...args, author });
      try {
        await book.save();
      } catch (error) {
        if (error.name === 'ValidationError') {
          throw new GraphQLError(error.message, {
            extensions: { code: 'BAD_USER_INPUT', invalidArgs: args },
          });
        } else {
          throw new GraphQLError('Saving book failed', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args,
            },
          });
        }
      }

      pubsub.publish('BOOK_ADDED', { bookAdded: book });

      return book;
    },
    editAuthor: async (root, args, { currentUser }) => {
      if (!currentUser) {
        // Not logged in
        throw new GraphQLError('Not authenticated', {
          extensions: {
            code: 'BAD_USER_INPUT',
          },
        });
      }

      const author = await Author.findOne({ name: args.name });

      if (!author) return null;

      author.born = args.setBornTo;

      try {
        await author.save();
      } catch (error) {
        throw new GraphQLError('Saving author failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args,
          },
        });
      }

      return author;
    },
    createUser: async (root, { username, favoriteGenre }) => {
      console.log(username, favoriteGenre);
      const user = new User({
        username,
        favoriteGenre,
      });

      try {
        await user.save();
      } catch (error) {
        throw new GraphQLError('Creating the user failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: [username, favoriteGenre],
            error,
          },
        });
      }
      return user;
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });

      if (!user || args.password !== 'secret') {
        throw new GraphQLError('Invalid username or password', {
          extensions: {
            code: 'BAD_USER_INPUT',
          },
        });
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      };

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) };
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterableIterator('BOOK_ADDED'),
    },
  },
};

export default resolvers;
