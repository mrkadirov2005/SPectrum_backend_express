import express from 'express';
import {
  createClient,
  deleteClient,
  updateClient,
  getClientByUuid,
  getClients
} from '../controllers/Client.controller';

const router = express.Router();

router.post('/', createClient);
router.get('/', getClients);
router.get('/:uuid', getClientByUuid);
router.put('/:uuid', updateClient);
router.delete('/:uuid', deleteClient);

export default router;
