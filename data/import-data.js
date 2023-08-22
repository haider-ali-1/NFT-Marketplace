import fs from 'node:fs/promises';
import { __dirname } from '../utils/__dirname.js';
import 'dotenv/config';
import connectWithMongoDB from '../configs/mongodbConnection.js';
import NFT from '../models/nftModel.js';
import path from 'node:path';

await connectWithMongoDB();

const importData = async () => {
  try {
    // read nfts from nfts.json
    const nfts = JSON.parse(
      await fs.readFile(path.join(__dirname(import.meta.url), 'nfts.json'), {
        encoding: 'utf-8',
      })
    );

    // insert nfts data
    await NFT.create(nfts);
    console.log('import data successfully');
    process.exit(0);
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

const deleteData = async () => {
  try {
    await NFT.deleteMany();
    console.log('delete data successfully');
    process.exit(0);
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

if (process.argv[2] === '--import') importData();
else if (process.argv[2] === '--delete') deleteData();
