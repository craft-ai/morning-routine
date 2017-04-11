import React from 'react';
import _ from 'lodash';
import classnames from 'classnames';

import constants from '../constants';

require('./PersonaPicker.css');

const { PERSONA_LABEL } = constants;

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

export default PersonaPicker;
