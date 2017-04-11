import _ from 'lodash';
import React from 'react';
import createClass from 'create-react-class';

import Ribbon from './Ribbon';
import Checkbox from './Checkbox';
import ListPicker from './ListPicker';
import PersonaPicker from './PersonaPicker';
import Timeline from './Timeline';

import { debug } from '../../utils';
import constants from '../constants';
import * as Decision from '../decision';
import * as Interval from '../interval';

import './App.css';

const { PROPERTIES, EVENTS, DAYS_OF_WEEK, MONTHS, MORNING_MEETING, VALUES, TIMESTAMPS } = constants;
const { HAPPENING, ON } = VALUES;

const MORNING_MEETING_KEYS = _.keys(MORNING_MEETING);
const MORNING_MEETING_VALUES = _.values(MORNING_MEETING);
const OUTPUTS = [HAPPENING, ON];

const log = debug();

function getTime(time) {
  const hours = Math.trunc(time);
  const result = new Date();

  result.setHours(hours, 60 * (time - hours), 0, 0);

  return result;
}

const App = createClass({
  getInitialState() {
    const personas = constants.PERSONA.map(name => ({ name, leafs: null }));

    return {
      personas,
      items: null,
      selectedPersona: null,
      selectedDayOfWeek: 2,
      selectedMonth: 3,
      selectedMorningMeeting: 0,
      holiday: false
    };
  },
  componentWillMount() {
    // Trigger the retrieval of each persona trees
    this.state.personas.forEach(({ name }, index) => {
      const log = debug(`persona:${name}`);

      Decision.retrievePersonaDecisionTrees(name, TIMESTAMPS.DECEMBER)
        .then(trees => {
          const leafs = _.mapValues(trees, (tree, property) => {
            return Interval.extractLeafs(tree.trees[property], ...OUTPUTS);
          });

          this.setState(_.set(this.state, `personas[${index}].leafs`, leafs));
        })
        .then(() => log('Persona ready'))
        .catch(error => log('Error while preparing persona', error));
    });
  },
  getItemsFromDecision() {
    const persona = this.state.personas.find(({ name }) => name === this.state.selectedPersona);

    if (!persona) {
      return;
    }

    const meeting = MORNING_MEETING_VALUES[this.state.selectedMorningMeeting];

    let context = Decision.createContext(2017, this.state.selectedMonth, this.state.selectedDayOfWeek);
    let items = [];

    context.holiday = VALUES[this.state.holiday];
    context.meeting = meeting;

    if (meeting > 0) {
      items.push({ slug: 'meeting', t: getTime(meeting) });
    }

    items = PROPERTIES.reduce((items, property) => {
      let leafs = _.cloneDeep(persona.leafs[property]);

      leafs = Interval.filterLeafsByContext(leafs, context);
      leafs = Interval.computeTimeSinceEvents(leafs, context);
      leafs = Interval.computeTimeToEvents(leafs, context);
      leafs = Interval.computePartialDecisions(leafs, context);
      leafs = Interval.mergeRules(leafs);
      leafs = Interval.filterDeadLeafsAndRules(leafs);

      const [leaf] = leafs;

      if (!leaf) {
        return items;
      }

      if (EVENTS.includes(property)) {
        const interval = leaf.rules.time && leaf.rules.time['[in['][0];

        if (interval) {
          const value = interval[0];

          context[property] = value;
          items.push({ slug: property, t: [getTime(value)] });
        }
      } else {
        context = Interval.expandContext(context, property, leaf);

        const intervals = leafs.reduce((intervals, current) => {
          const values = current.rules.time && current.rules.time['[in['];

          if (values) {
            intervals.push(...values.filter(interval => interval[0] < interval[1]));
          }

          return intervals;
        }, []);

        Interval.getIntervalsUnion(intervals).forEach(interval => {
          items.push({ slug: property, t: interval.map(getTime) });
        });
      }

      return items;
    }, items);

    this.setState({ items });
  },
  setSelectedPersona(persona) {
    log(`New selected persona is '${persona}'`);

    this.setState({ selectedPersona: persona }, this.getItemsFromDecision);
  },
  setSelectedDayOfWeek(dayOfWeek) {
    log(`New selected day of week is '${DAYS_OF_WEEK[dayOfWeek]}'`);

    this.setState({ selectedDayOfWeek: dayOfWeek }, this.getItemsFromDecision);
  },
  setSelectedMonth(month) {
    log(`New selected month is '${MONTHS[month]}'`);

    this.setState({ selectedMonth: month }, this.getItemsFromDecision);
  },
  setSelectedMorningMeeting(morningMeeting) {
    log(`New selected morningMeeting is '${MORNING_MEETING_KEYS[morningMeeting]}'`);

    this.setState({ selectedMorningMeeting: morningMeeting }, this.getItemsFromDecision);
  },
  setHoliday(holiday) {
    log(`New selected day is ${holiday ? '' : 'not '}a holiday`);

    this.setState({ holiday: holiday }, this.getItemsFromDecision);
  },
  render() {
    return <div>
        <Ribbon />

        {
          this.state.items && <Timeline items={ this.state.items } />
        }

        <div
          className='selector'
          style={{
            flex: '1 1',
            display: 'flex',
            flexDirection: 'row',
            paddingTop: this.state.items ? 0 : 80
          }}>
          <div
            style={{
              flex: '1 1 50%',
              padding: '10px 20px',
              overflowY: 'auto'
            }}>
            <h1>Choose a persona</h1>
            <PersonaPicker
              personas={ this.state.personas }
              selected={ this.state.selectedPersona }
              onSelectPersona={ this.setSelectedPersona } />
          </div>

          <div
            style={{
              flex: '1 1 50%',
              padding: '10px 30px',
              overflowX: 'hidden',
              overflowY: 'auto'
            }}>
            <h1>Set the context</h1>

            <h2>Day</h2>
            <ListPicker
              list={ DAYS_OF_WEEK }
              defaultValue={ this.state.selectedDayOfWeek }
              onSelect={ this.setSelectedDayOfWeek } />
            <Checkbox
              title='Bank holiday?'
              defaultValue={ this.state.holiday }
              onChange={ this.setHoliday } />

            <h2>Meeting</h2>
            <ListPicker
              list={ MORNING_MEETING_KEYS }
              defaultValue={ this.state.selectedMorningMeeting }
              onSelect={ this.setSelectedMorningMeeting } />

            <h2>Month</h2>
            <ListPicker
              list={ MONTHS }
              defaultValue={ this.state.selectedMonth }
              onSelect={ this.setSelectedMonth } />
          </div>
        </div>
      </div>;
  }
});

export default App;
