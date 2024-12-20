import log from './core/logger';
import app from './server';
import 'dotenv/config'

// Running Server
log.verbose("\n\n");
log.info("*************LANCEMENT DU SERVEUR*************\n");

// Running Server non sécurisé
app.listen(process.env.PORT, () => {
	log.info(`not server running on url: http://localhost:${process.env.PORT || 4000}/`);
	log.info(`Documentation: http://localhost:${process.env.PORT || 4000}/api-docs\n`);
});
