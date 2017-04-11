import React from 'react';
import './Ribbon.css';

const Ribbon = () => {
  const image = require('../images/ribbon.png');

  return <div className='ribbon_container'>
    <a href='http://craft.ai' className='ribbon' title='craft ai' target='_blank'>
      <img src={image} alt='Powered by craft ai' />
    </a>
  </div>;
};

export default Ribbon;
