import { Router, type IRouter } from "express";
import healthRouter from "./health";
import journalRouter from "./journal";
import photosRouter from "./photos";
import locationsRouter from "./locations";
import campgroundsRouter from "./campgrounds";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(journalRouter);
router.use(photosRouter);
router.use(locationsRouter);
router.use(campgroundsRouter);
router.use(statsRouter);

export default router;
