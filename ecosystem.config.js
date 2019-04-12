module.exports = {
  apps : [{
    name: 'ws',
    script: 'server/https.js',

    // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    //args: 'one two',
    instances: 6,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    },
    log_date_format: 'YYYY-MM-DD HH:mm'
  },
  {
    name: 'http',
    script: 'server/server.js',

    // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    //args: 'one two',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    },
    log_date_format: 'YYYY-MM-DD HH:mm'
  }],

  deploy : {
    production : {
      user : 'root',
      host : '163.172.71.7',
      ref  : 'origin/master',
      repo : 'git@github.com:cyber-nation/website.git',
      path : '/var/www/production',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production'
    }
  }
};
