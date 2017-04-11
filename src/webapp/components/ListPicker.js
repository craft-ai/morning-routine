import React  from 'react';
import _  from 'lodash';
import Slider  from 'rc-slider/lib/Slider';

import 'rc-slider/assets/index.css';
import './ListPicker.css';

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

export default ListPicker;
