import { Hono } from 'hono';
import auth from './auth.routes.js';
import brands from './brand.routes.js';
import { queries, brandQueries } from './query.routes.js';
import mentions from './mention.routes.js';
import analytics from './analytics.routes.js';
import alerts from './alert.routes.js';
import profile from './profile.routes.js';

const routes = new Hono();

routes.route('/auth', auth);
routes.route('/brands', brands);
routes.route('/brands', brandQueries);
routes.route('/brands', analytics);
routes.route('/queries', queries);
routes.route('/queries', mentions);
routes.route('/alerts', alerts);
routes.route('/profile', profile);

export default routes;
