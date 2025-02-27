export interface AppConfiguration {
  port: number;
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    synchronize: boolean;
  };
  cors: {
    origin: string;
    methods: string[];
    allowedHeaders: string[];
    credentials: boolean;
  };
}

export default (): AppConfiguration => ({
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'contact_management',
    synchronize: process.env.DB_SYNC === 'true' || true,
  },
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: (
      process.env.CORS_METHODS || 'GET,POST,PUT,DELETE,PATCH,OPTIONS'
    ).split(','),
    allowedHeaders: (
      process.env.CORS_ALLOWED_HEADERS || 'Content-Type,Authorization,Accept'
    ).split(','),
    credentials: process.env.CORS_CREDENTIALS === 'true' || true,
  },
});
