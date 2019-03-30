import React, { Component } from 'react';
import { Checkbox, Button } from 'antd';
import './App.scss';
import 'antd/dist/antd.css';
import download from './download';

class App extends Component {

  constructor(props) {
    super(props);
    this.videoEl = React.createRef();
    this.state = {
      markers: []
    }

    this.addMarker = this.addMarker.bind(this);
    this.downloadStop = this.downloadStop.bind(this);
    this.downloadTrim = this.downloadTrim.bind(this);
  }

  componentDidMount(){
    this.videoEl.current.addEventListener('pause', this.addMarker);
    this.videoEl.current.addEventListener('play', this.addMarker);
    this.videoEl.current.addEventListener('ended', this.addMarker);
  }

  addMarker() {
    const currentTime = this.videoEl.current.currentTime;
    const existingMarkers = this.state.markers;
    const alreadyMarked = existingMarkers.some(marker => marker.position === currentTime);

    if (alreadyMarked) {
      return;
    }
    this.setState({
      markers: existingMarkers.concat({
        id: existingMarkers.length + 1,
        position: currentTime,
        isChecked: false
      })
    })
  }

  selectMarker(ev, id) {
    const currentMarkers = this.state.markers;
    const currentCheckedCount = currentMarkers.filter(marker => marker.isChecked).length;

    if (currentCheckedCount > 2){
      return;
    }

    const newMarkers = currentMarkers.map(marker => {
      if (marker.id !== id){
        return marker;
      }
      return {
        ...marker,
        isChecked: ev.target.checked
      }
    })

    this.setState({markers: newMarkers})
  }

  downloadTrim(){
    const stream = this.videoEl.current.captureStream();
    const recorder = new MediaRecorder(stream);

    let chunks = [];

    const downloadVideo = () =>{
      const downloadData = new Blob(chunks, {
        type: 'video/mp4'
      });

      this.recorder = null;

      download(downloadData, 'audio-trim.mp4');
    }

    recorder.onstop = downloadVideo;
    recorder.ondataavailable = (ev) => chunks.push(ev.data);
    recorder.start(10);
    this.recorder = recorder;

  }

  downloadStop(){
    if (this.recorder){
      this.recorder.stop();
    }
  }

  render() {
    const {markers} = this.state;

    return (
      <div className="App">
        <video controls autoPlay ref={this.videoEl}>
          <source src="./test.mp4" type="video/mp4" />
        </video>
        <div>
          <Button onClick={this.downloadTrim}>Download video</Button>
          <Button onClick={this.downloadStop}>Stop</Button>
        </div>
        <div className="marker-list">
        {markers.map(({id, position, isChecked}) =>
          <Checkbox key={id} checked={isChecked} onChange={(ev) => this.selectMarker(ev, id)}>{position}s</Checkbox>
        )}
        </div>
      </div>
    );
  }
}

export default App;
