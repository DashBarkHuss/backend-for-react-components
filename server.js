const express = require('express');
const multer = require('multer');
const path = require('path');

const config = { data: { images: path.join(__dirname, './data/images') } };
const upload = multer({ limits: { size: 4 * 1024 * 1024 } });
const handleImage = (avatars) => async (req, res, next) => {
  if (!req.file) return next();
  if (req.file.mimetype !== 'image/png' && req.file.mimetype !== 'image/jpeg') {
    return next(new Error('File format is not supported'));
  }
  req.file.storedFilename = await avatars.store(req.file.buffer);
  return next();
};
const cors = require('cors');
const bodyParser = require('body-parser');
const ImageService = require('./services/ImageServices');

const app = express();

const images = new ImageService(config.data.images);

app.use(bodyParser.json());
app.use(cors());
app.use((req, res, next) => {
  console.log(req.path);
  next();
});
app.get('/users', (req, res, next) => {
  // pretend to go to the database
  const handles = ['dashie', 'dashiell', 'shlomo', 'butt'];
  const available = handles.includes(req.query.handle);
  res.status(200).send(available);
});
app.post('/alias', (req, res, next) => {
  // pretend to go to the database
  const aliasHandle = req.body.handle;
  const handles = ['dashie', 'dashiell', 'shlomo', 'butt'];
  const available = !handles.includes(aliasHandle);
  // pretend to change the handle in the database some code bla bla
  if (available) res.status(200).send({ message: 'success' });
  if (!available) res.status(200).send({ message: 'handle not available' });
});
app.post('/wishlist', (req, res, next) => {
  // pretend to change the wishlist in the database some code bla bla
  const { wishlistName, wishlistMessage } = req.body;
  if (wishlistName || wishlistMessage) res.status(200).send({ message: 'success' });
  if (!(wishlistName || wishlistMessage)) res.status(200).send({ message: 'something went wrong' });
});
app.post('/image', upload.single('image'), handleImage(images), (req, res, next) => {
  if (req.file && req.file.storedFilename) {
    // this is where we would save to user.avatar for example. remember to delete the image (images.delete(req.file.storedFileName)) if the user.save() throws an error
    console.log(`this file was saved to to the server: ${req.file.storedFilename}`);
  }
  res.status(200).send(req.file.storedFilename);
});
app.post('/form', (req, res, next) => {
  console.log('req', req);
  res.status(200).send('file');
});
app.get('/image/:filename', (req, res, next) => {
  res.type('png');
  console.log(req.params.filename);
  return res.sendFile(images.filepath(req.params.filename));
});
app.get('/user/:id', (req, res, next) => {
  // pretending we're going to a database
  if (req.params.id === '123') {
    return res.send({ profilePicture: 'bf69442b-abbd-4cd3-a27f-e4a7bfc3d640.png' });
  }

  return res.status(500).send('No such user');
});

app.listen(4000, () => {
  console.log('Running on port 4000');
});
