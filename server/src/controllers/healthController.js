import { database } from '../database/databaseAdapter.js';export const getHealth=(req,res)=>res.json({ok:true,version:'1.0.2',persistence:database.engine});
