import express from 'express';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import log from './core/config/logger';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(
	rateLimit({
		max: 100,
		windowMs: 60,
		message: 'Trop de Requete à partir de cette adresse IP '
	})
);

// Middleware de journalisation avec Morgan qui utilise Winston
app.use(morgan('combined', {
	stream: {
		write: (message) => log.http(message.trim()) // Redirige les logs HTTP vers Winston
	}
 }));

//  Test des logs
 log.info("ceci est une info")
 log.warn("ceci est un warn")
 log.error("ceci est une erreur")
 log.debug("ceci est un debug")

export default app;
