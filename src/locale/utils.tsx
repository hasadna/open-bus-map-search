import React from 'react'
import reactStringReplace from 'react-string-replace'

const PLACEHOLDER = 'XXX'
export const formatted = (text: string, value: string) => text.replace(PLACEHOLDER, value)
const linkFormatted = (text: string, link: { url: string; text: string }) => {
  return (
    <>
      {reactStringReplace(text, new RegExp(`(${PLACEHOLDER})`, 'g'), () => (
        <a href={link.url}>{link.text}</a>
      ))}
    </>
  )
}
export default { formatted, linkFormatted, PLACEHOLDER }
