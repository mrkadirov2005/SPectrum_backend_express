import express from 'express';
import {
createStudent,deleteStudent,getStudentByUuid,getStudents,updateStudent
  } from '../controllers/Student.controller';

const router = express.Router();

router.post('/', createStudent);
router.get('/', getStudents);
router.get('/:uuid', getStudentByUuid);
router.put('/:uuid', updateStudent);
router.delete('/:uuid', deleteStudent);

export default router;
