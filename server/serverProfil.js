const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3003;

app.use(express.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '/uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

const usersFilePath = path.join(__dirname, 'users.json');

const readUsers = () => {
  if (!fs.existsSync(usersFilePath)) {
    fs.writeFileSync(usersFilePath, JSON.stringify([]));
  }
  return JSON.parse(fs.readFileSync(usersFilePath));
};

const writeUsers = (data) => {
  fs.writeFileSync(usersFilePath, JSON.stringify(data, null, 2));
};

app.post('/update-bio', (req, res) => {
  const { username, bio } = req.body;
  const users = readUsers();
  const userIndex = users.findIndex(u => u.username === username);
  if (userIndex === -1) {
    return res.status(404).send('Utilisateur non trouvé');
  }
  users[userIndex].bio = bio;
  writeUsers(users);
  res.send('Bio mise à jour avec succès');
});

app.post('/upload-profile-picture', upload.single('profilePic'), (req, res) => {
  const username = req.body.username;
  const users = readUsers();
  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(404).send('Utilisateur non trouvé');
  }
  user.profilePicture = `/uploads/${req.file.filename}`;
  writeUsers(users);
  res.send('Photo de profil mise à jour avec succès');
});

app.post('/upload-background-picture', upload.single('backgroundPic'), (req, res) => {
  const username = req.body.username;
  const users = readUsers();
  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(404).send('Utilisateur non trouvé');
  }
  user.backgroundPicture = `/uploads/${req.file.filename}`;
  writeUsers(users);
  res.send('Photo de fond mise à jour avec succès');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
