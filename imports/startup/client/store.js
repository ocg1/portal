import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import createRavenMiddleware from 'raven-for-redux';

import {
  default as manageHoldings,
  middleware as manageHoldingsMiddleware,
} from '/imports/redux/manageHoldings';
import {
  default as vault,
  middleware as vaultMiddleware,
} from '/imports/redux/vault';
import web3 from '/imports/redux/web3';
import user from '/imports/redux/user';
import userMiddleware from '/imports/redux/middlewares/user';
import Raven from '/imports/startup/utils/raven';
import {
  default as summary,
  middleware as summaryMiddleware,
} from '/imports/redux/summary';


export default createStore(
  combineReducers({
    manageHoldings,
    web3,
    vault,
    user,
    summary,
  }),
  {
    /* preloadedState */
  },
  compose(
    applyMiddleware(
      manageHoldingsMiddleware,
      vaultMiddleware,
      userMiddleware,
      createRavenMiddleware(Raven),
      summaryMiddleware,
    ),
    /* eslint-disable no-underscore-dangle */
    window.__REDUX_DEVTOOLS_EXTENSION__
      ? window.__REDUX_DEVTOOLS_EXTENSION__()
      : f => f,
    /* eslint-enable */
  ),
);
