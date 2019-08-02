import React, { Component } from 'react';
import { render } from 'react-dom';
import axios from 'axios';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './Gallery.css';
import Spinner from './components/Spinner';

class Gallery extends Component {
  state = {
    activeImage: [],
    images: [],
    activeImageId: null,
    isLoading: false
  };

  componentDidMount() {
    // on page load, right after mounting the component, invoke onGiphyLoad function to make call to the Giphy API
    // start automatic timer that changes the active images after 3 seconds
    // if images array is empty, invoke onGiphyLoad function
    // if images array contains data, utilize the JavaScript Math object and array length property to return a random integer from 0 to length of array  - this allows a random image to be set if trending call returns the default of 25 records, or less i.e. if &limit=5 is added to request parameter
    // set key of random image to the activeImage array
    // activeImageId state is needed for 'react-transition-group' <TransitionGroup /> which maps over the array a returns each one with the <CSSTransition /> component - this is used for transition animation
    this.onGiphyLoad();
    this.interval = setInterval(() => {
      if (this.state.images.length === 0) {
        this.onGiphyLoad();
      } else {
        let randomImage = Math.floor(Math.random() * this.state.images.length);
        this.setState({
          activeImage: this.state.images[randomImage].images.fixed_height.url,
          activeImageId: this.state.images[randomImage].id
        });
      }
    }, 3000);
  }

  componentWillUnmount() {
    // Clear the interval right before component unmounts
    clearInterval(this.interval);
  }

  // API CALL - send the GET request to GIPHY API to pull trending images
  // within this.setState call, flip the isLoading state to true - if false, this will prevent images to be rendered
  onGiphyLoad = async () => {
    const response = await axios.get(
      'https://api.giphy.com/v1/gifs/trending?api_key=PEyIrGaWdf08Lw4nezyXejpD9Y0pO6Rt'
    );
    this.setState({
      images: response.data.data,
      activeImage: response.data.data[0].images.fixed_height.url,
      activeImageId: response.data.data[0].id,
      isLoading: true
    });
  };

  onImageSelect = image => {
    // this helper function is passed down to the GalleryThumb component
    // on click of inactive image, set url to update and the active image
    this.setState({ activeImage: image });
  };

  onRemove = imageId => {
    // this helper function is passed down to the GalleryThumb component
    // on button click, set id of the image to imageId variable
    // return new array with selected image id removed
    const newArr = this.state.images.filter(image => image.id !== imageId);
    this.setState({ images: newArr });
  };

  contentRendering = () => {
    // this helper function is used as a data check
    // if images array is empty, return null to prevent rendering
    // if isLoading is true/data exist, return active images to be rendered
    const contentLoading = this.state.images.length < 1;
    const imageData = this.state.isLoading;
    if (contentLoading) {
      return null;
    } else if (imageData) {
      return (
        <img
          className="image-transition"
          src={this.state.activeImage}
          alt="active giphy"
        />
      );
    }
  };

  render() {
    return (
      <div className="ui container" style={{ marginTop: '20px' }}>
        <h4 className="ui header" style={{ color: '#A6A6A6' }}>
          <i className="chart line icon" />
          <div className="content">TRENDING GIFS</div>
        </h4>
        {/* Active Gallery Image */}
        {/* TransitionGroup, and CSSTransition from React Transition Group dependency allows transition of components in and out of the DOM in a declarative and efficient way */}
        <TransitionGroup>
          <CSSTransition
            key={this.state.activeImageId}
            timeout={1000}
            classNames="messageout"
          >
            {/* invoke contentRendeing helper function to display active image if data exists */}
            <div className="center-display">{this.contentRendering()}</div>
          </CSSTransition>
        </TransitionGroup>
        {/* Conditional Rendering */}
        {/* display the GalleryThumb component if isLoading state is true */}
        {/* pass down state and helper functions to GalleryThumb component */}
        {this.state.isLoading && (
          <GalleryThumb
            images={this.state.images}
            onImageSelect={this.onImageSelect}
            onRemove={this.onRemove}
          />
        )}
        {/* Conditional Rendering - check if no inactive images are being displayed and adds a loading spinner */}
        {this.state.images.length < 1 && <Spinner />}
      </div>
    );
  }
}

class GalleryThumb extends Component {
  /* Thumbnails */
  render() {
    return (
      <div
        className="ui large horizontal divided list"
        style={{ marginTop: '40px', marginBottom: '20px' }}
      >
        {/* map over images array, return elements to be rendered for each thumbnail image */}
        {/* onClick event handlers to set active image, and remove image from images array */}
        {this.props.images.map(image => {
          return (
            <div className="item" key={image.id} style={{ marginTop: '20px' }}>
              <img
                style={{
                  maxWidth: '140px',
                  maxHeight: '140px',
                  cursor: 'pointer'
                }}
                src={image.images.downsized_still.url}
                alt={image.title}
                onClick={() =>
                  this.props.onImageSelect(image.images.fixed_height.url)
                }
              />
              <button
                className="fluid ui button"
                style={{ marginTop: '5px' }}
                onClick={() => this.props.onRemove(image.id)}
              >
                Remove
              </button>
            </div>
          );
        })}
      </div>
    );
  }
}

render(<Gallery />, document.getElementById('root'));
