# Page Détail Compte

## Vue d'ensemble

La page détail d'un compte (`/dashboard/accounts/[id]`) permet de visualiser et gérer un compte bancaire spécifique : consulter les transactions, importer des relevés, et configurer les paramètres du compte.

## Structure de la page

```
┌─────────────────────────────────────────────────────────────┐
│ ← Retour aux banques                                        │
├─────────────────────────────────────────────────────────────┤
│ HEADER                                                      │
│ ┌─────┐                                                     │
│ │ CM  │  Compte Joint  ✏️                                   │
│ └─────┘  Crédit Mutuel • Compte courant                     │
│ ─────────────────────────────────────────────────────────── │
│ 👤👤 Isaac, Mathieu          5 230,00 €  ⚙️ 🗑️             │
│                              173 transactions               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ TRANSACTIONS (173)                        [Importer]        │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🔍 Rechercher une transaction...                        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ 5 janv.  Vir Sepa Monsieur Mathieu...         +25,00 €     │
│ 29 déc.  Virement depuis BoursoBank           +25,00 €     │
│ 8 déc.   Virement depuis Isaac                -50,00 €     │
│ ...                                                         │
│                                                             │
│          [Charger plus de transactions]                     │
└─────────────────────────────────────────────────────────────┘
```

## Composants

### 1. Header du compte

Le header affiche les informations essentielles du compte :

- **Logo banque** : Carré coloré avec les initiales de la banque (ex: "CM" pour Crédit Mutuel)
- **Nom du compte** : Éditable via le bouton crayon qui ouvre un Sheet
- **Métadonnées** : Nom de la banque, type de compte, numéro de compte (optionnel)
- **Membres** : Avatars des titulaires avec leurs initiales et couleurs personnalisées
- **Solde** : Montant actuel du compte
- **Actions** : Boutons paramètres (⚙️) et suppression (🗑️)

La bordure gauche du header reprend la couleur de la banque pour une identification visuelle rapide.

### 2. Card Transactions

La card principale contient :

#### Header de la card
- **Titre** : "Transactions" avec le compteur total entre parenthèses
- **Bouton Importer** : Ouvre le sélecteur de fichier pour importer un relevé CSV

#### Barre de recherche
- Pleine largeur, hauteur généreuse (h-11)
- Recherche en temps réel avec debounce de 300ms
- Filtre les transactions par description

#### Liste des transactions
- Affichage compact : date | description | montant
- Couleurs : vert pour les revenus (+), noir pour les dépenses (-)
- Catégorie affichée si disponible (emoji + nom)

#### Infinite Scroll
- Chargement automatique au scroll via IntersectionObserver
- Bouton "Charger plus" en fallback
- Indicateur de chargement avec spinner
- Message de fin quand toutes les transactions sont affichées

#### Drag & Drop
- Zone de dépôt sur toute la card
- Overlay visuel quand un fichier est glissé au-dessus
- Supporte les formats CSV, XLSX, XLS

## Sheets (Drawers)

### Sheet Édition du compte

Ouvert via le bouton crayon (✏️) dans le header.

Contenu :
- Logo de la banque
- Champ "Nom du compte"
- Champ "Numéro de compte" (optionnel)
- Champ "Description" (optionnel)
- Boutons Annuler / Enregistrer

### Sheet Paramètres

Ouvert via le bouton engrenage (⚙️) dans le header.

Contenu :

#### Solde initial
- Montant de référence pour le calcul du solde
- Date à laquelle ce solde était valide
- Le solde actuel = solde initial + revenus - dépenses (après cette date)

#### Lien d'export
- URL vers l'espace client de la banque
- Raccourci pour télécharger les relevés

#### Historique des imports
- Liste des fichiers importés pour ce compte
- Statut : En attente, En cours, Traité, Échoué
- Actions : Retraiter, Supprimer
- Statistiques : nombre de transactions, doublons ignorés

## Flux d'import

1. **Upload** : Clic sur "Importer" ou drag & drop d'un fichier
2. **Traitement** : Le fichier est uploadé puis parsé automatiquement
3. **Déduplication** : Les transactions déjà existantes sont ignorées
4. **Feedback** : Message indiquant "X transactions importées, Y doublons ignorés"
5. **Rafraîchissement** : La liste des transactions et le solde sont mis à jour

## Patterns UI

### Utilisation des Sheets
Toute édition ou configuration se fait via des Sheets (drawers latéraux) plutôt que des modals ou des modes inline. Cela permet :
- Une meilleure expérience mobile (100% de largeur)
- Une séparation claire entre consultation et édition
- Une navigation cohérente (fermeture par swipe ou clic extérieur)

### Infinite Scroll
- Chargement par pages de 30 transactions
- Observer avec `rootMargin: 100px` pour anticiper le chargement
- Réinitialisation de l'observer après chaque chargement de données
- Bouton manuel en fallback si l'observer ne se déclenche pas

### Scroll Smooth
Le scroll de la page est fluide grâce à `scroll-behavior: smooth` appliqué globalement.

## États

### Chargement initial
Spinner centré pendant le fetch des données du compte.

### Compte non trouvé
Message d'erreur avec bouton de retour aux comptes.

### Aucune transaction
Message invitant à importer un fichier CSV avec icône et texte explicatif.

### Erreur d'import
Bannière rouge avec le message d'erreur et bouton pour fermer.

### Import réussi avec doublons
Bannière verte indiquant le nombre de transactions importées et de doublons ignorés.

## Fichiers

- **Page** : `src/app/dashboard/accounts/[id]/page.tsx`
- **API** : `src/app/api/accounts/[id]/route.ts`
- **Repository** : `src/server/repositories/account-repository.ts`
