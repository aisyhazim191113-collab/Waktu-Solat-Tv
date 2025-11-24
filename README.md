Deploy cepat (GitHub Pages):
1. Inisialisasi repo git di folder:
   git init
   git add .
   git commit -m "Initial"
2. Buat repo baru di GitHub dan push.
3. Di setelan repo -> Pages -> pilih branch main dan folder / (root) -> Save.
4. Tunggu beberapa minit — laman akan hidup di <username>.github.io/<repo>.

Deploy Netlify:
1. Log masuk ke netlify.com -> New site from Git -> pilih repo -> Deploy.
2. Netlify akan bina dan host; tambahkan domain jika mahu.

Nota CORS:
- Aladhan API membenarkan panggilan dari browser. Jika anda guna domain sendiri dan had atau masalah CORS muncul, gunakan proxy server atau hostkan kod pada platform yang membenarkan.

Push notifications (lanjutan):
- Untuk notifikasi walaupun laman ditutup, gunakan Firebase Cloud Messaging + server untuk schedule. Saya boleh bantu sediakan panduan penuh jika mahu.
