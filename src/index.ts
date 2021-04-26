/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
if (process.env.NODE_ENV === 'production') {
  require('dotenv').config({ path: '.env' });
} else {
  require('dotenv').config({ path: '.env.dev' });
}
require('./app');
