import { UserReponseForm } from './UserReponseForm'
import './App.css'

/**
 * Exemple d'utilisation du composant UserReponseForm
 * 
 * Ce composant affiche un formulaire matriciel où:
 * - Les questions (LQuestion) sont affichées verticalement (lignes)
 * - Les réponses (LReponse) sont affichées horizontalement (colonnes)
 * - L'utilisateur peut sélectionner une réponse par question
 */
function UserReponseFormExample() {
    return (
        <div style={{
            backgroundColor: '#f5f5f5',
            minHeight: '100vh',
            padding: '20px'
        }}>
            {/* En-tête */}
            <div style={{
                backgroundColor: '#0078D4',
                color: 'white',
                padding: '20px',
                borderRadius: '8px 8px 0 0',
                marginBottom: '20px'
            }}>
                <h1 style={{ margin: 0, fontSize: '24px' }}>
                    Formulaire de Réponse aux Questions
                </h1>
                <p style={{ margin: '10px 0 0 0', opacity: 0.9 }}>
                    Sélectionnez une réponse pour chaque question
                </p>
            </div>

            {/* Formulaire */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}>
                <UserReponseForm
                    userEmail="user@example.com" // Email de l'utilisateur
                    formName="form-2024-04-20" // Nom unique du formulaire
                // categoryId="CATEGORY_ID" // Optionnel: filtrer par catégorie
                // sectionId="SECTION_ID" // Optionnel: filtrer par section
                />
            </div>

            {/* Instructions */}
            <div style={{
                backgroundColor: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: '8px',
                padding: '15px',
                marginTop: '20px'
            }}>
                <h3 style={{ marginTop: 0, color: '#856404' }}>
                    ℹ️ Instructions
                </h3>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#856404' }}>
                    <li>Les questions sont affichées verticalement dans la première colonne</li>
                    <li>Les options de réponse sont affichées horizontalement dans les en-têtes</li>
                    <li>Sélectionnez un bouton radio pour chaque question</li>
                    <li>Vos réponses sont automatiquement sauvegardées</li>
                    <li>Cliquez sur "Soumettre le formulaire" pour finaliser</li>
                </ul>
            </div>

            {/* Configuration */}
            <div style={{
                backgroundColor: '#e7f3ff',
                border: '1px solid #0078D4',
                borderRadius: '8px',
                padding: '15px',
                marginTop: '20px'
            }}>
                <h3 style={{ marginTop: 0, color: '#004578' }}>
                    ⚙️ Configuration
                </h3>
                <div style={{ color: '#004578' }}>
                    <p><strong>Props du composant:</strong></p>
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                        <li><code>userEmail</code> (requis): Email de l'utilisateur qui remplit le formulaire</li>
                        <li><code>formName</code> (optionnel): Identifiant unique du formulaire (défaut: 'default-form')</li>
                        <li><code>categoryId</code> (optionnel): ID de catégorie pour filtrer les questions</li>
                        <li><code>sectionId</code> (optionnel): ID de section pour filtrer les questions</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default UserReponseFormExample
