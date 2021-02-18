import React, { Component } from 'react';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Rank from './components/Rank/Rank';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import './App.css';
import 'tachyons';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';

const app = new Clarifai.App({
  apiKey: ''
});

//https://samples.clarifai.com/face-det.jpg

const particlesOptions = {
  particles: {
    number: {
      value: 80,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      input: '',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedIn: false
    }
  }

  componentDidMount() {
    fetch('http://localhost:3001/')
    .then(response => response.json())
    .then(console.log)
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage');
    const width = Number(image.width); //set to 500px in FaceRecognition.js
    const height = Number(image.height);
    return {
      //returning the square where the face is!
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width), //the expression inside of brackets gives us the position in relation to the right side of image!
      bottomRow: height -(clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    this.setState({box: box});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input}); //Calling setState() in React is asynchronous! IMPORTANT!
    app.models.predict(Clarifai.FACE_DETECT_MODEL, this.state.input) //we can't use "this.state.imageUrl"!!!!" -> possible solution: setState(updater, callback)
    .then(response => this.displayFaceBox(this.calculateFaceLocation(response))) //response.outputs[0].data.regions[0].region_info.bounding_box
    .catch(err => console.log('Error! ', err));
  }

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState({isSignedIn: false})
    } else if (route === 'home') {
      this.setState({isSignedIn: true})
    }
    this.setState({route: route});
  }

  render() {
    const {isSignedIn, route, imageUrl, box} = this.state;
    return (
      <div className="App">
        <Particles className='particles'
         params={ particlesOptions } 
        />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
        { 
          route === 'signin' ?
          <Signin onRouteChange={ this.onRouteChange } />
          :
          (
            route === 'home' 
            ?
            <div>
              <Logo />
              <Rank />
              <ImageLinkForm 
                onInputChange={ this.onInputChange }
                onButtonSubmit={ this.onButtonSubmit }
              />
              <FaceRecognition 
                imageUrl= {imageUrl }
                box={ box }
              />
            </div>
            :
            <Register onRouteChange={ this.onRouteChange } />
          )
        }
      </div>
    );
  }

}

export default App;
