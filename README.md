# MIROST

MIROST est une application web de mise en relation entre des etudiants creatifs et des entreprises, associations ou particuliers qui cherchent des profils pour des missions ponctuelles simples.

Le projet vise une experience plus accessible, plus lisible et plus equitable que les plateformes freelance traditionnelles.

## Stack

- React 19 + Vite
- TypeScript
- Tailwind CSS
- Firebase Authentication / Firestore / Storage
- Zustand

## Lancer le projet

```bash
npm install
npm run dev
```

Pour verifier l'etat du projet :

```bash
npm run lint
npm run build
```

## Configuration Firebase

Le projet peut demarrer sans configuration Firebase complete, en mode demo local.

Pour brancher un vrai projet Firebase, cree un fichier `.env.local` a partir de `.env.example` :

```bash
cp .env.example .env.local
```

Puis renseigne les variables suivantes :

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## Structure utile

- `src/components` : composants UI reutilisables
- `src/data` : jeux de donnees locaux pour le mode demo
- `src/firebase` : initialisation Firebase et services
- `src/stores` : etat global Zustand
- `src/types` : types metier partages
