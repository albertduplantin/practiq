# Configuration Clerk pour Vercel

## Problème: Erreur 404 et CORS après connexion

Si vous rencontrez une erreur 404 ou des erreurs CORS après la connexion avec Clerk, suivez ces étapes :

## 1. Configuration dans le tableau de bord Clerk

### A. Ajouter votre domaine Vercel
1. Connectez-vous à [Clerk Dashboard](https://dashboard.clerk.com)
2. Sélectionnez votre application
3. Allez dans **Domains** dans la barre latérale
4. Cliquez sur **Add Domain**
5. Ajoutez votre domaine Vercel : `votre-app.vercel.app`
6. **Important** : Ajoutez aussi le domaine de prévisualisation si vous déployez des branches :
   - Format : `votre-app-git-branch-name-username.vercel.app`
   - Exemple : `practiq-git-copilot-add-new-features-albertduplantins-projects.vercel.app`

### B. Configuration des URLs de redirection
1. Dans Clerk Dashboard, allez dans **Paths**
2. Configurez les chemins suivants :
   - **Sign-in path** : `/login`
   - **Sign-up path** : `/sign-up`
   - **After sign-in** : `/dashboard`
   - **After sign-up** : `/dashboard`

### C. URLs autorisées (Allowed Origins)
1. Allez dans **Settings** > **Advanced** > **Allowed Origins**
2. Ajoutez vos domaines :
   ```
   https://votre-app.vercel.app
   https://votre-app-git-*.vercel.app
   http://localhost:3000
   ```

## 2. Variables d'environnement Vercel

Dans votre projet Vercel :

1. Allez dans **Settings** > **Environment Variables**
2. Ajoutez les variables suivantes :

```env
# Clerk Keys (à récupérer depuis Clerk Dashboard > API Keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx  # ou pk_test_xxxxx pour dev
CLERK_SECRET_KEY=sk_live_xxxxx                    # ou sk_test_xxxxx pour dev

# URLs Clerk (correspondent aux chemins configurés dans Clerk)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Firebase (vos credentials Firebase existants)
NEXT_PUBLIC_FIREBASE_API_KEY=xxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxxxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxxxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxxxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxxxx
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=xxxxx
```

3. **Important** : Appliquez ces variables à tous les environnements (Production, Preview, Development)

## 3. Redéployer

Après avoir configuré les domaines et variables :
1. Redéployez votre application depuis Vercel
2. Ou pushez un nouveau commit pour déclencher un nouveau déploiement

## 4. Vérification

Une fois redéployé, testez :
1. Allez sur votre site Vercel
2. Cliquez sur "Se connecter"
3. Connectez-vous avec Clerk
4. Vous devriez être redirigé vers `/dashboard` sans erreur 404

## Problèmes courants

### Erreur CORS
- **Cause** : Le domaine Vercel n'est pas ajouté dans Clerk Dashboard
- **Solution** : Ajoutez le domaine exact dans Clerk Dashboard > Domains

### Erreur 404 après connexion
- **Cause** : La redirection après connexion pointe vers une route qui n'existe pas ou qui est protégée
- **Solution** : 
  - Vérifiez que `/dashboard` existe dans votre application
  - Vérifiez que `/cours` est accessible publiquement (voir middleware.ts)

### "Development keys" warning
- **Cause** : Vous utilisez des clés de test (pk_test_*, sk_test_*)
- **Solution** : Normal en développement. Pour la production, utilisez des clés live (pk_live_*, sk_live_*)

### Redirection en boucle
- **Cause** : Conflit entre les chemins Clerk et les routes protégées
- **Solution** : Vérifiez que vos routes publiques dans `middleware.ts` incluent les chemins Clerk

## Routes publiques actuelles

Le fichier `middleware.ts` définit les routes publiques suivantes :
```typescript
const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sso-callback(.*)',
  '/cours(.*)',
]);
```

Les pages `/dashboard`, `/admin/*`, et `/tps/*` sont protégées et nécessitent une authentification.

## Support

- [Documentation Clerk](https://clerk.com/docs)
- [Clerk + Next.js](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk + Vercel](https://clerk.com/docs/deployments/deploy-to-vercel)
