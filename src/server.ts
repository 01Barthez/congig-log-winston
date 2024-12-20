import express from 'express';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import log from './core/logger';

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

// Logging middleware with Morgan using Winston
app.use(morgan(':method :url  :status :response-time ms', {
	stream: {
		write: (message) => log.http(message.trim()) // Redirect HTTP Log through winston
	}
 }));

//  Test of logs
 log.info("ceci est une info")
 log.warn("ceci est un warn")
 log.error("ceci est une erreur")
 log.error(new Error ("Ceci est une erreur avec une stack"))
 log.debug("ceci est un debug")

export default app;
