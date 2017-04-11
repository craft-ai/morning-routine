import React from 'react';
import Toggle from 'rc-checkbox';

import 'rc-checkbox/assets/index.css';
import './Checkbox.css';

const Checkbox = ({ title, defaultValue, onChange }) => (
  <label className='Checkbox'>
    <Toggle
      defaultChecked={ defaultValue }
      onChange={ e => onChange(e.target.checked) } />

    <span style={{ marginLeft: 10 }}>{ title || '' }</span>
  </label>
);

export default Checkbox;
