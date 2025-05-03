import express from 'express';
import {
  createTest,deleteTest,getTestByUuid,getTests,updateTest
} from '../controllers/Test.controller';

const router = express.Router();

router.post('/', createTest);
router.get('/', getTests);
router.get('/:uuid', getTestByUuid);
router.put('/:uuid', updateTest);
router.delete('/:uuid', deleteTest);

export default router;
