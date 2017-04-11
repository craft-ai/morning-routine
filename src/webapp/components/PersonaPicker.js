const React = require('react');
const _ = require('lodash');
const classnames = require('classnames');
const { PERSONA_LABEL } = require('../constants');

require('./PersonaPicker.css');

const PersonaPicker = ({ personas, selected, onSelectPersona, style }) => (
  <ul className='PersonaPicker' style={ style }>
  {
    _.map(personas, (persona, index) => {
      const { name, leafs } = persona;
      return leafs
        ? <li key={ index } 
              className={ classnames({ active: name === selected }, name) }
              onClick={ () => onSelectPersona(name) }>
            <div>{ PERSONA_LABEL[name] }</div>
          </li>
        : null;
    })
  }
  </ul>
);

module.exports = PersonaPicker;
