import express from 'express';
import bodyParser from 'body-parser';
import { attachMessages } from './messages';

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req: express.Request, _, next) => {
    console.log(new Date().toLocaleString(), req.method, req.url);
    next();
});

app.use(express.static('../poc-frontend'));

attachMessages(app);

app.listen(3001, () => console.log('Messaging app listening on port 3000!'));
