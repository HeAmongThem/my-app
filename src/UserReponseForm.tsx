import { useState, useEffect } from 'react'
import './UserReponseForm.css'
import { Oman_qpcfk_questionsService } from './generated/services/Oman_qpcfk_questionsService'
import { Oman_qpcuserreponseformsService } from './generated/services/Oman_qpcuserreponseformsService'
import type { Oman_qpcfk_questions } from './generated/models/Oman_qpcfk_questionsModel'

interface QuestionReponse {
    fkQuestionId: string
    questionLabel: string
    reponseLabel: string
    questionId: string
    reponseId: string
    categoryId: string
    sectionId?: string
    reponseInfoId?: string
}

interface UserReponseFormProps {
    categoryId?: string
    sectionId?: string
    userEmail: string
    formName?: string
}

export function UserReponseForm({
    categoryId,
    sectionId,
    userEmail,
    formName = 'default-form'
}: UserReponseFormProps) {
    const [questions, setQuestions] = useState<QuestionReponse[]>([])
    const [reponseHeaders, setReponseHeaders] = useState<string[]>([])
    const [selectedReponses, setSelectedReponses] = useState<Map<string, string>>(new Map())
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchQuestsions()
    }, [categoryId, sectionId])

    const fetchQuestions = async () => {
        try {
            setLoading(true)
            setError(null)

            // Construire le filtre OData
            const filters: string[] = []
            if (categoryId) {
                filters.push(`_oman_lcategory_value eq ${categoryId}`)
            }
            if (sectionId) {
                filters.push(`_oman_lsection_value eq ${sectionId}`)
            }
            filters.push(`statecode eq 0`) // Seulement les actifs

            const options = {
                filter: filters.length > 0 ? filters.join(' and ') : undefined,
                expand: 'oman_lquestion,oman_lreponse'
            }

            const result = await Oman_qpcfk_questionsService.getAll(options)

            if (result.success && result.data) {
                // Transformer les données
                const questionsData: QuestionReponse[] = result.data.map((item: Oman_qpcfk_questions) => ({
                    fkQuestionId: item.oman_qpcfk_questionid,
                    questionLabel: item.oman_lquestionname || 'Question sans label',
                    reponseLabel: item.oman_lreponsename || 'Réponse sans label',
                    questionId: item._oman_lquestion_value || '',
                    reponseId: item._oman_lreponse_value || '',
                    categoryId: item._oman_lcategory_value || '',
                    sectionId: item._oman_lsection_value,
                    reponseInfoId: item._oman_lreponseinfo_value
                }))

                setQuestions(questionsData)

                // Extraire les en-têtes de réponse uniques
                const uniqueReponses = Array.from(
                    new Set(questionsData.map(q => q.reponseLabel))
                ).sort()
                setReponseHeaders(uniqueReponses)

                // Charger les réponses existantes de l'utilisateur
                await loadExistingReponses(formName, userEmail)
            } else {
                setError('Erreur lors du chargement des questions')
            }
        } catch (err) {
            console.error('Erreur:', err)
            setError('Erreur lors du chargement des questions')
        } finally {
            setLoading(false)
        }
    }

    const loadExistingReponses = async (formNameGuid: string, email: string) => {
        try {
            const filter = `oman_formnameguid eq '${formNameGuid}' and oman_useremail eq '${email}'`
            const result = await Oman_qpcuserreponseformsService.getAll({ filter })

            if (result.success && result.data) {
                const reponseMap = new Map<string, string>()
                result.data.forEach(item => {
                    const key = `${item._oman_questionid_value}_${item._oman_reponseid_value}`
                    reponseMap.set(key, item.oman_qpcuserreponseformid)
                })
                setSelectedReponses(reponseMap)
            }
        } catch (err) {
            console.error('Erreur lors du chargement des réponses existantes:', err)
        }
    }

    const handleReponseChange = async (
        questionId: string,
        reponseId: string,
        categoryId: string,
        sectionId?: string
    ) => {
        const key = `${questionId}_${reponseId}`
        const isSelected = selectedReponses.has(key)

        try {
            if (isSelected) {
                // Supprimer la réponse
                const reponseFormId = selectedReponses.get(key)
                if (reponseFormId) {
                    await Oman_qpcuserreponseformsService.delete(reponseFormId)
                    const newMap = new Map(selectedReponses)
                    newMap.delete(key)
                    setSelectedReponses(newMap)
                }
            } else {
                // Créer une nouvelle réponse
                const newReponse = {
                    oman_formname: formName,
                    oman_formnameguid: formName,
                    oman_useremail: userEmail,
                    oman_userreponseformid: crypto.randomUUID(),
                    "oman_QuestionID@odata.bind": `/oman_qpcquestions(${questionId})`,
                    "oman_ReponseID@odata.bind": `/oman_qpcreponsetypes(${reponseId})`,
                    "oman_CategoryID@odata.bind": `/oman_qpccategories(${categoryId})`,
                    ...(sectionId && { "oman_SectionID@odata.bind": `/oman_qpcsections(${sectionId})` }),
                    oman_isdraft: true,
                    oman_isinit: false
                }

                const result = await Oman_qpcuserreponseformsService.create(newReponse)

                if (result.success && result.data) {
                    const newMap = new Map(selectedReponses)
                    newMap.set(key, result.data.oman_qpcuserreponseformid)
                    setSelectedReponses(newMap)
                }
            }
        } catch (err) {
            console.error('Erreur lors de la sauvegarde de la réponse:', err)
            setError('Erreur lors de la sauvegarde de la réponse')
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError(null)

        try {
            // Marquer toutes les réponses comme non-brouillon
            const updatePromises = Array.from(selectedReponses.values()).map(reponseFormId =>
                Oman_qpcuserreponseformsService.update(reponseFormId, { oman_isdraft: false })
            )

            await Promise.all(updatePromises)
            alert('Formulaire soumis avec succès !')
        } catch (err) {
            console.error('Erreur lors de la soumission:', err)
            setError('Erreur lors de la soumission du formulaire')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <div className="loading">Chargement des questions...</div>
    }

    if (error) {
        return <div className="error">{error}</div>
    }

    // Grouper les questions par label de question
    const questionGroups = new Map<string, QuestionReponse[]>()
    questions.forEach(q => {
        const existing = questionGroups.get(q.questionLabel) || []
        existing.push(q)
        questionGroups.set(q.questionLabel, existing)
    })

    return (
        <div className="user-reponse-form">
            <form onSubmit={handleSubmit}>
                <div className="form-matrix">
                    <table>
                        <thead>
                            <tr>
                                <th className="question-header">Questions</th>
                                {reponseHeaders.map((header, index) => (
                                    <th key={index} className="reponse-header">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from(questionGroups.entries()).map(([questionLabel, questionItems]) => {
                                const firstQuestion = questionItems[0]
                                return (
                                    <tr key={firstQuestion.questionId}>
                                        <td className="question-label">{questionLabel}</td>
                                        {reponseHeaders.map((reponseHeader) => {
                                            const matchingQuestion = questionItems.find(
                                                q => q.reponseLabel === reponseHeader
                                            )

                                            if (!matchingQuestion) {
                                                return <td key={reponseHeader} className="empty-cell"></td>
                                            }

                                            const key = `${matchingQuestion.questionId}_${matchingQuestion.reponseId}`
                                            const isChecked = selectedReponses.has(key)

                                            return (
                                                <td key={reponseHeader} className="reponse-cell">
                                                    <input
                                                        type="radio"
                                                        name={`question_${firstQuestion.questionId}`}
                                                        checked={isChecked}
                                                        onChange={() => handleReponseChange(
                                                            matchingQuestion.questionId,
                                                            matchingQuestion.reponseId,
                                                            matchingQuestion.categoryId,
                                                            matchingQuestion.sectionId
                                                        )}
                                                    />
                                                </td>
                                            )
                                        })}
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="form-actions">
                    <button type="submit" disabled={saving} className="submit-button">
                        {saving ? 'Envoi en cours...' : 'Soumettre le formulaire'}
                    </button>
                </div>
            </form>
        </div>
    )
}
