import './App.css'
import { useState, useEffect } from 'react'
import { Office365UsersService } from './generated/services/Office365UsersService'
import type { GraphUser_V1 } from './generated/models/Office365UsersModel'
import { Oman_qpccampaignsService, Oman_qpcquestiontempsService, Oman_qpcrolesService, Oman_qpcteamsService, Oman_qpcusersService } from './generated'
import type { IOperationOptions } from '@microsoft/power-apps/data'


interface dtoUserRole {
  roleGuid: string,
  roleId: string,
  role: string,
}

interface dtoUserUser {
  userGuid: string;
  role: string;
  team: string;
  user: string;
  userid: string;
}

interface dtoUserTeam {
  teamGuid: string,
  teamid: string,
  team: string,
}

interface dtoCampaign {
  campaignGuid: string,
  campaignid: string,
  campaign: string,
  end: string,
  start: string,
  status: string
}

interface dtoQuestion {
  categorie: string,
  identifiantdelareclamation: string,
  informationssurlareponse: string,
  intituledelaquestion: string,
  numerodelaquestion: string,
  qpcquestiontempid: string,
  reponsedonnee: string,
  section: string
}

// interface dtoGroupedQuestion {
//   intituledelaquestion: string,
//   questionNumber: string,
//   reponsedonne: string[],
//   category: {
//     categoryName: string,
//     section: string
//   }
// }

