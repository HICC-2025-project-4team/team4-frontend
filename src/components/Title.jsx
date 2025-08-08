import React from 'react';
import '../styles/Title.css';

import Vector0 from '../assets/Vector.svg';
import Vector1 from '../assets/Vector-1.svg';
import Vector2 from '../assets/Vector-2.svg';
import Vector3 from '../assets/Vector-3.svg';
import Vector4 from '../assets/Vector-4.svg';

import VectorLayer0 from '../assets/VectorLayer.svg';
import VectorLayer1 from '../assets/VectorLayer-1.svg';
import VectorLayer2 from '../assets/VectorLayer-2.svg';
import VectorLayer3 from '../assets/VectorLayer-3.svg';
import VectorLayer4 from '../assets/VectorLayer-4.svg';

const Title = () => {
  const colorImages = [Vector0, Vector1, Vector2, Vector3, Vector4];
  const layerImages = [VectorLayer0, VectorLayer1, VectorLayer2, VectorLayer3, VectorLayer4];

  return (
    <div className="title-container">
      {colorImages.map((colorImg, idx) => (
        <div className="title-letter-wrapper" key={idx}>
          <img
            src={layerImages[idx]}
            alt={`shadow-${idx}`}
            className="title-shadow"
          />
          <img
            src={colorImg}
            alt={`letter-${idx}`}
            className="title-top"
          />
        </div>
      ))}
    </div>
  );
};

export default Title;
