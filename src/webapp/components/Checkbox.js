const Toggle = require('rc-checkbox');
const React = require('react');

require('rc-checkbox/assets/index.css');
require('./Checkbox.css');

const Checkbox = ({ title, defaultValue, onChange }) => (
  <label className='Checkbox'>
    <Toggle
      defaultChecked={ defaultValue }
      onChange={ e => onChange(e.target.checked) } />

    <span style={{ marginLeft: 10 }}>{ title || '' }</span>
  </label>
);

module.exports = Checkbox;
