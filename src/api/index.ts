import express, { Router } from 'express';
import { Routes } from '../constant';
import * as cManifest from './manifest';
import * as cBindings from './bindings';
import * as cInstall from './install';
import * as cHelp from './help';
import * as cConfigure from './configure';

const router: Router = express.Router();

router.get(Routes.App.ManifestPath, cManifest.getManifest);
router.post(Routes.App.BindingsPath, cBindings.getBindings);
router.post(Routes.App.InstallPath, cInstall.getInstall);
router.post(Routes.App.CallPathHelp, cHelp.getHelp);

// Configure Google Client
router.post(Routes.App.CallPathConfigForm, cConfigure.configureGoogleClient);
router.post(Routes.App.CallPathConfigSubmit, cConfigure.configureGoogleClientSubmit);

const staticRouter = express.Router();
staticRouter.use(express.static('static'));
router.use('/static', staticRouter);

export default router;
