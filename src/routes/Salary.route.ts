import express from 'express';
import {
    createSalary,deleteSalary,getAllSalaries,getSalaryById,updateSalary
  } from '../controllers/Salary.controller';

const router = express.Router();

router.post('/',createSalary );
    router.delete('/', deleteSalary);
    router.get('/',getAllSalaries);
    router.get('/byId',getSalaryById);
    router.put('/',updateSalary)
    // router.getAllCa


export default router;
