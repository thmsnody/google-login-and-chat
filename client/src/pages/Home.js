import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import jwt_decode from 'jwt-decode'

import './Home.scss'

export default function Home({ user, setuser, city, setcity }) {
  const navigate = useNavigate()

  useEffect(() => {
    /* global google */
    window.google?.accounts.id.initialize({
      client_id: process.env.REACT_APP_GOOGLE_ACCOUNT_ID,
      callback: handleCallbackResponse,
    })
    window.google?.accounts.id.renderButton(
      document.getElementById('google-sign-in-btn'),
      {
        theme: 'filled_blue',
        text: 'continue_with',
      }
    )
    // window.google?.accounts.id.prompt()
  }, [])

  function handleCallbackResponse(response) {
    const userObject = jwt_decode(response.credential)
    localStorage.setItem(
      'chat',
      JSON.stringify({
        email: userObject.email,
        name: userObject.given_name,
      })
    )
    setuser({
      email: userObject.email,
      name: userObject.given_name,
    })
  }

  function joinRoom() {
    navigate(`/chat?city=${city}`)
  }

  function signOut() {
    localStorage.removeItem('chat')
    setuser(null)
  }

  return (
    <div className='Home'>
      <div className='home-box'>
        <div className='img'>
          <img src='/img/canada-42703.svg' alt='' />
        </div>
        <form>
          <div className='form-control-radio-group'>
            {['vancouver', 'calgary', 'toront', 'quebec'].map((x, i) => (
              <div key={i}>
                <input
                  type='radio'
                  name='city'
                  id={'Home-' + x}
                  value={x}
                  checked={x === city}
                  onChange={(e) => setcity(e.target.value)}
                />
                <label htmlFor={'Home-' + x}>
                  {x[0].toUpperCase() + x.slice(1)}
                </label>
              </div>
            ))}
          </div>

          <div
            id='google-sign-in-btn'
            className={`google-sign-in-btn ${user && 'hide'}`}
          ></div>
          {user && (
            <>
              <div className='hello'>👋 Hello, {user.name}</div>
              <div className='btn-group'>
                <div className='join btn' onClick={joinRoom}>
                  JOIN CHAT
                </div>
                <div className='sign-out btn' onClick={signOut}>
                  SIGN OUT
                </div>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  )
}
