import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { io } from 'socket.io-client'

import './Chat.scss'

const socket = io(
  process.env.REACT_APP_MODE === 'pro'
    ? process.env.REACT_APP_IO_URL_PRO
    : process.env.REACT_APP_IO_URL_DEV
)

export default function Chat({ user, city, setcity }) {
  const urlSearchParams = new URLSearchParams(window.location.search)
  const cityParam = urlSearchParams.get('city')

  const [chatMsg, setchatMsg] = useState('')
  const [chatMsgs, setchatMsgs] = useState([])
  const [currentUsers, setcurrentUsers] = useState([])

  const msgBoxRef = useRef(null)
  const msgInputRef = useRef(null)

  const navigate = useNavigate()

  useEffect(() => {
    setcity(cityParam)
  }, [])

  useEffect(() => {
    socket
      .disconnect()
      .connect()
      .on('connect', () => {
        socket.emit('joinRoom', {
          email: user.email,
          name: user.name,
          room: cityParam,
        })
      })
    return () => socket.off('connect')
  }, [])

  useEffect(() => {
    socket.on('adminMsg', ({ currentUsers }) => {
      setcurrentUsers(currentUsers)
    })
    socket.on('chatMsg', ({ email, name, msg }) => {
      const date = new Date(Date.now())
      const hours = date.getHours()
      const minutes =
        date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
      const ampm = hours >= 12 ? 'pm' : 'am'
      setchatMsgs((pre) => [
        ...pre,
        {
          email,
          name,
          msg,
          time: (hours % 12) + ':' + minutes + ' ' + ampm,
        },
      ])
    })
    return () => {
      socket.off('adminMsg')
      socket.off('chatMsg')
    }
  }, [])

  useEffect(() => {
    msgBoxRef.current.scrollTop = msgBoxRef.current.scrollHeight
  }, [chatMsgs])

  function leaveRoom() {
    navigate('/')
    socket.emit('leaveRoom', {
      email: user.email,
    })
  }

  function handleSubmitChat(e) {
    e.preventDefault()
    if (chatMsg.trim()) {
      socket.emit('chatMsg', {
        email: user.email,
        name: user.name,
        room: city,
        msg: chatMsg,
      })
      setchatMsg('')
      msgInputRef.current.focus()
    }
  }

  return (
    <div className='Chat'>
      <div className='header'>
        <div className='title-center'>
          <img src='/img/maple-leaf-38777.svg' />
          <div>Chat room - {city[0].toUpperCase() + city.slice(1)}</div>
        </div>
        <button className='leave' onClick={leaveRoom}>
          Leave
        </button>
      </div>
      <div className='chat-center-box'>
        <div className='msg-box' ref={msgBoxRef}>
          <div className='admin-msg'>{user.name} has joined.</div>
          {chatMsgs.map((x, i) => (
            <div
              className={user.email === x.email ? 'my-msg' : 'user-msg'}
              key={i}
            >
              <div className='info'>
                <span>{x.name}</span> - <span>{x.time}</span>
              </div>
              {x.msg}
            </div>
          ))}
        </div>
        <div className='users-box'>
          <div className='users'>Users</div>
          <ul>
            {currentUsers.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
        </div>
      </div>
      <form onSubmit={handleSubmitChat}>
        <input
          type='text'
          value={chatMsg}
          onChange={(e) => setchatMsg(e.target.value)}
          ref={msgInputRef}
        />
        <button>Send</button>
      </form>
    </div>
  )
}
