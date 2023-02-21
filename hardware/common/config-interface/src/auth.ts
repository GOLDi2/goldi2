import express from 'express';
import passwd from 'passwd-linux';

import {config} from './config';

export function pam_auth(realm: string) {
  let cache: undefined | string = undefined;
  let cache_time: undefined | number = undefined;
  async function _pam_auth(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (config.NODE_ENV === 'development') {
      return next();
    }

    function send_auth() {
      res.header('WWW-Authenticate', 'Basic realm="' + realm + '"');
      res.status(401).send('Authentication required');
    }

    if (req.headers.authorization && req.headers.authorization.search('Basic ') === 0) {
      let use_cached = false;
      if (req.headers.authorization === cache) {
        use_cached = true;
        next();
        if (cache_time && Date.now() - cache_time < 10000) {
          return;
        }
      }
      const decodedAuth = Buffer.from(req.headers.authorization.split(' ')[1], 'base64').toString().split(':');

      const options = {
        username: decodedAuth[0],
        password: decodedAuth[1],
      };

      new Promise((resolve, reject) => {
        passwd.checkPassword(options.username, options.password, (err, response) => {
          if (err) {
            reject(err);
          } else {
            if (response) {
              resolve(undefined);
            } else {
              reject('Password is not correct');
            }
          }
        });
      })
        .then(() => {
          if (!use_cached) next();
          cache = req.headers.authorization;
          cache_time = Date.now();
        })
        .catch(err => {
          cache = undefined;
          cache_time = undefined;
          send_auth();
          console.log('Failed Authentication Attemp: ', err);
        });
      return;
    }
    send_auth();
  }
  return _pam_auth;
}
