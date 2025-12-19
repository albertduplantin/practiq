# Practiq - Plateforme d'apprentissage BAC Pro MSPC

Plateforme de cours et travaux pratiques pour le **BAC Pro MSPC** (Maintenance des Systèmes de Production Connectés).

## 📋 Fonctionnalités

### Pour les Étudiants

#### 🎯 Tableau de bord personnalisé
- Visualisation de la progression globale
- Statistiques par catégorie (Fabrication, Électrotechnique, Mécanique, Hydraulique, Gestion de maintenance)
- Suivi du temps passé sur les TP
- Scores moyens et badges de réussite

#### 📚 Système de cours et TP
- **Parcours de formation** : Cours organisés regroupant plusieurs TP
- **Travaux Pratiques individuels** : TP indépendants avec niveaux de difficulté (1-5)
- **Contenu riche** : 
  - Descriptions détaillées avec éditeur WYSIWYG
  - Vidéos YouTube intégrées
  - Documents PDF téléchargeables
  - Images de couverture

#### 🔍 Recherche et filtrage avancés
- Recherche par mot-clé
- Filtrage par catégorie
- Filtrage par niveau de difficulté
- Filtrage par tags
- Vue séparée cours/TP ou combinée

#### 💬 Système de commentaires
- Poser des questions sur chaque TP
- Partager son expérience
- Commentaires modérés par les enseignants
- Affichage de la date et de l'auteur

#### 📊 Suivi de progression
- Marquer les TP comme "En cours" ou "Terminés"
- Barre de progression visuelle
- Historique des TP complétés

### Pour les Enseignants

#### 👨‍🏫 Gestion des TP
- Créer, modifier et supprimer des TP
- Éditeur WYSIWYG pour le contenu
- Upload de fichiers PDF
- Intégration de vidéos YouTube
- Statuts : Brouillon / Publié
- Système de tags
- Ordre d'affichage personnalisable

#### 📖 Gestion des cours
- Créer des parcours de formation
- Associer plusieurs TP à un cours
- Description détaillée du parcours
- Gestion de l'ordre d'affichage

#### 🗂️ Gestion des catégories (Admins uniquement)
- Créer et gérer des catégories dynamiques
- Définir le type : Cours, TP, ou les deux
- Ordre d'affichage personnalisable

#### 📈 Tableau de bord administrateur
- Vue d'ensemble des statistiques
- Nombre de TP publiés
- Nombre d'étudiants
- TP terminés

### Rôles utilisateurs

- **Student** : Accès aux cours et TP, suivi de progression
- **Teacher Free** : Création de TP et cours (limité)
- **Teacher Pro** : Création illimitée de TP et cours
- **Admin** : Gestion complète de la plateforme + catégories

## 🚀 Installation

### Prérequis

- Node.js 20+
- npm ou yarn
- Compte Firebase (Firestore + Authentication)

### Configuration

1. Cloner le repository :
```bash
git clone https://github.com/albertduplantin/practiq.git
cd practiq
```

2. Installer les dépendances :
```bash
npm install
```

3. Configurer Firebase :
   - Créer un projet Firebase
   - Activer Firestore et Authentication
   - Copier la configuration dans `src/firebase/config.ts`

4. Lancer le serveur de développement :
```bash
npm run dev
```

5. Ouvrir [http://localhost:3000](http://localhost:3000)

## 🏗️ Technologies utilisées

- **Framework** : Next.js 15.5.4 (App Router)
- **Language** : TypeScript
- **Styling** : Tailwind CSS
- **Base de données** : Firebase Firestore
- **Authentification** : Firebase Auth
- **Éditeur** : TipTap (éditeur WYSIWYG)
- **UI Components** : Radix UI
- **Icons** : Lucide React

## 📁 Structure du projet

```
src/
├── app/
│   ├── admin/          # Pages administration
│   │   ├── tps/        # Gestion des TP
│   │   ├── cours/      # Gestion des cours
│   │   └── categories/ # Gestion des catégories
│   ├── cours/          # Pages cours (étudiants)
│   ├── tps/            # Pages TP (étudiants)
│   ├── dashboard/      # Tableau de bord étudiant
│   └── login/          # Authentification
├── components/
│   ├── ui/             # Composants UI réutilisables
│   └── editor/         # Éditeur WYSIWYG
├── context/            # React Context (Auth)
├── firebase/           # Configuration Firebase
├── lib/                # Utilitaires et helpers
│   └── firestore.ts    # Fonctions Firestore
└── types/              # Types TypeScript
```

## 🔧 Scripts disponibles

```bash
npm run dev      # Lancer le serveur de développement
npm run build    # Build de production
npm run start    # Démarrer le serveur de production
npm run lint     # Linter le code
```

## 📝 Base de données Firestore

### Collections

- **tps** : Travaux pratiques
- **courses** : Parcours de formation
- **categories** : Catégories de contenu
- **users** : Utilisateurs
- **progress** : Progression des étudiants
- **comments** : Commentaires sur les TP

## 🔐 Règles de sécurité

Les règles de sécurité Firestore sont définies dans `firestore.rules` :
- Les étudiants peuvent lire les contenus publiés
- Les enseignants peuvent créer et modifier leurs contenus
- Les admins ont tous les droits
- Les utilisateurs peuvent gérer leur propre progression

## 🎨 Thèmes

L'application supporte les thèmes clair et sombre avec `next-themes`.

## 📄 Licence

Ce projet est sous licence privée.

## 👥 Contributeurs

- Albert Duplantin - Créateur et développeur principal

## 📞 Support

Pour toute question ou problème, veuillez ouvrir une issue sur GitHub.
