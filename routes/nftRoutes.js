import express from 'express';
import verifyToken from '../middlewares/verifyToken.js';
import {
  getAllNfts,
  createNft,
  getNft,
  updateNft,
  deleteNft,
  topFiveNfts,
  getNftsStats,
  getNftsCreatedInYear,
} from '../controllers/nftController.js';

const router = express.Router();

// alias routes
router.route('/top-5-nfts').get(topFiveNfts, getAllNfts);

// aggregation routes
router.route('/nfts-stats').get(getNftsStats);
router.route('/created/:year').get(getNftsCreatedInYear);

router.route('/').get(verifyToken, getAllNfts).post(createNft);
router.route('/:id').get(getNft).patch(updateNft).delete(deleteNft);

export default router;