function App() {
  const [isAdminView, setIsAdminView] = useState(false)
  const [selectedExport, setSelectedExport] = useState('PDF')

  const [userProfile, setUserProfile] = useState<GraphUser_V1 | null>(null)
  const [userRoles, setUserRole] = useState<dtoUserRole[]>([])
  const [userTeams, setUserTeam] = useState<dtoUserTeam[]>([])
  const [userUsers, setUserUser] = useState<dtoUserUser[]>([])
  const [isAllowedUser, setIsAllowedUser] = useState<boolean>(false)
  const [roleUser, setRoleUser] = useState<string>('')
  const [campaign, setCampaign] = useState<dtoCampaign>();
  const [questions, setQuestion] = useState<dtoQuestion[]>([])
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedSection, setSelectedSection] = useState<string>('')
  const [questionFiltred, setquestionFiltred] = useState<dtoQuestion[]>([])
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [loadingStates, setLoadingStates] = useState({
    export: false,
    save: false,
    publish: false,
  })


  const toggleView = () => {
    setIsAdminView(!isAdminView)
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(section)) {
        newSet.delete(section)
      } else {
        newSet.add(section)
      }
      return newSet
    })
  }

  const handleCategorySelection = (category: string, section: string) => {
    setSelectedCategory(category)
    setSelectedSection(section)

    const result = questions.filter(x => x.categorie === category).filter(x => x.section === section)
    setquestionFiltred(result)
  }

  // Grouper les questions par section
  const categorySection = questions.reduce((acc, question) => {
    const section = question.section || ''
    const category = question.categorie || ''
    if (!acc[category]) {
      acc[category] = []
    }
    if (!acc[category].includes(section)) {
      acc[category].push(section)
    }

    return acc
  }, {} as Record<string, string[]>)

  // Grouper les questions par numéro de question
  // const questionsByNumber = questions.reduce((acc, question) => {
  //   const numero = question.numerodelaquestion || 'Sans numéro'
  //   if (!acc[numero]) {
  //     acc[numero] = []
  //   }
  //   acc[numero].push(question)
  //   return acc
  // }, {} as Record<string, dtoQuestion[]>)

  // Grouper les questions filtrées par numéro de question
  const questionsFiltredByNumber = questionFiltred.reduce((acc, question) => {
    const numero = question.numerodelaquestion || 'Sans numéro'
    if (!acc[numero]) {
      acc[numero] = []
    }
    acc[numero].push(question)
    return acc
  }, {} as Record<string, dtoQuestion[]>)

  // Grouper les questions par intitulé avec toutes les réponses
  // const groupedQuestions: dtoGroupedQuestion[] = Object.values(
  //   questions.reduce((acc, question) => {
  //     const key = question.intituledelaquestion || 'Sans titre'

  //     if (!acc[key]) {
  //       acc[key] = {
  //         intituledelaquestion: question.intituledelaquestion,
  //         questionNumber: question.numerodelaquestion || 'Sans numéro',
  //         reponsedonne: [],
  //         category: {
  //           categoryName: question.categorie || '',
  //           section: question.section || ''
  //         }
  //       }
  //     }

  //     // Ajouter la réponse si elle existe
  //     if (question.reponsedonnee) {
  //       acc[key].reponsedonne.push(question.reponsedonnee)
  //     }

  //     return acc
  //   }, {} as Record<string, dtoGroupedQuestion>)
  // )

  const fetchUserCampaign = async () => {
    try {
      const result = await Oman_qpccampaignsService.getAll({
        select: ['oman_qpccampaignid', 'oman_campaignid', 'oman_campaign', 'oman_end', 'oman_start', 'statecode'],
        orderBy: ['oman_campaignid desc']
      })
      if (!result.success || !result.data) {
        throw new Error(result.error?.message);
      }

      const campaign: dtoCampaign = {
        campaignGuid: result.data[0].oman_qpccampaignid,
        campaignid: result.data[0].oman_campaignid,
        campaign: result.data[0].oman_campaign,
        end: result.data[0].oman_end.split('T')[0],
        start: result.data[0].oman_start.split('T')[0],
        status: result.data[0].statecode === 0 ? "inactif" : "actif"
      }
      setCampaign(campaign)

    } catch (err) {
      console.log(err)
    }



  }

  const fetchUserRelatedInformations = async () => {

    try {
      const roleResult = await Oman_qpcrolesService.getAll();
      const teamResult = await Oman_qpcteamsService.getAll();
      const userResult = await Oman_qpcusersService.getAll();


      if (!roleResult.success)
        throw new Error(roleResult.error?.message)

      if (!teamResult.success)
        throw new Error(teamResult.error?.message)

      if (!userResult.success)
        throw new Error(userResult.error?.message)


      const roles = roleResult.data.map(result => (
        {
          roleGuid: result.oman_qpcroleid,
          roleId: result.oman_roleid,
          role: result.oman_role
        } as dtoUserRole))

      const teams = teamResult.data.map(result => (
        {
          teamGuid: result.oman_qpcteamid,
          team: result.oman_team,
          teamid: result.oman_teamid,
        } as dtoUserTeam))

      const users = userResult.data.map(result => (
        {
          userGuid: result.oman_qpcuserid,
          role: result._oman_role_value,
          team: result._oman_team_value,
          user: result.oman_user,
          userid: result.oman_userid
        } as dtoUserUser))

      const usersResolved: dtoUserUser[] = await Promise.all(users.map(async (user) => {
        const role = await Oman_qpcrolesService.get(user.role, { select: ['oman_role'] })
        const team = await Oman_qpcteamsService.get(user.team, { select: ['oman_team'] })
        return {
          userGuid: user.userGuid,
          role: role.data?.oman_role || '',
          team: team.data?.oman_team || '',
          user: user.user,
          userid: user.userid,
        } as dtoUserUser
      }))


      setUserRole(roles);
      setUserTeam(teams);
      setUserUser(usersResolved);

    } catch (err) {
      console.error('Failed to fetch accounts:', err);
    }
  }

  const fetchUserProfile = async () => {
    setIsLoadingProfile(true)
    setProfileError(null)

    try {
      // Récupération du profil avec les champs spécifiques
      const result = await Office365UsersService.MyProfile_V2(
        'displayName,mail'
      )
      if (result.success && result.data) {
        setUserProfile(result.data)
      } else {
        setProfileError('Erreur lors de la récupération du profil')
        console.error('Erreur:', result.error)
      }



    } catch (error) {
      setProfileError('Impossible de récupérer le profil')
      console.error('Erreur lors de la récupération du profil:', error)
    } finally {
      setIsLoadingProfile(false)
    }
  }

  const fetchQuestionTemp = async () => {
    try {
      const requestOption: IOperationOptions = {
        select: [
          'oman_categorie'
          , 'oman_identifiantdelareclamation'
          , 'oman_informationssurlareponse'
          , 'oman_intituledelaquestion'
          , 'oman_numerodelaquestion'
          , 'oman_qpcquestiontempid'
          , 'oman_reponsedonnee'
          , 'oman_section'
        ],
        orderBy: ['importsequencenumber asc']
      }
      const resultatQuestion = await Oman_qpcquestiontempsService.getAll(requestOption);
      const resultatCategory = await Oman_qpcquestiontempsService.getAll({ select: ['oman_categorie'] });

      if (!resultatQuestion.success || !resultatQuestion.data) {
        throw new Error(resultatQuestion.error?.message)
      }
      if (!resultatCategory.success || !resultatCategory.data) {
        throw new Error(resultatCategory.error?.message)
      }





      const questions = resultatQuestion.data.map(q => {
        return {
          categorie: q.oman_categorie,
          identifiantdelareclamation: q.oman_identifiantdelareclamation,
          informationssurlareponse: q.oman_informationssurlareponse,
          intituledelaquestion: q.oman_intituledelaquestion,
          numerodelaquestion: q.oman_numerodelaquestion,
          qpcquestiontempid: q.oman_qpcquestiontempid,
          reponsedonnee: q.oman_reponsedonnee,
          section: q.oman_section
        } as dtoQuestion
      })
      setQuestion(questions)
      setquestionFiltred(questions)
    } catch (err) {
      console.log(err)
    }
  }

  // Récupération du profil au chargement de l'application
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoadingProfile(true)
      setProfileError(null)

      try {

        await fetchQuestionTemp();
        await fetchUserCampaign();
        await fetchUserRelatedInformations();
        await fetchUserProfile();
        const currentUser = userUsers.find(user => user.userid === userProfile?.mail)




        if (currentUser !== undefined) {
          setIsAllowedUser(true)
          setRoleUser(currentUser.role)
        } else {
          setIsAllowedUser(false)
          setRoleUser('')
        }

      } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error)
      } finally {
        setIsLoadingProfile(false)
        console.log(profileError)
        console.log(userRoles)
      }
    }

    loadProfile()
  }, [])

  const handleAction = async (actionType: 'export' | 'save' | 'publish') => {
    setLoadingStates(prev => ({ ...prev, [actionType]: true }))

    // Simulation d'une action asynchrone (appel API, sauvegarde, etc.)
    await new Promise(resolve => setTimeout(resolve, 2000))

    setLoadingStates(prev => ({ ...prev, [actionType]: false }))
    console.log(`Action ${actionType} terminée!`)
  }

  return (
    <div className="grid-container">
      <header className="header">
        <div className="header-left">
          <h1>Rapport QPC</h1>
          <div className="campaign-info">
            {campaign && (
              <>
                <span className="campaign-name">Campagne: {campaign?.campaign}</span>
                <span className="campaign-dates">
                  Du {campaign?.start} au {campaign?.end}
                </span>
              </>)
            }
          </div>
        </div>

        <div className="header-center">
          {isLoadingProfile ? (
            <div className="user-info-loading">
              <span className="spinner-small"></span>
            </div>
          ) : userProfile ? (
            (() => {
              if (isAllowedUser) {
                return (
                  <div className="user-info">
                    <div className="user-name">{userProfile.displayName}</div>
                    <div className="user-email">{userProfile.mail}</div>
                    <div className="user-role">Rôle: {roleUser || 'Non défini'}</div>
                  </div>
                )
              } else {
                return (
                  <div className="user-info user-no-access">
                    <div className="user-name">{userProfile.displayName}</div>
                    <div className="user-access-denied">⛔ Accès refusé - Utilisateur non autorisé</div>
                  </div>
                )
              }
            })()
          ) : null}
        </div>

        <div className="header-right">

          {roleUser.toLowerCase().includes("admin") ?
            (
              <button
                className={`btn-view-toggle ${isAdminView ? 'admin' : 'user'}`}
                onClick={toggleView}
                disabled={!isAllowedUser}
              >
                {isAdminView ? '👤 Vue Utilisateur' : '⚙️ Vue Administrateur'}
              </button>
            )
            :
            (
              <>
                <button className="btn-view-toggle user" disabled={!isAllowedUser}>
                  👤 Vue Utilisateur
                </button>
              </>
            )
          }

          {isAdminView && (
            <>
              <button
                className="btn-export"
                onClick={() => handleAction('export')}
                disabled={loadingStates.export || !isAllowedUser}
              >
                {loadingStates.export ? (
                  <>
                    <span className="spinner"></span>
                    Export en cours...
                  </>
                ) : (
                  <>📤 Export</>
                )}
              </button>
              <select
                className="dropdown-export"
                value={selectedExport}
                onChange={(e) => setSelectedExport(e.target.value)}
                disabled={!isAllowedUser}
              >
                {
                  userTeams.map(team => (
                    <>
                      <option value={team.teamid}>{team.team}</option>
                      <option value={team.teamid}>{team.team}</option>
                      <option value={team.teamid}>{team.team}</option>
                    </>
                  ))
                }
              </select>
            </>
          )}

          <button
            className="btn-save"
            onClick={() => handleAction('save')}
            disabled={loadingStates.save || !isAllowedUser}
          >
            {loadingStates.save ? (
              <>
                <span className="spinner"></span>
                Enregistrement...
              </>
            ) : (
              <>💾 Enregistrer</>
            )}
          </button>
          <button
            className="btn-publish"
            onClick={() => handleAction('publish')}
            disabled={loadingStates.publish || !isAllowedUser}
          >
            {loadingStates.publish ? (
              <>
                <span className="spinner"></span>
                Publication...
              </>
            ) : (
              <>📢 Publier</>
            )}
          </button>
        </div>
      </header>

      <nav className="nav">
        <h2>Questions</h2>
        <div className="accordion">
          {Object.entries(categorySection).map(([category, sections]) => (
            <div key={category} className="accordion-item">
              <button
                className={`accordion-header ${expandedSections.has(category) ? 'active' : ''}`}
                onClick={() => toggleSection(category)}
              >
                <span>{category}</span>
                <span className="accordion-icon">{expandedSections.has(category) ? '▼' : '▶'}</span>
              </button>
              {expandedSections.has(category) && (
                <div className="accordion-content">
                  {sections.map((section, id) => (
                    <div
                      key={`${category}-${section}-${id}`}
                      className="question-item"
                      onClick={() => handleCategorySelection(category, section)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="question-number">{category}</div>
                      <div className="question-title">{section}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      <main className="main">
        <div className='header'>
          <h2>Contenu Principal</h2>
          {selectedCategory && selectedSection && (
            <div className="selected-info">
              <strong>Sélection :</strong> {selectedCategory} - {selectedSection}
            </div>
          )}
        </div>

        <div className='question year-n'>
          <h3>Tableau de l'année courante</h3>
          <div className="table-container">
            <table className="question-table">
              <thead>
                <tr>
                  <th>Question</th>
                  {
                    questionFiltred
                      .map(x => x.informationssurlareponse)
                      .filter((value, index, self) => self.indexOf(value) === index)
                      .map(r => (<th>{r}</th>))
                  }
                </tr>
              </thead>
              <tbody>
                {
                  questionFiltred
                    .map(x => `${x.intituledelaquestion}`)
                    .filter((value, index, self) => self.indexOf(value) === index)
                    .map(o => (
                      <tr key={`year-n-${o}`}>
                        <td>{o}</td>
                        {
                          questionFiltred
                            .map(x => x.informationssurlareponse)
                            .filter((value, index, self) => self.indexOf(value) === index)
                            .map((r, i) => (<th><input key={`${r}-${i}`}></input></th>))
                        }
                      </tr>
                    ))



                }

              </tbody>
            </table>
          </div>
        </div>

        <div className='question year-n_1'>
          <h3>Tableau de l'année passée</h3>
          <div className="table-container">
            <table className="question-table">
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Question</th>
                  <th>Catégorie</th>
                  <th>Section</th>
                  <th>Réponse</th>
                  <th>Informations</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(questionsFiltredByNumber).sort(([a], [b]) => a.localeCompare(b)).map(([numero, questionsGroup]) => (
                  questionsGroup.map((question, index) => (
                    <tr key={`year-n_1-${question.qpcquestiontempid}`}>
                      {index === 0 && (
                        <td rowSpan={questionsGroup.length} className="question-number-cell">
                          {numero}
                        </td>
                      )}
                      <td className="question-text">{question.intituledelaquestion}</td>
                      <td>{question.categorie}</td>
                      <td>{question.section}</td>
                      <td>
                        <input
                          type="text"
                          className="response-input"
                          defaultValue={question.reponsedonnee}
                          placeholder="Entrez votre réponse"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="info-input"
                          defaultValue={question.informationssurlareponse}
                          placeholder="Informations complémentaires"
                        />
                      </td>
                    </tr>
                  ))
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <footer className="footer">
        <p>&copy; 2026 - Mon Application</p>
      </footer>
    </div >
  )
}

export default App
