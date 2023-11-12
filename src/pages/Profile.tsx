import styled from 'styled-components'
import React from 'react'
import { TEXT_KEYS } from 'src/resources/texts'
import SlackIcon from '../resources/slack-icon.svg'
import { useTranslation } from 'react-i18next'
import GapsPage from './GapsPage'
import SingleLineMapPage from './SingleLineMapPage'

const Profile = () => {
    return  (
        <GeneralDetailsAboutLine />
    )
}

const GeneralDetailsAboutLine = () => {
    const { t } = useTranslation()
  
    return (
      <>
      <ParagraphStyle>
        <h2>קו מספר: </h2>
        <h3>מפעיל: </h3>
      </ParagraphStyle>
      </>
    )
  }

const ParagraphStyle = styled.div`
  & h2 {
    font-size: 1.5em;
  }
  & p {
    font-size: 1.15em;
  }

  & ul {
    list-style: none;
    padding: 0;
  }
  & img {
    width: 5%;
  }
`


export default Profile