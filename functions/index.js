const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });
const admin = require('firebase-admin');

admin.initializeApp();

exports.uploadImage = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== 'POST') {
        return res.status(405).send({ error: 'Метод не поддерживается. Используйте POST.' });
      }

      const { file, fileName, contentType } = req.body;
      if (!file || !fileName || !contentType) {
        return res.status(400).send({ error: 'Отсутствуют необходимые параметры: file, fileName или contentType.' });
      }

      const bucket = admin.storage().bucket();
      const fileRef = bucket.file(`posts/${Date.now()}_${fileName}`);

      await fileRef.save(Buffer.from(file, 'base64'), {
        metadata: { contentType: contentType }
      });

      const [downloadURL] = await fileRef.getSignedUrl({
        action: 'read',
        expires: '03-09-2491' // Долгосрочный URL
      });

      res.status(200).send({ url: downloadURL });
    } catch (error) {
      console.error('Ошибка при загрузке изображения:', error);
      res.status(500).send({ error: error.message });
    }
  });
});