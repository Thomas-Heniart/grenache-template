# grenache-template

[![codecov](https://codecov.io/gh/Thomas-Heniart/grenache-template/graph/badge.svg?token=XUFD51HJAE)](https://codecov.io/gh/Thomas-Heniart/grenache-template)

This is a template for creating a new Grenache project.

## Instructions

Install the project easily with the following commands:

```bash  
npm i  
cp .env.example .env  
```  

## Development Environment

To start a decentralized environment, run the following command:

⚠️ Ensure your `.env` file is correctly configured with **DHT_PORTS** and **API_PORTS**.

```bash  
npm run grapes:start  
```  

A `docker-compose` file is also provided to start development databases such as MongoDB, PostgreSQL, and Redis. Run the
following command:

```bash  
docker compose up -d  
```  

## Code Style

This project comes with default code style configurations using Prettier and ESLint.

Linting rules and code formatting will be executed automatically with every commit.

If you're using IntelliJ IDEA, ESLint fixes and Prettier formatting will be applied automatically on save.

## License

MIT  
