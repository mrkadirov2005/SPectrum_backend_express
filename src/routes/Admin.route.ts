import express from 'express';
import {
  createAdmin,
  createGroup,deleteAdmin,deleteAdmins,getAdminByUuid,getAdmins,getGroups,removeGroup,searchAdmins,updateAdmin,updateAdmins,updateGroup,
  getGroupById
} from '../controllers/Admin.controller';
import { get } from 'http';

const router = express.Router();

router.post('/', createAdmin);
router.post('/group', createGroup);
router.get('/', getAdmins);
router.put('/update', updateGroup);
router.get('/groups', getGroups);
router.get('/group',getGroupById);
router.get('/uuid', getAdminByUuid);
router.put('/:uuid', updateAdmin);
router.put('/admins', updateAdmins);
router.delete('/01', removeGroup);
router.delete('/', deleteAdmin);
router.delete('/', deleteAdmins);
router.get('/search_admins',searchAdmins);
export default router;