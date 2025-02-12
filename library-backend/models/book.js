import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

const schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
  },
  published: {
    type: Number,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author',
  },
  genres: [{ type: String }],
});

schema.plugin(uniqueValidator);

export default mongoose.model('Book', schema);
