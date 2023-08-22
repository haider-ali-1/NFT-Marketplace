import mongoose from 'mongoose';
import slugify from 'slugify';

const nftSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: true,
      required: [true, 'please provide nft name'],
      maxLength: [40, 'name should be less than 40 characters'],
    },
    price: {
      type: Number,
      required: [true, 'please provide nft price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: `discount price ({VALUE}) should be less than actual price`,
      },
    },
    slug: {
      type: String,
    },
    categories: {
      type: [String],
      required: [true, 'please provide movie category'],
    },
    summary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    durationMinutes: {
      type: Number,
      required: [true, 'please provide duration in minutes'],
    },
    maxGroupSize: {
      type: Number,
    },
    difficulty: {
      type: String,
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: `difficulty level should be either easy, medium or difficult`,
      },
      default: 'easy',
    },
    averageRating: {
      type: Number,
      validate: {
        validator: function (v) {
          return v >= 1 && v <= 5;
        },
        message: `average rating should be within the range of 1 to 5`,
      },
    },
    totalRatings: {
      type: Number,
      min: 0,
    },
    coverImage: {
      type: String,
    },
    images: {
      type: [String],
    },
    startDates: {
      type: [Date],
    },
    secretNft: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtuals
nftSchema.virtual('durationFormat').get(function () {
  const hours = Math.floor(this.durationMinutes / 60);
  const minutes = this.durationMinutes % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
});

// Document Middlewares
nftSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Query Middleware
nftSchema.pre(/^find/, function (next) {
  this.find({ secretNft: { $ne: true } });
  this.start = Date.now();
  next();
});

nftSchema.post(/^find/, function (result) {
  console.log(
    `Query took ${
      Date.now() - this.start
    } miliseconds to perform find operation`
  );
});

// Aggregation Middlware
nftSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretNft: { $ne: true } } });
  next();
});

const NFT = mongoose.model('NFT', nftSchema);
export default NFT;
