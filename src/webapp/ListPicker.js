const React = require('react');
const Slider = require('rc-slider/lib/Slider');
const _ = require('lodash');

require('rc-slider/assets/index.css');
require('./ListPicker.css');

const ListPicker = ({ list, defaultValue, onSelect }) => (
  <Slider 
    className='ListPicker'
    min={ 0 } 
    max={ list.length - 1 } 
    marks={ _.assign(..._.map(list, (item, index) => ({ [index]: item }))) } 
    step={ null } 
    onChange={ onSelect } 
    defaultValue={ defaultValue } 
    included={ false } />
);

module.exports = ListPicker;
