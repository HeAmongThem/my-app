import { useState, useEffect } from 'react'
import './App.css'
import { Oman_qpccategorysectionsService } from './generated/services/Oman_qpccategorysectionsService'
import { Oman_qpccategoriesService } from './generated/services/Oman_qpccategoriesService'
import { Oman_qpcsectionsService } from './generated/services/Oman_qpcsectionsService'
import type { Oman_qpccategorysections } from './generated/models/Oman_qpccategorysectionsModel'
import type { Oman_qpccategories } from './generated/models/Oman_qpccategoriesModel'
import type { Oman_qpcsections } from './generated/models/Oman_qpcsectionsModel'

interface CategorySection {
  categoryId: string
  categoryName: string
  categoryInfo?: string
  sections: {
    sectionId: string
    sectionName: string
    sectionInfo?: string
  }[]
}

function App() {
  const [categorySections, setCategorySections] = useState<CategorySection[]>([])
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategorySections = async () => {
      try {
        setLoading(true)

        // Récupérer les données des trois tables
        const [categoriesResult, sectionsResult, relationshipsResult] = await Promise.all([
          Oman_qpccategoriesService.getAll(),
          Oman_qpcsectionsService.getAll(),
          Oman_qpccategorysectionsService.getAll()
        ])

        if (categoriesResult.success && sectionsResult.success && relationshipsResult.success &&
          categoriesResult.data && sectionsResult.data && relationshipsResult.data) {

          console.debug(categoriesResult.data)
          console.log(categoriesResult.data)
          categoriesResult.data.forEach((cat: Oman_qpccategories) => {
            console.log(`Name: ${cat.oman_name}`)
            console.log(`Info: ${cat.oman_info}`)
            console.log(`Ppp: ${cat.oman_categoryid}`)
          })

          // Créer des maps pour un accès rapide
          const categoriesMap = new Map<string, Oman_qpccategories>()
          categoriesResult.data.forEach((cat: Oman_qpccategories) => {
            categoriesMap.set(cat.oman_qpccategoryid, cat)
          })

          const sectionsMap = new Map<string, Oman_qpcsections>()
          sectionsResult.data.forEach((sec: Oman_qpcsections) => {
            sectionsMap.set(sec.oman_qpcsectionid, sec)
          })

          // Organiser les données par catégorie avec les lookups
          const categoryMap = new Map<string, CategorySection>()

          relationshipsResult.data.forEach((relationship: Oman_qpccategorysections) => {
            const categoryId = relationship._oman_categoryid_value
            const sectionId = relationship._oman_sectionid_value

            if (!categoryId || !sectionId) return

            const category = categoriesMap.get(categoryId)
            const section = sectionsMap.get(sectionId)

            if (!category || !section) return

            if (!categoryMap.has(categoryId)) {
              categoryMap.set(categoryId, {
                categoryId: category.oman_qpccategoryid,
                categoryName: category.oman_name,
                categoryInfo: category.oman_info,
                sections: []
              })
            }

            categoryMap.get(categoryId)?.sections.push({
              sectionId: section.oman_qpcsectionid,
              sectionName: section.oman_name,
              sectionInfo: section.oman_info
            })
          })

          const categories = Array.from(categoryMap.values())
          setCategorySections(categories)

          // Stocker aussi les données brutes pour l'affichage JSON
          console.log('CategoryMap values:', categories)
        } else {
          setError('Erreur lors de la récupération des données')
        }
      } catch (err) {
        setError(`Erreur: ${err instanceof Error ? err.message : 'Erreur inconnue'}`)
      } finally {
        setLoading(false)
      }
    }

    fetchCategorySections()
  }, [])

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  return (
    <div style={{
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      {/* En-tête bleu */}
      <div style={{
        backgroundColor: '#0078D4',
        color: 'white',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <div style={{
          width: '24px',
          height: '24px',
          border: '2px solid white',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px'
        }}>
          ◎
        </div>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'normal' }}>
          Afficher toutes les questions
        </h2>
      </div>

      {/* Contenu avec deux colonnes */}
      <div style={{
        display: 'flex',
        gap: '20px',
        padding: '20px'
      }}>
        {/* Colonne gauche - Menu */}
        <div style={{
          flex: '0 0 700px',
          maxWidth: '700px'
        }}>
          {loading && <p>Chargement des données...</p>}

          {error && (
            <div style={{
              backgroundColor: '#fdd',
              color: '#d00',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              {error}
            </div>
          )}

          {!loading && !error && (
            <div>
              {categorySections.map((category) => {
                const isExpanded = expandedCategories.has(category.categoryId)

                return (
                  <div key={category.categoryId} style={{ marginBottom: '15px' }}>
                    {/* Catégorie */}
                    <div
                      onClick={() => toggleCategory(category.categoryId)}
                      style={{
                        backgroundColor: 'white',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        padding: '15px 20px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        transition: 'background-color 0.2s',
                        marginBottom: isExpanded ? '10px' : '0'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      <span style={{
                        fontSize: '16px',
                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s',
                        display: 'inline-block'
                      }}>
                        ›
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: isExpanded ? 'bold' : 'normal',
                          textDecoration: isExpanded ? 'underline' : 'none'
                        }}>
                          {category.categoryName}
                        </div>
                        {category.categoryInfo && (
                          <div style={{
                            fontSize: '13px',
                            color: '#666',
                            marginTop: '5px'
                          }}>
                            {category.categoryInfo}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Sections (affichées quand la catégorie est expansée) */}
                    {isExpanded && (
                      <div style={{ paddingLeft: '20px' }}>
                        {category.sections.map((section) => {
                          const isSectionExpanded = expandedSections.has(section.sectionId)

                          return (
                            <div
                              key={section.sectionId}
                              onClick={() => toggleSection(section.sectionId)}
                              style={{
                                backgroundColor: 'white',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                padding: '15px 20px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '15px',
                                marginBottom: '10px',
                                transition: 'background-color 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                            >
                              <span style={{
                                fontSize: '16px',
                                transform: isSectionExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s',
                                display: 'inline-block'
                              }}>
                                ›
                              </span>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '15px' }}>
                                  {section.sectionName}
                                </div>
                                {isSectionExpanded && section.sectionInfo && (
                                  <div style={{
                                    fontSize: '13px',
                                    color: '#666',
                                    marginTop: '8px',
                                    paddingTop: '8px',
                                    borderTop: '1px solid #eee'
                                  }}>
                                    {section.sectionInfo}
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {!loading && !error && categorySections.length === 0 && (
            <div style={{
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '20px',
              textAlign: 'center',
              color: '#666'
            }}>
              Aucune donnée trouvée.
            </div>
          )}
        </div>

        {/* Colonne droite - JSON */}
        <div style={{
          flex: '1',
          minWidth: '400px'
        }}>
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            position: 'sticky',
            top: '20px'
          }}>
            <h3 style={{
              margin: '0 0 15px 0',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              Données brutes (JSON)
            </h3>
            <pre style={{
              backgroundColor: '#f5f5f5',
              padding: '15px',
              borderRadius: '4px',
              overflow: 'auto',
              maxHeight: 'calc(100vh - 150px)',
              fontSize: '12px',
              lineHeight: '1.4',
              margin: 0
            }}>
              {JSON.stringify(categorySections, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
