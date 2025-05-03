import express from 'express';
import {
  createCalendar,deleteCalendar,getAllCalendars,getCalendarById,updateCalendar
  } from '../controllers/CalendarController';

const router = express.Router();

router.post('/',createCalendar );
    router.delete('/', deleteCalendar);
    router.get('/',getAllCalendars);
    router.get('/byId',getCalendarById);
    router.put('/',updateCalendar)
    // router.getAllCa


export default router;
