# Yulduzlar Bashorati Bot

Yulduzlar bashorati kontenti uchun Telegram bot va to'lov tizimi.

## Xususiyatlar

- Telegram bot orqali obuna boshqaruvi
- Bir martalik va avtomatik to'lovlar
- Click, Payme, UzCard to'lov tizimlari integratsiyasi
- MongoDB ma'lumotlar bazasi
- NestJS framework

## O'rnatish

```bash
npm install --legacy-peer-deps
```

## Ishga tushirish

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

## Environment Variables

`.env` faylida quyidagi o'zgaruvchilarni sozlang:

- `BOT_TOKEN` - Telegram bot token
- `MONGODB_URI` - MongoDB ulanish satri
- `CHANNEL_ID` - Telegram kanal ID
- To'lov tizimi konfiguratsiyalari (Click, Payme, UzCard)

## API Endpoints

- `/api/click-subs-api` - Click obuna to'lovlari
- `/api/payme-subs-api` - Payme obuna to'lovlari  
- `/api/uzcard-api` - UzCard obuna to'lovlari
- `/api/uzcard-onetime-api` - UzCard bir martalik to'lovlar
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
