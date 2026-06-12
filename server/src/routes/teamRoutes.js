import{Router}from'express';import{listTeams}from'../controllers/teamController.js';export const teamRoutes=Router();teamRoutes.get('/teams',listTeams);
