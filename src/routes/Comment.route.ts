import express from 'express';
import {
 createComment,deleteComment,deleteAllComments,getAllComments,getCommentsByGivenBy,getCommentsByTargetId
} from '../controllers/Comment.controller';

const router = express.Router();

router.post('/', createComment);
router.get('/', getAllComments);
router.get('/targetId', getCommentsByTargetId);
router.get('/bycreator', getCommentsByGivenBy);
router.delete('/byId', deleteComment);

export default router;
