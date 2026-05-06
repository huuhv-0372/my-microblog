import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import cookieParser from 'cookie-parser';
import methodOverride from 'method-override';
import connectFlash from 'connect-flash';
import session from 'express-session';
import helmet from 'helmet';
import csurf from 'csurf';
import { create } from 'express-handlebars';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { registerHbsHelpers } from './common/helpers/hbs-helpers';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Security headers
  app.use(helmet({ contentSecurityPolicy: false }));

  // Static files
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Views
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  const hbsEngine = create({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: join(__dirname, '..', 'views', 'layouts'),
    partialsDir: join(__dirname, '..', 'views', 'partials'),
  });
  // Register helpers on the same Handlebars instance used by express-handlebars
  registerHbsHelpers(hbsEngine.handlebars as unknown as Parameters<typeof registerHbsHelpers>[0]);
  app.engine('hbs', hbsEngine.engine);
  app.setViewEngine('hbs');

  // Middleware: cookie, session, method-override, csrf, flash
  app.use(cookieParser(process.env.COOKIE_SECRET ?? 'cookie-secret'));
  app.use(methodOverride('_method'));
  app.use(
    session({
      secret: process.env.SESSION_SECRET ?? 'session-secret',
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === 'production', httpOnly: true },
    }),
  );
  app.use(csurf({ cookie: false })); // store token in session
  app.use(connectFlash());

  // Inject csrfToken + currentYear into every response's locals
  app.use(
    (
      req: import('express').Request & { csrfToken?: () => string },
      res: import('express').Response,
      next: import('express').NextFunction,
    ) => {
      if (typeof req.csrfToken === 'function') {
        res.locals['csrfToken'] = req.csrfToken();
      }
      res.locals['currentYear'] = new Date().getFullYear();
      next();
    },
  );

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = parseInt(process.env.PORT ?? '3000', 10);
  await app.listen(port);
  console.log(`Application running on http://localhost:${port}`);
}
bootstrap();


