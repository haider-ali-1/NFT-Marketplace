import asyncErrorHandler from '../middlewares/asyncErrorHandler.js';
import NFT from '../models/nftModel.js';
import CustomError from '../utils/CustomError.js';
import QueryBuilder from '../utils/QueryBuilder.js';

// @ desc top 5 nfts
// @ route GET /api/v1/top-5-nfts
// @ access PUBLIC

const topFiveNfts = asyncErrorHandler(async (req, res, next) => {
  req.query.sort = '-totalRatings price';
  req.query.limit = 5;
  next();
});

// @ desc get all nfts
// @ route GET /api/v1/nfts
// @ access PUBLIC

const getAllNfts = asyncErrorHandler(async (req, res, next) => {
  const features = await new QueryBuilder(NFT.find(), req.query)
    .filter()
    .sort()
    .selectFields()
    .paginate();
  const nfts = await features.query;
  res
    .status(200)
    .json({ status: 'success', total: nfts.length, data: { nfts } });
});

// @ desc create new nft
// @ route POST /api/v1/nfts
// @ access PUBLIC

const createNft = asyncErrorHandler(async (req, res, next) => {
  const nft = await NFT.create(req.body);
  res.status(201).json({ status: 'success', data: { nft } });
});

// @ desc get single nft
// @ route GET /api/v1/nfts/:id
// @ access PUBLIC

const getNft = asyncErrorHandler(async (req, res, next) => {
  const nft = await NFT.findById(req.params.id);

  if (!nft) throw new CustomError("can't find nft with that id", 404);

  res.status(201).json({ status: 'success', data: { nft } });
});

// @ desc update nft
// @ route PATCH /api/v1/nfts
// @ access PUBLIC

const updateNft = asyncErrorHandler(async (req, res, next) => {
  const updatedNft = await NFT.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(201).json({ status: 'success', data: { nft: updatedNft } });
});

// @ desc delete nft
// @ route DELETE /api/v1/nfts
// @ access PUBLIC

const deleteNft = asyncErrorHandler(async (req, res, next) => {
  await NFT.findByIdAndDelete(req.params.id);
  res.status(200).json({ status: 'success', data: 'null' });
});

// @ desc get nfts stats
// @ route GET /api/v1/nfts/nfts-stats
// @ access PUBLIC

const getNftsStats = asyncErrorHandler(async (req, res, next) => {
  const stats = await NFT.aggregate([
    { $match: { totalRatings: { $gte: 1 } } },
    {
      $group: {
        _id: '$difficulty',
        nftCount: { $sum: 1 },
        nftName: { $push: '$name' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        totalRatings: { $sum: '$totalRatings' },
        avgPrice: { $avg: '$price' },
        avgRating: { $avg: '$averageRating' },
      },
    },
    { $addFields: { difficulty: '$_id' } },
    {
      $project: {
        _id: 0,
        difficulty: 1,
        nftCount: 1,
        nftName: 1,
        minPrice: 1,
        maxPrice: 1,
        totalRatings: 1,
        avgPrice: { $round: ['$avgPrice', 0] },
        avgRating: { $round: ['$avgRating', 2] },
      },
    },
    { $sort: { totalRatings: -1 } },
  ]);
  res.status(200).json({ status: 'success', data: { stats } });
});

// @ desc get nfts created in month
// @ route GET /api/v1/nfts/created/:year
// @ access PUBLIC

const getNftsCreatedInYear = asyncErrorHandler(async (req, res, next) => {
  const year = Number(req.params.year);
  const filteredNfts = await NFT.aggregate([
    { $unwind: '$startDates' },
    { $match: { $expr: { $eq: [{ $year: '$startDates' }, year] } } },
    {
      $group: {
        _id: { $month: '$startDates' },
        nftsCount: { $sum: 1 },
        nftsName: { $push: '$name' },
      },
    },
    { $addFields: { month: '$_id' } },
    { $project: { _id: 0 } },
  ]);
  res.status(200).json({ status: 'success', data: { filteredNfts } });
});

export {
  getAllNfts,
  createNft,
  getNft,
  updateNft,
  deleteNft,
  topFiveNfts,
  getNftsStats,
  getNftsCreatedInYear,
};
