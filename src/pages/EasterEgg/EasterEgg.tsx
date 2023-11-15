import { useState } from 'react'
import styled from 'styled-components'
import useKonami from 'use-konami'

const EnvelopeWrapper = styled.div`
  .letter-image {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 200px;
    height: 200px;
    -webkit-transform: translate(-50%, -50%);
    -moz-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
    cursor: pointer;
    direction: ltr;
    z-index: 999;
    opacity: 1;
    animation: fadeIn 1s ease-in-out;

    &.fade-out {
      opacity: 0;
      animation: fadeOut 1s ease-in-out;
    }
  }

  @keyframes fadeIn {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  @keyframes fadeOut {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  .animated-mail {
    position: absolute;
    height: 150px;
    width: 200px;
    -webkit-transition: 0.4s;
    -moz-transition: 0.4s;
    transition: 0.4s;

    .body {
      position: absolute;
      bottom: 0;
      width: 0;
      height: 0;
      border-style: solid;
      border-width: 0 0 100px 200px;
      border-color: transparent transparent #e95f55 transparent;
      z-index: 2;
    }

    .top-fold {
      position: absolute;
      top: 50px;
      width: 0;
      height: 0;
      border-style: solid;
      border-width: 50px 100px 0 100px;
      -webkit-transform-origin: 50% 0%;
      -webkit-transition: transform 0.4s 0.4s, z-index 0.2s 0.4s;
      -moz-transform-origin: 50% 0%;
      -moz-transition: transform 0.4s 0.4s, z-index 0.2s 0.4s;
      transform-origin: 50% 0%;
      transition: transform 0.4s 0.4s, z-index 0.2s 0.4s;
      border-color: #cf4a43 transparent transparent transparent;
      z-index: 2;
    }

    .back-fold {
      position: absolute;
      bottom: 0;
      width: 200px;
      height: 100px;
      background: #cf4a43;
      z-index: 0;
    }

    .left-fold {
      position: absolute;
      bottom: 0;
      width: 0;
      height: 0;
      border-style: solid;
      border-width: 50px 0 50px 100px;
      border-color: transparent transparent transparent #e15349;
      z-index: 2;
    }

    .letter {
      left: 20px;
      bottom: 0px;
      position: absolute;
      width: 160px;
      height: 60px;
      background: white;
      z-index: 1;
      overflow: hidden;
      -webkit-transition: 0.4s 0.2s;
      -moz-transition: 0.4s 0.2s;
      transition: 0.4s 0.2s;

      .letter-border {
        height: 10px;
        width: 100%;
        background: repeating-linear-gradient(
          -45deg,
          #cb5a5e,
          #cb5a5e 8px,
          transparent 8px,
          transparent 18px
        );
      }

      .letter-title {
        margin-top: 10px;
        margin-left: 5px;
        height: 10px;
        width: 40%;
        background: #cb5a5e;
      }
      .letter-context {
        margin-top: 10px;
        margin-left: 5px;
        height: 10px;
        width: 20%;
        background: #cb5a5e;
      }

      .letter-stamp {
        margin-top: 30px;
        margin-left: 120px;
        border-radius: 100%;
        height: 30px;
        width: 30px;
        background: #cb5a5e;
        opacity: 0.3;
      }
    }
  }

  .shadow {
    position: absolute;
    top: 200px;
    left: 50%;
    width: 400px;
    height: 30px;
    transition: 0.4s;
    transform: translateX(-50%);
    -webkit-transition: 0.4s;
    -webkit-transform: translateX(-50%);
    -moz-transition: 0.4s;
    -moz-transform: translateX(-50%);

    border-radius: 100%;
    background: radial-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0), rgba(0, 0, 0, 0));
  }

  .letter-image:hover {
    .animated-mail {
      transform: translateY(50px);
      -webkit-transform: translateY(50px);
      -moz-transform: translateY(50px);
    }

    .animated-mail .top-fold {
      transition: transform 0.4s, z-index 0.2s;
      transform: rotateX(180deg);
      -webkit-transition: transform 0.4s, z-index 0.2s;
      -webkit-transform: rotateX(180deg);
      -moz-transition: transform 0.4s, z-index 0.2s;
      -moz-transform: rotateX(180deg);
      z-index: 0;
    }

    .animated-mail .letter {
      height: 180px;
    }

    .shadow {
      width: 250px;
    }
  }
`
const Envelope = ({ fade }: { fade: boolean }) => (
  <EnvelopeWrapper>
    <div className={fade ? 'letter-image fade-out' : 'letter-image'}>
      <div className="animated-mail">
        <div className="back-fold"></div>
        <div className="letter">
          <div className="letter-border"></div>
          <div className="letter-title"></div>
          <div className="letter-context"></div>
          <div className="letter-stamp">
            <div className="letter-stamp-inner"></div>
          </div>
        </div>
        <div className="top-fold"></div>
        <div className="body"></div>
        <div className="left-fold"></div>
      </div>
      <div className="shadow"></div>
    </div>
  </EnvelopeWrapper>
)

export function EasterEgg() {
  const [show, setShow] = useState(false)
  const [fade, setFade] = useState(false)
  useKonami({
    onUnlock: () => {
      setShow(true)
      setTimeout(() => {
        setFade(true)
      }, 9000)
      setTimeout(() => {
        setShow(false)
        setFade(false)
      }, 10000)
    },
    sequence: 'storybook'.split(''),
  })
  return (
    show && (
      <a href="/storybook/index.html">
        <Envelope fade={fade} />
      </a>
    )
  )
}
