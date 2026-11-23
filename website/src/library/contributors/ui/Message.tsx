/**
 * Message
 * ────────────────────────────────────────────────────────────────
 * Shows one message of the format check or the package builder.
 * The messages are plain text shared with the command line, where
 * names are written between backticks. Here those parts are shown
 * as code, and the message starts with a capital letter.
 */

import React from 'react'

interface MessageProps {
  text: string
}

const Message: React.FC<MessageProps> = ({ text }) => {
  const parts = text.split('`')
  // an odd number of backticks is not a pair: show the text as it is
  if (parts.length % 2 === 0) return <>{text}</>
  parts[0] = parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? <code key={i}>{part}</code> : part,
      )}
    </>
  )
}

export default Message
