# UserReponseForm Component

Composant de formulaire matriciel pour répondre aux questions de la table Dataverse `oman_qpcfk_questions`.

## 📋 Description

Ce composant affiche un formulaire sous forme de matrice où :
- **Les questions** (colonne `LQuestion`) sont affichées **verticalement** (lignes)
- **Les en-têtes de réponse** (colonne `LReponse`) sont affichées **horizontalement** (colonnes)
- L'utilisateur sélectionne une réponse par question via des boutons radio

## 🎯 Fonctionnalités

- ✅ Affichage matriciel questions × réponses
- ✅ Chargement automatique des questions depuis Dataverse
- ✅ Sauvegarde automatique des réponses dans `oman_qpcuserreponseforms`
- ✅ Gestion du mode brouillon
- ✅ Filtrage par catégorie et/ou section
- ✅ Interface responsive
- ✅ Design moderne avec Material Design

## 📦 Installation

Les fichiers suivants ont été créés :
- `src/UserReponseForm.tsx` - Composant principal
- `src/UserReponseForm.css` - Styles du composant
- `src/UserReponseFormExample.tsx` - Exemple d'utilisation

## 🚀 Utilisation

### Utilisation basique

```tsx
import { UserReponseForm } from './UserReponseForm'

function MyApp() {
  return (
    <UserReponseForm
      userEmail="utilisateur@exemple.com"
      formName="formulaire-unique-2024"
    />
  )
}
```

### Avec filtres

```tsx
<UserReponseForm
  userEmail="utilisateur@exemple.com"
  formName="formulaire-categorie-1"
  categoryId="12345678-1234-1234-1234-123456789012"
  sectionId="87654321-4321-4321-4321-210987654321"
/>
```

## 🔧 Props

| Prop         | Type     | Requis | Description                                                 |
| ------------ | -------- | ------ | ----------------------------------------------------------- |
| `userEmail`  | `string` | ✅ Oui  | Email de l'utilisateur remplissant le formulaire            |
| `formName`   | `string` | ❌ Non  | Identifiant unique du formulaire (défaut: `'default-form'`) |
| `categoryId` | `string` | ❌ Non  | ID de catégorie pour filtrer les questions                  |
| `sectionId`  | `string` | ❌ Non  | ID de section pour filtrer les questions                    |

## 📊 Structure des données

### Table source : `oman_qpcfk_questions`

Le composant charge les questions depuis la table lookup `oman_qpcfk_questions` qui contient :
- `oman_lquestionname` - Label de la question (affiché verticalement)
- `oman_lreponsename` - Label de la réponse (affiché horizontalement)
- `_oman_lquestion_value` - ID de la question
- `_oman_lreponse_value` - ID du type de réponse
- `_oman_lcategory_value` - ID de la catégorie
- `_oman_lsection_value` - ID de la section (optionnel)

### Table de destination : `oman_qpcuserreponseforms`

Les réponses sont sauvegardées dans :
- `oman_formname` / `oman_formnameguid` - Identifiant du formulaire
- `oman_useremail` - Email de l'utilisateur
- `oman_QuestionID` - Référence à la question
- `oman_ReponseID` - Référence au type de réponse
- `oman_CategoryID` - Référence à la catégorie
- `oman_SectionID` - Référence à la section
- `oman_isdraft` - Indicateur de brouillon (true pendant l'édition)

## 🎨 Apparence

Le formulaire utilise :
- Un tableau avec en-têtes fixes
- Couleurs Material Design (bleu #3498db)
- Boutons radio stylisés
- Survol des lignes pour meilleure lisibilité
- Design responsive pour mobile

## 🔄 Flux de travail

1. **Chargement** : Le composant récupère les questions depuis `oman_qpcfk_questions`
2. **Affichage** : Matrice générée avec questions en lignes, réponses en colonnes
3. **Sélection** : L'utilisateur sélectionne une réponse par question (radio button)
4. **Sauvegarde auto** : Chaque sélection est immédiatement sauvegardée en mode brouillon
5. **Soumission** : Le bouton "Soumettre" marque toutes les réponses comme finalisées

## 📱 Responsive

Le composant s'adapte aux écrans mobiles :
- Défilement horizontal pour les grandes matrices
- En-têtes fixes pour navigation facile
- Tailles de police et espacements réduits sur mobile

## 🐛 Gestion des erreurs

Le composant gère :
- Erreurs de chargement des questions
- Erreurs de sauvegarde des réponses
- États de chargement avec indicateurs visuels
- Messages d'erreur clairs pour l'utilisateur

## 💡 Exemple complet

Voir le fichier `src/UserReponseFormExample.tsx` pour un exemple complet avec :
- Interface utilisateur complète
- Instructions d'utilisation
- Documentation des props
- Mise en page professionnelle

## 🔐 Sécurité

⚠️ **Important** : 
- Le composant utilise l'email fourni en prop pour identifier l'utilisateur
- Assurez-vous d'implémenter une authentification appropriée
- Validez l'email côté serveur si nécessaire

## 🚀 Pour tester

Pour utiliser l'exemple :

```tsx
// Dans main.tsx ou App.tsx
import UserReponseFormExample from './UserReponseFormExample'

// Remplacez le composant actuel par :
<UserReponseFormExample />
```

Ou importez directement le composant dans votre application existante :

```tsx
import { UserReponseForm } from './UserReponseForm'
```
