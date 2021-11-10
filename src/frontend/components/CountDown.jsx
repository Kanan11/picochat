import React, { useEffect, useState } from 'react'
import dayjs from 'dayjs'

export default function CountDownTimer ({ start, timeout, onTimeout }) {
  if (typeof start !== 'number') start = new Date(start).getTime()
  if (typeof timeout !== 'number') throw new Error('Prop: "timeout" should be a number')

  const [timeLeft, setTimeLeft] = useState(timeout)
  const timer = dayjs(timeLeft)

  useEffect(() => {
    const initialTimeLeft = timeout - (Date.now() - start)
    // When countdown is already zero or less,
    // set timeLeft once and don't start interval
    if (initialTimeLeft <= 0) {
      setTimeLeft(initialTimeLeft)
      /*return*/
    }

    // Set up interval that updates timeLeft
    const intervalId = setInterval(() => {
      const now = Date.now()
      setTimeLeft(timeout - (now - start))
    }, 500)

    // Set up timeout that triggers onTimeout event
    const timerId = setTimeout(() => {
      if (typeof onTimeout === 'function') onTimeout()
    }, initialTimeLeft)

    // clean up on component unmount
    return () => {
      clearTimeout(timerId)
      clearInterval(intervalId)
    }
  }, [setTimeLeft, start, timeout])

  let classes = 'count-down'
  if (timeLeft < 10 * 1000) classes += ' danger'
  else if (timeLeft < 60 * 1000) classes += ' warning'

  return (
    <p className={classes}>

      {timer.format('h:mm:ss')}
      {/* TODO: use Day.js */}
      {/* 10.5s */}
      {/* 3.4m */}
    </p>
  )
}
