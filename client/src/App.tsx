import React, { useEffect, useRef, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import ReactPlayer from 'react-player'
import { OnProgressProps } from 'react-player/base';
import result from "./result"
function App() {
  const [elpased, setElapsed] = useState<number>(0);
  const player = useRef(null);
  const [comments, setComments] = useState<any[]>([])
  useEffect(() => {

  }, [])

  const onDuration = (s: any) => {
    console.log("seconds", s);
  }
  const onProgress = (props: OnProgressProps) => {
    console.log("played", props.playedSeconds);
    let time = props.playedSeconds;
    time = Math.round(time*100)/100;
    setElapsed(time);

    if (time < 3) // if less than 3s, introduction
    {
      setComments(result[0].msgList)
      return;
    }
    let comment :any = null;
    for (const one of result) {
      if (Math.round(one.time) == Math.round(time)) {
        comment = one.msgList;
        setComments(comment);
        break;
      }
    }
  }
  return (
    <div className="App" style={{ display: 'flex', }}>
      <ReactPlayer
        playing={true}
        url='./game.mp4' width={1300} height={800}
        onDuration={onDuration}
        onProgress={onProgress}
        controls
      />
      <div style={{ width: 500, flexGrow: 1, padding: 16, backgroundColor: '#8f8', display: 'flex', flexDirection: 'column' }}>
        <div>
          <p style={{ textAlign: 'left', fontSize: 36, fontWeight: 600, }}>
            Chicken Race Simulation: {elpased}
          </p>
        </div>
        {
          comments.map((v, i) => (
            <div style={{
              backgroundColor: 'white',
              width: '95%', marginTop: 10,
              alignSelf: v.who === 'Tom' ? 'flex-start' : 'flex-end'
            }}>
              <p style={{
                color: v.who === 'Tom' ? 'red' : 'blue',
                textAlign: 'left',
                fontWeight: 500,
                fontSize: 20,
                padding: 4,
              }}>{v.msg}</p>
            </div>
          ))
        }
      </div>
    </div>
  );
}

export default App;
