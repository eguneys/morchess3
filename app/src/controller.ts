import { Router } from "express";

class LockedDayError extends Error {}
class InvalidHashError extends Error {}


export const router = Router()