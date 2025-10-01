import React from 'react'

export default function ClientDoppelteDashboardPage() {
  return (
    <div className='min-h-80 flex justify-center align-center'>
        <h1 className='text-xl text-blue-500'>
            ClientDoppelteDashboardPage  Coming Soon..
        </h1>
    </div>
  )
}
/*

[ 1 ] 1 Auswahl Stakeholder |	1 Select Stakeholders
  - stakeholder ( FK )
  - is_included = boolean.
  - weighting ( 1 - 3)
  - justifications ( textfield)

[ 2 ] 2 Auswahl für IRO-Bewertung |	2 Selection for IRO-Assessment
  - ESGQuestions ( index_code, question name)
  - Punkte RT => punkte_rt ( 1 - 3)
  - Punkte SH => punkte_sh ( 1 - 3)
  - relevant => boolean 
  - justification

[ 3 ] 3: IRO-Bewertung (IRO-Assessment)
  - Punkte ( Scores)
  - index ( index code from ESGQuestion)
  - impact ( 1-10 )
  - risiko ( risk => 1-10 )
  - chance ( risk => 1-10 )
  - reporting ( boolean YES or No )
      - justification ()
  - reporting_justification
    - textfield
 */